'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api-client'

type SeedResult = {
  created: { works: number; machines: number; staff: number; services: number; company: boolean }
}

/**
 * Offered only while the database is empty. It loads the projects documented
 * in the company profile plus the eight services, so a new admin has
 * something real to edit instead of a blank dashboard.
 */
export function SeedPrompt() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [dismissed, setDismissed] = React.useState(false)

  async function handleSeed() {
    setLoading(true)
    try {
      const result = await api.post<SeedResult>('/api/admin/seed', {})
      const { works, machines, staff, services } = result.created
      toast.success(
        `Added ${works} projects, ${services} services, ${machines} machines and ${staff} team profiles.`,
      )
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not load starter content.')
    } finally {
      setLoading(false)
    }
  }

  if (dismissed) return null

  return (
    <section className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-base font-semibold text-amber-950">
            <Sparkles className="size-4" /> Start with your documented work
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm text-amber-900/85">
            Load the projects, services and leadership profiles recorded in the company profile document.
            Sample machines are added as <strong>unpublished demo records</strong> marked &ldquo;DEMO&rdquo;
            so nothing unverified appears on the public site — edit them with real details or delete them.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button size="lg" onClick={handleSeed} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {loading ? 'Loading…' : 'Load starter content'}
          </Button>
          <Button size="lg" variant="ghost" onClick={() => setDismissed(true)} disabled={loading}>
            Start empty
          </Button>
        </div>
      </div>
    </section>
  )
}
