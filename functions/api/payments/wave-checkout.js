// Cloudflare Pages Function — POST /api/payments/wave-checkout
//
// Creates a Wave Business "Checkout" session and returns the launch URL to
// redirect the customer to. Requires a WAVE_API_KEY environment variable
// (set in Cloudflare Pages > Settings > Environment variables) obtained
// from a Wave Business merchant account at business.wave.com.
//
// Until WAVE_API_KEY is set, this returns a 503 "not_configured" error so
// the frontend can fall back to the WhatsApp flow.

export async function onRequestPost({ request, env }) {
  const apiKey = env.WAVE_API_KEY;
  if (!apiKey) {
    return jsonResponse({ error: 'not_configured' }, 503);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: 'invalid_body' }, 400);
  }

  const { amount, currency, formation, name, phone } = payload;
  if (!amount || !currency) {
    return jsonResponse({ error: 'missing_amount' }, 400);
  }

  const origin = new URL(request.url).origin;

  let waveResponse;
  try {
    waveResponse = await fetch('https://api.wave.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: String(amount),
        currency,
        error_url: `${origin}/inscription?payment=error`,
        success_url: `${origin}/inscription?payment=success`,
        client_reference: `${formation || 'formation'}-${name || ''}-${phone || ''}-${Date.now()}`,
      }),
    });
  } catch {
    return jsonResponse({ error: 'wave_unreachable' }, 502);
  }

  if (!waveResponse.ok) {
    return jsonResponse({ error: 'wave_request_failed' }, 502);
  }

  const session = await waveResponse.json();
  return jsonResponse({ checkoutUrl: session.wave_launch_url, sessionId: session.id });
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
