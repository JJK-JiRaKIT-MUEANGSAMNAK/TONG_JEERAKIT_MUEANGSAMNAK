export interface SystemSettings {
  id: string
  companyName: string
  companyAddress: string
  companyTaxId: string
  companyPhone: string
  companyEmail: string
  logoUrl?: string
  receiptFooterText?: string
  quotationNote?: string
  defaultRentalDays: number
  updatedAt: string
}

export interface SystemSecrets {
  id: string
  lineChannelAccessToken?: string
  lineChannelSecret?: string
  promptpayId?: string
  updatedAt: string
}
