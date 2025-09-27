import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CreateDeliveryInfoBodyType,
  DeliveryInfoType,
  GetDeliveryResType,
  UpdateDeliveryInfoBodyType,
} from './models/delivery-info.model'
import { DeliveryInfoNotFoundException } from './models/delivery-info.error.model'
import { isNotFoundPrismaError } from 'src/shared/helpers'

@Injectable()
export class DeliveryInfoRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(userId: number, data: CreateDeliveryInfoBodyType): Promise<DeliveryInfoType> {
    // Sử dụng transaction để đảm bảo tính nhất quán
    return this.prismaService.$transaction(async (prisma) => {
      // Nếu đang tạo địa chỉ mặc định, cập nhật tất cả địa chỉ mặc định khác thành false
      if (data.isDefault) {
        await prisma.deliveryInfo.updateMany({
          where: {
            userId,
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        })
      }

      // Tạo địa chỉ mới
      return prisma.deliveryInfo.create({
        data: {
          ...data,
          userId,
        },
      })
    })
  }

  async update({
    userId,
    data,
    deliveryInfoId,
  }: {
    userId: number
    data: UpdateDeliveryInfoBodyType
    deliveryInfoId: number
  }): Promise<DeliveryInfoType> {
    // Sử dụng transaction để đảm bảo tính nhất quán
    try {
      return await this.prismaService.$transaction(async (prisma) => {
        // Nếu đang cập nhật địa chỉ thành mặc định, cập nhật tất cả địa chỉ mặc định khác thành false
        if (data.isDefault) {
          await prisma.deliveryInfo.updateMany({
            where: {
              userId,
              isDefault: true,
              id: {
                not: deliveryInfoId, // Không cập nhật chính bản ghi đang sửa
              },
            },
            data: {
              isDefault: false,
            },
          })
        }

        // Cập nhật địa chỉ
        const updatedInfo = await prisma.deliveryInfo.update({
          where: {
            id: deliveryInfoId,
            userId,
          },
          data,
        })

        return updatedInfo
      })
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw DeliveryInfoNotFoundException
      }
      throw error
    }
  }

  async delete(userId: number, deliveryInfoId: number): Promise<DeliveryInfoType> {
    return await this.prismaService.deliveryInfo
      .delete({
        where: {
          id: deliveryInfoId,
          userId,
        },
      })
      .catch((error) => {
        if (isNotFoundPrismaError(error)) {
          throw DeliveryInfoNotFoundException
        }
        throw error
      })
  }

  async getAllDeliveryInfoByUserId(userId: number): Promise<GetDeliveryResType> {
    const result = await this.prismaService.deliveryInfo.findMany({
      where: {
        userId,
      },
    })
    return {
      items: result,
    }
  }

  async getDeliveryInfoById(deliveryInfoId: number, userId: number): Promise<DeliveryInfoType> {
    const result = await this.prismaService.deliveryInfo.findFirst({
      where: {
        id: deliveryInfoId,
        userId,
      },
    })

    if (!result) {
      throw DeliveryInfoNotFoundException
    }

    return result
  }

  async getDeliveryDefaultByUserId(userId: number): Promise<DeliveryInfoType> {
    const result = await this.prismaService.deliveryInfo.findFirst({
      where: {
        userId,
        isDefault: true,
      },
    })

    if (!result) {
      throw DeliveryInfoNotFoundException
    }

    return result
  }
}
