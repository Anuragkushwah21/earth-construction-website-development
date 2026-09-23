'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'

type FilterSelect = { name: string; label: string; options: string[]; placeholder: string }

/**
 * Filters live in the URL, so a filtered list is shareable, survives a reload
 * and works with the browser's back button. The form submits normally when
 * JavaScript has not loaded yet.
 */
export function FilterBar({
  searchPlaceholder,
  selects,
  resultLabel,
}: {
  searchPlaceholder: string
  selects: FilterSelect[]
  resultLabel: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [search, setSearch] = React.useState(searchParams.get('search') ?? '')

  React.useEffect(() => {
    setSearch(searchParams.get('search') ?? '')
  }, [searchParams])

  function applyParam(name: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(name, value)
    else params.delete(name)
    params.delete('page') // A new filter always starts from the first page.
    router.push(`${pathname}?${params.toString()}`)
  }

  const hasFilters = Array.from(searchParams.keys()).some((key) => key !== 'page')

  return (
    <>
      <form
        className="filter-bar"
        onSubmit={(event) => {
          event.preventDefault()
          applyParam('search', search.trim())
        }}
      >
        <label>
          Search
          <input
            type="search"
            name="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={searchPlaceholder}
          />
        </label>

        {selects.map((select) => (
          <label key={select.name}>
            {select.label}
            <select
              name={select.name}
              value={searchParams.get(select.name) ?? ''}
              onChange={(event) => applyParam(select.name, event.target.value)}
            >
              <option value="">{select.placeholder}</option>
              {select.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ))}

        <button type="submit" className="sr-only">
          Apply filters
        </button>
      </form>

      <div className="filter-actions">
        <span>
          <Search size={12} aria-hidden style={{ verticalAlign: 'middle', marginRight: 7 }} />
          {resultLabel}
        </span>
        {hasFilters ? (
          <Link href={pathname} className="filter-reset">
            Clear all filters
          </Link>
        ) : null}
      </div>
    </>
  )
}
