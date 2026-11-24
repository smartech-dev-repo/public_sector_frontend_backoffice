import { NextRequest, NextResponse } from 'next/server';
import {
  REFRESH_COOKIE,
  apiError,
  blocked,
  callApi,
  clearRefreshCookie,
  crossSite,
  setRefreshCookie,
  unreachable,
} from '../_lib/upstream';

/**
 * Swaps the refresh cookie for a new access token. Refresh tokens are single use, so the cookie
 * is replaced on every success and cleared once the API says the session is over.
 */
export async function POST(req: NextRequest) {
  if (crossSite(req)) return blocked('cross-site', req, 403, 'Forbidden');
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) return NextResponse.json({ statusCode: 401, message: 'Not signed in' }, { status: 401 });
  try {
    const result = await callApi('auth/refresh', { refreshToken }, req);
    if (result.status === 200 && typeof result.data?.accessToken === 'string' && typeof result.data?.refreshToken === 'string') {
      const res = NextResponse.json({ accessToken: result.data.accessToken });
      setRefreshCookie(res, result.data.refreshToken);
      return res;
    }
    const res = apiError(result);
    if (result.status === 401) clearRefreshCookie(res);
    return res;
  } catch (err) {
    // The API may just be unreachable; keep the cookie so the session survives.
    return unreachable(req, err);
  }
}
