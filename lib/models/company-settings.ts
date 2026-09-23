import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose'

const companySettingsSchema = new Schema(
  {
    // A single settings document is kept, addressed by this fixed key.
    key: { type: String, default: 'default', unique: true, index: true },
    companyName: { type: String, default: '', trim: true },
    tagline: { type: String, default: '', trim: true },
    establishedDate: { type: String, default: '', trim: true },
    address: { type: String, default: '', trim: true },
    phone: { type: [String], default: [] },
    email: { type: String, default: '', trim: true },
    gstin: { type: String, default: '', trim: true },
    logo: { type: String, default: '' },
    favicon: { type: String, default: '' },
    about: { type: String, default: '' },
    vision: { type: String, default: '' },
    mission: { type: String, default: '' },
    safetyCompliance: { type: String, default: '' },
    sustainability: { type: String, default: '' },
    ceo: {
      name: { type: String, default: '', trim: true },
      title: { type: String, default: 'CEO', trim: true },
      bio: { type: String, default: '' },
      image: { type: String, default: '' },
    },
    headOfProjects: {
      name: { type: String, default: '', trim: true },
      title: { type: String, default: 'Head of Projects', trim: true },
      bio: { type: String, default: '' },
      image: { type: String, default: '' },
    },
    socialLinks: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      youtube: { type: String, default: '' },
      twitter: { type: String, default: '' },
    },
    mapEmbedUrl: { type: String, default: '' },
  },
  { timestamps: true },
)

export type CompanySettingsDoc = InferSchemaType<typeof companySettingsSchema>

export const CompanySettings =
  (models.CompanySettings as Model<CompanySettingsDoc>) ||
  model<CompanySettingsDoc>('CompanySettings', companySettingsSchema)
export default CompanySettings
