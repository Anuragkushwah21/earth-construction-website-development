import 'server-only'

import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024 // 5 MB

export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
}

export type UploadResult = { url: string; provider: 'cloudinary' | 'local'; publicId?: string }

export class UploadError extends Error {
  status: number
  constructor(message: string, status = 400) {
    super(message)
    this.name = 'UploadError'
    this.status = status
  }
}

function cloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  )
}

/** The provider currently in use — surfaced in the admin UI. */
export function uploadProvider(): 'cloudinary' | 'local' {
  return cloudinaryConfigured() ? 'cloudinary' : 'local'
}

function assertValidFile(file: File) {
  if (!file || typeof file.arrayBuffer !== 'function') {
    throw new UploadError('No file was received.')
  }
  if (file.size === 0) {
    throw new UploadError('The selected file is empty.')
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadError(
      `Image is too large. Maximum size is ${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))} MB.`,
    )
  }
  if (!ALLOWED_IMAGE_TYPES[file.type]) {
    throw new UploadError('Unsupported file type. Upload a JPG, PNG, WEBP, AVIF, GIF or SVG image.')
  }
}

/**
 * Magic-number check so a renamed executable cannot pass as an image just by
 * claiming an image MIME type.
 */
function assertImageSignature(buffer: Buffer, mimeType: string) {
  const startsWith = (...bytes: number[]) => bytes.every((byte, index) => buffer[index] === byte)

  switch (mimeType) {
    case 'image/jpeg':
      if (!startsWith(0xff, 0xd8, 0xff)) throw new UploadError('File does not look like a valid JPEG.')
      break
    case 'image/png':
      if (!startsWith(0x89, 0x50, 0x4e, 0x47)) throw new UploadError('File does not look like a valid PNG.')
      break
    case 'image/gif':
      if (!startsWith(0x47, 0x49, 0x46)) throw new UploadError('File does not look like a valid GIF.')
      break
    case 'image/webp':
    case 'image/avif': {
      const container = buffer.subarray(0, 16).toString('ascii')
      if (!container.includes('WEBP') && !container.includes('ftyp')) {
        throw new UploadError('File does not look like a valid WEBP/AVIF image.')
      }
      break
    }
    case 'image/svg+xml': {
      const head = buffer.subarray(0, 1024).toString('utf8')
      if (!head.includes('<svg')) throw new UploadError('File does not look like a valid SVG.')
      if (/<\s*script/i.test(buffer.toString('utf8'))) {
        throw new UploadError('SVG files containing scripts are not allowed.')
      }
      break
    }
  }
}

async function uploadToCloudinary(buffer: Buffer, folder: string): Promise<UploadResult> {
  const { v2: cloudinary } = await import('cloudinary')

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })

  return new Promise<UploadResult>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `earth-construction/${folder}`, resource_type: 'image' },
      (error, result) => {
        if (error || !result) {
          reject(new UploadError(error?.message ?? 'Cloudinary upload failed.', 502))
          return
        }
        resolve({ url: result.secure_url, provider: 'cloudinary', publicId: result.public_id })
      },
    )
    stream.end(buffer)
  })
}

async function uploadToLocalDisk(buffer: Buffer, folder: string, extension: string): Promise<UploadResult> {
  const directory = path.join(process.cwd(), 'public', 'uploads', folder)
  await mkdir(directory, { recursive: true })

  const fileName = `${Date.now()}-${randomUUID()}.${extension}`
  await writeFile(path.join(directory, fileName), buffer)

  return { url: `/uploads/${folder}/${fileName}`, provider: 'local' }
}

/**
 * Single entry point for storing an image. Swapping storage providers later
 * means changing this function only — nothing that calls it needs to know
 * where the bytes end up.
 */
export async function uploadImage(file: File, folder = 'general'): Promise<UploadResult> {
  assertValidFile(file)

  const safeFolder = folder.replace(/[^a-z0-9-]/gi, '').toLowerCase() || 'general'
  const buffer = Buffer.from(await file.arrayBuffer())
  assertImageSignature(buffer, file.type)

  if (cloudinaryConfigured()) {
    return uploadToCloudinary(buffer, safeFolder)
  }
  return uploadToLocalDisk(buffer, safeFolder, ALLOWED_IMAGE_TYPES[file.type]!)
}
