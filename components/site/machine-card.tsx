import Image from 'next/image'
import Link from 'next/link'
import { MoveUpRight, Truck } from 'lucide-react'
import type { Machine } from '@/lib/types'

const AVAILABILITY_CLASS: Record<string, string> = {
  Available: 'pill pill-available',
  'In Use': 'pill pill-in-use',
  'Under Maintenance': 'pill pill-under-maintenance',
}

export function MachineCard({ machine }: { machine: Machine }) {
  return (
    <article className="entity-card">
      <Link href={`/machines/${machine.slug}`} className="entity-media" aria-label={machine.name}>
        {machine.mainImage ? (
          <Image
            src={machine.mainImage}
            alt={machine.name}
            fill
            sizes="(max-width: 680px) 100vw, (max-width: 1100px) 50vw, 33vw"
          />
        ) : (
          <span className="entity-media-fallback">
            <Truck size={28} aria-hidden />
          </span>
        )}
        {machine.featured ? <span className="image-tag">Featured</span> : null}
      </Link>

      <div className="entity-body">
        {machine.category ? (
          <div className="entity-meta">
            <span>{machine.category}</span>
          </div>
        ) : null}

        <h3>
          <Link href={`/machines/${machine.slug}`}>{machine.name}</Link>
        </h3>

        {machine.description ? <p>{truncate(machine.description, 150)}</p> : null}

        <div className="entity-footer">
          <span className={AVAILABILITY_CLASS[machine.availability] ?? 'pill pill-available'}>
            {machine.availability}
          </span>
          <Link href={`/machines/${machine.slug}`} className="text-link">
            View details <MoveUpRight size={15} aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  )
}

function truncate(text: string, limit: number) {
  const clean = text.replace(/\s+/g, ' ').trim()
  return clean.length <= limit ? clean : `${clean.slice(0, limit).trimEnd()}…`
}
