/**
 * Starter content for a fresh database.
 *
 * Project records come from the supplied Earth Construction Company profile —
 * locations, clients and completion years are reproduced as documented.
 * Anything not in that document is flagged `isDemo` and left unpublished, so
 * the site never claims something the company has not confirmed.
 */

export const SEED_WORKS = [
  {
    title: '5 KM PQC Road — Mehgaon Mau Road',
    slug: 'pqc-road-mehgaon-mau',
    coverImage: '/media/pqc-roadwork.png',
    galleryImages: ['/media/pqc-roadwork.png', '/media/heavy-machinery.png'],
    shortDescription:
      'Construction of a 5-kilometre Pavement Quality Concrete road built to carry heavy traffic with a durable, long-lasting surface.',
    description: `The project involves the construction of a 5-kilometre Pavement Quality Concrete (PQC) road, designed to provide a durable, smooth, and long-lasting surface capable of withstanding heavy traffic. The road was built using high-quality materials and modern construction techniques to ensure strength, safety, and minimal maintenance.

This infrastructure project aims to improve connectivity, reduce travel time, and enhance the overall transportation experience for commuters. The road also features effective drainage systems to prevent water accumulation and ensure the road's longevity under various weather conditions.

The project was completed with a focus on sustainability, environmental impact, and adherence to safety standards.`,
    category: 'PQC / CC Roads',
    location: 'Mehgaon Mau Road Before Mau 05km, Mau, Distt. Bhind, M.P.',
    client: 'RCL Porsa Highways Private Limited',
    completionYear: '2020–2021',
    status: 'Completed' as const,
    services: ['PQC / CC Roads', 'Road Construction', 'Drainage Systems'],
    featured: true,
    published: true,
    isDemo: false,
  },
  {
    title: 'Manual PQC Laying & Groove Cutting — Surat–Dahisar',
    slug: 'manual-pqc-surat-dahisar',
    coverImage: '/media/heavy-machinery.png',
    galleryImages: ['/media/heavy-machinery.png', '/media/pqc-roadwork.png'],
    shortDescription:
      'Manual PQC laying with transverse and longitudinal groove cutting, kerb-stone laying and labour supply on the Surat–Dahisar worksite.',
    description: `Work order for PQC laying and cutting at the Surat–Dahisar (SDH) worksite, covering manual PQC with shuttering and accessories, labour supply for PQC laying, transverse and longitudinal initial groove cutting, and kerb-stone laying as per applicable standards and specifications.

Since 2024, the Earth Construction division has been delivering reliable and efficient construction solutions, consistently meeting diverse project requirements with precision and quality. The construction process emphasises structural integrity and environmental sustainability while adhering to project timelines and quality standards.

Safety protocols remain a top priority to ensure the well-being of workers and environmental preservation. The work is managed by a skilled team with extensive experience, ensuring compliance with regulatory and engineering standards, accompanied by regular updates and quality inspections.`,
    category: 'PQC / CC Roads',
    location: 'Aradhya Highpark, Dahisar Check Naka, Thane, Maharashtra',
    client: 'Nirmal Buildinfra Private Limited',
    completionYear: '2024 – ongoing',
    status: 'Ongoing' as const,
    services: ['PQC / CC Roads', 'Groove Cutting', 'Labour Supply'],
    featured: true,
    published: true,
    isDemo: false,
  },
  {
    title: 'Groove Cutting & Joint Filling — Kailaras to Jora Road',
    slug: 'groove-cutting-kailaras-jora',
    coverImage: '/media/drainage-work.png',
    galleryImages: ['/media/drainage-work.png'],
    shortDescription:
      'Groove cutting and joint filling work on the Kailaras to Jora road stretch, carried out for RCL Porsa Highway Private Ltd.',
    description: `Groove cutting and joint filling work carried out on the "Kailaras to Jora" road, delivered for RCL Porsa Highway Private Ltd.

The role involved collaborating on key highway construction work with a focus on precision, efficiency, and adherence to regulatory and safety standards, alongside hands-on use of advanced techniques and sustainable construction practices.`,
    category: 'Groove Cutting',
    location: 'Kailaras to Jora Road, Madhya Pradesh',
    client: 'RCL Porsa Highway Private Ltd.',
    completionYear: '2022–2023',
    status: 'Completed' as const,
    services: ['Groove Cutting', 'Road Construction'],
    featured: false,
    published: true,
    isDemo: false,
  },
  {
    title: 'PQC Laying & Groove Cutting — Samruddhi Expressway',
    slug: 'pqc-samruddhi-expressway-nagpur',
    coverImage: '/media/pqc-roadwork.png',
    galleryImages: [],
    shortDescription:
      'PQC laying by paver machine along with DLC groove cutting and joint filling on the Samruddhi Expressway.',
    description: `PQC laying using a paver machine, together with DLC groove cutting and joint filling, carried out on the Samruddhi Expressway at Nagpur for NCC Limited.`,
    category: 'PQC / CC Roads',
    location: 'Samruddhi Expressway, Nagpur, Maharashtra',
    client: 'NCC Limited',
    completionYear: '2018–2022',
    status: 'Completed' as const,
    services: ['PQC / CC Roads', 'Groove Cutting'],
    featured: false,
    published: true,
    isDemo: false,
  },
  {
    title: 'Canal Work — Gwalior',
    slug: 'canal-work-gwalior',
    coverImage: '/media/drainage-work.png',
    galleryImages: [],
    shortDescription:
      'Canal construction work carried out in Gwalior, Madhya Pradesh for HR Construction.',
    description: `Canal construction work delivered in Gwalior, Madhya Pradesh for HR Construction, covering irrigation and water transport structures.`,
    category: 'Canal Construction',
    location: 'Gwalior, Madhya Pradesh',
    client: 'HR Construction',
    completionYear: '2014–2017',
    status: 'Completed' as const,
    services: ['Canal Construction'],
    featured: false,
    published: true,
    isDemo: false,
  },
  {
    title: 'PQC Paver Machine Work — Sagar',
    slug: 'pqc-paver-sagar',
    coverImage: '',
    galleryImages: [],
    shortDescription: 'PQC laying by paver machine at Sagar, Madhya Pradesh for Kundu Construction Company.',
    description: `PQC laying using a paver machine at Sagar, Madhya Pradesh, delivered for Kundu Construction Company.`,
    category: 'PQC / CC Roads',
    location: 'Sagar, Madhya Pradesh',
    client: 'Kundu Construction Company',
    completionYear: '2017–2019',
    status: 'Completed' as const,
    services: ['PQC / CC Roads'],
    featured: false,
    published: true,
    isDemo: false,
  },
  {
    title: 'PQC Paver & DLC Groove Cutting — Jashpur',
    slug: 'pqc-dlc-jashpur',
    coverImage: '',
    galleryImages: [],
    shortDescription:
      'PQC paver work with DLC groove cutting and joint filling at Jashpur, Chhattisgarh.',
    description: `PQC paver work along with DLC groove cutting and joint filling at Jashpur, Chhattisgarh, delivered for Shivalaya Construction Company.`,
    category: 'PQC / CC Roads',
    location: 'Jashpur, Chhattisgarh',
    client: 'Shivalaya Construction Company',
    completionYear: '2018',
    status: 'Completed' as const,
    services: ['PQC / CC Roads', 'Groove Cutting'],
    featured: false,
    published: true,
    isDemo: false,
  },
  {
    title: 'PQC Paver Machine Work — Rajgarh Byavara',
    slug: 'pqc-paver-rajgarh-byavara',
    coverImage: '',
    galleryImages: [],
    shortDescription: 'PQC laying by paver machine at Rajgarh Byavara, Madhya Pradesh.',
    description: `PQC laying using a paver machine at Rajgarh Byavara, Madhya Pradesh, delivered for Shivaliya Construction Company.`,
    category: 'PQC / CC Roads',
    location: 'Rajgarh Byavara, Madhya Pradesh',
    client: 'Shivaliya Construction Company',
    completionYear: '2016–2017',
    status: 'Completed' as const,
    services: ['PQC / CC Roads'],
    featured: false,
    published: true,
    isDemo: false,
  },
  {
    title: 'Groove Cutting & Joint Filling — Morena',
    slug: 'groove-cutting-morena',
    coverImage: '',
    galleryImages: [],
    shortDescription: 'Groove cutting and joint filling work at Morena, Madhya Pradesh.',
    description: `Groove cutting and joint filling work carried out at Morena, Madhya Pradesh for BP Modi.`,
    category: 'Groove Cutting',
    location: 'Morena, Madhya Pradesh',
    client: 'BP Modi Pvt. Ltd.',
    completionYear: '2017',
    status: 'Completed' as const,
    services: ['Groove Cutting'],
    featured: false,
    published: true,
    isDemo: false,
  },
  {
    title: 'PQC Paver & Groove Cutting — Pune',
    slug: 'pqc-groove-cutting-pune',
    coverImage: '',
    galleryImages: [],
    shortDescription: 'PQC paver work with groove cutting and joint filling at Pune, Maharashtra.',
    description: `PQC paver work along with groove cutting and joint filling at Pune, Maharashtra, delivered for Dilip Buildcon Limited.`,
    category: 'PQC / CC Roads',
    location: 'Pune, Maharashtra',
    client: 'Dilip Buildcon Limited',
    completionYear: '2023',
    status: 'Completed' as const,
    services: ['PQC / CC Roads', 'Groove Cutting'],
    featured: false,
    published: true,
    isDemo: false,
  },
]

/**
 * Demo machines only. They are created unpublished and marked as demo, because
 * the company profile does not document which equipment the company owns. The
 * admin should edit these with real details (or delete them) before
 * publishing.
 */
export const SEED_MACHINES = [
  {
    name: 'PQC Paver Machine',
    slug: 'pqc-paver-machine',
    category: 'Road Construction Equipment',
    mainImage: '/media/heavy-machinery.png',
    galleryImages: [],
    description:
      'DEMO RECORD — replace with the machine details you want shown publicly. Paver used for laying Pavement Quality Concrete on road and highway projects.',
    specifications: [],
    capacity: '',
    applications: ['PQC / CC road laying'],
    availability: 'Available' as const,
    featured: true,
    published: false,
    isDemo: true,
  },
  {
    name: 'Groove Cutting Machine',
    slug: 'groove-cutting-machine',
    category: 'Road Construction Equipment',
    mainImage: '',
    galleryImages: [],
    description:
      'DEMO RECORD — replace with the machine details you want shown publicly. Used for transverse and longitudinal groove cutting on concrete road surfaces.',
    specifications: [],
    capacity: '',
    applications: ['Transverse groove cutting', 'Longitudinal groove cutting'],
    availability: 'Available' as const,
    featured: true,
    published: false,
    isDemo: true,
  },
]

/** Leadership as documented in the company profile. */
export const SEED_STAFF = [
  {
    name: 'Rajesh Baghel',
    designation: 'Chief Executive Officer',
    department: 'Leadership',
    profileImage: '',
    bio: 'Founder and CEO of Earth Construction. Holds a Bachelor of Engineering (B.E.) degree and has led the company since 2014, with an emphasis on advanced techniques, safety and compliance.',
    experience: 'Since 2014',
    skills: ['Engineering', 'Project Management', 'Safety & Compliance'],
    contactEmail: '',
    contactPhone: '',
    showContact: false,
    published: true,
    active: true,
    displayOrder: 1,
    isDemo: false,
  },
  {
    name: 'Pushpendra Baghel',
    designation: 'Head of Projects',
    department: 'Projects',
    profileImage: '',
    bio: 'Head of Projects at Earth Construction. Holds a Bachelor of Engineering (B.E.) degree and oversees project planning, resource management and the timely delivery of quality outcomes.',
    experience: 'Construction industry',
    skills: ['Project Planning', 'Resource Management', 'Quality Control'],
    contactEmail: '',
    contactPhone: '',
    showContact: false,
    published: true,
    active: true,
    displayOrder: 2,
    isDemo: false,
  },
]
