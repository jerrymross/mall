import { useEditorStore } from '../../store/useEditorStore'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'

export function AIContextForm() {
  const { aiContext, setAIContext } = useEditorStore()

  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-50 rounded-lg">
      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">AI-kontext</p>
      <Input
        label="Produkt/Kursnamn"
        value={aiContext.productName}
        onChange={(e) => setAIContext({ productName: e.target.value })}
        placeholder="t.ex. Avancerat Ledarskap"
      />
      <Input
        label="Målgrupp"
        value={aiContext.targetAudience ?? ''}
        onChange={(e) => setAIContext({ targetAudience: e.target.value })}
        placeholder="t.ex. Mellanchefer"
      />
      <Select
        label="Ton"
        value={aiContext.tone ?? 'professional'}
        options={[
          { value: 'formal', label: 'Formell' },
          { value: 'friendly', label: 'Vänlig' },
          { value: 'inspiring', label: 'Inspirerande' },
          { value: 'technical', label: 'Teknisk' },
        ]}
        onChange={(e) => setAIContext({ tone: e.target.value as 'formal' | 'friendly' | 'inspiring' | 'technical' })}
      />
      <Select
        label="Språk"
        value={aiContext.language}
        options={[
          { value: 'sv', label: 'Svenska' },
          { value: 'en', label: 'Engelska' },
        ]}
        onChange={(e) => setAIContext({ language: e.target.value as 'sv' | 'en' })}
      />
    </div>
  )
}
