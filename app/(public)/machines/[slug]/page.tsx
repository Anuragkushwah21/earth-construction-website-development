import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowLeft, CircleCheck, Gauge, Send, Tag, Truck } from 'lucide-react'
import { CtaBand } from '@/components/site/cta-band'
import { Prose } from '@/components/site/prose'
import { getMachineBySlug } from '@/lib/data'

export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ slug: string }> }

const AVAILABILITY_CLASS: Record<string, string> = {
  Available: 'pill pill-available',
  'In Use': 'pill pill-in-use',
  'Under Maintenance': 'pill pill-under-maintenance',
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const machine = await getMachineBySlug(slug)
  if (!machine) return { title: 'Machine not found' }

  const description = machine.description.replace(/\s+/g, ' ').slice(0, 160) || machine.name

  return {
    title: machine.name,
    description,
    alternates: { canonical: `/machines/${machine.slug}` },
    openGraph: {
      type: 'article',
      title: `${machine.name} | Earth Construction Company`,
      description,
      images: machine.mainImage ? [{ url: machine.mainImage, alt: machine.name }] : undefined,
    },
  }
}

export default async function MachineDetailPage({ params }: PageProps) {
  const { slug } = await params
  const machine = await getMachineBySlug(slug)
  if (!machine) notFound()

  return (
    <>
      <section className="page-hero">
        <p className="eyebrow light">
          <span className="kicker-line" />
          Machines &amp; equipment
        </p>
        <h1>{machine.name}</h1>
        {machine.category ? <p>{machine.category}</p> : null}
      </section>

      <section className="section-pad">
        <Link href="/machines" className="text-link" style={{ marginTop: 0 }}>
          <ArrowLeft size={15} aria-hidden /> All equipment
        </Link>

        <div className="split-panel" style={{ marginTop: 38 }}>
          <div>
            <div className="service-detail-media">
              {machine.mainImage ? (
                <Image src={machine.mainImage} alt={machine.name} fill sizes="(max-width: 900px) 100vw, 45vw" />
              ) : (
                <span className="entity-media-fallback">
                  <Truck size={40} aria-hidden />
                </span>
              )}
            </div>

            {machine.galleryImages.length > 0 ? (
              <div className="detail-gallery" style={{ marginTop: 14 }}>
                {machine.galleryImages.map((image, index) => (
                  <figure key={`${image}-${index}`}>
                    <Image
                      src={image}
                      alt={`${machine.name} — image ${index + 1}`}
                      fill
                      sizes="(max-width: 680px) 50vw, 20vw"
                    />
                  </figure>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <div className="entity-meta" style={{ marginBottom: 18 }}>
              <span className={AVAILABILITY_CLASS[machine.availability] ?? 'pill pill-available'}>
                {machine.availability}
              </span>
              {machine.category ? (
                <span>
                  <Tag size={12} aria-hidden /> {machine.category}
                </span>
              ) : null}
            </div>

            {machine.description ? (
              <Prose text={machine.description} className="detail-prose" />
            ) : (
              <p className="detail-prose">Detailed information for this machine has not been added yet.</p>
            )}

            {machine.capacity ? (
              <p className="entity-meta" style={{ marginTop: 6 }}>
                <span>
                  <Gauge size={13} aria-hidden /> Capacity: {machine.capacity}
                </span>
              </p>
            ) : null}

            {/* Only admin-entered specifications are shown — nothing is inferred. */}
            {machine.specifications.length > 0 ? (
              <>
                <p className="eyebrow" style={{ marginTop: 34 }}>
                  <span className="kicker-line" />
                  Specifications
                </p>
                <table className="spec-table">
                  <tbody>
                    {machine.specifications.map((spec) => (
                      <tr key={spec.label}>
                        <th scope="row">{spec.label}</th>
                        <td>{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : null}

            {machine.applications.length > 0 ? (
              <>
                <p className="eyebrow" style={{ marginTop: 34, marginBottom: 14 }}>
                  <span className="kicker-line" />
                  Applications
                </p>
                <ul className="benefit-list">
                  {machine.applications.map((application) => (
                    <li key={application}>
                      <CircleCheck size={16} aria-hidden />
                      {application}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            <Link href="/contact#inquiry" className="button button-accent" style={{ marginTop: 26 }}>
              Enquire about this machine <Send size={16} aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <CtaBand
        eyebrow="Equipment enquiry"
        title="Need this machine on your site?"
        description="Send us the location, the scope of work and the duration you need it for."
      />
    </>
  )
}
