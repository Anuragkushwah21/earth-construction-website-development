import type { Metadata } from 'next'
import { Users } from 'lucide-react'
import { CtaBand } from '@/components/site/cta-band'
import { TeamCard } from '@/components/site/team-card'
import { getCompanySettings, getPublishedStaff } from '@/lib/data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Our Team',
  description:
    'Meet the leadership and site team behind Earth Construction Company — engineers, supervisors and skilled workers delivering road and infrastructure projects.',
  openGraph: {
    title: 'Our Team | Earth Construction Company',
    description: 'The leadership and site team behind Earth Construction Company.',
  },
}

export default async function TeamPage() {
  const [team, company] = await Promise.all([getPublishedStaff(), getCompanySettings()])

  return (
    <>
      <section className="page-hero">
        <p className="eyebrow light">
          <span className="kicker-line" />
          Our team
        </p>
        <h1>
          The people
          <br />
          <em>behind the build.</em>
        </h1>
        <p>
          {company.companyName} is led by an experienced team and supported by a skilled, trained workforce
          deployed across project sites.
        </p>
      </section>

      <section className="section-pad">
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
            <p>
              Team profiles are added from the admin dashboard and appear here once they are marked active
              and published.
            </p>
          </div>
        )}
      </section>

      <CtaBand
        eyebrow="Join us"
        title="Interested in working with our team?"
        description="Get in touch to discuss project work, labour supply or on-site collaboration."
      />
    </>
  )
}
