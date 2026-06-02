import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  variant?: 'blue' | 'green' | 'yellow' | 'red' | 'slate'
}

const variants = {
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red: 'bg-red-100 text-red-700',
  slate: 'bg-slate-100 text-slate-600',
}

export function Badge({ children, variant = 'slate' }: Props) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  )
}
