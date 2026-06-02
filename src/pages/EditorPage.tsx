import { useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { BUILT_IN_TEMPLATES } from '../config/templates'
import { useDesignSystemStore } from '../store/useDesignSystemStore'
import { GRADIENT_PRESETS } from '../config/gradientPresets'
import { EditorLayout } from '../components/editor/EditorLayout'
import { useEditorStore } from '../store/useEditorStore'

export function EditorPage() {
  const { templateId } = useParams<{ templateId: string }>()
  const navigate = useNavigate()
  const { activeDesignSystem } = useDesignSystemStore()
  const { templateId: storeTemplateId } = useEditorStore()

  const template = BUILT_IN_TEMPLATES.find((t) => t.id === templateId)

  useEffect(() => {
    if (!template || !storeTemplateId) {
      navigate('/')
    }
  }, [template, storeTemplateId, navigate])

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
