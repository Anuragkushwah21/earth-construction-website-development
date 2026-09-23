import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose'

export const WORK_STATUSES = ['Completed', 'Ongoing', 'Upcoming'] as const

const workSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    coverImage: { type: String, default: '' },
    galleryImages: { type: [String], default: [] },
    shortDescription: { type: String, default: '', trim: true },
    description: { type: String, default: '' },
    category: { type: String, default: '', trim: true, index: true },
    location: { type: String, default: '', trim: true, index: true },
    client: { type: String, default: '', trim: true },
    startDate: { type: Date, default: null },
    completionYear: { type: String, default: '', trim: true },
    status: { type: String, enum: WORK_STATUSES, default: 'Completed', index: true },
    services: { type: [String], default: [] },
    featured: { type: Boolean, default: false, index: true },
    published: { type: Boolean, default: false, index: true },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true },
)

workSchema.index({ title: 'text', shortDescription: 'text', description: 'text', location: 'text' })

export type WorkDoc = InferSchemaType<typeof workSchema>

export const Work = (models.Work as Model<WorkDoc>) || model<WorkDoc>('Work', workSchema)
export default Work
