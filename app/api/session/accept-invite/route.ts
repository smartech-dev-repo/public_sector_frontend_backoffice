import { NextRequest, NextResponse } from 'next/server';
import { apiError, blocked, callApi, crossSite, pick, readBody, unreachable } from '../_lib/upstream';

/**
 * Creates the invited admin's account. The API also signs them in, but the page sends them to
 * the sign-in screen next, so that session is revoked here and its tokens never reach the browser.
 */
export async function POST(req: NextRequest) {
  if (crossSite(req)) return blocked('cross-site', req, 403, 'Forbidden');
  const body = await readBody(req);
  if (body === 'too-large') return blocked('body-too-large', req, 413, 'Request too large');
  if (body === 'invalid') return blocked('invalid-body', req, 400, 'Invalid request');
  try {
    const result = await callApi(
      'auth/admin/accept-invite',
      pick(body, ['token', 'password', 'firstName', 'lastName']),
      req,
    );
    if (result.status !== 200) return apiError(result);
    if (typeof result.data?.refreshToken === 'string') {
      await callApi('auth/logout', { refreshToken: result.data.refreshToken }, req).catch(() => undefined);
    }
    return NextResponse.json({ accepted: true });
  } catch (err) {
    return unreachable(req, err);
  }
}
