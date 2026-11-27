import { isIP } from 'net';
import { NextRequest, NextResponse } from 'next/server';

/*
 * Server side of admin sign-in. The browser never holds the refresh token: these routes keep it
 * in an httpOnly cookie on the back office's own domain and hand the page only the 15-minute
 * access token. They follow the proxy rules: one fixed API address, a fixed list of API paths
 * named in code, request bodies rebuilt field by field, outgoing headers built rather than
 * copied, no redirects, a timeout and a body cap.
 *
 * Server settings (never NEXT_PUBLIC_):
 *   API_INTERNAL_URL         API address as this server reaches it. Falls back to NEXT_PUBLIC_API_BASE_URL.
 *   BACKOFFICE_PROXY_SECRET  Same value as the API's. Lets the API trust the admin's IP sent by this server.
 *   CLIENT_IP_HEADER         Header your edge sets to the visitor's IP (e.g. cf-connecting-ip). Optional.
 *   TRUST_PROXY_HOPS         Otherwise, how many proxies in front of this server append to X-Forwarded-For.
 */

export const REFRESH_COOKIE = 'ps_admin_refresh';
const COOKIE_PATH = '/api/session';
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // the API's session lifetime
const MAX_BODY_BYTES = 16 * 1024;
const TIMEOUT_MS = 15_000;

/** The only API paths these routes call. */
export type ApiPath =
  | 'auth/admin/login'
  | 'auth/admin/2fa/login-verify'
  | 'auth/admin/accept-invite'
  | 'auth/refresh'
  | 'auth/logout';

export interface ApiResult {
  status: number;
  data: any;
}

function apiBase(): URL {
  const raw = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!raw) throw new Error('API_INTERNAL_URL is not set');
  return new URL(raw.endsWith('/') ? raw : `${raw}/`);
}

export function blocked(reason: string, req: NextRequest, status: number, message: string) {
  console.warn(`[session][blocked:${reason}] ${req.method} ${req.nextUrl.pathname}`);
  return NextResponse.json({ statusCode: status, message }, { status });
}

/**
 * Same-origin only. The refresh cookie is SameSite=Strict already; this also stops another site
 * from posting a login form here (login CSRF).
 */
export function crossSite(req: NextRequest): boolean {
  const site = req.headers.get('sec-fetch-site');
  if (site && site !== 'same-origin') return true;
  const origin = req.headers.get('origin');
  if (!origin) return false;
  const host = req.headers.get('x-forwarded-host')?.split(',')[0].trim() || req.headers.get('host');
  try {
    return new URL(origin).host !== host;
  } catch {
    return true;
  }
}

const WARN_EVERY_MS = 10 * 60 * 1000;
let lastIpWarnAt = -Infinity;

/** Setup problems that cost admins their own IP at the API, logged at most every 10 minutes. */
function warnIp(message: string) {
  if (Date.now() - lastIpWarnAt < WARN_EVERY_MS) return;
  lastIpWarnAt = Date.now();
  console.warn(`[session][client-ip] ${message}`);
}

/**
 * The visitor's IP from a source the deployment trusts, or null. Without it the API sees this
 * server's address for every sign-in, so all admins share one login rate limit.
 */
function clientIp(req: NextRequest): string | null {
  const header = process.env.CLIENT_IP_HEADER?.trim().toLowerCase();
  const hops = Number(process.env.TRUST_PROXY_HOPS || '0');
  if (header) {
    if (!/^[a-z0-9-]+$/.test(header)) {
      warnIp(`CLIENT_IP_HEADER must be a single header name, e.g. cf-connecting-ip; ignoring "${header}".`);
      return null;
    }
    const ip = req.headers.get(header)?.trim();
    if (ip && isIP(ip)) return ip;
    // The edge that sets this header has probably gone (e.g. Cloudflare removed) while the setting stayed.
    warnIp(
      `CLIENT_IP_HEADER is "${header}" but a sign-in arrived without a valid one, so the admin's IP is not sent. ` +
        'If the proxy in front of the back office changed, update CLIENT_IP_HEADER or switch to TRUST_PROXY_HOPS.',
    );
    return null;
  }
  if (Number.isInteger(hops) && hops > 0) {
    const chain = (req.headers.get('x-forwarded-for') || '').split(',').map((s) => s.trim()).filter(Boolean);
    // Each trusted proxy appends the address it saw; the visitor is `hops` entries from the right.
    const ip = chain[chain.length - hops];
    if (ip && isIP(ip)) return ip;
    warnIp(`TRUST_PROXY_HOPS is ${hops} but X-Forwarded-For has only ${chain.length} entries, so the admin's IP is not sent.`);
    return null;
  }
  if (process.env.NODE_ENV === 'production') {
    warnIp('Neither CLIENT_IP_HEADER nor TRUST_PROXY_HOPS is set, so the API sees this server\'s address for every sign-in.');
  }
  return null;
}

/** The JSON object body, or a reason it was refused. */
export async function readBody(req: NextRequest): Promise<Record<string, unknown> | 'too-large' | 'invalid'> {
  if (Number(req.headers.get('content-length') || 0) > MAX_BODY_BYTES) return 'too-large';
  const text = await req.text();
  if (Buffer.byteLength(text) > MAX_BODY_BYTES) return 'too-large';
  try {
    const parsed = JSON.parse(text || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : 'invalid';
  } catch {
    return 'invalid';
  }
}

/** Only the named string fields, so nothing else the caller sent reaches the API. */
export function pick(body: Record<string, unknown>, fields: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of fields) if (typeof body[f] === 'string') out[f] = body[f] as string;
  return out;
}

export async function callApi(path: ApiPath, body: Record<string, string>, req: NextRequest): Promise<ApiResult> {
  const base = apiBase();
  const target = new URL(path, base);
  if (target.origin !== base.origin || !target.pathname.startsWith(base.pathname)) {
    throw new Error('API path escaped the configured base');
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'application/json' };
  for (const name of ['accept-language', 'user-agent']) {
    const value = req.headers.get(name);
    if (value) headers[name] = value;
  }
  const secret = process.env.BACKOFFICE_PROXY_SECRET?.trim();
  const ip = clientIp(req);
  if (ip && !secret) warnIp('BACKOFFICE_PROXY_SECRET is not set, so the API cannot trust the admin\'s IP.');
  if (secret && ip) {
    headers['X-Backoffice-Proxy-Secret'] = secret;
    headers['X-Backoffice-Client-Ip'] = ip;
  }

  const res = await fetch(target, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    redirect: 'manual',
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: 'no-store',
  });
  if (res.status >= 300 && res.status < 400) {
    console.warn(`[session][blocked:redirect-refused] POST ${path}`);
    return { status: 502, data: { statusCode: 502, message: 'Sign-in service unavailable' } };
  }
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

/** The API's error, reduced to what the page shows. */
export function apiError({ status, data }: ApiResult) {
  return NextResponse.json(
    { statusCode: status, message: data?.message ?? 'Request failed', error: data?.error },
    { status },
  );
}

export function unreachable(req: NextRequest, err: unknown) {
  console.error(`[session] ${req.nextUrl.pathname} could not reach the API: ${(err as Error)?.name ?? 'error'}`);
  return NextResponse.json({ statusCode: 502, message: 'Sign-in service unavailable' }, { status: 502 });
}

export function setRefreshCookie(res: NextResponse, token: string) {
  res.cookies.set(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: COOKIE_PATH,
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearRefreshCookie(res: NextResponse) {
  res.cookies.set(REFRESH_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: COOKIE_PATH,
    maxAge: 0,
  });
}

/**
 * Turns the API's sign-in answer into the page's: a two-factor challenge passes through,
 * tokens become a cookie (refresh) and a body (access only).
 */
export function signedIn(result: ApiResult) {
  const { data } = result;
  if (data?.twoFactorRequired) {
    return NextResponse.json({
      twoFactorRequired: true,
      method: data.method,
      pendingToken: data.pendingToken,
      devCode: data.devCode,
    });
  }
  if (typeof data?.accessToken !== 'string' || typeof data?.refreshToken !== 'string') {
    return NextResponse.json({ statusCode: 502, message: 'Sign-in service unavailable' }, { status: 502 });
  }
  const res = NextResponse.json({ accessToken: data.accessToken });
  setRefreshCookie(res, data.refreshToken);
  return res;
}
