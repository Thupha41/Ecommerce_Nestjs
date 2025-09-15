import { Injectable } from '@nestjs/common'
import envConfig from '../config'
import fs from 'fs'
import path from 'path'
import nodemailer, { Transporter } from 'nodemailer'

@Injectable()
export class EmailService {
  private fromEmail: string = `OTP Verification <${envConfig.GOOGLE_APP_EMAIL}>`
  private transporter: Transporter

  constructor() {
    // Initialize Gmail SMTP transporter
    const googleEmail = envConfig.GOOGLE_APP_EMAIL
    const googleAppPassword = envConfig.GOOGLE_APP_PASSWORD

    // Gmail supports two SMTP ports:
    // - Port 465: Uses implicit SSL (secure: true)
    // - Port 587: Uses STARTTLS (secure: false)
    this.transporter = nodemailer.createTransport({
      host: envConfig.SMTP_HOST,
      port: Number(envConfig.SMTP_PORT) || 587,
      secure: Number(envConfig.SMTP_PORT) === 465 ? true : false,
      auth: {
        user: googleEmail,
        pass: googleAppPassword,
      },
    })

    if (!this.transporter) {
      console.warn('No email configuration found. Please set up GOOGLE_EMAIL and GOOGLE_APP_PASSWORD or SMTP settings.')
    }
  }

  async sendOTPCodeEmail(payload: { email: string; code: string }) {
    const otpTemplate = fs.readFileSync(path.resolve(process.cwd(), 'src/shared/email-templates/otp.html'), {
      encoding: 'utf-8',
    })
    const html = otpTemplate.replaceAll('{{subject}}', 'OTP').replaceAll('{{code}}', payload.code)

    // Send email via SMTP
    if (this.transporter) {
      return this.sendViaSMTP(payload.email, html)
    }
    // throw error if no email service configured
    else {
      throw new Error('No email service configured. Please set up GOOGLE_APP_EMAIL and GOOGLE_APP_PASSWORD settings.')
    }
  }

  private async sendViaSMTP(email: string, html: string) {
    console.log('>>> Sending email via SMTP')
    try {
      const mailOptions = {
        from: this.fromEmail || `OTP Verification <${envConfig.GOOGLE_APP_EMAIL}>`,
        to: `${email}`,
        subject: 'OTP',
        html: html,
      }

      const info = await this.transporter.sendMail(mailOptions)
      console.log('>>> end sending email')
      console.log('info', info)
      return { success: true, data: info }
    } catch (error) {
      console.error('SMTP email failed:', error)
      throw error instanceof Error ? error : new Error('Failed to send email via SMTP')
    }
  }
}
