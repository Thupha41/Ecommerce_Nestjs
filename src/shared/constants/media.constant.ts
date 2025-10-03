export const MediaType = {
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
} as const

export type MediaTypeType = (typeof MediaType)[keyof typeof MediaType]
