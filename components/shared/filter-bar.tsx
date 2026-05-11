'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/components/providers/i18n-provider'

interface FilterOption {
  label: string
  value: string
}

interface FilterDef {
  key: string
  label: string
  options: FilterOption[]
  // controlled mode
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
}

interface FilterBarProps {
  search?: string
  onSearchChange?: (value: string) => void
  filters?: FilterDef[]
  actions?: React.ReactNode
  className?: string
}

export function FilterBar({
  search,
  onSearchChange,
  filters,
  actions,
  className,
}: FilterBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function handleUrlFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all' || value === '') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const { t } = useI18n()

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {onSearchChange !== undefined && (
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder={t.common.search}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
      {filters?.map((filter) => {
        // URL-based mode (no onChange provided)
        const isUrlMode = !filter.onChange
        const currentValue = isUrlMode
          ? (searchParams.get(filter.key) ?? 'all')
          : (filter.value ?? 'all')

        return (
          <Select
            key={filter.key}
            value={currentValue}
            onValueChange={(v) => {
              if (isUrlMode) {
                handleUrlFilter(filter.key, v)
              } else {
                filter.onChange?.(v)
              }
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{filter.label}: {t.common.all}</SelectItem>
              {filter.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      })}
      {actions && (
        <div className="ml-auto flex items-center gap-2">{actions}</div>
      )}
    </div>
  )
}
