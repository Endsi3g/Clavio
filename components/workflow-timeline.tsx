import { cn } from '@/lib/utils'
import { formatDateTime } from '@/lib/utils'
import { CheckCircle2, XCircle, Loader2, Circle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type StepStatus = 'completed' | 'failed' | 'processing' | 'pending' | 'success'

interface TimelineStep {
  id?: string
  label: string
  status: StepStatus
  timestamp?: string
  message?: string
}

interface WorkflowTimelineProps {
  steps: TimelineStep[]
  className?: string
  title?: string
}

const stepIcons: Record<StepStatus, React.ReactNode> = {
  completed: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  success: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  failed: <XCircle className="h-4 w-4 text-red-400" />,
  processing: <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />,
  pending: <Circle className="h-4 w-4 text-slate-300" />,
}

export function WorkflowTimeline({ steps, className, title = 'Timeline' }: WorkflowTimelineProps) {
  if (steps.length === 0) return null

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {steps.map((step, i) => (
            <div key={step.id ?? `step-${i}`} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="flex h-6 w-6 items-center justify-center">
                  {stepIcons[step.status]}
                </div>
                {i < steps.length - 1 && (
                  <div className="mt-1 flex-1 w-px bg-slate-200 min-h-[24px]" />
                )}
              </div>
              <div className="pb-4 pt-0.5 flex-1">
                <p
                  className={cn('text-sm font-medium', {
                    'text-slate-900': step.status === 'completed' || step.status === 'success',
                    'text-red-600': step.status === 'failed',
                    'text-blue-600': step.status === 'processing',
                    'text-slate-400': step.status === 'pending',
                  })}
                >
                  {step.label}
                </p>
                {step.message && (
                  <p className="mt-0.5 text-xs text-slate-500">{step.message}</p>
                )}
                {step.timestamp && (
                  <p className="mt-0.5 font-mono text-xs text-slate-400">
                    {formatDateTime(step.timestamp)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
