import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose'

export const INQUIRY_STATUSES = ['New', 'Contacted', 'In Progress', 'Resolved', 'Spam'] as const

const inquirySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: '', trim: true },
    subject: { type: String, default: '', trim: true },
    message: { type: String, required: true },
    projectType: { type: String, default: '', trim: true },
    location: { type: String, default: '', trim: true },
    status: { type: String, enum: INQUIRY_STATUSES, default: 'New', index: true },
    read: { type: Boolean, default: false, index: true },
    // Stored for abuse handling only, never exposed on the public site.
    sourceIp: { type: String, default: '' },
  },
  { timestamps: true },
)

export type InquiryDoc = InferSchemaType<typeof inquirySchema>

export const Inquiry = (models.Inquiry as Model<InquiryDoc>) || model<InquiryDoc>('Inquiry', inquirySchema)
export default Inquiry
