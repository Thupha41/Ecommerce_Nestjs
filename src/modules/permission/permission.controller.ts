import { Controller, Post, Body, Get, Query, Param, Put, Delete } from '@nestjs/common'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { UseGuards } from '@nestjs/common'
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  GetPermissionQueryDTO,
  GetPermissionResDTO,
  GetPermissionDetailResDTO,
  CreatePermissionBodyDTO,
  UpdatePermissionBodyDTO,
  GetPermissionParamsDTO,
} from './permission.dto'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { ApiBearerAuth, ApiParam, ApiQuery, ApiBody, ApiTags } from '@nestjs/swagger'
import { PermissionService } from './permission.service'
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator'
import { HTTPMethod } from 'src/shared/constants/permission.constants'
@Controller('permissions')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
@ApiTags('Permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post('/')
  @ZodSerializerDto(GetPermissionDetailResDTO)
  @ResponseMessage('Permission created successfully')
  @ApiBody({ type: CreatePermissionBodyDTO })
  async create(@Body() body: CreatePermissionBodyDTO, @ActiveUser('userId') userId: number) {
    return await this.permissionService.create({
      data: body,
      createdById: userId,
    })
  }

  @Get('/modules')
  @ResponseMessage('Modules retrieved successfully')
  async getModules() {
    return await this.permissionService.getModules()
  }

  @Get('/method')
  @ResponseMessage('Methods retrieved successfully')
  async getMethods() {
    return await this.permissionService.getMethods()
  }

  @Get('/')
  @ZodSerializerDto(GetPermissionResDTO)
  @ResponseMessage('Permission list successfully')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'module', required: false, type: String })
  @ApiQuery({ name: 'method', required: false, enum: [HTTPMethod.GET, HTTPMethod.POST, HTTPMethod.PUT, HTTPMethod.DELETE, HTTPMethod.PATCH, HTTPMethod.OPTIONS, HTTPMethod.HEAD] })
  async list(@Query() query: GetPermissionQueryDTO) {
    return await this.permissionService.list({
      page: query.page,
      limit: query.limit,
      module: query.module,
      method: query.method,
    })
  }

  @Get('/:permissionId')
  @ResponseMessage('Permission found successfully')
  @ZodSerializerDto(GetPermissionDetailResDTO)
  @ApiParam({ name: 'permissionId', type: 'number', description: 'Permission ID' })
  async findById(@Param('') params: GetPermissionParamsDTO) {
    return await this.permissionService.findById(params.permissionId)
  }

  @Put('/:permissionId')
  @ZodSerializerDto(GetPermissionDetailResDTO)
  @ResponseMessage('Permission updated successfully')
  @ApiParam({ name: 'permissionId', type: 'number', description: 'Permission ID' })
  @ApiBody({ type: UpdatePermissionBodyDTO })
  async update(
    @Param() params: GetPermissionParamsDTO,
    @Body() body: UpdatePermissionBodyDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return await this.permissionService.update({
      data: body,
      id: params.permissionId,
      updatedById: userId,
    })
  }

  @Delete('/:permissionId')
  @ZodSerializerDto(MessageResDTO)
  @ResponseMessage('Permission deleted successfully')
  @ApiParam({ name: 'permissionId', type: 'number', description: 'Permission ID' })
  async delete(@Param() params: GetPermissionParamsDTO, @ActiveUser('userId') userId: number) {
    return await this.permissionService.delete({
      id: params.permissionId,
      deletedById: userId,
    })
  }
}
