import { NextRequest } from 'next/server';
import { apiError, blocked, callApi, crossSite, pick, readBody, signedIn, unreachable } from '../_lib/upstream';

/** Email and password sign-in. Answers with a two-factor challenge or the access token. */
export async function POST(req: NextRequest) {
  if (crossSite(req)) return blocked('cross-site', req, 403, 'Forbidden');
  const body = await readBody(req);
  if (body === 'too-large') return blocked('body-too-large', req, 413, 'Request too large');
  if (body === 'invalid') return blocked('invalid-body', req, 400, 'Invalid request');
  try {
    const result = await callApi('auth/admin/login', pick(body, ['email', 'password']), req);
    return result.status === 200 ? signedIn(result) : apiError(result);
  } catch (err) {
    return unreachable(req, err);
  }
}
