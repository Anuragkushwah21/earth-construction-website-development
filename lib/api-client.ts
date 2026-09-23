'use client'

export class ApiError extends Error {
  status: number
  fields: Record<string, string>

  constructor(message: string, status: number, fields: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fields = fields
  }
}

/**
 * Thin fetch wrapper for the dashboard. It always sends same-origin cookies,
 * turns non-2xx responses into `ApiError` (carrying per-field messages from
 * the server's Zod validation) and bounces to the login page on a 401.
 */
export async function apiRequest<T>(url: string, init: RequestInit = {}): Promise<T> {
  const isFormData = init.body instanceof FormData

  const response = await fetch(url, {
    credentials: 'same-origin',
    ...init,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...init.headers,
    },
  })

  let payload: unknown = null
  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    payload = await response.json().catch(() => null)
  }

  if (!response.ok) {
    const body = (payload ?? {}) as { error?: string; fields?: Record<string, string> }

    if (response.status === 401 && typeof window !== 'undefined') {
      // Via the clear-cookie handler: a session revoked by a password change
      // still looks valid to the middleware, which would bounce a plain
      // /admin/login navigation straight back to the dashboard.
      const next = encodeURIComponent(window.location.pathname + window.location.search)
      window.location.href = `/api/auth/expired?next=${next}`
    }

    throw new ApiError(
      body.error ?? `Request failed (${response.status}).`,
      response.status,
      body.fields ?? {},
    )
  }

  return payload as T
}

export const api = {
  get: <T>(url: string) => apiRequest<T>(url),
  post: <T>(url: string, body: unknown) =>
    apiRequest<T>(url, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(url: string, body: unknown) =>
    apiRequest<T>(url, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(url: string) => apiRequest<T>(url, { method: 'DELETE' }),
}
