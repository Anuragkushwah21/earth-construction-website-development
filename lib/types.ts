/**
 * Plain, JSON-serialisable shapes passed from server components and API routes
 * into client components. Mongoose documents never cross that boundary.
 */

export const WORK_STATUSES = ['Completed', 'Ongoing', 'Upcoming'] as const
export type WorkStatus = (typeof WORK_STATUSES)[number]

export const MACHINE_AVAILABILITY = ['Available', 'In Use', 'Under Maintenance'] as const
export type MachineAvailability = (typeof MACHINE_AVAILABILITY)[number]

export const INQUIRY_STATUSES = ['New', 'Contacted', 'In Progress', 'Resolved', 'Spam'] as const
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number]

export type Work = {
  id: string
  title: string
  slug: string
  coverImage: string
  galleryImages: string[]
  shortDescription: string
  description: string
  category: string
  location: string
  client: string
  startDate: string | null
  completionYear: string
  status: WorkStatus
  services: string[]
  featured: boolean
  published: boolean
  isDemo: boolean
  createdAt: string
  updatedAt: string
}

export type MachineSpecification = { label: string; value: string }

export type Machine = {
  id: string
  name: string
  slug: string
  category: string
  mainImage: string
  galleryImages: string[]
  description: string
  specifications: MachineSpecification[]
  capacity: string
  applications: string[]
  availability: MachineAvailability
  featured: boolean
  published: boolean
  isDemo: boolean
  createdAt: string
  updatedAt: string
}

export type Staff = {
  id: string
  name: string
  designation: string
  department: string
  profileImage: string
  bio: string
  experience: string
  skills: string[]
  contactEmail: string
  contactPhone: string
  showContact: boolean
  published: boolean
  active: boolean
  displayOrder: number
  isDemo: boolean
  createdAt: string
  updatedAt: string
}

export type Inquiry = {
  id: string
  name: string
  email: string
  phone: string
  subject: string
  message: string
  projectType: string
  location: string
  status: InquiryStatus
  read: boolean
  createdAt: string
  updatedAt: string
}

export type Service = {
  id: string
  title: string
  slug: string
  image: string
  icon: string
  shortDescription: string
  description: string
  benefits: string[]
  featured: boolean
  published: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export type LeaderProfile = {
  name: string
  title: string
  bio: string
  image: string
}

export type CompanySettings = {
  companyName: string
  tagline: string
  establishedDate: string
  address: string
  phone: string[]
  email: string
  gstin: string
  logo: string
  favicon: string
  about: string
  vision: string
  mission: string
  safetyCompliance: string
  sustainability: string
  ceo: LeaderProfile
  headOfProjects: LeaderProfile
  socialLinks: {
    facebook: string
    instagram: string
    linkedin: string
    youtube: string
    twitter: string
  }
  mapEmbedUrl: string
}

export type AdminSession = {
  id: string
  email: string
  name: string
}

export type DashboardStats = {
  totalProjects: number
  publishedProjects: number
  totalMachines: number
  publishedMachines: number
  activeStaff: number
  newInquiries: number
  totalInquiries: number
  totalServices: number
}

export type Paginated<T> = {
  data: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}
