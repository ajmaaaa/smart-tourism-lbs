import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import {
  cultures,
  culinaryItems,
  destinations,
  faqItems,
  galleryItems,
  historyItems,
  sourceItems,
  transportationItems
} from '../src/data/seedData.js'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function upsertMany(model, items) {
  for (const item of items) {
    await model.upsert({
      where: { id: item.id },
      update: item,
      create: item
    })
  }
}

async function main() {
  await upsertMany(prisma.destination, destinations)
  await upsertMany(prisma.culture, cultures)
  await upsertMany(prisma.culinary, culinaryItems)
  await upsertMany(prisma.galleryItem, galleryItems)
  await upsertMany(prisma.faq, faqItems)
  await upsertMany(prisma.transportation, transportationItems)
  await upsertMany(prisma.history, historyItems)
  await upsertMany(prisma.source, sourceItems)

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@penyengat.local'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  const passwordHash = await bcrypt.hash(adminPassword, 12)

  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {
      name: 'Admin Penyengat',
      passwordHash
    },
    create: {
      name: 'Admin Penyengat',
      email: adminEmail,
      passwordHash
    }
  })

  console.log('Seed data Smart Tourism LBS selesai.')
  console.log(`Admin default: ${adminEmail}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
