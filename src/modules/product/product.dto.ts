import { createZodDto } from 'nestjs-zod'
import {
  CreateProductBodySchema,
  GetManageProductsQuerySchema,
  GetProductDetailResSchema,
  GetProductParamsSchema,
  GetProductsQuerySchema,
  GetProductsResSchema,
  UpdateProductBodySchema,
} from 'src/modules/product/models/product.model'
import { ProductSchema } from 'src/shared/models/shared-product.model'
import { createResponseDTO } from 'src/shared/dtos/response.dto'

export class ProductDTO extends createResponseDTO(ProductSchema) {}

export class GetProductsResDTO extends createResponseDTO(GetProductsResSchema) {}

export class GetProductsQueryDTO extends createZodDto(GetProductsQuerySchema) {}

export class GetManageProductsQueryDTO extends createZodDto(GetManageProductsQuerySchema) {}

export class GetProductParamsDTO extends createZodDto(GetProductParamsSchema) {}

export class GetProductDetailResDTO extends createResponseDTO(GetProductDetailResSchema) {}

export class CreateProductBodyDTO extends createZodDto(CreateProductBodySchema) {}

export class UpdateProductBodyDTO extends createZodDto(UpdateProductBodySchema) {}
