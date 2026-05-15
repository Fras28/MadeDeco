import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Crear configuración inicial
  await prisma.settings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      businessName: 'Madedeco',
      discountPercentage: 20,
      totalSlots: 10,
      initialStamps: 2,
    },
  })

  console.log('✅ Base de datos inicializada con configuración de Madedeco')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
