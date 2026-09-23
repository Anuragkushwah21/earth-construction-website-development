import 'server-only'

import { NextResponse } from 'next/server'
import type { z } from 'zod'
import connectToDatabase from '@/lib/db'
import { UnauthorizedError, requireSession } from '@/lib/auth'
import { isSameOrigin, jsonError } from '@/lib/security'
import { fieldErrors } from '@/lib/validation'
import type { AdminSession } from '@/lib/types'

const MUTATING_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE'])

type Handler<T> = (context: { request: Request; session: AdminSession; params: T }) => Promise<Response>

/**
 * Wraps an admin API handler with the checks every one of them needs:
 * same-origin, authenticated session, database connection and a single place
 * where unexpected errors turn into a 500 instead of leaking a stack trace.
 */
export function withAdmin<T = Record<string, never>>(handler: Handler<T>) {
  return async (request: Request, context: { params?: Promise<T> } = {}) => {
    try {
      if (MUTATING_METHODS.has(request.method) && !isSameOrigin(request)) {
        return jsonError('Request origin not allowed.', 403)
      }

      const session = await requireSession()
      await connectToDatabase()

      const params = context.params ? await context.params : ({} as T)
      return await handler({ request, session, params })
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return jsonError('You need to sign in to do that.', 401)
      }
      return handleUnexpected(error)
    }
  }
}

export function handleUnexpected(error: unknown) {
  if (isDuplicateKeyError(error)) {
    return jsonError('That value is already in use. Try a different title or slug.', 409)
  }
  console.error('[api]', error)
  const message =
    process.env.NODE_ENV === 'development' && error instanceof Error
      ? error.message
      : 'Something went wrong. Please try again.'
  return jsonError(message, 500)
}

function isDuplicateKeyError(error: unknown) {
  return Boolean(error && typeof error === 'object' && 'code' in error && (error as { code: unknown }).code === 11000)
}

/** Parses and validates a JSON body, returning a 400 response on failure. */
export async function parseBody<S extends z.ZodTypeAny>(
  request: Request,
  schema: S,
): Promise<{ ok: true; data: z.infer<S> } | { ok: false; response: NextResponse }> {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return { ok: false, response: jsonError('Request body must be valid JSON.', 400) }
  }

  const result = schema.safeParse(raw)
  if (!result.success) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Please check the highlighted fields.', fields: fieldErrors(result.error) },
        { status: 400 },
      ),
    }
  }

  return { ok: true, data: result.data }
}

export function searchParams(request: Request) {
  return new URL(request.url).searchParams
}
