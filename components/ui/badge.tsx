import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        outline: 'border-border text-foreground',
        muted: 'border-transparent bg-muted text-muted-foreground',
        success: 'border-emerald-600/25 bg-emerald-500/12 text-emerald-700 dark:text-emerald-400',
        warning: 'border-amber-600/25 bg-amber-500/15 text-amber-700 dark:text-amber-400',
        info: 'border-sky-600/25 bg-sky-500/12 text-sky-700 dark:text-sky-400',
        danger: 'border-destructive/25 bg-destructive/10 text-destructive',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
