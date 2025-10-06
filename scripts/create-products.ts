import { PrismaService } from 'src/shared/services/prisma.service'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaService()

interface ProductDataVariant {
  code: string
  name: string
  position: number
  show_preview_image: boolean
  values: {
    label: string
  }[]
}

interface ProductData {
  product_id: number
  title: string
  short_description: string
  description: string
  breadcrumbs: string[]
  origin: string
  brand: {
    id: number
    name: string
  }
  configurable_options: ProductDataVariant[]
  image_urls: string[]
  images: string[]
}

interface Variant {
  value: string
  options: string[]
}

interface SKU {
  value: string
  price: number
  stock: number
  image: string
}

// Function to generate all SKU combinations from variants
function generateSKUs(
  variants: Variant[],
  basePrice: number,
  images: string[],
  configurableOptions: ProductDataVariant[],
): SKU[] {
  if (!variants || variants.length === 0) {
    return []
  }

  // Helper function to create all combinations
  function getCombinations(arrays: string[][]): string[][] {
    if (arrays.length === 0) return [[]]
    const [first, ...rest] = arrays
    const restCombinations = getCombinations(rest)
    return first.flatMap((value) => restCombinations.map((combo) => [value, ...combo]))
  }

  // Get array of options from variants
  const options = variants.map((variant) => variant.options)

  // Create all combinations as arrays
  const combinations = getCombinations(options)

  // Find color variant index (if exists with show_preview_image)
  const colorVariantIndex = configurableOptions.findIndex(
    (option) => option.show_preview_image === true || option.name.toLowerCase().includes('màu'),
  )

  // If there's a color variant, divide images among colors
  const imagesPerColor: { [key: string]: string[] } = {}
  if (colorVariantIndex !== -1 && images.length > 0) {
    const colorOptions = variants[colorVariantIndex].options
    const imagesPerColorCount = Math.floor(images.length / colorOptions.length)

    colorOptions.forEach((color, index) => {
      const startIndex = index * imagesPerColorCount
      const endIndex = index === colorOptions.length - 1 ? images.length : startIndex + imagesPerColorCount
      imagesPerColor[color] = images.slice(startIndex, endIndex)
    })
  }

  // Convert combinations to SKU objects
  return combinations.map((combo) => {
    const value = combo.join('-')

    // Determine image for this SKU
    let image = images[0] || ''
    if (colorVariantIndex !== -1 && combo[colorVariantIndex]) {
      const colorValue = combo[colorVariantIndex]
      const colorImages = imagesPerColor[colorValue]
      if (colorImages && colorImages.length > 0) {
        // Use first image of this color
        image = colorImages[0]
      }
    }

    return {
      value,
      price: basePrice,
      stock: 100,
      image,
    }
  })
}

// Random price generator between min and max, rounded to nearest 1000
function getRandomPrice(min: number, max: number): number {
  const randomPrice = Math.floor(Math.random() * (max - min + 1)) + min
  return Math.round(randomPrice / 1000) * 1000
}

const main = async () => {
  try {
    // Read product data from JSON file
    const productDataPath = path.join(process.cwd(), 'data', 'product_data.json')
    const productDataRaw = fs.readFileSync(productDataPath, 'utf-8')
    const productData: ProductData[] = JSON.parse(productDataRaw)

    console.log(`Found ${productData.length} products to import`)

    // Get all brands from database to map brand names to IDs
    const brands = await prisma.brand.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
      },
    })

    // Create a map of brand names to IDs
    const brandMap = new Map<string, number>()
    brands.forEach((brand) => {
      brandMap.set(brand.name.toLowerCase().trim(), brand.id)
    })

    console.log(`Loaded ${brands.length} brands from database`)

    // Transform data for Prisma
    const productsToCreate: any[] = []
    let skippedProducts = 0

    for (const product of productData) {
      // Find brand ID by matching brand name
      const brandName = product.brand.name.toLowerCase().trim()
      const brandId = brandMap.get(brandName)

      if (!brandId) {
        console.log(`Brand not found for product ${product.product_id}: ${product.brand.name}`)
        skippedProducts++
        continue
      }

      // Generate random price between 100,000 and 500,000
      const basePrice = getRandomPrice(100000, 500000)
      const virtualPrice = basePrice

      // Use image_urls for images
      const images = product.image_urls.slice(0, 10) // Limit to 10 images

      // Transform configurable_options to variants
      const variants: Variant[] = product.configurable_options.map((option) => ({
        value: option.name,
        options: option.values.map((v) => v.label),
      }))

      // Generate SKUs based on variants
      const skus = generateSKUs(variants, basePrice, images, product.configurable_options)

      // If no SKUs generated (no variants), create a default SKU
      if (skus.length === 0) {
        skus.push({
          value: product.title,
          price: basePrice,
          stock: 100,
          image: images[0] || '',
        })
      }

      productsToCreate.push({
        productNo: String(product.product_id),
        publishedAt: new Date(),
        name: product.title,
        basePrice,
        virtualPrice,
        brandId,
        images,
        variants: variants,
        skus,
      })
    }

    console.log(
      `Prepared ${productsToCreate.length} products for import (${skippedProducts} skipped due to missing brand)`,
    )

    // Import products in batches to avoid memory issues
    const batchSize = 10
    let createdCount = 0
    let errorCount = 0

    for (let i = 0; i < productsToCreate.length; i += batchSize) {
      const batch = productsToCreate.slice(i, i + batchSize)

      for (const productToCreate of batch) {
        try {
          const { skus, ...productWithoutSkus } = productToCreate

          await prisma.product.create({
            data: {
              ...productWithoutSkus,
              createdById: 1,
              skus: {
                createMany: {
                  data: skus.map((sku: SKU) => ({
                    ...sku,
                    createdById: 1,
                  })),
                },
              },
            },
          })

          createdCount++
        } catch (error) {
          console.error(`Error creating product ${productToCreate.productNo}:`, error)
          errorCount++
        }
      }

      console.log(
        `Imported batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(productsToCreate.length / batchSize)} - ${createdCount} products created, ${errorCount} errors`,
      )
    }

    console.log(`Successfully imported ${createdCount} products (${errorCount} errors)`)
    return { createdCount, errorCount, skippedProducts }
  } catch (error) {
    console.error('Error importing products:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .then((result) => {
    if (result) {
      console.log(
        `Product import completed. Total products created: ${result.createdCount}, Errors: ${result.errorCount}, Skipped: ${result.skippedProducts}`,
      )
    }
  })
  .catch((error) => {
    console.error('Product import failed:', error)
    process.exit(1)
  })
