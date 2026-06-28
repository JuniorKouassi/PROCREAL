const ENDPOINTS = {
  wave: '/api/payments/wave-checkout',
  'orange-money': '/api/payments/orange-money-checkout',
};

/** Calls the matching Cloudflare Pages Function. Throws if the provider isn't configured yet (no API key set). */
export async function initiateCheckout(provider, payload) {
  const endpoint = ENDPOINTS[provider];
  if (!endpoint) throw new Error('unknown_provider');

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'checkout_failed');
  return body;
}
