import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Building2,
  CalendarDays,
  HardHat,
  Leaf,
  MoveUpRight,
  ShieldCheck,
  Truck,
  Users,
} from 'lucide-react'
import { CtaBand } from '@/components/site/cta-band'
import { MachineCard } from '@/components/site/machine-card'
import { ServiceIcon } from '@/components/site/service-icon'
import { TeamCard } from '@/components/site/team-card'
import { WorkCard } from '@/components/site/work-card'
import { FOUNDING_YEAR, yearsOfExperience } from '@/lib/company-defaults'
import {
  getCompanySettings,
  getPublishedMachines,
  getPublishedServices,
  getPublishedStaff,
  getPublishedWorks,
} from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [company, services, works, machines, team] = await Promise.all([
    getCompanySettings(),
    getPublishedServices(),
    getPublishedWorks({ limit: 3 }),
    getPublishedMachines({ limit: 3, featuredOnly: false }),
    getPublishedStaff(4),
  ])

  const experience = yearsOfExperience()
  const aboutIntro = company.about.split(/\n{2,}/)[0] ?? ''

  return (
    <>
      {/* Hero ------------------------------------------------------------ */}
      <section className="hero">
        <Image
          src="/earth-construction-hero.png"
          alt=""
          fill
          priority
          className="hero-image"
          sizes="100vw"
        />
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="eyebrow light">
            <span />
            Established {FOUNDING_YEAR} · Gwalior, Madhya Pradesh
          </p>
          <h1>
            Building Infrastructure.
            <br />
            <em>Delivering Strength.</em>
          </h1>
          <p className="hero-copy">
            {company.companyName} provides reliable construction and infrastructure solutions — roads,
            structures, drainage and canal works — delivered with a focus on quality, safety and efficient
            execution.
          </p>
          <div className="hero-actions">
            <Link href="/work" className="button button-accent">
              View our work <ArrowRight size={17} aria-hidden />
            </Link>
            <Link href="/contact" className="button button-ghost">
              Contact us <ArrowRight size={17} aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust strip ----------------------------------------------------- */}
      <section className="trust-strip" aria-label="Company at a glance">
        <div>
          <CalendarDays size={20} aria-hidden />
          <strong>{FOUNDING_YEAR}</strong>
          <span>Established</span>
        </div>
        <div>
          <HardHat size={20} aria-hidden />
          <strong>{experience}+</strong>
          <span>Years of experience</span>
        </div>
        <div>
          <Building2 size={20} aria-hidden />
          <strong>Infrastructure</strong>
          <span>Construction &amp; infrastructure</span>
        </div>
        <div>
          <ShieldCheck size={20} aria-hidden />
          <strong>Safety first</strong>
          <span>Safety &amp; quality focus</span>
        </div>
      </section>

      {/* About preview --------------------------------------------------- */}
      <section className="about-section section-pad">
        <div className="about-copy">
          <p className="eyebrow">
            <span />
            01 / About the company
          </p>
          <h2>
            Established in 2014,
            <br />
            built on <em>reliability.</em>
          </h2>
          <p>{aboutIntro}</p>
          <div className="values">
            <div>
              <ShieldCheck size={17} aria-hidden />
              <span>
                Quality
                <small>High standards on every project</small>
              </span>
            </div>
            <div>
              <HardHat size={17} aria-hidden />
              <span>
                Safety
                <small>Training, PPE and site inspections</small>
              </span>
            </div>
            <div>
              <Leaf size={17} aria-hidden />
              <span>
                Sustainability
                <small>Environmentally responsible practice</small>
              </span>
            </div>
          </div>
          <Link href="/about" className="text-link">
            Learn more <MoveUpRight size={15} aria-hidden />
          </Link>
        </div>

        <div className="quote-card">
          <span className="quote-mark" aria-hidden>
            &ldquo;
          </span>
          <blockquote>
            {company.vision.split(/\n{2,}/)[0]?.slice(0, 210).trimEnd()}
            {company.vision.length > 210 ? '…' : ''}
          </blockquote>
          <div className="quote-byline">
            <span className="avatar-placeholder" aria-hidden>
              {initials(company.ceo.name)}
            </span>
            <span>
              <strong>{company.ceo.name}</strong>
              <small>{company.ceo.title}</small>
            </span>
          </div>
        </div>
      </section>

      {/* Services -------------------------------------------------------- */}
      <section className="dark-section section-pad">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              <span />
              02 / What we do
            </p>
            <h2>
              Services built for
              <br />
              <em>real site conditions.</em>
            </h2>
          </div>
          <p>
            From pavement quality concrete to drainage and canal works, we cover the full scope of road and
            infrastructure delivery.
          </p>
        </div>

        <div className="services-grid">
          {services.slice(0, 8).map((service, index) => (
            <Link key={service.id} href={`/services/${service.slug}`} className="service-card">
              <div className="service-top">
                <ServiceIcon name={service.icon} />
                <span>{String(index + 1).padStart(2, '0')}</span>
              </div>
              <h3>{service.title}</h3>
              <p>{service.shortDescription}</p>
              <MoveUpRight size={16} className="service-arrow" aria-hidden />
            </Link>
          ))}
        </div>
      </section>

      {/* Featured work --------------------------------------------------- */}
      <section className="work-section section-pad">
        <div className="block-heading">
          <div>
            <p className="eyebrow">
              <span />
              03 / Our work
            </p>
            <h2>
              Latest projects
              <br />
              <em>from the field.</em>
            </h2>
            <p>
              Project records are maintained by our team and published as each stage of work is documented.
            </p>
          </div>
          <Link href="/work" className="text-link">
            View all projects <MoveUpRight size={15} aria-hidden />
          </Link>
        </div>

        {works.data.length > 0 ? (
          <div className="card-grid cols-3">
            {works.data.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        ) : (
          <div className="state-block">
            <Building2 size={30} aria-hidden />
            <h3>No projects published yet</h3>
            <p>
              Project stories appear here as soon as they are published from the admin dashboard.
            </p>
          </div>
        )}
      </section>

      {/* Machines preview ------------------------------------------------ */}
      <section className="section-muted section-pad">
        <div className="block-heading">
          <div>
            <p className="eyebrow">
              <span />
              04 / Machines &amp; equipment
            </p>
            <h2>
              Equipment behind
              <br />
              <em>the work.</em>
            </h2>
            <p>Equipment records are added and kept up to date by our team.</p>
          </div>
          <Link href="/machines" className="text-link">
            View all equipment <MoveUpRight size={15} aria-hidden />
          </Link>
        </div>

        {machines.data.length > 0 ? (
          <div className="card-grid cols-3">
            {machines.data.map((machine) => (
              <MachineCard key={machine.id} machine={machine} />
            ))}
          </div>
        ) : (
          <div className="state-block">
            <Truck size={30} aria-hidden />
            <h3>No equipment published yet</h3>
            <p>Machines and equipment will be listed here once they are added from the admin dashboard.</p>
          </div>
        )}
      </section>

      {/* Team preview ---------------------------------------------------- */}
      <section className="section-white section-pad">
        <div className="block-heading">
          <div>
            <p className="eyebrow">
              <span />
              05 / Our team
            </p>
            <h2>
              The people
              <br />
              <em>behind the build.</em>
            </h2>
          </div>
          <Link href="/team" className="text-link">
            Meet the team <MoveUpRight size={15} aria-hidden />
          </Link>
        </div>

        {team.length > 0 ? (
          <div className="card-grid cols-4">
            {team.map((member) => (
              <TeamCard key={member.id} member={member} />
            ))}
          </div>
        ) : (
          <div className="state-block">
            <Users size={30} aria-hidden />
            <h3>No team profiles published yet</h3>
            <p>Team profiles appear here once they are added and published from the admin dashboard.</p>
          </div>
        )}
      </section>

      <CtaBand />
    </>
  )
}

function initials(name: string) {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || '—'
  )
}
