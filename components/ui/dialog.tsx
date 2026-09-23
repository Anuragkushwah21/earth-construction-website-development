'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

type DialogProps = {
  open: boolean
  onClose: () => void
  title: string
  description?: React.ReactNode
  children?: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

/**
 * Small modal used for confirmations and detail panels. It closes on Escape
 * and on backdrop click, locks body scroll, and moves focus into the dialog
 * when it opens.
 */
function Dialog({ open, onClose, title, description, children, footer, className }: DialogProps) {
  const panelRef = React.useRef<HTMLDivElement>(null)
  const titleId = React.useId()

  React.useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/55 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'relative max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-border bg-card p-5 shadow-2xl outline-none sm:max-w-lg sm:rounded-2xl',
          className,
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>

        <h2 id={titleId} className="pr-8 text-lg font-semibold">
          {title}
        </h2>
        {description ? <div className="mt-1.5 text-sm text-muted-foreground">{description}</div> : null}
        {children ? <div className="mt-4">{children}</div> : null}
        {footer ? <div className="mt-6 flex flex-wrap justify-end gap-2">{footer}</div> : null}
      </div>
    </div>
  )
}

export { Dialog }
