export function paymentProviderStatus() {
  const provider = process.env.PAYMENT_PROVIDER || ''
  const configured = Boolean(provider && process.env.PAYMENT_SECRET_KEY && process.env.PAYMENT_WEBHOOK_SECRET)
  return { provider: provider || null, configured }
}

export async function createPaymentSession() {
  const status = paymentProviderStatus()
  if (!status.configured) {
    const error = new Error('payment_gateway_not_configured')
    error.status = 501
    throw error
  }

  // Provider-specific implementation belongs here (Mada/cards/Apple Pay).
  // Never expose PAYMENT_SECRET_KEY or webhook secrets to the browser.
  const error = new Error('payment_provider_adapter_not_implemented')
  error.status = 501
  throw error
}
