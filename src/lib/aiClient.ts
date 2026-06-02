import type { AIRequest, AIResponse } from '../types/ai.types'
import type { SlotContent } from '../types/content.types'

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY ?? ''

export async function generateSlotContent(request: AIRequest): Promise<AIResponse> {
  const systemPrompt = buildSystemPrompt(request)
  const userPrompt = buildUserPrompt(request)

  if (!ANTHROPIC_API_KEY) {
    return mockGenerate(request)
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`)
  }

  const data = await response.json()
  const text = data.content?.[0]?.text ?? ''

  const content = parseAIResponse(request.slotType, text)
  return { slotId: request.slotId, content, model: 'claude-haiku' }
}

function buildSystemPrompt(request: AIRequest): string {
  const { aiContext } = request
  const lang = aiContext.language === 'sv' ? 'Swedish' : 'English'
  const tone = aiContext.tone ?? 'professional'
  return `You are an expert marketing copywriter. Write in ${lang}. Tone: ${tone}.
Product/Course: ${aiContext.productName}.
${aiContext.targetAudience ? `Target audience: ${aiContext.targetAudience}.` : ''}
${aiContext.keywords?.length ? `Keywords to incorporate: ${aiContext.keywords.join(', ')}.` : ''}
Return ONLY the requested text content, no explanations or metadata.`
}

function buildUserPrompt(request: AIRequest): string {
  const hint = request.promptHint ?? `Write content for a ${request.slotType} slot.`
  return hint
}

function parseAIResponse(slotType: string, text: string): SlotContent {
  const clean = text.trim()

  switch (slotType) {
    case 'heading':
      return { type: 'heading', text: clean }
    case 'subheading':
      return { type: 'subheading', text: clean }
    case 'body-text':
      return { type: 'body-text', text: clean }
    case 'bullet-list': {
      const items = clean
        .split('\n')
        .map((l) => l.replace(/^[-•*]\s*/, '').trim())
        .filter(Boolean)
      return { type: 'bullet-list', items }
    }
    case 'cta':
      return { type: 'cta', label: clean }
    default:
      return { type: 'heading', text: clean }
  }
}

function mockGenerate(request: AIRequest): AIResponse {
  const mocks: Record<string, SlotContent> = {
    heading: { type: 'heading', text: 'Avancerad ledarskapsutbildning för framtidens chefer' },
    subheading: { type: 'subheading', text: 'Utveckla ditt ledarskap och ta nästa steg i karriären' },
    'body-text': {
      type: 'body-text',
      text: 'Den här kursen ger dig de verktyg och insikter du behöver för att leda effektivt i en modern organisation. Genom praktiska övningar och teori bygger du en solid grund för framgångsrikt ledarskap.',
    },
    'bullet-list': {
      type: 'bullet-list',
      items: [
        'Leda team mot gemensamma mål',
        'Kommunicera tydligt och engagerande',
        'Hantera konflikter konstruktivt',
        'Skapa en motiverande arbetskultur',
      ],
    },
    cta: { type: 'cta', label: 'Anmäl dig idag' },
  }

  const content = mocks[request.slotType] ?? { type: 'heading', text: 'AI-genererad text' }
  return { slotId: request.slotId, content, model: 'mock' }
}
