import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose'

const serviceSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    image: { type: String, default: '' },
    icon: { type: String, default: 'Ruler', trim: true },
    shortDescription: { type: String, default: '', trim: true },
    description: { type: String, default: '' },
    benefits: { type: [String], default: [] },
    featured: { type: Boolean, default: false, index: true },
    published: { type: Boolean, default: true, index: true },
    displayOrder: { type: Number, default: 0, index: true },
  },
  { timestamps: true },
)

export type ServiceDoc = InferSchemaType<typeof serviceSchema>

export const Service = (models.Service as Model<ServiceDoc>) || model<ServiceDoc>('Service', serviceSchema)
export default Service
