'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

type SwitchProps = {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  id?: string
  className?: string
  'aria-label'?: string
}

function Switch({ checked, onCheckedChange, disabled, id, className, ...rest }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors outline-none',
        'focus-visible:ring-3 focus-visible:ring-ring/40',
        'disabled:cursor-not-allowed disabled:opacity-60',
        checked ? 'bg-amber-500' : 'bg-muted-foreground/30',
        className,
      )}
      {...rest}
    >
      <span
        className={cn(
          'pointer-events-none block size-5 rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-[22px]' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}

export { Switch }
