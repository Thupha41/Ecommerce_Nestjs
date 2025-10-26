export const PaymentStatus = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
} as const
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus]

export const PaymentMethod = {
  CASH: 'CASH',
  BANK: 'BANK',
} as const
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod]