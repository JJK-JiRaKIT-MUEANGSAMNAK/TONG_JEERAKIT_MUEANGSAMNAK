import { createClient } from '@/lib/supabase/client'
import { AIPostDraft } from '@/lib/types/ai'

// STATUS: READY_AFTER_REMOTE_APPLY

const supabase = createClient()

export async function fetchAIDraftsFromSupabase(): Promise<AIPostDraft[]> {
  const { data, error } = await supabase.from('ai_social_drafts').select('*').order('created_at', { ascending: false })
  if (error) throw error
  
  return data.map((d: any) => ({
    id: d.id,
    content: d.content,
    suggestedImages: d.suggested_images,
    status: d.status as any,
    publishedAt: d.published_at,
    createdAt: d.created_at,
    updatedAt: d.updated_at
  } as unknown as AIPostDraft))
}

export async function saveAIDraftToSupabase(draft: AIPostDraft): Promise<void> {
  const { error } = await supabase.from('ai_social_drafts').upsert({
    id: draft.id?.startsWith('cart-') ? undefined : draft.id,
    content: draft.content,
    suggested_images: draft.suggestedImages,
    status: draft.status,
    published_at: draft.publishedAt,
    updated_at: new Date().toISOString()
  })
  
  if (error) throw error
}
