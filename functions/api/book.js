const ALLOWED_DATES = new Set([
  'May 26 – 31, 2026',
  'September 16 – 21, 2026',
  'October 28 – November 2, 2026',
]);

const RECIPIENTS = ['contact@thecareranch.com', 'willem@scex.nl'];
const FROM = 'The Care Ranch <onboarding@resend.dev>';

export async function onRequestPost({ request, env }) {
  if (!env.RESEND_API_KEY) {
    return json({ ok: false, error: 'Server not configured' }, 500);
  }

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

  const subject = `Retreat booking request, ${date}`;
  const text = [
    'New retreat booking request:',
    '',
    `  Date:  ${date}`,
    `  Name:  ${name}`,
    `  Email: ${email}`,
    '',
    'Reply directly to this email to reach the guest.',
  ].join('\n');

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM,
      to: RECIPIENTS,
      reply_to: email,
      subject,
      text,
    }),
  });

  if (!resendResponse.ok) {
    const detail = await resendResponse.text().catch(() => '');
    console.error('Resend error', resendResponse.status, detail);
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
