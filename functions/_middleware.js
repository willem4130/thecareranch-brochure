import { CFP_PROTECTED_PATHS } from './constants.js';
import { getCookieKeyValue } from './utils.js';
import { getTemplate } from './template.js';

export async function onRequest(context) {
  const { request, next, env } = context;
  const { pathname, searchParams } = new URL(request.url);

  if (!CFP_PROTECTED_PATHS.includes(pathname)) {
    return next();
  }

  if (!env.CFP_PASSWORD) {
    return new Response('Dashboard is not configured (missing CFP_PASSWORD secret).', {
      status: 500,
      headers: { 'content-type': 'text/plain', 'cache-control': 'no-store' },
    });
  }

  const cookie = request.headers.get('cookie') || '';
  const cookieKeyValue = await getCookieKeyValue(env.CFP_PASSWORD);
  if (cookie.includes(cookieKeyValue)) {
    return next();
  }

  const withError = searchParams.get('error') === '1';
  return new Response(getTemplate({ redirectPath: pathname, withError }), {
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  });
}
