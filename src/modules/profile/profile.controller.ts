import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { ProfileService } from './profile.service'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { GetUserProfileResDTO, UpdateProfileResDTO } from 'src/shared/dtos/shared-user.dto'
import { ChangePasswordBodyDTO, UpdateMeBodyDTO } from 'src/modules/profile/profile.dto'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { ApiBearerAuth, ApiParam, ApiBody, ApiTags } from '@nestjs/swagger'
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard'
@Controller('profile')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
@ApiTags('Profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiParam({ name: 'userId', required: true, type: Number })
  @ZodSerializerDto(GetUserProfileResDTO)
  getProfile(@ActiveUser('userId') userId: number) {
    return this.profileService.getProfile(userId)
  }

  @Put()
  @ApiParam({ name: 'userId', required: true, type: Number })
  @ApiBody({ type: UpdateMeBodyDTO })
  @ZodSerializerDto(UpdateProfileResDTO)
  updateProfile(@Body() body: UpdateMeBodyDTO, @ActiveUser('userId') userId: number) {
    return this.profileService.updateProfile({
      userId,
      body,
    })
  }

  @Put('change-password')
  @ApiParam({ name: 'userId', required: true, type: Number })
  @ApiBody({ type: ChangePasswordBodyDTO })
  @ZodSerializerDto(MessageResDTO)
  changePassword(@Body() body: ChangePasswordBodyDTO, @ActiveUser('userId') userId: number) {
    return this.profileService.changePassword({
      userId,
      body,
    })
  }
}
