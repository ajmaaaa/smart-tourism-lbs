import jwt from 'jsonwebtoken'

export function getJwtSecret() {
  return process.env.JWT_SECRET || 'dev-only-smart-tourism-admin-secret'
}

export function requireAdmin(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''

  if (!token) {
    return res.status(401).json({ error: 'Token admin diperlukan' })
  }

  try {
    req.admin = jwt.verify(token, getJwtSecret())
    next()
  } catch (error) {
    res.status(401).json({ error: 'Token admin tidak valid' })
  }
}
