// Cloudflare Pages Function — POST /api/payments/orange-money-checkout
//
// Initiates an Orange Money Web Payment session and returns the payment
// page URL to redirect the customer to. Requires three environment
// variables (Cloudflare Pages > Settings > Environment variables),
// obtained from a partner account on the Orange Developer Center:
//   ORANGE_MONEY_CLIENT_ID
//   ORANGE_MONEY_CLIENT_SECRET
//   ORANGE_MONEY_MERCHANT_KEY
//
// NOTE: Orange Money's Web Payment API contract (endpoint region segment,
// exact field names) varies by country/partner agreement and is NOT as
// uniformly documented as Wave's. This follows Orange's commonly published
// OAuth2-then-webpayment flow, but must be verified against the real
// Orange Developer Center contract for Côte d'Ivoire before going live.
//
// Until the env vars are set, this returns a 503 "not_configured" error so
// the frontend can fall back to the WhatsApp flow.

export async function onRequestPost({ request, env }) {
  const { ORANGE_MONEY_CLIENT_ID, ORANGE_MONEY_CLIENT_SECRET, ORANGE_MONEY_MERCHANT_KEY } = env;
  if (!ORANGE_MONEY_CLIENT_ID || !ORANGE_MONEY_CLIENT_SECRET || !ORANGE_MONEY_MERCHANT_KEY) {
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
  const orderId = `${formation || 'formation'}-${Date.now()}`;

  let tokenResponse;
  try {
    const basicAuth = btoa(`${ORANGE_MONEY_CLIENT_ID}:${ORANGE_MONEY_CLIENT_SECRET}`);
    tokenResponse = await fetch('https://api.orange.com/oauth/v3/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
  } catch {
    return jsonResponse({ error: 'orange_unreachable' }, 502);
  }

  if (!tokenResponse.ok) {
    return jsonResponse({ error: 'orange_auth_failed' }, 502);
  }

  const { access_token } = await tokenResponse.json();

  let paymentResponse;
  try {
    paymentResponse = await fetch('https://api.orange.com/orange-money-webpay/ci/v1/webpayment', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        merchant_key: ORANGE_MONEY_MERCHANT_KEY,
        currency,
        order_id: orderId,
        amount: Number(amount),
        return_url: `${origin}/inscription?payment=success`,
        cancel_url: `${origin}/inscription?payment=cancelled`,
        notif_url: `${origin}/api/payments/orange-money-webhook`,
        lang: 'fr',
        reference: `${name || ''} ${phone || ''}`.trim(),
      }),
    });
  } catch {
    return jsonResponse({ error: 'orange_unreachable' }, 502);
  }

  if (!paymentResponse.ok) {
    return jsonResponse({ error: 'orange_request_failed' }, 502);
  }

  const session = await paymentResponse.json();
  return jsonResponse({ checkoutUrl: session.payment_url, payToken: session.pay_token });
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
