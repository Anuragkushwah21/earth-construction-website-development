import Link from 'next/link'
import {
  CheckCircle2,
  FolderOpen,
  HardHat,
  Mail,
  MailOpen,
  Plus,
  Truck,
  Users,
} from 'lucide-react'
import { PageHeader } from '@/components/admin/page-header'
import { RecentActivity } from '@/components/admin/recent-activity'
import { SeedPrompt } from '@/components/admin/seed-prompt'
import { StatCard } from '@/components/admin/stat-card'
import { Button } from '@/components/ui/button'
import { requireSession } from '@/lib/auth'
import connectToDatabase, { isDatabaseConfigured } from '@/lib/db'
import InquiryModel from '@/lib/models/inquiry'
import MachineModel from '@/lib/models/machine'
import ServiceModel from '@/lib/models/service'
import StaffModel from '@/lib/models/staff'
import WorkModel from '@/lib/models/work'
import { serializeInquiry, serializeMachine, serializeStaff, serializeWork } from '@/lib/serialize'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const session = await requireSession()

  if (!isDatabaseConfigured()) {
    return (
      <>
        <PageHeader title="Dashboard" description="The database is not configured yet." />
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900">
          <p className="m-0 font-semibold">MONGODB_URI is not set.</p>
          <p className="mt-2 mb-0">
            Copy <code className="font-mono">.env.example</code> to{' '}
            <code className="font-mono">.env.local</code>, add your MongoDB connection string, and restart
            the server.
          </p>
        </div>
      </>
    )
  }

  await connectToDatabase()

  const [
    totalProjects,
    publishedProjects,
    totalMachines,
    activeStaff,
    newInquiries,
    totalInquiries,
    totalServices,
    recentWorks,
    recentMachines,
    recentStaff,
    recentInquiries,
  ] = await Promise.all([
    WorkModel.countDocuments(),
    WorkModel.countDocuments({ published: true }),
    MachineModel.countDocuments(),
    StaffModel.countDocuments({ active: true }),
    InquiryModel.countDocuments({ read: false }),
    InquiryModel.countDocuments(),
    ServiceModel.countDocuments(),
    WorkModel.find().sort({ createdAt: -1 }).limit(3).lean(),
    MachineModel.find().sort({ createdAt: -1 }).limit(2).lean(),
    StaffModel.find().sort({ createdAt: -1 }).limit(2).lean(),
    InquiryModel.find().sort({ createdAt: -1 }).limit(3).lean(),
  ])

  const isEmpty = totalProjects === 0 && totalMachines === 0 && totalServices === 0

  return (
    <>
      <PageHeader
        eyebrow="Control room"
        title={`Welcome back, ${session.name.split(' ')[0]}.`}
        description="Everything the public website shows is managed from here."
        actions={
          <>
            <Button size="lg" render={<Link href="/admin/work/new" />}>
              <Plus /> Add work
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/admin/machines/new" />}>
              <Plus /> Add machine
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/admin/staff/new" />}>
              <Plus /> Add staff
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/admin/inquiries" />}>
              <Mail /> View inquiries
            </Button>
          </>
        }
      />

      {isEmpty ? <SeedPrompt /> : null}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={HardHat} label="Total projects" value={totalProjects} href="/admin/work" />
        <StatCard
          icon={CheckCircle2}
          label="Published projects"
          value={publishedProjects}
          href="/admin/work?published=true"
        />
        <StatCard icon={Truck} label="Total machines" value={totalMachines} href="/admin/machines" />
        <StatCard icon={Users} label="Active staff" value={activeStaff} href="/admin/staff" />
        <StatCard
          icon={Mail}
          label="New inquiries"
          value={newInquiries}
          href="/admin/inquiries?read=false"
          highlight={newInquiries > 0}
        />
        <StatCard
          icon={MailOpen}
          label="Total inquiries"
          value={totalInquiries}
          href="/admin/inquiries"
        />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <RecentActivity
          works={recentWorks.map(serializeWork)}
          machines={recentMachines.map(serializeMachine)}
          staff={recentStaff.map(serializeStaff)}
          inquiries={recentInquiries.map(serializeInquiry)}
        />

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold">What to do next</h2>
          <ol className="mt-4 flex flex-col gap-3 text-sm">
            <NextStep
              done={totalProjects > 0}
              href="/admin/work/new"
              title="Add your project stories"
              description="Each project becomes a page on the public website, like a blog post."
            />
            <NextStep
              done={totalMachines > 0}
              href="/admin/machines/new"
              title="List your machines"
              description="Add only the equipment and specifications you want shown publicly."
            />
            <NextStep
              done={activeStaff > 0}
              href="/admin/staff/new"
              title="Add your team"
              description="Upload real photos — nothing is published until you mark it published."
            />
            <NextStep
              done={totalServices > 0}
              href="/admin/company"
              title="Review company details"
              description="Address, phone, vision, mission and leadership all read from here."
            />
          </ol>
        </section>
      </div>
    </>
  )
}

function NextStep({
  done,
  href,
  title,
  description,
}: {
  done: boolean
  href: string
  title: string
  description: string
}) {
  return (
    <li className="flex gap-3">
      <span
        className={
          done
            ? 'mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-600'
            : 'mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-border text-muted-foreground'
        }
      >
        {done ? <CheckCircle2 className="size-3.5" /> : <FolderOpen className="size-3" />}
      </span>
      <span className="min-w-0">
        <Link href={href} className="font-medium underline-offset-4 hover:underline">
          {title}
        </Link>
        <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>
      </span>
    </li>
  )
}
