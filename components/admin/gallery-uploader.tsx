'use client'

import * as React from 'react'
import Image from 'next/image'
import { ImagePlus, Loader2, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { uploadFile } from '@/components/admin/image-uploader'
import { cn } from '@/lib/utils'

type GalleryUploaderProps = {
  value: string[]
  onChange: (urls: string[]) => void
  folder?: string
  label?: string
  max?: number
  className?: string
}

/** Multi-image field for project and machine galleries. */
function GalleryUploader({
  value,
  onChange,
  folder = 'gallery',
  label = 'Gallery images',
  max = 20,
  className,
}: GalleryUploaderProps) {
  const [uploading, setUploading] = React.useState(false)
  const [progress, setProgress] = React.useState({ current: 0, total: 0, percent: 0 })
  const inputRef = React.useRef<HTMLInputElement>(null)

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return

    const files = Array.from(fileList)
    const room = max - value.length

    if (room <= 0) {
      toast.error(`You can add up to ${max} images.`)
      return
    }

    const selected = files.slice(0, room)
    if (files.length > room) {
      toast.warning(`Only the first ${room} image${room === 1 ? '' : 's'} will be added.`)
    }

    setUploading(true)
    const uploaded: string[] = []

    try {
      for (const [index, file] of selected.entries()) {
        setProgress({ current: index + 1, total: selected.length, percent: 0 })
        try {
          const result = await uploadFile(file, folder, (percent) =>
            setProgress({ current: index + 1, total: selected.length, percent }),
          )
          uploaded.push(result.url)
        } catch (error) {
          toast.error(
            `${file.name}: ${error instanceof Error ? error.message : 'upload failed'}`,
          )
        }
      }

      if (uploaded.length > 0) {
        onChange([...value, ...uploaded])
        toast.success(`${uploaded.length} image${uploaded.length === 1 ? '' : 's'} added.`)
      }
    } finally {
      setUploading(false)
      setProgress({ current: 0, total: 0, percent: 0 })
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function removeAt(index: number) {
    onChange(value.filter((_, position) => position !== index))
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">
          {value.length} / {max}
        </span>
      </div>

      {value.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {value.map((url, index) => (
            <li
              key={`${url}-${index}`}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
            >
              <Image src={url} alt="" fill sizes="200px" className="object-cover" />
              <button
                type="button"
                onClick={() => removeAt(index)}
                aria-label={`Remove image ${index + 1}`}
                className="absolute top-1.5 right-1.5 rounded-md bg-background/90 p-1.5 text-destructive opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-8 text-center text-muted-foreground">
          <ImagePlus className="size-6" />
          <p className="text-xs">No gallery images yet.</p>
        </div>
      )}

      {uploading ? (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-3 py-2">
          <Loader2 className="size-4 shrink-0 animate-spin" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium">
              Uploading image {progress.current} of {progress.total}
            </p>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-amber-500 transition-[width]"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        </div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml"
        className="sr-only"
        onChange={(event) => handleFiles(event.target.files)}
      />

      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || value.length >= max}
        >
          <Upload /> Add images
        </Button>
      </div>
    </div>
  )
}

export { GalleryUploader }
