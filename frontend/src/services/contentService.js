const API_BASE = import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== 'http://localhost:5000'
  ? import.meta.env.VITE_API_URL
  : (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:5000'
      : '');

export async function fetchContent(path, fallback) {
  try {
    const response = await fetch(`${API_BASE}${path}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const payload = await response.json()
    return Array.isArray(payload.data) ? payload.data : fallback
  } catch (error) {
    console.warn(`Memakai fallback lokal untuk ${path}:`, error.message)
    return fallback
  }
}

export function getImageUrl(path) {
  if (!path) return '/images/gallery-laut.svg'
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  if (path.startsWith('/uploads')) {
    return `${API_BASE}${path}`
  }
  return path
}

