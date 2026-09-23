import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Truck } from 'lucide-react'
import { CtaBand } from '@/components/site/cta-band'
import { FilterBar } from '@/components/site/filter-bar'
import { MachineCard } from '@/components/site/machine-card'
import { Pagination } from '@/components/site/pagination'
import { getMachineFilterOptions, getPublishedMachines } from '@/lib/data'
import { MACHINE_AVAILABILITY } from '@/lib/types'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 9

export const metadata: Metadata = {
  title: 'Machines & Equipment',
  description:
    'Construction machinery and equipment available through Earth Construction Company for road, PQC, groove cutting and infrastructure work.',
  openGraph: {
    title: 'Machines & Equipment | Earth Construction Company',
    description: 'Construction machinery and equipment used on Earth Construction Company projects.',
  },
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function MachinesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const single = (key: string) => {
    const value = params[key]
    return (Array.isArray(value) ? value[0] : value) ?? ''
  }

  const search = single('search')
  const category = single('category')
  const availability = single('availability')
  const page = Math.max(1, Number(single('page')) || 1)

  const [results, filters, featured] = await Promise.all([
    getPublishedMachines({ search, category, availability, page, limit: PAGE_SIZE }),
    getMachineFilterOptions(),
    search || category || availability || page > 1
      ? Promise.resolve({ data: [] })
      : getPublishedMachines({ featuredOnly: true, limit: 3 }),
  ])

  const hasFilters = Boolean(search || category || availability)

  return (
    <>
      <section className="page-hero">
        <p className="eyebrow light">
          <span className="kicker-line" />
          Machines &amp; equipment
        </p>
        <h1>
          The equipment
          <br />
          <em>behind the work.</em>
        </h1>
        <p>
          Machinery records are maintained by our team. Each listing shows only the details we have confirmed
          — nothing is estimated.
        </p>
      </section>

      {featured.data.length > 0 ? (
        <section className="section-white section-pad" style={{ paddingBottom: 60 }}>
          <div className="block-heading" style={{ marginBottom: 34 }}>
            <div>
              <p className="eyebrow">
                <span className="kicker-line" />
                Featured equipment
              </p>
              <h2>
                Key machines
                <br />
                <em>in our fleet.</em>
              </h2>
            </div>
          </div>
          <div className="card-grid cols-3">
            {featured.data.map((machine) => (
              <MachineCard key={machine.id} machine={machine} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="section-muted section-pad">
        <div className="block-heading" style={{ marginBottom: 30 }}>
          <div>
            <p className="eyebrow">
              <span className="kicker-line" />
              All equipment
            </p>
            <h2>
              Browse the
              <br />
              <em>equipment list.</em>
            </h2>
          </div>
        </div>

        <Suspense fallback={<div className="filter-bar" aria-hidden />}>
          <FilterBar
            searchPlaceholder="Search by machine name or category"
            selects={[
              {
                name: 'category',
                label: 'Category',
                options: filters.categories,
                placeholder: 'All categories',
              },
              {
                name: 'availability',
                label: 'Availability',
                options: [...MACHINE_AVAILABILITY],
                placeholder: 'Any availability',
              },
            ]}
            resultLabel={`${results.total} machine${results.total === 1 ? '' : 's'} found`}
          />
        </Suspense>

        {results.data.length > 0 ? (
          <>
            <div className="card-grid cols-3">
              {results.data.map((machine) => (
                <MachineCard key={machine.id} machine={machine} />
              ))}
            </div>
            <Pagination
              page={results.page}
              totalPages={results.totalPages}
              basePath="/machines"
              params={{ search, category, availability }}
            />
          </>
        ) : (
          <div className="state-block">
            <Truck size={30} aria-hidden />
            <h3>{hasFilters ? 'No machines match these filters' : 'No equipment published yet'}</h3>
            <p>
              {hasFilters
                ? 'Try clearing a filter or searching for a different category.'
                : 'Machines and equipment appear here once they are added and published from the admin dashboard.'}
            </p>
          </div>
        )}
      </section>

      <CtaBand
        eyebrow="Equipment enquiry"
        title="Need a machine for your site?"
        description="Tell us the work, the site and the duration, and we will confirm what we can make available."
      />
    </>
  )
}
