import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowLeft, CircleCheck } from 'lucide-react'
import { CtaBand } from '@/components/site/cta-band'
import { Prose } from '@/components/site/prose'
import { ServiceIcon } from '@/components/site/service-icon'
import { WorkCard } from '@/components/site/work-card'
import { getServiceBySlug, getWorksForService } from '@/lib/data'

export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const service = await getServiceBySlug(slug)
  if (!service) return { title: 'Service not found' }

  const description = service.shortDescription || service.description.slice(0, 160)

  return {
    title: service.title,
    description,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: {
      title: `${service.title} | Earth Construction Company`,
      description,
      type: 'article',
      images: service.image ? [{ url: service.image }] : undefined,
    },
  }
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params
  const service = await getServiceBySlug(slug)
  if (!service) notFound()

  const relatedWork = await getWorksForService(service.title, 3)

  return (
    <>
      <section className="page-hero">
        <p className="eyebrow light">
          <span className="kicker-line" />
          Service
        </p>
        <h1>{service.title}</h1>
        {service.shortDescription ? <p>{service.shortDescription}</p> : null}
      </section>

      <section className="section-pad">
        <Link href="/services" className="text-link" style={{ marginTop: 0 }}>
          <ArrowLeft size={15} aria-hidden /> All services
        </Link>

        <div className="split-panel" style={{ marginTop: 38 }}>
          <div>
            <div className="service-detail-media">
              {service.image ? (
                <Image src={service.image} alt={service.title} fill sizes="(max-width: 900px) 100vw, 45vw" />
              ) : (
                <span className="entity-media-fallback">
                  <ServiceIcon name={service.icon} size={40} />
                </span>
              )}
            </div>

            {service.benefits.length > 0 ? (
              <>
                <p className="eyebrow" style={{ margin: '34px 0 14px' }}>
                  <span className="kicker-line" />
                  Key benefits
                </p>
                <ul className="benefit-list">
                  {service.benefits.map((benefit) => (
                    <li key={benefit}>
                      <CircleCheck size={16} aria-hidden />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>

          <div>
            <Prose text={service.description || service.shortDescription} />
          </div>
        </div>
      </section>

      {relatedWork.length > 0 ? (
        <section className="section-muted section-pad">
          <div className="block-heading">
            <div>
              <p className="eyebrow">
                <span className="kicker-line" />
                Related work
              </p>
              <h2>
                {service.title}
                <br />
                <em>in practice.</em>
              </h2>
            </div>
          </div>
          <div className="card-grid cols-3">
            {relatedWork.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        </section>
      ) : null}

      <CtaBand
        eyebrow="Enquire"
        title={`Need ${service.title.toLowerCase()}?`}
        description="Send us the site details and scope. We will come back with a practical proposal."
      />
    </>
  )
}
