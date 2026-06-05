import bcrypt from 'bcryptjs'
import express from 'express'
import jwt from 'jsonwebtoken'
import { getJwtSecret, requireAdmin } from '../middleware/adminAuth.js'
import { getPrisma } from '../services/prismaClient.js'

const router = express.Router()

const resources = {
  destinations: {
    model: 'destination',
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    normalize: (body) => ({
      id: body.id,
      name: body.name,
      category: body.category,
      location: body.location,
      latitude: Number(body.latitude),
      longitude: Number(body.longitude),
      routeNodeId: body.routeNodeId || null,
      shortDesc: body.shortDesc,
      description: body.description,
      image: body.image || null,
      keywords: parseKeywords(body.keywords),
      sortOrder: Number(body.sortOrder || 0),
      isPublished: Boolean(body.isPublished)
    })
  },
  culture: {
    model: 'culture',
    orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
    normalize: basicContent
  },
  culinary: {
    model: 'culinary',
    orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
    normalize: basicContent
  },
  gallery: {
    model: 'galleryItem',
    orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
    normalize: (body) => ({
      id: body.id,
      title: body.title,
      image: body.image,
      className: body.className || null,
      category: body.category || null,
      description: body.description || null,
      sortOrder: Number(body.sortOrder || 0),
      isPublished: Boolean(body.isPublished)
    })
  },
  faq: {
    model: 'faq',
    orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
    normalize: (body) => ({
      id: body.id,
      title: body.title,
      category: body.category,
      summary: body.summary,
      keywords: parseKeywords(body.keywords),
      sortOrder: Number(body.sortOrder || 0),
      isPublished: Boolean(body.isPublished)
    })
  },
  transportation: {
    model: 'transportation',
    orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
    normalize: basicContent
  },
  history: {
    model: 'history',
    orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
    normalize: (body) => ({
      id: body.id,
      title: body.title,
      period: body.period || null,
      summary: body.summary,
      description: body.description || null,
      keywords: parseKeywords(body.keywords),
      sortOrder: Number(body.sortOrder || 0),
      isPublished: Boolean(body.isPublished)
    })
  },
  sources: {
    model: 'source',
    orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
    normalize: (body) => ({
      id: body.id,
      title: body.title,
      type: body.type,
      publisher: body.publisher || null,
      url: body.url || null,
      description: body.description || null,
      sortOrder: Number(body.sortOrder || 0)
    })
  }
}

function parseKeywords(value) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean)
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function basicContent(body) {
  return {
    id: body.id,
    title: body.title,
    category: body.category || null,
    summary: body.summary,
    description: body.description || null,
    image: body.image || null,
    icon: body.icon || null,
    keywords: parseKeywords(body.keywords),
    sortOrder: Number(body.sortOrder || 0),
    isPublished: Boolean(body.isPublished)
  }
}

function getResource(req, res) {
  const config = resources[req.params.resource]
  if (!config) {
    res.status(404).json({ error: 'Resource admin tidak ditemukan' })
    return null
  }
  return config
}

router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan password wajib diisi' })
  }

  try {
    const prisma = getPrisma()
    const admin = await prisma.admin.findUnique({ where: { email } })
    const valid = admin ? await bcrypt.compare(password, admin.passwordHash) : false

    if (!valid) {
      return res.status(401).json({ error: 'Email atau password salah' })
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, name: admin.name },
      getJwtSecret(),
      { expiresIn: '8h' }
    )

    res.json({ token, admin: { id: admin.id, name: admin.name, email: admin.email } })
  } catch (error) {
    console.error('Admin login error:', error)
    res.status(500).json({ error: 'Login admin gagal. Pastikan database sudah migrasi dan seed.' })
  }
})

router.get('/me', requireAdmin, (req, res) => {
  res.json({ admin: req.admin })
})

router.get('/:resource', requireAdmin, async (req, res) => {
  const config = getResource(req, res)
  if (!config) return

  const prisma = getPrisma()
  const data = await prisma[config.model].findMany({ orderBy: config.orderBy })
  res.json({ data })
})

router.post('/:resource', requireAdmin, async (req, res) => {
  const config = getResource(req, res)
  if (!config) return

  const data = config.normalize(req.body)
  if (!data.id) return res.status(400).json({ error: 'ID wajib diisi' })

  const prisma = getPrisma()
  const item = await prisma[config.model].create({ data })
  res.status(201).json({ data: item })
})

router.put('/:resource/:id', requireAdmin, async (req, res) => {
  const config = getResource(req, res)
  if (!config) return

  const data = config.normalize({ ...req.body, id: req.params.id })
  delete data.id

  const prisma = getPrisma()
  const item = await prisma[config.model].update({
    where: { id: req.params.id },
    data
  })
  res.json({ data: item })
})

router.delete('/:resource/:id', requireAdmin, async (req, res) => {
  const config = getResource(req, res)
  if (!config) return

  const prisma = getPrisma()
  await prisma[config.model].delete({ where: { id: req.params.id } })
  res.status(204).send()
})

export default router
