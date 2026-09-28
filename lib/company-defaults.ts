import type { CompanySettings } from '@/lib/types'

/**
 * Fallback content taken from the supplied Earth Construction Company profile
 * document. These values seed the database and keep the public site readable
 * before the admin has saved anything. Nothing here is invented — every fact
 * comes from the company profile.
 */
export const COMPANY_DEFAULTS: CompanySettings = {
  companyName: 'Earth Construction Company',
  tagline: 'Building Infrastructure. Delivering Strength.',
  establishedDate: '20 April 2014',
  address: 'Shivnagar, Shamshan Road, Gadaipura, Gwalior, M.P. – 474004',
  phone: ['6264147250', '7999270766'],
  email: 'rajesh8001baghel@gmail.com',
  gstin: '23CRNPB4733K1ZR',
  logo: '',
  favicon: '',
  about: `Earth Construction Company was established on 20 April 2014 and works across the construction and infrastructure sector from its base in Gwalior, Madhya Pradesh. The company delivers roads, structural works, drainage systems, canals and pavement quality concrete using modern construction techniques and high-quality materials.

Since 2014 the company has built its reputation on reliability, safety and environmental responsibility. Work is planned and executed with a focus on structural integrity, regulatory compliance and the long-term value of every project it takes on.

Site work is managed by an experienced team, with regular updates and quality inspections carried out through each phase of construction.`,
  vision: `At Earth Construction Company, we strive to become a global leader in the construction industry by setting new benchmarks in quality, innovation, and sustainability. We are dedicated to creating world-class infrastructure that transforms lives, drives economic growth, and protects the environment. Our mission is to inspire trust and confidence by consistently exceeding expectations, delivering enduring projects, and fostering a culture of excellence, integrity, and collaboration. By embracing eco-friendly practices and prioritizing resilience, we aim to contribute to the development of thriving communities and build a brighter, more sustainable future for generations to come.`,
  mission: `In the coming years, Earth Construction Company will continue to lead the construction industry by embracing innovation, sustainability, and excellence in all our projects. Our mission is to build infrastructure that not only meets the highest standards of quality but also supports the growth and well-being of the communities we serve. We will leverage emerging technologies, foster collaboration, and adopt sustainable practices to ensure the timely and efficient completion of every project. By maintaining our commitment to integrity, safety, and customer satisfaction, we aim to shape a future where our contributions leave a lasting positive impact on the world, creating resilient and thriving environments for generations to come.`,
  safetyCompliance: `Since 2014, Earth Construction has been dedicated to upholding the highest standards of safety and regulatory compliance across all projects. The company places a strong emphasis on creating a safe working environment for its team while adhering to industry standards and legal requirements.

Safety protocols are meticulously designed to prevent accidents and ensure the well-being of workers and stakeholders. This includes regular safety training, use of personal protective equipment (PPE), and adherence to established safety guidelines. The company implements rigorous site inspections to identify and mitigate potential hazards.

Compliance is a cornerstone of Earth Construction's operations. The company ensures all projects meet local and national regulations, including environmental and labour laws. By using environmentally responsible practices, Earth Construction minimises its ecological footprint while delivering high-quality outcomes.`,
  sustainability: `Earth Construction is committed to integrating sustainability into every aspect of its operations, ensuring that its projects contribute to a healthier environment and a more sustainable future. Since 2014, the company has prioritised environmentally responsible practices that minimise the ecological footprint while maintaining the highest standards of quality and efficiency.

Key sustainability initiatives include the use of eco-friendly materials and advanced techniques to reduce waste during construction. Earth Construction employs soil stabilisation and erosion control measures to protect natural landscapes and prevent degradation. The company also promotes energy-efficient operations by using modern equipment designed to lower emissions and conserve resources.

Water conservation practices and effective drainage systems are implemented to maintain the natural water cycle and prevent contamination. Earth Construction is also dedicated to recycling materials wherever possible, further reducing its environmental impact.`,
  ceo: {
    name: 'Rajesh Baghel',
    title: 'CEO',
    bio: `Rajesh Baghel is the CEO of Earth Construction. With a Bachelor of Engineering (B.E.) degree, he brings a strong technical foundation and an innovative approach to the industry. Since founding Earth Construction in 2014, Rajesh has been at the forefront of delivering sustainable and high-quality construction solutions.

With a deep understanding of engineering principles and project management, Rajesh has led the company to achieve remarkable milestones. Under his leadership, Earth Construction has become synonymous with reliability, safety, and environmental responsibility. His emphasis on adopting advanced technologies and adhering to strict safety and compliance standards has set the company apart.`,
    image: '',
  },
  headOfProjects: {
    name: 'Pushpendra Baghel',
    title: 'Head of Projects',
    bio: `Pushpendra Baghel serves as the Head of Projects at Earth Construction. Holding a Bachelor of Engineering (B.E.) degree, Pushpendra combines his technical expertise with strategic vision to oversee and execute large-scale projects with precision and efficiency.

With years of experience in the construction industry, Pushpendra excels in project planning, resource management, and ensuring timely delivery of quality outcomes. His leadership ensures that all projects adhere to strict safety standards, regulatory compliance, and sustainable practices.`,
    image: '',
  },
  socialLinks: { facebook: '', instagram: '', linkedin: '', youtube: '', twitter: '' },
  mapEmbedUrl: '',
}

/** Founding year, used to calculate years of experience at render time. */
export const FOUNDING_YEAR = 2014

export function yearsOfExperience(now = new Date()) {
  return Math.max(0, now.getFullYear() - FOUNDING_YEAR)
}

/**
 * The eight services documented in the company profile. Seeded into the
 * database so the admin can edit the copy, add images and reorder them.
 */
export const DEFAULT_SERVICES = [
  {
    title: 'Road Construction',
    slug: 'road-construction',
    icon: 'Route',
    shortDescription:
      'Durable roads, highways and pavements built with advanced techniques and high-quality materials.',
    description:
      'We specialise in the construction of durable roads, highways, and pavements using advanced techniques and high-quality materials. Our projects are designed to meet both traffic needs and environmental sustainability.',
    benefits: [
      'Advanced construction techniques',
      'High-quality material selection',
      'Designed for real traffic loads',
      'Built with environmental sustainability in mind',
    ],
    displayOrder: 1,
    featured: true,
  },
  {
    title: 'Structural Engineering',
    slug: 'structural-engineering',
    icon: 'Building2',
    shortDescription:
      'Design and construction of residential, commercial and industrial buildings with safety at the core.',
    description:
      'Earth Construction Company provides robust and innovative structural engineering solutions, including the design and construction of residential, commercial, and industrial buildings. Our expertise ensures safety, functionality, and aesthetic value.',
    benefits: [
      'Residential, commercial and industrial scope',
      'Robust and innovative structural solutions',
      'Safety and functionality first',
      'Attention to aesthetic value',
    ],
    displayOrder: 2,
    featured: true,
  },
  {
    title: 'Drainage Systems',
    slug: 'drainage-systems',
    icon: 'Droplets',
    shortDescription:
      'Comprehensive drainage design and installation that manages water flow and prevents flooding.',
    description:
      'We design and implement comprehensive drainage systems to manage water flow efficiently, preventing flooding and erosion while ensuring sustainable urban and rural infrastructure.',
    benefits: [
      'Efficient water flow management',
      'Flood and erosion prevention',
      'Suited to urban and rural infrastructure',
      'Supports long-term road durability',
    ],
    displayOrder: 3,
    featured: true,
  },
  {
    title: 'Canal Construction',
    slug: 'canal-construction',
    icon: 'Waves',
    shortDescription:
      'Irrigation and water transport systems that improve agricultural efficiency and water management.',
    description:
      'Our canal construction services focus on creating irrigation and water transport systems, contributing to agricultural efficiency and improving water management in local communities.',
    benefits: [
      'Irrigation and water transport systems',
      'Improved agricultural efficiency',
      'Better water management for communities',
      'Lining and dressing work',
    ],
    displayOrder: 4,
    featured: true,
  },
  {
    title: 'Groove Cutting',
    slug: 'groove-cutting',
    icon: 'Scissors',
    shortDescription:
      'Transverse and longitudinal groove cutting that improves traction and surface water drainage.',
    description:
      'We offer groove cutting services to improve road safety by enhancing traction and water drainage, minimising risks associated with slippery surfaces.',
    benefits: [
      'Improved road safety',
      'Enhanced tyre traction',
      'Better surface water drainage',
      'Transverse and longitudinal cutting',
    ],
    displayOrder: 5,
    featured: true,
  },
  {
    title: 'PQC / CC Roads',
    slug: 'pqc-cc-roads',
    icon: 'Layers',
    shortDescription:
      'Pavement Quality Concrete roads engineered for heavy traffic, long life and minimal maintenance.',
    description:
      'We construct Pavement Quality Concrete (PQC) roads, designed for heavy traffic, long-term durability, and minimal maintenance. These roads are engineered for high performance under challenging conditions.',
    benefits: [
      'Engineered for heavy traffic',
      'Long-term durability',
      'Minimal maintenance requirement',
      'Paver-laid and manual PQC capability',
    ],
    displayOrder: 6,
    featured: true,
  },
  {
    title: 'Labour Supply',
    slug: 'labour-supply',
    icon: 'Users',
    shortDescription:
      'A skilled, trained workforce made available to support a wide range of construction projects.',
    description:
      'Earth Construction Company provides a skilled and dedicated workforce to support a wide range of construction projects. We ensure that our team is trained and ready to meet specific project requirements.',
    benefits: [
      'Skilled and dedicated workforce',
      'Trained for specific project requirements',
      'Supports a wide range of project types',
      'Deployed with supervision and compliance',
    ],
    displayOrder: 7,
    featured: true,
  },
  {
    title: 'Project Management',
    slug: 'project-management',
    icon: 'ClipboardList',
    shortDescription:
      'End-to-end oversight from planning through completion, on schedule and within budget.',
    description:
      'We offer expert project management services, overseeing every phase of the construction process from planning to completion, ensuring timely delivery and adherence to budget constraints.',
    benefits: [
      'Oversight from planning to completion',
      'Timely delivery focus',
      'Adherence to budget constraints',
      'Regular updates and quality inspections',
    ],
    displayOrder: 8,
    featured: true,
  },
] as const
