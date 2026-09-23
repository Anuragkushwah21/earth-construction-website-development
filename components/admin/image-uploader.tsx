'use client'

import * as React from 'react'
import Image from 'next/image'
import { ImagePlus, Loader2, RefreshCw, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/lib/api-client'
import { cn } from '@/lib/utils'

type UploadResponse = { url: string; provider: string }

type ImageUploaderProps = {
  value: string
  onChange: (url: string) => void
  folder?: string
  label?: string
  hint?: string
  aspect?: 'video' | 'square'
  className?: string
}

async function uploadFile(file: File, folder: string, onProgress: (percent: number) => void) {
  // XMLHttpRequest rather than fetch, because it reports upload progress.
  return new Promise<UploadResponse>((resolve, reject) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)

    const request = new XMLHttpRequest()
    request.open('POST', '/api/admin/upload')
    request.withCredentials = true

    request.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100))
    })

    request.addEventListener('load', () => {
      let body: { url?: string; provider?: string; error?: string } = {}
      try {
        body = JSON.parse(request.responseText)
      } catch {
        /* fall through to the generic message below */
      }

      if (request.status >= 200 && request.status < 300 && body.url) {
        resolve({ url: body.url, provider: body.provider ?? 'local' })
      } else {
        reject(new ApiError(body.error ?? 'Upload failed. Please try again.', request.status))
      }
    })

    request.addEventListener('error', () => reject(new ApiError('Network error during upload.', 0)))
    request.send(formData)
  })
}

/** Single-image field: upload, preview, replace and remove. */
function ImageUploader({
  value,
  onChange,
  folder = 'general',
  label = 'Image',
  hint,
  aspect = 'video',
  className,
}: ImageUploaderProps) {
  const [uploading, setUploading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const inputId = React.useId()

  async function handleFile(file: File | undefined) {
    if (!file) return

    setUploading(true)
    setProgress(0)
    try {
      const result = await uploadFile(file, folder, setProgress)
      onChange(result.url)
      toast.success('Image uploaded.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed.')
    } finally {
      setUploading(false)
      setProgress(0)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={inputId} className="text-sm font-medium">
          {label}
        </label>
        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => onChange('')}
            disabled={uploading}
            className="text-destructive"
          >
            <Trash2 /> Remove
          </Button>
        ) : null}
      </div>

      <div
        className={cn(
          'relative w-full overflow-hidden rounded-xl border border-dashed border-border bg-muted/40',
          aspect === 'video' ? 'aspect-video' : 'aspect-square max-w-56',
        )}
      >
        {value ? (
          <Image src={value} alt="" fill sizes="(max-width: 768px) 100vw, 480px" className="object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-muted-foreground">
            <ImagePlus className="size-7" />
            <p className="text-xs">No image yet — JPG, PNG, WEBP, AVIF or SVG up to 5 MB.</p>
          </div>
        )}

        {uploading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/85">
            <Loader2 className="size-5 animate-spin" />
            <div className="h-1.5 w-40 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-amber-500 transition-[width]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs font-medium text-muted-foreground">Uploading… {progress}%</p>
          </div>
        ) : null}
      </div>

      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml"
        className="sr-only"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {value ? <RefreshCw /> : <Upload />}
          {value ? 'Replace image' : 'Upload image'}
        </Button>
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </div>
    </div>
  )
}

export { ImageUploader, uploadFile }
