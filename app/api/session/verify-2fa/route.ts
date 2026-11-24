import { NextRequest } from 'next/server';
import { apiError, blocked, callApi, crossSite, pick, readBody, signedIn, unreachable } from '../_lib/upstream';

/** Second step of sign-in: the two-factor code for the pending token. */
export async function POST(req: NextRequest) {
  if (crossSite(req)) return blocked('cross-site', req, 403, 'Forbidden');
  const body = await readBody(req);
  if (body === 'too-large') return blocked('body-too-large', req, 413, 'Request too large');
  if (body === 'invalid') return blocked('invalid-body', req, 400, 'Invalid request');
  try {
    const result = await callApi('auth/admin/2fa/login-verify', pick(body, ['pendingToken', 'code']), req);
    return result.status === 200 ? signedIn(result) : apiError(result);
  } catch (err) {
    return unreachable(req, err);
  }
}
