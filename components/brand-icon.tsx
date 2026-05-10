interface BrandIconProps {
  name: string
  className?: string
}

export function BrandIcon({ name, className }: BrandIconProps) {
  const initials = name
    .split(/[\s-_]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('')
  return <span className={className}>{initials || '?'}</span>
}
