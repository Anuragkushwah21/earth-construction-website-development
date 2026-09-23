import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose'

const staffSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    designation: { type: String, default: '', trim: true },
    department: { type: String, default: '', trim: true },
    profileImage: { type: String, default: '' },
    bio: { type: String, default: '' },
    experience: { type: String, default: '', trim: true },
    skills: { type: [String], default: [] },
    // Private by default: only surfaced publicly when showContact is enabled.
    contactEmail: { type: String, default: '', trim: true, lowercase: true },
    contactPhone: { type: String, default: '', trim: true },
    showContact: { type: Boolean, default: false },
    published: { type: Boolean, default: false, index: true },
    active: { type: Boolean, default: true, index: true },
    displayOrder: { type: Number, default: 0, index: true },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true },
)

export type StaffDoc = InferSchemaType<typeof staffSchema>

export const Staff = (models.Staff as Model<StaffDoc>) || model<StaffDoc>('Staff', staffSchema)
export default Staff
