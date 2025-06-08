import { Injectable } from '@nestjs/common'
import * as OTPAuth from 'otpauth'
import envConfig from '../config'
@Injectable()
export class TwoFactorAuthService {
  constructor() {}
  private createTOTP(email: string, secret?: string) {
    return new OTPAuth.TOTP({
      // Provider or service the account is associated with.
      issuer: envConfig.APP_NAME,
      // Account identifier.
      label: email,
      // Algorithm used for the HMAC function, possible values are:
      //   "SHA1", "SHA224", "SHA256", "SHA384", "SHA512",
      //   "SHA3-224", "SHA3-256", "SHA3-384" and "SHA3-512".
      algorithm: 'SHA1',
      // Length of the generated tokens.
      digits: 6,
      // Interval of time for which a token is valid, in seconds.
      period: 30,
      secret: secret || new OTPAuth.Secret(),
    })
  }

  generateTOTPSecret(email: string) {
    const totp = this.createTOTP(email)
    return {
      secret: totp.secret.base32,
      uri: totp.toString(),
    }
  }

  isVerifyTOTP({ email, code, secret }: { email: string; code: string; secret?: string }): boolean {
    const totp = this.createTOTP(email, secret)

    //window 1: 1 code is valid in 30s before and after the current time
    const delta = totp.validate({ token: code, window: 1 })
    return delta !== null
  }
}
