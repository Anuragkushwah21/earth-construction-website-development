import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { CircleCheck, MoveUpRight, Wrench } from 'lucide-react'
import { CtaBand } from '@/components/site/cta-band'
import { ServiceIcon } from '@/components/site/service-icon'
import { getPublishedServices, getWorksForService } from '@/lib/data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Our Services',
  description:
    'Road construction, structural engineering, drainage systems, canal construction, groove cutting, PQC/CC roads, labour supply and project management from Earth Construction Company.',
  openGraph: {
    title: 'Services | Earth Construction Company',
    description:
      'Road construction, PQC/CC roads, drainage, canals, groove cutting, labour supply and project management.',
  },
}

export default async function ServicesPage() {
  const services = await getPublishedServices()

  // Pull related published projects for each service in parallel.
  const related = await Promise.all(services.map((service) => getWorksForService(service.title, 3)))

  return (
    <>
      <section className="page-hero">
        <p className="eyebrow light">
          <span className="kicker-line" />
          Our services
        </p>
        <h1>
          What we build,
          <br />
          <em>and how.</em>
        </h1>
        <p>
          Eight core capabilities covering road and infrastructure delivery — from earthwork and pavement
          quality concrete through to drainage, canals and full project management.
        </p>
      </section>

      {services.length === 0 ? (
        <section className="section-pad">
          <div className="state-block">
            <Wrench size={30} aria-hidden />
            <h3>No services published yet</h3>
            <p>Services will appear here once they are added from the admin dashboard.</p>
          </div>
        </section>
      ) : (
        <section className="section-pad">
          {services.map((service, index) => (
            <article className="service-detail-row" key={service.id} id={service.slug}>
              <div className="service-detail-media">
                {service.image ? (
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    sizes="(max-width: 900px) 100vw, 45vw"
                  />
                ) : (
                  <span className="entity-media-fallback">
                    <ServiceIcon name={service.icon} size={38} />
                  </span>
                )}
                <span className="image-tag">{String(index + 1).padStart(2, '0')}</span>
              </div>

              <div className="service-detail-body">
                <p className="eyebrow">
                  <span className="kicker-line" />
                  {service.title}
                </p>
                <h2>{service.title}</h2>
                <p>{service.description || service.shortDescription}</p>

                {service.benefits.length > 0 ? (
                  <ul className="benefit-list">
                    {service.benefits.map((benefit) => (
                      <li key={benefit}>
                        <CircleCheck size={16} aria-hidden />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                ) : null}

                {related[index] && related[index].length > 0 ? (
                  <>
                    <p className="eyebrow" style={{ marginBottom: 10 }}>
                      Related projects
                    </p>
                    <div className="related-chips">
                      {related[index].map((work) => (
                        <Link key={work.id} href={`/work/${work.slug}`}>
                          {work.title}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : null}

                <Link href={`/services/${service.slug}`} className="text-link">
                  Service details <MoveUpRight size={15} aria-hidden />
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}

      <CtaBand
        eyebrow="Scope your project"
        title="Not sure which service you need?"
        description="Describe the site and the outcome you want. We will point you to the right scope of work."
      />
    </>
  )
}
