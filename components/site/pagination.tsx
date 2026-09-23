import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function Pagination({
  page,
  totalPages,
  basePath,
  params,
}: {
  page: number
  totalPages: number
  basePath: string
  params: Record<string, string | undefined>
}) {
  if (totalPages <= 1) return null

  const hrefFor = (targetPage: number) => {
    const search = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (value) search.set(key, value)
    }
    if (targetPage > 1) search.set('page', String(targetPage))
    const query = search.toString()
    return query ? `${basePath}?${query}` : basePath
  }

  // Show a window around the current page so long lists stay compact.
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (candidate) =>
      candidate === 1 ||
      candidate === totalPages ||
      Math.abs(candidate - page) <= 1,
  )

  return (
    <nav className="pagination" aria-label="Pagination">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} aria-label="Previous page">
          <ChevronLeft size={15} aria-hidden />
        </Link>
      ) : (
        <span className="is-disabled" aria-hidden>
          <ChevronLeft size={15} />
        </span>
      )}

      {pages.map((candidate, index) => {
        const previous = pages[index - 1]
        const gap = previous !== undefined && candidate - previous > 1

        return (
          <span key={candidate} style={{ display: 'contents' }}>
            {gap ? <span className="is-disabled">…</span> : null}
            {candidate === page ? (
              <span className="is-current" aria-current="page">
                {candidate}
              </span>
            ) : (
              <Link href={hrefFor(candidate)}>{candidate}</Link>
            )}
          </span>
        )
      })}

      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} aria-label="Next page">
          <ChevronRight size={15} aria-hidden />
        </Link>
      ) : (
        <span className="is-disabled" aria-hidden>
          <ChevronRight size={15} />
        </span>
      )}
    </nav>
  )
}
