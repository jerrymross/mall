export function Spinner({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <span
      className={`inline-block border-2 border-current border-t-transparent rounded-full animate-spin ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
