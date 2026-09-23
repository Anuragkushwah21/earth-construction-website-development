import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StatCard({
  icon: Icon,
  label,
  value,
  href,
  highlight = false,
}: {
  icon: LucideIcon
  label: string
  value: number | string
  href?: string
  highlight?: boolean
}) {
  const content = (
    <>
      <Icon className={cn('size-4', highlight ? 'text-amber-600' : 'text-muted-foreground')} />
      <span className="mt-3 block text-2xl leading-none font-semibold tracking-tight tabular-nums">
        {value}
      </span>
      <span className="mt-1.5 block text-xs text-muted-foreground">{label}</span>
    </>
  )

  const className = cn(
    'block rounded-xl border bg-card p-4 transition-colors',
    highlight ? 'border-amber-400/60 bg-amber-50/60' : 'border-border',
    href && 'hover:border-amber-400',
  )

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    )
  }

  return <div className={className}>{content}</div>
}
