import express from 'express'
import {
  getCulinaryItems,
  getCultures,
  getFaqItems,
  getGalleryItems,
  getHistoryItems,
  getSourceItems,
  getTransportationItems
} from '../services/contentService.js'

const router = express.Router()

router.get('/culture', async (req, res) => {
  res.json({ data: await getCultures() })
})

router.get('/culinary', async (req, res) => {
  res.json({ data: await getCulinaryItems() })
})

router.get('/gallery', async (req, res) => {
  res.json({ data: await getGalleryItems() })
})

router.get('/faq', async (req, res) => {
  res.json({ data: await getFaqItems() })
})

router.get('/transportation', async (req, res) => {
  res.json({ data: await getTransportationItems() })
})

router.get('/history', async (req, res) => {
  res.json({ data: await getHistoryItems() })
})

router.get('/sources', async (req, res) => {
  res.json({ data: await getSourceItems() })
})

export default router
