import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose'

export const MACHINE_AVAILABILITY = ['Available', 'In Use', 'Under Maintenance'] as const

const specificationSchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false },
)

const machineSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    category: { type: String, default: '', trim: true, index: true },
    mainImage: { type: String, default: '' },
    galleryImages: { type: [String], default: [] },
    description: { type: String, default: '' },
    // Only admin-entered specs are ever shown — nothing is inferred.
    specifications: { type: [specificationSchema], default: [] },
    capacity: { type: String, default: '', trim: true },
    applications: { type: [String], default: [] },
    availability: { type: String, enum: MACHINE_AVAILABILITY, default: 'Available', index: true },
    featured: { type: Boolean, default: false, index: true },
    published: { type: Boolean, default: false, index: true },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true },
)

export type MachineDoc = InferSchemaType<typeof machineSchema>

export const Machine = (models.Machine as Model<MachineDoc>) || model<MachineDoc>('Machine', machineSchema)
export default Machine
