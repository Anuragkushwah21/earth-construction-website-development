import { HardDrive, Image as ImageIcon, ShieldCheck, Upload } from 'lucide-react'
import { PageHeader } from '@/components/admin/page-header'
import { MediaUploader } from '@/components/admin/media-uploader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MAX_UPLOAD_BYTES, uploadProvider } from '@/lib/upload'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Media' }

export default function AdminMediaPage() {
  const provider = uploadProvider()
  const maxMb = Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))

  return (
    <>
      <PageHeader
        eyebrow="Library"
        title="Media"
        description="Upload an image here to get a link you can paste anywhere, or upload directly inside a project, machine or staff form."
      />

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <MediaUploader />

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Storage</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <p className="flex items-start gap-2.5">
                <HardDrive className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span>
                  Current provider: <strong>{provider === 'cloudinary' ? 'Cloudinary' : 'Local disk'}</strong>
                  {provider === 'local' ? (
                    <span className="mt-1 block text-xs text-muted-foreground">
                      Images are saved to <code className="font-mono">public/uploads</code>. This works for
                      local development and a normal server, but not on serverless hosting such as Vercel,
                      where the filesystem is wiped between deploys. Set the Cloudinary variables in{' '}
                      <code className="font-mono">.env.local</code> to switch.
                    </span>
                  ) : (
                    <span className="mt-1 block text-xs text-muted-foreground">
                      Images are uploaded to Cloudinary and served from their CDN.
                    </span>
                  )}
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upload rules</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <p className="flex items-start gap-2.5">
                <ImageIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span>Accepted formats: JPG, PNG, WEBP, AVIF, GIF and SVG.</span>
              </p>
              <p className="flex items-start gap-2.5">
                <Upload className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span>Maximum size: {maxMb} MB per image.</span>
              </p>
              <p className="flex items-start gap-2.5">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span>
                  Every file is checked against its real contents, not just its name, and SVGs containing
                  scripts are rejected.
                </span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
