'use client'

import * as React from 'react'
import { Loader2, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'

type ConfirmDialogProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  description: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
}

/** Every delete in the dashboard goes through this, so nothing is one click away. */
function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  destructive = true,
}: ConfirmDialogProps) {
  const [pending, setPending] = React.useState(false)

  async function handleConfirm() {
    setPending(true)
    try {
      await onConfirm()
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={pending ? () => {} : onClose}
      title={title}
      description={description}
      className="sm:max-w-md"
      footer={
        <>
          <Button variant="outline" size="lg" onClick={onClose} disabled={pending}>
            {cancelLabel}
          </Button>
          <Button
            size="lg"
            variant={destructive ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={pending}
          >
            {pending ? <Loader2 className="animate-spin" /> : null}
            {pending ? 'Working…' : confirmLabel}
          </Button>
        </>
      }
    >
      {destructive ? (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/25 bg-destructive/8 p-3 text-sm text-destructive">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <p className="m-0">This action cannot be undone.</p>
        </div>
      ) : null}
    </Dialog>
  )
}

export { ConfirmDialog }
