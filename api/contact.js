// Contact form endpoint: POST /api/contact
// Sends each submission to CONTACT_TO by email through Resend (https://resend.com).
//
// Environment variables (Vercel → Settings → Environment Variables):
//   RESEND_API_KEY  required  API key from Resend
//   CONTACT_FROM    required  verified sender, e.g. "Threedays <forms@threedays.co>"
//   CONTACT_TO      optional  inbox for submissions (default: hello@threedays.co)

const FALLBACK_EMAIL = 'hello@threedays.co';
const TOPICS = new Set(['General', 'AI lab', 'Data partner']);
const LIMITS = { name: 120, org: 160, email: 254, note: 5000 };

const clean = (v, max) => String(v ?? '').replace(/\r\n?/g, '\n').trim().slice(0, max);
const oneLine = (v) => v.replace(/[\r\n]+/g, ' ');
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

async function readFields(request) {
  const type = request.headers.get('content-type') || '';
  if (type.includes('application/json')) return { fields: await request.json(), wantsJson: true };
  const form = await request.formData();
  return { fields: Object.fromEntries(form), wantsJson: false };
}

function reply(wantsJson, status, body) {
  if (wantsJson) return Response.json(body, { status });
  // No-JavaScript fallback: send the visitor back to the form with a status flag.
  const flag = body.ok ? 'sent=1' : 'error=1';
  return new Response(null, { status: 303, headers: { Location: `/?${flag}#contact` } });
}

export async function POST(request) {
  let fields, wantsJson = true;
  try {
    ({ fields, wantsJson } = await readFields(request));
  } catch {
    return Response.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  // Spam trap: real visitors never see or fill this field.
  if (clean(fields.website, 200)) return reply(wantsJson, 200, { ok: true });

  const name = oneLine(clean(fields.name, LIMITS.name));
  const org = oneLine(clean(fields.org, LIMITS.org));
  const email = oneLine(clean(fields.email, LIMITS.email));
  const note = clean(fields.note, LIMITS.note);
  const topic = TOPICS.has(fields.topic) ? fields.topic : 'General';

  if (!name || !org || !note || !isEmail(email)) {
    return reply(wantsJson, 422, { ok: false, error: 'Please fill in every field with a valid email address.' });
  }

  const { RESEND_API_KEY, CONTACT_FROM } = process.env;
  const to = process.env.CONTACT_TO || FALLBACK_EMAIL;
  if (!RESEND_API_KEY || !CONTACT_FROM) {
    console.error('Contact form is not configured: set RESEND_API_KEY and CONTACT_FROM.');
    return reply(wantsJson, 503, { ok: false, error: `The form is unavailable right now. Please email ${FALLBACK_EMAIL}.` });
  }

  const text = [
    `Topic: ${topic}`,
    `Name: ${name}`,
    `Organization: ${org}`,
    `Email: ${email}`,
    '',
    note,
  ].join('\n');

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: CONTACT_FROM,
        to: [to],
        reply_to: email,
        subject: `[threedays.co] ${topic}: ${name}, ${org}`,
        text,
      }),
    });
    if (!res.ok) {
      console.error('Resend error', res.status, await res.text());
      throw new Error('send failed');
    }
  } catch {
    return reply(wantsJson, 502, { ok: false, error: `Your message couldn't be sent. Please email ${FALLBACK_EMAIL}.` });
  }

  return reply(wantsJson, 200, { ok: true });
}
