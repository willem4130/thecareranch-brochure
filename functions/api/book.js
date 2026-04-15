const ALLOWED_DATES = new Set([
  'May 26 – 31, 2026',
  'September 16 – 21, 2026',
  'October 28 – November 2, 2026',
]);

const PRIMARY_RECIPIENT = 'willem@scex.nl';
const CC_RECIPIENTS = 'contact@thecareranch.com';

export async function onRequestPost({ request }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid request body' }, 400);
  }

  const name = String(body?.name ?? '').trim().slice(0, 120);
  const email = String(body?.email ?? '').trim().slice(0, 180);
  const date = String(body?.date ?? '').trim();

  if (!name) return json({ ok: false, error: 'Name is required' }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: 'Valid email is required' }, 400);
  }
  if (!ALLOWED_DATES.has(date)) {
    return json({ ok: false, error: 'Please select a valid date' }, 400);
  }

  const origin = new URL(request.url).origin;
  const formSubmitResponse = await fetch(
    `https://formsubmit.co/ajax/${encodeURIComponent(PRIMARY_RECIPIENT)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Origin: origin,
        Referer: origin + '/',
      },
      body: JSON.stringify({
        _subject: `Retreat booking request, ${date}`,
        _cc: CC_RECIPIENTS,
        _replyto: email,
        _template: 'table',
        _captcha: 'false',
        Date: date,
        Name: name,
        Email: email,
      }),
    },
  );

  const result = await formSubmitResponse.json().catch(() => ({}));
  if (!formSubmitResponse.ok || result.success !== 'true') {
    console.error('FormSubmit error', formSubmitResponse.status, result);
    return json({ ok: false, error: 'Could not send email' }, 502);
  }

  return json({ ok: true });
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
