import { Controller, Get, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { ManageOrderService } from 'src/modules/order/manage-order.service'
import {
  GetManageOrderListQueryDTO,
  GetOrderListResDTO,
} from 'src/modules/order/order.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { IAccessTokenPayload } from 'src/shared/types/jwt.types'
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard'
import { ApiBearerAuth, ApiQuery, ApiTags, ApiOperation } from '@nestjs/swagger'
import { UseGuards } from '@nestjs/common'
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator'

@Controller('manage-order/orders')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
@ApiTags('Manage Order')
export class ManageOrderController {
  constructor(private readonly manageOrderService: ManageOrderService) {}

  @Get()
  @ApiOperation({ summary: 'List orders', description: 'Get a list of all orders with pagination / Admin Only' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'userId', required: false, type: Number })
  @ZodSerializerDto(GetOrderListResDTO)
  @ResponseMessage('Orders fetched successfully')
  list(@Query() query: GetManageOrderListQueryDTO, @ActiveUser() user: IAccessTokenPayload) {
    return this.manageOrderService.list({
      query,
      roleNameRequest: user.roleName,
    })
  }
}


