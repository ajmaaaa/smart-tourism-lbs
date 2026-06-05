import express from 'express'
import { getDestinations } from '../services/contentService.js'

const router = express.Router()

router.get('/', async (req, res) => {
  const items = await getDestinations()
  res.json({ data: items })
})

export default router
