import type { TextareaHTMLAttributes } from 'react'

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  charCount?: number
  maxChars?: number
}

export function Textarea({ label, error, charCount, maxChars, className = '', id, ...props }: Props) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  const over = maxChars != null && charCount != null && charCount > maxChars
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-slate-700">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 resize-y min-h-[80px]
          focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100
          ${error ? 'border-red-400' : ''}
          ${className}`}
        {...props}
      />
      <div className="flex justify-between">
        {error ? <p className="text-xs text-red-500">{error}</p> : <span />}
        {maxChars != null && charCount != null && (
          <span className={`text-xs ${over ? 'text-red-500' : 'text-slate-400'}`}>
            {charCount}/{maxChars}
          </span>
        )}
      </div>
    </div>
  )
}
