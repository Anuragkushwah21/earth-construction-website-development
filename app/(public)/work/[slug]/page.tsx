import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowLeft, Briefcase, CalendarDays, Layers, MapPin, Tag } from 'lucide-react'
import { CtaBand } from '@/components/site/cta-band'
import { Prose } from '@/components/site/prose'
import { WorkCard } from '@/components/site/work-card'
import { getRelatedWorks, getWorkBySlug } from '@/lib/data'

export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ slug: string }> }

const STATUS_CLASS: Record<string, string> = {
  Completed: 'pill pill-completed',
  Ongoing: 'pill pill-ongoing',
  Upcoming: 'pill pill-upcoming',
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const work = await getWorkBySlug(slug)
  if (!work) return { title: 'Project not found' }

  const description =
    work.shortDescription || work.description.replace(/\s+/g, ' ').slice(0, 160) || work.title

  return {
    title: work.title,
    description,
    alternates: { canonical: `/work/${work.slug}` },
    openGraph: {
      type: 'article',
      title: `${work.title} | Earth Construction Company`,
      description,
      publishedTime: work.createdAt || undefined,
      modifiedTime: work.updatedAt || undefined,
      images: work.coverImage ? [{ url: work.coverImage, alt: work.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: work.title,
      description,
      images: work.coverImage ? [work.coverImage] : undefined,
    },
  }
}

export default async function WorkDetailPage({ params }: PageProps) {
  const { slug } = await params
  const work = await getWorkBySlug(slug)
  if (!work) notFound()

  const related = await getRelatedWorks(work, 3)

  return (
    <>
      <section className="detail-hero">
        {work.coverImage ? (
          <Image src={work.coverImage} alt={work.title} fill priority className="cover-image" sizes="100vw" />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'var(--charcoal)' }} />
        )}
        <div className="hero-overlay" />
        <div className="detail-hero-copy">
          <p className="eyebrow light">
            <span />
            Project journal{work.completionYear ? ` / ${work.completionYear}` : ''}
          </p>
          <h1>{work.title}</h1>
          {work.location ? <p>{work.location}</p> : null}
        </div>
      </section>

      <section className="detail-content section-pad">
        <div className="detail-meta">
          <div>
            <span>Status</span>
            <strong>
              <span className={STATUS_CLASS[work.status] ?? 'pill pill-completed'}>{work.status}</span>
            </strong>
          </div>
          {work.category ? (
            <div>
              <span>Category</span>
              <strong>
                <Tag size={14} aria-hidden />
                {work.category}
              </strong>
            </div>
          ) : null}
          {work.location ? (
            <div>
              <span>Location</span>
              <strong>
                <MapPin size={14} aria-hidden />
                {work.location}
              </strong>
            </div>
          ) : null}
          {work.client ? (
            <div>
              <span>Client / organisation</span>
              <strong>
                <Briefcase size={14} aria-hidden />
                {work.client}
              </strong>
            </div>
          ) : null}
          {work.completionYear ? (
            <div>
              <span>Completion</span>
              <strong>
                <CalendarDays size={14} aria-hidden />
                {work.completionYear}
              </strong>
            </div>
          ) : null}
          {work.services.length > 0 ? (
            <div>
              <span>Services involved</span>
              <strong style={{ display: 'block' }}>
                <Layers size={14} aria-hidden style={{ marginRight: 6, verticalAlign: 'middle' }} />
                {work.services.join(', ')}
              </strong>
            </div>
          ) : null}
        </div>

        <div className="detail-story">
          <Link href="/work" className="text-link" style={{ marginTop: 0, marginBottom: 26 }}>
            <ArrowLeft size={15} aria-hidden /> All projects
          </Link>

          <p className="eyebrow">
            <span className="kicker-line" />
            The project story
          </p>

          {work.shortDescription ? (
            <h2 style={{ fontSize: 'clamp(28px, 3.4vw, 46px)' }}>{work.shortDescription}</h2>
          ) : null}

          <Prose text={work.description} className="detail-prose" />

          {work.galleryImages.length > 0 ? (
            <>
              <p className="eyebrow" style={{ marginTop: 40 }}>
                <span className="kicker-line" />
                Project gallery
              </p>
              <div className="detail-gallery">
                {work.galleryImages.map((image, index) => (
                  <figure key={`${image}-${index}`}>
                    <Image
                      src={image}
                      alt={`${work.title} — image ${index + 1}`}
                      fill
                      sizes="(max-width: 680px) 50vw, 30vw"
                    />
                  </figure>
                ))}
              </div>
            </>
          ) : null}

          <Link href="/contact" className="button button-dark" style={{ marginTop: 36 }}>
            Discuss a similar project
          </Link>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="section-muted section-pad">
          <div className="block-heading">
            <div>
              <p className="eyebrow">
                <span className="kicker-line" />
                Related projects
              </p>
              <h2>
                More from
                <br />
                <em>our portfolio.</em>
              </h2>
            </div>
            <Link href="/work" className="text-link">
              View all projects
            </Link>
          </div>
          <div className="card-grid cols-3">
            {related.map((item) => (
              <WorkCard key={item.id} work={item} />
            ))}
          </div>
        </section>
      ) : null}

      <CtaBand />
    </>
  )
}
