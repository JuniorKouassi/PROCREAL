export async function submitForm(form) {
  const webhookUrl = import.meta.env.PUBLIC_FORM_WEBHOOK_URL;
  const data = Object.fromEntries(new FormData(form).entries());

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('form submission failed');
  return data;
}

export function whatsappUrl(message) {
  const number = import.meta.env.PUBLIC_WHATSAPP_NUMBER || '2250749817621';
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
