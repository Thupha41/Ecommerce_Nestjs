import { PrismaService } from 'src/shared/services/prisma.service'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaService()

interface BrandData {
  id: number
  name: string
}

const main = async () => {
  try {
    // Read brand data from JSON file
    const brandDataPath = path.join(process.cwd(), 'data', 'brand_data.json')
    const brandDataRaw = fs.readFileSync(brandDataPath, 'utf-8')
    const brandData: BrandData[] = JSON.parse(brandDataRaw)

    console.log(`Found ${brandData.length} brands to import`)

    // Transform data for Prisma
    const brandsToCreate = brandData.map((brand) => ({
      name: brand.name,
      logo: '',
      createdById: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))

    // Import brands in batches to avoid memory issues
    const batchSize = 100
    let createdCount = 0

    for (let i = 0; i < brandsToCreate.length; i += batchSize) {
      const batch = brandsToCreate.slice(i, i + batchSize)
      const result = await prisma.brand.createMany({
        data: batch,
        skipDuplicates: true,
      })
      createdCount += result.count
      console.log(
        `Imported batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(brandsToCreate.length / batchSize)} - ${result.count} brands`,
      )
    }

    console.log(`Successfully imported ${createdCount} brands`)
    return { createdCount }
  } catch (error) {
    console.error('Error importing brands:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .then((result) => {
    if (result) {
      console.log(`Brand import completed. Total brands created: ${result.createdCount}`)
    }
  })
  .catch((error) => {
    console.error('Brand import failed:', error)
    process.exit(1)
  })
