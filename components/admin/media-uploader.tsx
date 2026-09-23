'use client'

import * as React from 'react'
import { Check, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { ImageUploader } from '@/components/admin/image-uploader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

/**
 * Standalone uploader. Images uploaded here are stored immediately; the link
 * is shown so it can be pasted into any field that takes an image URL.
 */
export function MediaUploader() {
  const [uploaded, setUploaded] = React.useState<string[]>([])
  const [copied, setCopied] = React.useState<string | null>(null)

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(url)
      toast.success('Link copied.')
      setTimeout(() => setCopied(null), 2000)
    } catch {
      toast.error('Could not copy. Select the text and copy it manually.')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload an image</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <ImageUploader
          value=""
          onChange={(url) => {
            if (url) setUploaded((current) => [url, ...current])
          }}
          folder="media"
          label="Choose an image"
          hint="The link appears below once the upload finishes."
        />

        {uploaded.length > 0 ? (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Uploaded in this session</h3>
            {uploaded.map((url) => (
              <div key={url} className="flex gap-2">
                <Input readOnly value={url} className="font-mono text-xs" aria-label="Image link" />
                <Button type="button" size="icon-lg" variant="outline" onClick={() => copy(url)} aria-label="Copy link">
                  {copied === url ? <Check /> : <Copy />}
                </Button>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
