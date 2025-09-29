export const DiscountApplyTo = {
  ALL: 'ALL',
  SPECIFIC: 'SPECIFIC',
} as const

export type DiscountApplyToType = (typeof DiscountApplyTo)[keyof typeof DiscountApplyTo]

export const DiscountType = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED: 'FIXED',
} as const

export type DiscountTypeType = (typeof DiscountType)[keyof typeof DiscountType]
