import { CFP_COOKIE_MAX_AGE } from './constants.js';
import { sha256, getCookieKeyValue } from './utils.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  const body = await request.formData();
  const password = (body.get('password') || '').toString();
  const redirect = (body.get('redirect') || '/stats').toString();

  if (!env.CFP_PASSWORD) {
    return new Response('Dashboard is not configured.', { status: 500 });
  }

  const submitted = await sha256(password);
  const expected = await sha256(env.CFP_PASSWORD);

  if (submitted === expected) {
    const cookieKeyValue = await getCookieKeyValue(env.CFP_PASSWORD);
    return new Response('', {
      status: 302,
      headers: {
        'Set-Cookie': `${cookieKeyValue}; Max-Age=${CFP_COOKIE_MAX_AGE}; Path=/; HttpOnly; Secure; SameSite=Lax`,
        'Cache-Control': 'no-store',
        Location: redirect,
      },
    });
  }

  return new Response('', {
    status: 302,
    headers: {
      'Cache-Control': 'no-store',
      Location: `${redirect}?error=1`,
    },
  });
}
