import {
  ConflictException,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common'

//user related errors
export const UserNotFoundException = new Error('Error.UserNotFound')

//OTP related errors
export const InvalidOTPException = new UnprocessableEntityException([
  {
    message: 'Error.InvalidOTP',
    path: 'code',
  },
])

export const OTPExpiredException = new UnprocessableEntityException([
  {
    message: 'Error.OTPExpired',
    path: 'code',
  },
])

export const FailedToSendOTPException = new UnprocessableEntityException([
  {
    message: 'Error.FailedToSendOTP',
    path: 'email',
  },
])

//Email related errors
export const EmailAlreadyExistsException = new ConflictException([
  {
    message: 'Error.EmailAlreadyExists',
    path: 'email',
  },
])

export const EmailNotFoundException = new UnprocessableEntityException([
  {
    message: 'Error.EmailNotFound',
    path: 'email',
  },
])

export const InvalidEmailException = new BadRequestException('Error.InvalidEmail')

//Password related errors
export const PasswordIncorrectException = new UnprocessableEntityException([
  {
    message: 'Error.PasswordIncorrect',
    path: 'password',
  },
])

//Device related errors
export const FailedToCreateDeviceException = new Error('Error.FailedToCreateDevice')

//Auth token related errors
export const RefreshTokenAlreadyUsedException = new UnauthorizedException('Error.RefreshTokenAlreadyUsed')

export const RefreshTokenNotFoundException = new NotFoundException('Error.RefreshTokenNotFound')

export const UnauthorizedAccessException = new UnauthorizedException('Error.UnauthorizedAccess')

//Google auth related errors
export const InvalidCredentialsException = new UnauthorizedException('Error.InvalidCredentials')

export const InvalidGoogleEmailException = new UnprocessableEntityException([
  {
    message: 'Error.InvalidGoogleEmail',
    path: 'email',
  },
])

export const GoogleUserInfoException = new Error('Error.FailedToGetGoogleUserInfo')

//TOTP related errors
export const TOTPAlreadyEnabledException = new UnprocessableEntityException([
  {
    message: 'Error.TOTPAlreadyEnabled',
    path: 'totpCode',
  },
])

export const TOTPNotEnabledException = new UnprocessableEntityException([
  {
    message: 'Error.TOTPNotEnabled',
    path: 'totpCode',
  },
])

export const InvalidTOTPAndCodeException = new UnprocessableEntityException([
  {
    message: 'Error.InvalidTOTPAndCode',
    path: 'totpCode',
  },
  {
    message: 'Error.InvalidTOTPAndCode',
    path: 'code',
  },
])

export const InvalidTOTPException = new UnprocessableEntityException([
  {
    message: 'Error.InvalidTOTP',
    path: 'totpCode',
  },
])
