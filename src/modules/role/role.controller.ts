import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateRoleBodyDTO,
  CreateRoleResDTO,
  GetRoleDetailResDTO,
  GetRoleParamsDTO,
  GetRolesQueryDTO,
  GetRolesResDTO,
  UpdateRoleBodyDTO,
} from 'src/modules/role/role.dto'
import { RoleService } from 'src/modules/role/role.service'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { ApiBearerAuth, ApiParam, ApiQuery, ApiBody, ApiTags } from '@nestjs/swagger'
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard'
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator'

@Controller('roles')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
@ApiTags('Roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @ZodSerializerDto(GetRolesResDTO)
  @ResponseMessage('Role list successfully')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  list(@Query() query: GetRolesQueryDTO) {
    return this.roleService.list({
      page: query.page,
      limit: query.limit,
    })
  }

  @Get(':roleId')
  @ZodSerializerDto(GetRoleDetailResDTO)
  @ResponseMessage('Role found successfully')
  @ApiParam({ name: 'roleId', type: 'number', description: 'Role ID' })
  findById(@Param() params: GetRoleParamsDTO) {
    return this.roleService.findById(params.roleId)
  }

  @Post()
  @ZodSerializerDto(CreateRoleResDTO)
  @ResponseMessage('Role created successfully')
  @ApiBody({ type: CreateRoleBodyDTO })
  create(@Body() body: CreateRoleBodyDTO, @ActiveUser('userId') userId: number) {
    return this.roleService.create({
      data: body,
      createdById: userId,
    })
  }

  @Put(':roleId')
  @ZodSerializerDto(GetRoleDetailResDTO)
  @ResponseMessage('Role updated successfully')
  @ApiBody({ type: UpdateRoleBodyDTO })
  @ApiParam({ name: 'roleId', type: 'number', description: 'Role ID' })
  update(@Body() body: UpdateRoleBodyDTO, @Param() params: GetRoleParamsDTO, @ActiveUser('userId') userId: number) {
    return this.roleService.update({
      data: body,
      id: params.roleId,
      updatedById: userId,
    })
  }

  @Delete(':roleId')
  @ZodSerializerDto(MessageResDTO)
  @ResponseMessage('Role deleted successfully')
  @ApiParam({ name: 'roleId', type: 'number', description: 'Role ID' })
  delete(@Param() params: GetRoleParamsDTO, @ActiveUser('userId') userId: number, @Query('isHard') isHard: boolean) {
    return this.roleService.delete(
      {
        id: params.roleId,
        deletedById: userId,
      },
      isHard,
    )
  }
}
