import { getPrisma } from './prismaClient.js'
import {
  cultures,
  culinaryItems,
  destinations,
  faqItems,
  galleryItems,
  historyItems,
  sourceItems,
  transportationItems
} from '../data/seedData.js'

const orderBy = [{ sortOrder: 'asc' }, { createdAt: 'asc' }]
let databaseAvailable = true

function destinationView(item) {
  return {
    id: item.id,
    name: item.name,
    title: item.name,
    type: 'destination',
    category: item.category,
    location: item.location,
    coordinates: { lat: item.latitude, lng: item.longitude },
    routeNodeId: item.routeNodeId,
    shortDesc: item.shortDesc,
    summary: item.shortDesc,
    description: item.description,
    image: item.image,
    keywords: item.keywords || []
  }
}

function cultureView(item) {
  return {
    id: item.id,
    title: item.title,
    type: 'culture',
    category: item.category,
    summary: item.summary,
    description: item.description || item.summary,
    image: item.image,
    icon: item.icon,
    keywords: item.keywords || []
  }
}

function culinaryView(item) {
  return {
    id: item.id,
    title: item.title,
    type: 'culinary',
    category: item.category || 'Kuliner',
    summary: item.summary,
    description: item.description || item.summary,
    image: item.image,
    keywords: item.keywords || []
  }
}

function faqView(item) {
  return {
    id: item.id,
    title: item.title,
    type: 'faq',
    category: item.category,
    summary: item.summary,
    keywords: item.keywords || []
  }
}

function transportationView(item) {
  return {
    id: item.id,
    title: item.title,
    type: 'transportation',
    category: item.category,
    summary: item.summary,
    description: item.description || item.summary,
    keywords: item.keywords || []
  }
}

function historyView(item) {
  return {
    id: item.id,
    title: item.title,
    type: 'history',
    category: item.period || 'Sejarah',
    summary: item.summary,
    description: item.description || item.summary,
    keywords: item.keywords || []
  }
}

function sourceView(item) {
  return {
    id: item.id,
    title: item.title,
    type: 'source',
    category: item.type,
    publisher: item.publisher,
    url: item.url,
    summary: item.description || item.publisher || item.type
  }
}

function galleryView(item) {
  return {
    id: item.id,
    title: item.title,
    type: 'gallery',
    category: item.category || 'Galeri',
    description: item.description,
    image: item.image,
    className: item.className
  }
}

async function fromDb(query, fallback) {
  if (!databaseAvailable || !process.env.DATABASE_URL) return fallback

  try {
    const prisma = getPrisma()
    return await query(prisma)
  } catch (error) {
    databaseAvailable = false
    console.warn('Database belum tersedia, memakai seed fallback:', error.message)
    return fallback
  }
}

export async function getDestinations() {
  return fromDb(
    async (prisma) => (await prisma.destination.findMany({ where: { isPublished: true }, orderBy })).map(destinationView),
    destinations.map(destinationView)
  )
}

export async function getCultures() {
  return fromDb(
    async (prisma) => (await prisma.culture.findMany({ where: { isPublished: true }, orderBy })).map(cultureView),
    cultures.map(cultureView)
  )
}

export async function getCulinaryItems() {
  return fromDb(
    async (prisma) => (await prisma.culinary.findMany({ where: { isPublished: true }, orderBy })).map(culinaryView),
    culinaryItems.map(culinaryView)
  )
}

export async function getGalleryItems() {
  return fromDb(
    async (prisma) => (await prisma.galleryItem.findMany({ where: { isPublished: true }, orderBy })).map(galleryView),
    galleryItems.map(galleryView)
  )
}

export async function getFaqItems() {
  return fromDb(
    async (prisma) => (await prisma.faq.findMany({ where: { isPublished: true }, orderBy })).map(faqView),
    faqItems.map(faqView)
  )
}

export async function getTransportationItems() {
  return fromDb(
    async (prisma) => (await prisma.transportation.findMany({ where: { isPublished: true }, orderBy })).map(transportationView),
    transportationItems.map(transportationView)
  )
}

export async function getHistoryItems() {
  return fromDb(
    async (prisma) => (await prisma.history.findMany({ where: { isPublished: true }, orderBy })).map(historyView),
    historyItems.map(historyView)
  )
}

export async function getSourceItems() {
  return fromDb(
    async (prisma) => (await prisma.source.findMany({ orderBy })).map(sourceView),
    sourceItems.map(sourceView)
  )
}

export async function getKnowledgeItems() {
  const groups = await Promise.all([
    getDestinations(),
    getCultures(),
    getCulinaryItems(),
    getFaqItems(),
    getTransportationItems(),
    getHistoryItems()
  ])

  return groups.flat()
}
