'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export type ChartPoint = { date: string; [platform: string]: number | string }

const PLATFORM_COLORS: Record<string, string> = {
  youtube: '#ef4444',
  tiktok: '#1a1a1a',
  instagram: '#ec4899',
  linkedin: '#3b82f6',
  twitter: '#38bdf8',
}

export function AnalyticsChart({
  data,
  platforms,
}: {
  data: ChartPoint[]
  platforms: string[]
}) {
  if (data.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 4, right: 16, left: -16, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v))}
        />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
          labelStyle={{ fontWeight: 600, color: '#1e293b' }}
        />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        {platforms.map((p) => (
          <Line
            key={p}
            type="monotone"
            dataKey={p}
            name={p.charAt(0).toUpperCase() + p.slice(1)}
            stroke={PLATFORM_COLORS[p] ?? '#94a3b8'}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
