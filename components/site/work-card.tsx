import Image from 'next/image'
import Link from 'next/link'
import { CalendarDays, ImageOff, MapPin, MoveUpRight } from 'lucide-react'
import type { Work } from '@/lib/types'

const STATUS_CLASS: Record<string, string> = {
  Completed: 'pill pill-completed',
  Ongoing: 'pill pill-ongoing',
  Upcoming: 'pill pill-upcoming',
}

export function WorkCard({ work }: { work: Work }) {
  return (
    <article className="entity-card">
      <Link href={`/work/${work.slug}`} className="entity-media" aria-label={work.title}>
        {work.coverImage ? (
          <Image
            src={work.coverImage}
            alt={work.title}
            fill
            sizes="(max-width: 680px) 100vw, (max-width: 1100px) 50vw, 33vw"
          />
        ) : (
          <span className="entity-media-fallback">
            <ImageOff size={28} aria-hidden />
          </span>
        )}
        {work.featured ? <span className="image-tag">Featured</span> : null}
      </Link>

      <div className="entity-body">
        <div className="entity-meta">
          {work.category ? <span>{work.category}</span> : null}
          {work.completionYear ? (
            <span>
              <CalendarDays size={12} aria-hidden /> {work.completionYear}
            </span>
          ) : null}
        </div>

        <h3>
          <Link href={`/work/${work.slug}`}>{work.title}</Link>
        </h3>

        {work.location ? (
          <p className="entity-meta">
            <span>
              <MapPin size={12} aria-hidden /> {work.location}
            </span>
          </p>
        ) : null}

        {work.shortDescription ? <p>{work.shortDescription}</p> : null}

        <div className="entity-footer">
          <span className={STATUS_CLASS[work.status] ?? 'pill pill-completed'}>{work.status}</span>
          <Link href={`/work/${work.slug}`} className="text-link">
            View details <MoveUpRight size={15} aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  )
}
