import * as React from 'react'
import { cn } from '@/lib/utils'

function Input({ className, type = 'text', ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-10 w-full min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-xs transition-colors outline-none',
        'placeholder:text-muted-foreground',
        'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40',
        'disabled:cursor-not-allowed disabled:opacity-60',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/25',
        'file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
