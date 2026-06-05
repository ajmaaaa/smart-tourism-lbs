import { getKnowledgeItems } from './contentService.js'

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/gi, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2)
}

function itemText(item) {
  return [
    item.title,
    item.name,
    item.type,
    item.category,
    item.location,
    item.summary,
    item.description,
    ...(item.keywords || [])
  ].join(' ')
}

const SYNONYMS = {
  'masjid': ['mesjid', 'mushola', 'tempat ibadah'],
  'benteng': ['fort', 'pertahanan'],
  'raja': ['kerajaan', 'sultan', 'riau'],
  'pompong': ['perahu', 'kapal', 'transportasi', 'boat'],
  'makam': ['kubur', 'makan', 'ziarah'],
  'penyengat': ['pulau penyengat', 'tanjung pinang'],
}

function expandTokens(tokens) {
  const expanded = new Set(tokens)
  for (const token of tokens) {
    for (const [key, aliases] of Object.entries(SYNONYMS)) {
      if (token === key || aliases.includes(token)) {
        expanded.add(key)
        aliases.forEach(a => expanded.add(a))
      }
    }
  }
  return [...expanded]
}

export async function searchKnowledgeBase(query, limit = 5) {
  if (!query || query.trim().length < 2) {
    const items = await getKnowledgeItems()
    return items.slice(0, limit)
  }

  const rawTokens = tokenize(query)
  const queryTokens = rawTokens.length
    ? expandTokens(rawTokens)
    : [query.toLowerCase().trim()]

  const items = await getKnowledgeItems()

  return items
    .map((item) => {
      const text = itemText(item).toLowerCase()
      const score = queryTokens.reduce((total, token) => {
        if (text.includes(token)) return total + (token.length > 4 ? 2 : 1)
        const words = text.split(/\s+/)
        const partialMatch = words.some(w => w.startsWith(token) || token.startsWith(w))
        if (partialMatch) return total + 0.5
        return total
      }, 0)
      return { ...item, score }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

export function buildContext(contextItems) {
  if (!contextItems.length) return 'Tidak ada konteks spesifik dari knowledge base.'

  return contextItems.map((item, index) => {
    return [
      `Sumber ${index + 1}: ${item.title || item.name}`,
      `Jenis: ${item.type || '-'}`,
      `Kategori: ${item.category || '-'}`,
      `Lokasi: ${item.location || '-'}`,
      `Ringkasan: ${item.summary || item.description || '-'}`
    ].join('\n')
  }).join('\n\n---\n\n')
}

export async function getAllKnowledgeItems() {
  return getKnowledgeItems()
}

export async function getKnowledgeBaseStats() {
  const items = await getKnowledgeItems()
  const byType = items.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1
    return acc
  }, {})
  return { total: items.length, byType }
}
