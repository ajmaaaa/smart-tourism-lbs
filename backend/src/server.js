import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import adminRoutes from './routes/admin.js'
import chatRoutes from './routes/chat.js'
import contentRoutes from './routes/content.js'
import destinationRoutes from './routes/destinations.js'
import uploadRoutes from './routes/upload.js'
import routingRoutes from './routes/routing.js'
import { getKnowledgeBaseStats } from './services/ragService.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'

app.use(cors({ origin: FRONTEND_URL }))
app.use(express.json({ limit: '1mb' }))
app.use(morgan('dev'))
app.use(rateLimit({ windowMs: 60 * 1000, limit: 60 }))

app.get('/api/health', async (req, res) => {
  res.json({
    status: 'ok',
    message: 'Smart Tourism LBS API berjalan',
    knowledgeBase: await getKnowledgeBaseStats(),
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash'
  })
})

app.use('/uploads', express.static('uploads'))
app.use('/api/chat', chatRoutes)
app.use('/api/destinations', destinationRoutes)
app.use('/api', contentRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/route', routingRoutes)
app.use('/route', routingRoutes)

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan' })
})

app.listen(PORT, async () => {
  const stats = await getKnowledgeBaseStats()
  console.log(`📚 Knowledge base loaded: ${stats.total} dokumen`)
  console.log(`✅ Server berjalan di http://localhost:${PORT}`)
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🤖 Gemini Model: ${process.env.GEMINI_MODEL || 'gemini-2.5-flash'}`)
})
