import { ForbiddenException, Injectable } from '@nestjs/common'
import { OrderRepo } from 'src/modules/order/order.repo'
import { GetManageOrderListQueryType, GetOrderListResType } from 'src/modules/order/models/order.model'
import { RoleName } from 'src/shared/constants/role.constants'

@Injectable()
export class ManageOrderService {
  constructor(private orderRepo: OrderRepo) {}

  /**
   * Kiểm tra nếu người dùng không phải là admin thì không cho tiếp tục
   */
  validatePrivilege(roleNameRequest: string) {
    if (roleNameRequest !== RoleName.Admin) {
      throw new ForbiddenException('You are not allowed to access this resource')
    }
    return true
  }

  /**
   * @description: Xem danh sách tất cả orders của tất cả users (chỉ Admin)
   */
  async list(props: { query: GetManageOrderListQueryType; roleNameRequest: string }): Promise<GetOrderListResType> {
    this.validatePrivilege(props.roleNameRequest)
    const data = await this.orderRepo.listAll(props.query)
    return data
  }
}

