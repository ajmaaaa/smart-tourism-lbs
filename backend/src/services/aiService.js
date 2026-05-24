import { GoogleGenerativeAI } from '@google/generative-ai'
import { buildContext } from './ragService.js'

const SYSTEM_PROMPT = `Kamu adalah Pak Cik Penyengat, asisten wisata AI untuk website Smart Tourism Kepulauan Riau.
Tugasmu membantu wisatawan memahami destinasi, budaya, sejarah, transportasi, dan rute wisata.
Gunakan Bahasa Indonesia yang jelas, ramah, dan ringkas.
Jika ada konteks RAG, jadikan konteks tersebut sebagai rujukan utama.
Jika informasi tidak ada di knowledge base, jawab secara hati-hati dan sarankan konfirmasi ke pengelola.`

function hasApiKey() {
  const key = process.env.GEMINI_API_KEY
  return key && !key.includes('isi_api_key') && key.length > 20
}

function fallbackReply(message, contextItems) {
  if (contextItems.length) {
    const top = contextItems[0]
    return `Berdasarkan informasi lokal kami: ${top.title || top.name} — ${top.summary || top.description || 'silakan kunjungi langsung untuk info lebih lanjut.'}`
  }
  return 'Saya belum menemukan data yang cocok di knowledge base lokal. Coba tanyakan tentang Masjid Raya Sultan Riau, Benteng Bukit Kursi, Makam Raja Ali Haji, transportasi pompong, atau rute wisata Pulau Penyengat.'
}

export const aiService = {
  async chat({ message, history = [], contextItems = [] }) {
    if (!hasApiKey()) {
      console.warn('⚠️ GEMINI_API_KEY tidak valid atau belum diisi')
      return fallbackReply(message, contextItems)
    }

    try {
      const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
      const model = genAI.getGenerativeModel({ model: modelName })
      const context = buildContext(contextItems)

      const safeHistory = history
        .filter((item) => item?.text && ['user', 'assistant'].includes(item.role))
        .slice(-8)
        .map((item) => ({
          role: item.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: item.text }]
        }))

      const chat = model.startChat({
        history: [
          { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
          { role: 'model', parts: [{ text: 'Siap. Saya akan menjawab sebagai Pak Cik Penyengat.' }] },
          ...safeHistory
        ]
      })

      const ragPrompt = contextItems.length
        ? `Konteks RAG dari knowledge base lokal:\n${context}\n\nBerdasarkan konteks di atas, jawab pertanyaan berikut dalam Bahasa Indonesia:\n${message}`
        : `Pertanyaan pengguna (tidak ada konteks spesifik):\n${message}\n\nJawab sesuai pengetahuanmu tentang wisata Kepulauan Riau.`

      const result = await chat.sendMessage(ragPrompt)
      return result.response.text()

    } catch (error) {
      console.error('❌ Gemini error full:', error)
      if (error.message?.includes('API_KEY_INVALID')) {
        console.error('❌ API Key Gemini tidak valid!')
      }
      return fallbackReply(message, contextItems)
    }
  }
}