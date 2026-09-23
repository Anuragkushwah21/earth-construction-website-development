import { Suspense } from 'react'
import type { Metadata } from 'next'
import { HardHat } from 'lucide-react'
import { CtaBand } from '@/components/site/cta-band'
import { FilterBar } from '@/components/site/filter-bar'
import { Pagination } from '@/components/site/pagination'
import { WorkCard } from '@/components/site/work-card'
import { getPublishedWorks, getWorkFilterOptions } from '@/lib/data'
import { WORK_STATUSES } from '@/lib/types'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 9

export const metadata: Metadata = {
  title: 'Our Work',
  description:
    'Road, PQC/CC, drainage, canal and groove cutting projects delivered by Earth Construction Company across Madhya Pradesh, Maharashtra and Chhattisgarh.',
  openGraph: {
    title: 'Our Work | Earth Construction Company',
    description: 'Selected road and infrastructure projects delivered by Earth Construction Company.',
  },
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function WorkPage({ searchParams }: PageProps) {
  const params = await searchParams
  const single = (key: string) => {
    const value = params[key]
    return (Array.isArray(value) ? value[0] : value) ?? ''
  }

  const search = single('search')
  const category = single('category')
  const location = single('location')
  const status = single('status')
  const page = Math.max(1, Number(single('page')) || 1)

  const [results, filters, featured] = await Promise.all([
    getPublishedWorks({ search, category, location, status, page, limit: PAGE_SIZE }),
    getWorkFilterOptions(),
    // Featured projects are highlighted only on the unfiltered first page.
    search || category || location || status || page > 1
      ? Promise.resolve({ data: [] })
      : getPublishedWorks({ featuredOnly: true, limit: 2 }),
  ])

  const hasFilters = Boolean(search || category || location || status)

  return (
    <>
      <section className="page-hero">
        <p className="eyebrow light">
          <span className="kicker-line" />
          Our work
        </p>
        <h1>
          Built for the
          <br />
          <em>long road.</em>
        </h1>
        <p>
          Every project below is documented by our own team — location, client, scope and completion year, as
          delivered.
        </p>
      </section>

      {featured.data.length > 0 ? (
        <section className="section-white section-pad" style={{ paddingBottom: 60 }}>
          <div className="block-heading" style={{ marginBottom: 34 }}>
            <div>
              <p className="eyebrow">
                <span className="kicker-line" />
                Featured projects
              </p>
              <h2>
                Work we are
                <br />
                <em>proud of.</em>
              </h2>
            </div>
          </div>
          <div className="card-grid cols-2">
            {featured.data.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="section-muted section-pad">
        <div className="block-heading" style={{ marginBottom: 30 }}>
          <div>
            <p className="eyebrow">
              <span className="kicker-line" />
              All projects
            </p>
            <h2>
              Browse the
              <br />
              <em>project journal.</em>
            </h2>
          </div>
        </div>

        <Suspense fallback={<div className="filter-bar" aria-hidden />}>
          <FilterBar
            searchPlaceholder="Search by title, location or client"
            selects={[
              {
                name: 'category',
                label: 'Category',
                options: filters.categories,
                placeholder: 'All categories',
              },
              {
                name: 'location',
                label: 'Location',
                options: filters.locations,
                placeholder: 'All locations',
              },
              {
                name: 'status',
                label: 'Status',
                options: [...WORK_STATUSES],
                placeholder: 'Any status',
              },
            ]}
            resultLabel={`${results.total} project${results.total === 1 ? '' : 's'} found`}
          />
        </Suspense>

        {results.data.length > 0 ? (
          <>
            <div className="card-grid cols-3">
              {results.data.map((work) => (
                <WorkCard key={work.id} work={work} />
              ))}
            </div>
            <Pagination
              page={results.page}
              totalPages={results.totalPages}
              basePath="/work"
              params={{ search, category, location, status }}
            />
          </>
        ) : (
          <div className="state-block">
            <HardHat size={30} aria-hidden />
            <h3>{hasFilters ? 'No projects match these filters' : 'No projects published yet'}</h3>
            <p>
              {hasFilters
                ? 'Try clearing a filter or searching for a different location or client.'
                : 'Project stories appear here as soon as they are published from the admin dashboard.'}
            </p>
          </div>
        )}
      </section>

      <CtaBand />
    </>
  )
}
