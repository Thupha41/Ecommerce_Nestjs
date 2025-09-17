import { Inject, Injectable } from '@nestjs/common'
import { google } from 'googleapis'
import envConfig from 'src/shared/config'
import { OAuth2Client } from 'google-auth-library'
import { GoogleAuthStateType } from './models/auth.model'
import { IAuthRepository } from './repository/auth.repo.interface'
import { HashingService } from 'src/shared/services/hashing.service'
import { v4 as uuidv4 } from 'uuid'
import { AuthService } from './auth.service'
import { InvalidEmailException } from './models/auth.error.model'
import { SharedRoleRepository } from 'src/shared/repositories/shared-role.repo'
@Injectable()
export class GoogleService {
  private oauth2Client: OAuth2Client
  constructor(
    @Inject('IAuthRepository') private readonly authRepository: IAuthRepository,
    private readonly hashingService: HashingService,
    private readonly sharedRoleRepository: SharedRoleRepository,
    private readonly authService: AuthService,
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      envConfig.GOOGLE_CLIENT_ID,
      envConfig.GOOGLE_CLIENT_SECRET,
      envConfig.GOOGLE_REDIRECT_URI,
    )
  }
  private parseState(state: string): GoogleAuthStateType {
    try {
      return state
        ? JSON.parse(Buffer.from(state, 'base64').toString('utf-8'))
        : { userAgent: 'Unknown', ip: 'Unknown' }
    } catch (error) {
      console.error('Error parsing state:', error)
      return { userAgent: 'Unknown', ip: 'Unknown' }
    }
  }
  private async getGoogleTokens(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code)
    return tokens
  }

  private async getGoogleUserInfo() {
    const { data } = await google.oauth2({ version: 'v2', auth: this.oauth2Client }).userinfo.get()
    return data
  }

  private async findOrCreateGoogleUser(userInfo: {
    email?: string | null
    name?: string | null
    picture?: string | null
  }) {
    if (!userInfo.email) {
      throw InvalidEmailException
    }

    let user = await this.authRepository.findUniqueUserIncludeRole({ email: userInfo.email })
    if (!user) {
      const clientRoleId = await this.sharedRoleRepository.getClientRoleId()
      const randomPassword = uuidv4()
      const hashingPassword = await this.hashingService.hash(randomPassword)
      user = await this.authRepository.createUserIncludeRole({
        email: userInfo.email,
        password: hashingPassword,
        roleId: clientRoleId,
        name: userInfo.name ?? '',
        phoneNumber: '',
        avatar: userInfo.picture ?? null,
      })
    }
    return user
  }

  getAuthorizationUrl({ userAgent, ip }: GoogleAuthStateType) {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ]
    //Chuyển object sang string base 64 an toàn bỏ lên url
    const state = Buffer.from(JSON.stringify({ userAgent, ip })).toString('base64')

    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      include_granted_scopes: true,
      state,
    })
    return { url }
  }

  async googleCallBack({ code, state }: { code: string; state: string }) {
    //1. Parse state
    const { userAgent, ip } = this.parseState(state)
    const tokens = await this.getGoogleTokens(code)
    this.oauth2Client.setCredentials(tokens)

    //2. Get user info
    const userInfo = await this.getGoogleUserInfo()
    if (!userInfo.email) {
      throw InvalidEmailException
    }

    //3. Find or create user
    const user = await this.findOrCreateGoogleUser(userInfo)

    //4. Create device and tokens
    return await this.authService.createDeviceAndTokens(user.id, user.roleId, user.role.name, userAgent, ip)
  }
}
