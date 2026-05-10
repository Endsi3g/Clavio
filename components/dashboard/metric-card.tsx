import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string | number
  trend?: number // percentage change
  icon?: React.ReactNode
  className?: string
  mono?: boolean // use monospace for value
}

export function MetricCard({
  label,
  value,
  trend,
  icon,
  className,
  mono,
}: MetricCardProps) {
  const trendPositive = trend !== undefined && trend > 0
  const trendNegative = trend !== undefined && trend < 0
  const trendNeutral = trend === 0

  return (
    <Card className={cn('', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              {label}
            </p>
            <p
              className={cn(
                'mt-1 text-2xl font-semibold text-slate-900',
                mono && 'font-mono'
              )}
            >
              {value}
            </p>
            {trend !== undefined && (
              <div
                className={cn('mt-1 flex items-center gap-1 text-xs', {
                  'text-emerald-600': trendPositive,
                  'text-red-500': trendNegative,
                  'text-slate-400': trendNeutral,
                })}
              >
                {trendPositive && <TrendingUp className="h-3 w-3" />}
                {trendNegative && <TrendingDown className="h-3 w-3" />}
                {trendNeutral && <Minus className="h-3 w-3" />}
                <span>
                  {trend > 0 ? '+' : ''}
                  {trend}% vs last period
                </span>
              </div>
            )}
          </div>
          {icon && (
            <div className="ml-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
