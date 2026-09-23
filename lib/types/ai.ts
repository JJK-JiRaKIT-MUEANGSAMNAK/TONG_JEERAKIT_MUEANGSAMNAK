export interface AIPostDraft {
  id: string
  content: string
  suggestedImages?: string[]
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'PUBLISHED' | 'REJECTED'
  publishedAt?: string
  createdAt: string
  updatedAt: string
}
