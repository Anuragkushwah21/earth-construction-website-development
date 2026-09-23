import Image from 'next/image'
import { Mail, Phone } from 'lucide-react'
import type { Staff } from '@/lib/types'

export function TeamCard({ member }: { member: Staff }) {
  const initials = member.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  return (
    <article className="team-card">
      <div className="team-photo">
        {member.profileImage ? (
          <Image
            src={member.profileImage}
            alt={member.name}
            fill
            sizes="(max-width: 680px) 100vw, 320px"
          />
        ) : (
          // No stock portraits: a neutral monogram stands in until the admin
          // uploads a real photo.
          <span className="team-photo-fallback" aria-hidden>
            {initials || '—'}
          </span>
        )}
      </div>

      <div className="team-body">
        <h3>{member.name}</h3>
        {member.designation ? <p className="team-role">{member.designation}</p> : null}
        {member.department || member.experience ? (
          <div className="entity-meta">
            {member.department ? <span>{member.department}</span> : null}
            {member.experience ? <span>{member.experience}</span> : null}
          </div>
        ) : null}
        {member.bio ? <p>{member.bio}</p> : null}

        {member.skills.length > 0 ? (
          <div className="team-skills">
            {member.skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        ) : null}

        {member.showContact && (member.contactEmail || member.contactPhone) ? (
          <div className="team-contact">
            {member.contactPhone ? (
              <a href={`tel:${member.contactPhone.replace(/\s/g, '')}`}>
                <Phone size={13} aria-hidden /> {member.contactPhone}
              </a>
            ) : null}
            {member.contactEmail ? (
              <a href={`mailto:${member.contactEmail}`}>
                <Mail size={13} aria-hidden /> {member.contactEmail}
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  )
}
