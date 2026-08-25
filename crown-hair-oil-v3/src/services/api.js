const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })

  if (!response.ok) {
    const error = new Error(`API request failed: ${response.status}`)
    error.status = response.status
    throw error
  }

  if (response.status === 204) return null
  return response.json()
}

export const commerceApi = {
  getProducts: () => request('/products'),
  getProduct: (slug) => request(`/products/${encodeURIComponent(slug)}`),
  createCheckout: (payload) => request('/checkout', { method: 'POST', body: JSON.stringify(payload) }),
  getOrder: (id) => request(`/orders/${encodeURIComponent(id)}`),
}

export const adminApi = {
  me: () => request('/admin/me'),
  getDashboard: () => request('/admin/dashboard'),
  getOrders: () => request('/admin/orders'),
  updateOrderStatus: (id, status) => request(`/admin/orders/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  updateProduct: (id, payload) => request(`/admin/products/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(payload) }),
}

export { API_BASE }
