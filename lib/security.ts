import { NextResponse } from 'next/server'

/* ---------------------------------------------------------------- slugs -- */

export function slugify(input: string) {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90)
}

/** Appends `-2`, `-3`, … until `exists` reports the slug is free. */
export async function uniqueSlug(base: string, exists: (slug: string) => Promise<boolean>) {
  const root = slugify(base) || 'item'
  let candidate = root
  let counter = 2
  while (await exists(candidate)) {
    candidate = `${root}-${counter}`
    counter += 1
    if (counter > 200) return `${root}-${Date.now()}`
  }
  return candidate
}

/* ------------------------------------------------------------ sanitising -- */

/**
 * Strips HTML tags and control characters from visitor-supplied text. All
 * user content is rendered as plain text, so this is defence in depth rather
 * than the only protection against injection.
 */
export function sanitizeText(input: unknown, maxLength = 5000) {
  if (typeof input !== 'string') return ''
  return input
    .replace(/<[^>]*>/g, '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')
    .trim()
    .slice(0, maxLength)
}

/** Keeps admin-authored rich text but removes script/style/iframe payloads. */
export function sanitizeRichText(input: unknown, maxLength = 20000) {
  if (typeof input !== 'string') return ''
  return input
    .replace(/<\s*(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '')
    .slice(0, maxLength)
}

/* ---------------------------------------------------------- rate limiting -- */

type Bucket = { count: number; resetAt: number }

const globalForBuckets = globalThis as unknown as { _rateLimitBuckets?: Map<string, Bucket> }
const buckets = globalForBuckets._rateLimitBuckets ?? new Map<string, Bucket>()
globalForBuckets._rateLimitBuckets = buckets

/**
 * Fixed-window limiter held in process memory. It is enough to blunt casual
 * form spam and credential guessing on a single instance; a multi-instance
 * deployment should move this to Redis or an upstream WAF.
 */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    if (buckets.size > 5000) {
      for (const [bucketKey, value] of buckets) {
        if (value.resetAt <= now) buckets.delete(bucketKey)
      }
    }
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 }
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    }
  }

  bucket.count += 1
  return { allowed: true, remaining: limit - bucket.count, retryAfterSeconds: 0 }
}

export function clientIp(request: Request) {
  const headers = request.headers
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]!.trim()
  return headers.get('x-real-ip') ?? '0.0.0.0'
}

/* ------------------------------------------------------------------ CSRF -- */

/**
 * Session cookies are `SameSite=Lax`, which already blocks cross-site form
 * posts. This adds an explicit Origin check so a mismatched origin is rejected
 * before any handler work happens.
 */
export function isSameOrigin(request: Request) {
  const origin = request.headers.get('origin')
  if (!origin) return true // Same-origin navigations and server-to-server calls omit Origin.

  const host = request.headers.get('host')
  if (!host) return false

  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

/* -------------------------------------------------------- API responses -- */

export function jsonError(message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status })
}

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status })
}
