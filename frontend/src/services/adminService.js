const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'
const TOKEN_KEY = 'smart-tourism-admin-token'

export function getAdminToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAdminToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearAdminToken() {
  localStorage.removeItem(TOKEN_KEY)
}

async function adminRequest(path, options = {}) {
  const token = getAdminToken()
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  if (response.status === 204) return null
  return response.json()
}

export async function loginAdmin(email, password) {
  return adminRequest('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
}

export async function fetchAdminResource(resource) {
  const payload = await adminRequest(`/api/admin/${resource}`)
  return payload.data || []
}

export async function saveAdminResource(resource, item, isEdit) {
  const path = isEdit ? `/api/admin/${resource}/${item.id}` : `/api/admin/${resource}`
  const payload = await adminRequest(path, {
    method: isEdit ? 'PUT' : 'POST',
    body: JSON.stringify(item)
  })
  return payload.data
}

export async function deleteAdminResource(resource, id) {
  return adminRequest(`/api/admin/${resource}/${id}`, { method: 'DELETE' })
}

export async function uploadImage(file) {
  const token = getAdminToken()
  const formData = new FormData()
  formData.append('image', file)

  const response = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    body: formData,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  return response.json()
}

