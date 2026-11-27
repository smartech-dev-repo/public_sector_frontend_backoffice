import { announceDataChanged } from '@/app/composables/useDataVersion';
import axios, { type AxiosResponse } from "axios";
import { addToast } from '@/app/composables/useToast'
import { getAccessToken, setAccessToken } from './tokenStore';

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

// Admin sign-in, refresh and sign-out go through the back office's own server (app/api/session),
// which keeps the refresh token in an httpOnly cookie. Same origin, so the cookie rides along.
export const SESSION_ENDPOINT = axios.create({
 baseURL: '/api/session',
});

const readAccessToken = (): string => getAccessToken();

let refreshInFlight: Promise<string | null> | null = null;

const rotateTokens = async (staleToken: string): Promise<string | null> => {
 // A sign-in may have landed while this call waited for the lock.
 const currentToken = readAccessToken();
 if (currentToken && currentToken !== staleToken) return currentToken;

 const { data } = await axios.post('/api/session/refresh', null, { timeout: 15000 });
 if (typeof data?.accessToken !== 'string') return null;
 setAccessToken(data.accessToken);
 return data.accessToken;
};

// After a refresh finds no session, the requests a page fires on load would each try again.
let noSessionUntil = 0;
const NO_SESSION_MEMO_MS = 5000;

/**
 * Exchanges the refresh cookie for a new access token and returns it, or null
 * when the session is dead (or there is none yet). Refresh tokens are single use
 * and the backend revokes every session when one is replayed, and all tabs share
 * the one cookie, so at most one refresh may run across all tabs: the promise
 * dedupes within a tab, the Web Lock across tabs.
 * A network failure rejects instead, because the session may still be fine.
 */
export const refreshSession = (): Promise<string | null> => {
 if (!refreshInFlight && Date.now() < noSessionUntil) return Promise.resolve(null);
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
  refreshInFlight = pending
   .then((token) => {
    noSessionUntil = token ? 0 : Date.now() + NO_SESSION_MEMO_MS;
    return token;
   })
   .finally(() => {
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
 SESSION_ENDPOINT,
];

// Public routes: a 401 there means bad credentials, not an expired session, and they need no token.
const PUBLIC_INSTANCES = new Set([GATEWAY_ENDPOINT, SESSION_ENDPOINT]);
// Only the API gets the admin's token; the upload host is a different server.
const NO_TOKEN_INSTANCES = new Set([SESSION_ENDPOINT, IMAGE_UPLOAD_ENDPOINT]);

instanceArray.forEach((instance) => {
 instance.defaults.timeout = 15000; // Set global timeout to 15 seconds
 instance.interceptors.request.use(async (config: any) => {
 if (NO_TOKEN_INSTANCES.has(instance)) return config;
 let tokenValue = readAccessToken();
 // After a reload the token is gone from memory; get one from the refresh cookie first.
 if (!tokenValue && !PUBLIC_INSTANCES.has(instance) && typeof window !== 'undefined') {
  tokenValue = (await refreshSession().catch(() => null)) || '';
 }

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
 // Public auth routes answer 401 for bad credentials rather than an expired session.
 if (!PUBLIC_INSTANCES.has(instance) && typeof window !== 'undefined' && !err.config?._retriedAfterRefresh) {
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
