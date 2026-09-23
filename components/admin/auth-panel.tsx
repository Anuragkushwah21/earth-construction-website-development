import Image from 'next/image'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { COMPANY_LOGO } from '@/lib/brand'

/** Shared frame for the signed-out admin screens: sign in, forgot, reset. */
export function AuthPanel({
  eyebrow = 'Secure admin area',
  title,
  description,
  children,
  footer,
}: {
  eyebrow?: string
  title: React.ReactNode
  description: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 p-5">
      <div className="w-full max-w-md rounded-2xl bg-[#f1f0ed] p-8 sm:p-10">
        <Link href="/" className="mb-10 flex items-center gap-2.5 text-neutral-900 no-underline">
          <Image
            src={COMPANY_LOGO}
            alt=""
            width={72}
            height={72}
            priority
            className="size-9 shrink-0 rounded-full bg-white object-cover"
          />
          <span className="leading-none">
            <span className="block text-[13px] font-bold tracking-[0.18em]">EARTH</span>
            <span className="mt-1 block text-[7px] font-bold tracking-[0.16em]">
              CONSTRUCTION COMPANY
            </span>
          </span>
        </Link>

        <p className="flex items-center gap-2 text-[10px] font-medium tracking-[0.1em] text-amber-700 uppercase">
          <ShieldCheck className="size-3.5" /> {eyebrow}
        </p>

        <h1 className="mt-4 text-4xl leading-[0.95] font-bold tracking-tighter text-neutral-900">
          {title}
        </h1>

        <p className="mt-4 text-sm leading-relaxed text-neutral-600">{description}</p>

        {children}

        {footer ? <div className="mt-6 text-sm text-neutral-600">{footer}</div> : null}
      </div>
    </main>
  )
}
