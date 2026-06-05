import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { requireAdmin } from '../middleware/adminAuth.js'

const router = express.Router()

// Ensure upload directory exists
const uploadDir = 'uploads'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const baseName = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '_').toLowerCase()
    cb(null, `${baseName}-${Date.now()}${ext}`)
  }
})

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|svg|webp/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (extname && mimetype) {
    cb(null, true)
  } else {
    cb(new Error('Hanya berkas gambar yang diperbolehkan! (.jpg, .jpeg, .png, .gif, .svg, .webp)'))
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
})

router.post('/', requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Tidak ada berkas yang diunggah' })
  }
  
  const relativePath = `/uploads/${req.file.filename}`
  res.status(200).json({ 
    message: 'Berkas berhasil diunggah',
    url: relativePath 
  })
}, (error, req, res, next) => {
  res.status(400).json({ error: error.message })
})

export default router
