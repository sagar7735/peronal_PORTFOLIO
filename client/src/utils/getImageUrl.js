const PLACEHOLDER = '/placeholder.png'
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export function getImageUrl(path) {
  if (!path) return PLACEHOLDER
  if (path.startsWith('http')) return path
  return `${BASE}${path}`
}
