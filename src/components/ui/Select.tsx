import type { SelectHTMLAttributes } from 'react'

interface Option {
  value: string
  label: string
}

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: Option[]
  error?: string
}

export function Select({ label, options, error, className = '', id, ...props }: Props) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-slate-700">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={`w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900
          focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100
          ${error ? 'border-red-400' : ''}
          ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
