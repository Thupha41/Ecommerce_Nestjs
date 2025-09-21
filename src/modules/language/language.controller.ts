import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateLanguageBodyDTO,
  GetLanguageDetailResDTO,
  GetLanguageParamsDTO,
  GetLanguagesResDTO,
  UpdateLanguageBodyDTO,
} from 'src/modules/language/language.dto'
import { LanguageService } from 'src/modules/language/language.service'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard'
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator'

@Controller('languages')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
@ApiTags('Languages')
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}
  @ApiOperation({ summary: 'Get all languages' })
  @ApiResponse({ status: 200, description: 'Get all languages', type: GetLanguagesResDTO })
  @Get()
  @ZodSerializerDto(GetLanguagesResDTO)
  @ResponseMessage('Language list successfully')
  findAll() {
    return this.languageService.findAll()
  }

  @ApiOperation({ summary: 'Get language by id' })
  @ApiResponse({ status: 200, description: 'Get language by id', type: GetLanguageDetailResDTO })
  @Get(':languageId')
  @ZodSerializerDto(GetLanguageDetailResDTO)
  @ResponseMessage('Language found successfully')
  findById(@Param() params: GetLanguageParamsDTO) {
    return this.languageService.findById(params.languageId)
  }

  @ApiOperation({ summary: 'Create language' })
  @ApiResponse({ status: 200, description: 'Create language', type: GetLanguageDetailResDTO })
  @Post()
  @ZodSerializerDto(GetLanguageDetailResDTO)
  @ResponseMessage('Language created successfully')
  create(@Body() body: CreateLanguageBodyDTO, @ActiveUser('userId') userId: number) {
    return this.languageService.create({
      data: body,
      createdById: userId,
    })
  }
  // Không cho phép cập nhật id: Vì id là mã ngôn ngữ do người dùng tạo (ví dụ: 'en', 'vi'), nó nên bất biến (immutable). Nếu cần thay đổi id, bạn nên xóa ngôn ngữ cũ và tạo mới.

  // Kiểm tra soft delete: Theo nguyên tắc chung của soft delete, không nên cho phép cập nhật bản ghi đã bị xóa trừ khi có yêu cầu đặc biệt (ví dụ: khôi phục hoặc chỉnh sửa dữ liệu lịch sử).

  @ApiOperation({ summary: 'Update language' })
  @ApiResponse({ status: 200, description: 'Update language', type: GetLanguageDetailResDTO })
  @Put(':languageId')
  @ZodSerializerDto(GetLanguageDetailResDTO)
  @ResponseMessage('Language updated successfully')
  update(
    @Body() body: UpdateLanguageBodyDTO,
    @Param() params: GetLanguageParamsDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.languageService.update({
      data: body,
      id: params.languageId,
      updatedById: userId,
    })
  }

  @ApiOperation({ summary: 'Delete language' })
  @ApiResponse({ status: 200, description: 'Delete language', type: MessageResDTO })
  @Delete(':languageId')
  @ZodSerializerDto(MessageResDTO)
  @ResponseMessage('Language deleted successfully')
  delete(@Param() params: GetLanguageParamsDTO) {
    return this.languageService.delete(params.languageId)
  }
}
