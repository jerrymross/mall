import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { BUILT_IN_TEMPLATES } from '../config/templates'
import { fetchCustomTemplates } from '../lib/templateService'
import type { TemplateDefinition } from '../types/template.types'
import { useDesignSystemStore } from '../store/useDesignSystemStore'
import { GRADIENT_PRESETS } from '../config/gradientPresets'
import { EditorLayout } from '../components/editor/EditorLayout'
import { useEditorStore } from '../store/useEditorStore'

export function EditorPage() {
  const { templateId } = useParams<{ templateId: string }>()
  const navigate = useNavigate()
  const { activeDesignSystem } = useDesignSystemStore()
  const { templateId: storeTemplateId } = useEditorStore()
  const [template, setTemplate] = useState<TemplateDefinition | null>(
    BUILT_IN_TEMPLATES.find((t) => t.id === templateId) ?? null
  )
  const [loading, setLoading] = useState(!template)

  useEffect(() => {
    if (template) return
    // Not a built-in — try fetching from Supabase
    fetchCustomTemplates().then((templates) => {
      const found = templates.find((t) => t.id === templateId)
      if (found) setTemplate(found)
      setLoading(false)
    })
  }, [templateId, template])

  useEffect(() => {
    if (!loading && (!template || !storeTemplateId)) {
      navigate('/')
    }
  }, [loading, template, storeTemplateId, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!template) return null

  return (
    <EditorLayout
      template={template}
      designSystem={activeDesignSystem}
      gradients={GRADIENT_PRESETS}
      title={template.name}
    />
  )
}
