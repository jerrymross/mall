import { supabase } from './supabase'
import type { TemplateDefinition } from '../types/template.types'

interface SupabaseTemplate {
  id: string
  name: string
  description: string | null
  category: string
  thumbnail_url: string | null
  design_system_id: string | null
  pages: TemplateDefinition['pages']
  is_published: boolean
  created_at: string
  updated_at: string
}

function fromSupabase(row: SupabaseTemplate): TemplateDefinition {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    thumbnailUrl: row.thumbnail_url ?? '',
    category: row.category,
    designSystemId: row.design_system_id ?? 'ds-default',
    pages: row.pages,
    isPublished: row.is_published,
    createdBy: 'user',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function fetchCustomTemplates(): Promise<TemplateDefinition[]> {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.warn('Could not fetch templates from Supabase:', error.message)
    return []
  }
  return (data as SupabaseTemplate[]).map(fromSupabase)
}

export async function saveTemplate(template: TemplateDefinition): Promise<string> {
  const payload = {
    name: template.name,
    description: template.description || null,
    category: template.category,
    thumbnail_url: template.thumbnailUrl || null,
    design_system_id: null, // no FK until design system is synced to Supabase
    pages: template.pages,
    is_published: true,
  }

  const { data, error } = await supabase
    .from('templates')
    .insert(payload)
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  return (data as { id: string }).id
}

export async function deleteTemplate(id: string): Promise<void> {
  const { error } = await supabase.from('templates').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
