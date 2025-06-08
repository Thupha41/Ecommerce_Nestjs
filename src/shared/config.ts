// Kiểm tra thử xem có file env hay chưa?
import fs from 'fs'
import path from 'path'
import z from 'zod'
import { config } from 'dotenv'

config({
  path: '.env',
})

if (!fs.existsSync(path.resolve('.env'))) {
  console.log('Không tìm thấy file .env')
  process.exit(1)
}

const configSchema = z.object({
  DATABASE_URL: z.string(),

  // PORT: z.number().min(1),

  ACCESS_TOKEN_SECRET: z.string(),

  ACCESS_TOKEN_EXPIRES_IN: z.string(),

  REFRESH_TOKEN_SECRET: z.string(),

  REFRESH_TOKEN_EXPIRES_IN: z.string(),

  SECRET_API_KEY: z.string(),

  ADMIN_EMAIL: z.string(),

  ADMIN_PASSWORD: z.string(),

  ADMIN_PHONE_NUMBER: z.string(),

  ADMIN_NAME: z.string(),

  //Email service
  OTP_EXPIRES_IN: z.string(),
  // RESEND_API_KEY: z.string(),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string(),

  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_REDIRECT_URI: z.string(),
  GOOGLE_APP_EMAIL: z.string(),
  GOOGLE_APP_PASSWORD: z.string(),

  APP_NAME: z.string(),
})

const configServer = configSchema.safeParse(process.env)

if (!configServer.success) {
  console.error('Các giá trị trong file .env không hợp lệ:\n', configServer.error)
  process.exit(1)
}

const envConfig = configServer.data
export default envConfig
