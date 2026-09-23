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

export function SeedButton() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<SeedResult['created'] | null>(null)

  async function handleSeed() {
    setLoading(true)
    try {
      const response = await api.post<SeedResult>('/api/admin/seed', {})
      setResult(response.created)

      const added =
        response.created.works +
        response.created.machines +
        response.created.staff +
        response.created.services

      toast.success(added === 0 ? 'Everything was already in place.' : `Added ${added} records.`)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not load starter content.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button size="lg" onClick={handleSeed} disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
        {loading ? 'Loading…' : 'Load starter content'}
      </Button>

      {result ? (
        <p className="text-sm text-muted-foreground">
          Added {result.works} projects, {result.services} services, {result.machines} machines and{' '}
          {result.staff} team profiles
          {result.company ? ', plus the company profile' : ''}.
        </p>
      ) : (
        <p className="max-w-lg text-sm text-muted-foreground">
          Sample machines are created as <strong>unpublished demo records</strong> marked
          &ldquo;DEMO&rdquo;, because the company profile does not document which equipment is owned.
        </p>
      )}
    </div>
  )
}
