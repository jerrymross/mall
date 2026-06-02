import { useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Upload, X, Loader2 } from 'lucide-react'

interface Props {
  value: string
  bucket: 'assets' | 'template-thumbs'
  folder?: string
  accept?: string
  label?: string
  hint?: string
  onUploaded: (url: string) => void
}

export function ImageUploader({
  value,
  bucket,
  folder = '',
  accept = 'image/png,image/jpeg,image/webp,image/svg+xml',
  label,
  hint,
  onUploaded,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setError(null)
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${folder ? folder + '/' : ''}${crypto.randomUUID()}.${ext}`
      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      })
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      onUploaded(data.publicUrl)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Uppladdning misslyckades')
    } finally {
      setUploading(false)
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="flex flex-col gap-2">
      {label && <p className="text-xs font-medium text-slate-700">{label}</p>}

      <div
        className="relative border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-slate-50 hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
        style={{ minHeight: 80 }}
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {value ? (
          <div className="relative group">
            <img
              src={value}
              alt="Uppladdad bild"
              className="w-full max-h-40 object-contain p-2"
            />
            <button
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                onUploaded('')
              }}
              title="Ta bort bild"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-6 px-4 text-center">
            {uploading ? (
              <Loader2 size={20} className="text-blue-500 animate-spin" />
            ) : (
              <Upload size={20} className="text-slate-400" />
            )}
            <p className="text-xs text-slate-500">
              {uploading ? 'Laddar upp…' : 'Klicka eller dra och släpp'}
            </p>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <Loader2 size={24} className="text-blue-500 animate-spin" />
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  )
}
