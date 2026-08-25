export function shippingProviderStatus() {
  const provider = process.env.SHIPPING_PROVIDER || ''
  const configured = Boolean(provider && process.env.SHIPPING_API_KEY)
  return { provider: provider || null, configured }
}

export async function quoteShipment() {
  const status = shippingProviderStatus()
  if (!status.configured) {
    const error = new Error('shipping_provider_not_configured')
    error.status = 501
    throw error
  }

  // Provider-specific quote/label/tracking logic belongs here.
  const error = new Error('shipping_provider_adapter_not_implemented')
  error.status = 501
  throw error
}
