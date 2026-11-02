import { announceDataChanged } from '@/app/composables/useDataVersion';
import axios, { type AxiosResponse } from "axios";
import { addToast } from '@/app/composables/useToast'

const $GATEWAY_ENDPOINT_WITHOUT_VERSION = process.env.NEXT_PUBLIC_API_BASE_URL as string;
const $GATEWAY_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL as string;
const $GATEWAY_ENDPOINT_V2 = process.env.NEXT_PUBLIC_API_BASE_URL + "/v2";
const $IMAGE_UPLOAD_ENDPOINT = process.env.NEXT_PUBLIC_IMAGE_UPLOAD_BASE_URL as string;

export const GATEWAY_ENDPOINT = axios.create({
 baseURL: $GATEWAY_ENDPOINT,
});

export const GATEWAY_ENDPOINT_V2 = axios.create({
 baseURL: $GATEWAY_ENDPOINT_V2
});

export const GATEWAY_ENDPOINT_WITH_AUTH = axios.create({
 baseURL: $GATEWAY_ENDPOINT,
});

export const GATEWAY_ENDPOINT_WITH_AUTH_FORM_DATA = axios.create({
 baseURL: $GATEWAY_ENDPOINT,
 headers: {
 "Content-Type": "multipart/form-data",
 },
});

export const GATEWAY_ENDPOINT_WITHOUT_VERSION = axios.create({
 baseURL: $GATEWAY_ENDPOINT_WITHOUT_VERSION,
});
export const GATEWAY_ENDPOINT_WITHOUT_VERSION_WITH_AUTH = axios.create({
 baseURL: $GATEWAY_ENDPOINT_WITHOUT_VERSION,
});
export const IMAGE_UPLOAD_ENDPOINT = axios.create({
 baseURL: $IMAGE_UPLOAD_ENDPOINT,
});

export const SESSION_EXPIRED_EVENT = 'public_sector_session_expired';
export const APPROVAL_SENT_EVENT = 'public_sector_approval_sent';

const readAccessToken = (): string => {
 if (typeof window === 'undefined') return '';
 const match = document.cookie.match(new RegExp('(^| )public_sector_token=([^;]+)'));
 return match ? decodeURIComponent(match[2]) : localStorage.getItem('token') || '';
};

let refreshInFlight: Promise<string | null> | null = null;

const rotateTokens = async (staleToken: string): Promise<string | null> => {
 // Another tab may have rotated while this one waited for the lock.
 const currentToken = readAccessToken();
 if (currentToken && currentToken !== staleToken) return currentToken;

 const refreshToken = localStorage.getItem('refreshToken');
 if (!refreshToken) return null;

 const { data } = await axios.post(`${$GATEWAY_ENDPOINT}/auth/refresh`, { refreshToken }, { timeout: 15000 });
 document.cookie = `public_sector_token=${encodeURIComponent(data.accessToken)}; path=/; max-age=31536000`;
 localStorage.setItem('token', data.accessToken);
 localStorage.setItem('refreshToken', data.refreshToken);
 return data.accessToken;
};

/**
 * Exchanges the refresh token for a new access token and returns it, or null
 * when the session is dead. Refresh tokens are single use and the backend
 * revokes every session when one is replayed, so at most one refresh may run
 * across all tabs: the promise dedupes within a tab, the Web Lock across tabs.
 * A network failure rejects instead, because the session may still be fine.
 */
export const refreshSession = (): Promise<string | null> => {
 if (!refreshInFlight) {
  const staleToken = readAccessToken();
  const run = async () => {
   try {
    return await rotateTokens(staleToken);
   } catch (err: any) {
    if (err?.response?.status === 401) return null;
    throw err;
   }
  };
  const pending: Promise<string | null> = typeof navigator !== 'undefined' && navigator.locks
   ? navigator.locks.request('public_sector_token_refresh', run)
   : run();
  refreshInFlight = pending.finally(() => {
   refreshInFlight = null;
  });
 }
 return refreshInFlight;
};

export const notifySessionExpired = () => {
 if (typeof window !== 'undefined') window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
};

export interface CustomAxiosResponse extends AxiosResponse {
 value?: any;
 type?: string;
}

const instanceArray = [
 GATEWAY_ENDPOINT,
 GATEWAY_ENDPOINT_V2,
 GATEWAY_ENDPOINT_WITH_AUTH,
 GATEWAY_ENDPOINT_WITHOUT_VERSION,
 GATEWAY_ENDPOINT_WITHOUT_VERSION_WITH_AUTH,
 GATEWAY_ENDPOINT_WITH_AUTH_FORM_DATA,
 IMAGE_UPLOAD_ENDPOINT,
];

instanceArray.forEach((instance) => {
 instance.defaults.timeout = 15000; // Set global timeout to 15 seconds
 instance.interceptors.request.use((config: any) => {
 const tokenValue = readAccessToken();

 if (tokenValue) {
 config.headers = config.headers || {};
 if (typeof config.headers.set === 'function') {
 config.headers.set('Authorization', `Bearer ${tokenValue}`);
 } else {
 config.headers.Authorization = `Bearer ${tokenValue}`;
 }
 }
 return config;
 });

 instance.interceptors.response.use(
 (response: CustomAxiosResponse) => {
 if (changesData(response.config)) announceDataChanged();
 // Every action sent for approval answers this way, so its maker can pick an approver.
 if (response.data?.pendingApproval && response.data.approvalId && typeof window !== 'undefined') {
 window.dispatchEvent(new CustomEvent(APPROVAL_SENT_EVENT, { detail: response.data.approvalId }));
 }
 return response;
 },
 async (err: any) => {
 // Check for timeout or network connection error
 if (err.code === 'ECONNABORTED' || err.message?.includes('timeout') || err.message?.includes('Network Error') || typeof err.response === "undefined") {
 // try {
 // const { recordSlowNetwork } = useNetworkStatus();
 // recordSlowNetwork();
 // } catch (e) {}
 
 return {
 type: "ERROR",
 ...(err.response || { status: 0, statusText: "Network Error" }),
 };
 }
 if (err.response.status === 401) {
 // GATEWAY_ENDPOINT carries the public auth routes, where a 401 means bad
 // credentials rather than an expired session.
 if (instance !== GATEWAY_ENDPOINT && typeof window !== 'undefined' && !err.config?._retriedAfterRefresh) {
 try {
 const newToken = await refreshSession();
 if (newToken) {
 return instance.request({ ...err.config, _retriedAfterRefresh: true });
 }
 notifySessionExpired();
 return { type: "ERROR", ...err.response };
 } catch {
 // Refresh itself couldn't reach the server: fall through and report the 401.
 }
 }
 addToast(
 err?.response?.data?.message || err?.response?.data?.error || "An error occured",
 "error",
 3000
 );
 return {
 type: "ERROR",
 ...err.response,
 };
 } else if (statusCodeStartsWith(err.response.status, 4)) {
  const shouldSkipToast = (err.config as any)?.skipToast || ((err.config as any)?.skipToastOn404 && err.response.status === 404);
  if (err.response.data.message && !shouldSkipToast) {
   addToast(
    err?.response?.data?.message || err?.response?.data?.error || "An error occured",
    "error",
    3000
   );
  }
  return {
   type: "ERROR",
   ...err.response,
  };
 } else if (err.response.status === 500) {
 addToast(
 err?.response?.data?.message || err?.response?.data?.error || "An error occured",
 "error",
 3000
 );
 return {
 type: "ERROR",
 ...err.response,
 };
 } else if (err.response.status === 409) {
 addToast(
 err?.response?.data?.message || err?.response?.data?.error || "An error occured",
 "error",
 3000
 );
 return {
 type: "ERROR",
 ...err.response,
 };
 } else {
 addToast(
 err?.response?.data?.message || err?.response?.data?.error || "An unexpected error occurred",
 "error",
 3000
 );
 return {
 type: "ERROR",
 ...err.response,
 };
 }
 }
 );
});

// Logging a reveal or marking a notification read changes nothing a list shows.
const QUIET_PATHS = /\/(auth|admin\/audit-logs\/data-access|admin\/notifications)\b/;

const changesData = (config?: { method?: string; url?: string }) =>
 !!config?.method && config.method !== 'get' && !QUIET_PATHS.test(config.url ?? '');

const statusCodeStartsWith = (
 statusCode: number,
 startNumber: number
): boolean => {
 const statusCodeString = statusCode.toString();
 const startNumberString = startNumber.toString();

 return statusCodeString.startsWith(startNumberString);
};
