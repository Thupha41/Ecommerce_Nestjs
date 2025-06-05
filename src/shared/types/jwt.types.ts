export interface IAccessTokenPayloadCreate {
  userId: number
  deviceId: number
  roleId: number
  roleName: string
}
export interface IAccessTokenPayload extends IAccessTokenPayloadCreate {
  exp: number
  iat: number
}
export interface IRefreshTokenPayloadCreate {
  userId: number
}
export interface IRefreshTokenPayload extends IRefreshTokenPayloadCreate {
  exp: number
  iat: number
}
