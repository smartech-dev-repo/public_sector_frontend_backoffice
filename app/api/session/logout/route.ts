import { NextRequest, NextResponse } from 'next/server';
import { REFRESH_COOKIE, blocked, callApi, clearRefreshCookie, crossSite } from '../_lib/upstream';

/** Revokes the session at the API and clears the cookie. The cookie goes even if the API is down. */
export async function POST(req: NextRequest) {
  if (crossSite(req)) return blocked('cross-site', req, 403, 'Forbidden');
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;
  if (refreshToken) {
    await callApi('auth/logout', { refreshToken }, req).catch(() => undefined);
  }
  const res = NextResponse.json({ loggedOut: true });
  clearRefreshCookie(res);
  return res;
}
