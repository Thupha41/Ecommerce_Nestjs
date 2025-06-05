import { Resend } from 'resend'
import { Injectable } from '@nestjs/common'
import envConfig from '../config'
import fs from 'fs'
import path from 'path'

@Injectable()
export class EmailService {
  private readonly resend: Resend
  constructor() {
    this.resend = new Resend(envConfig.RESEND_API_KEY)
  }
  async sendOTPCodeEmail(payload: { email: string; code: string }) {
    const otpTemplate = fs.readFileSync(path.resolve(__dirname, '../email-templates/otp.html'), {
      encoding: 'utf-8',
    })
    return await this.resend.emails.send({
      from: 'Xun Mike Shop <no-reply@yourdomain.com>',
      to: [payload.email],
      subject: 'OTP',
      html: otpTemplate.replaceAll('{{subject}}', 'OTP').replaceAll('{{code}}', payload.code),
    })
  }
}
