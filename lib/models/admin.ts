import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose'

const adminSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    name: { type: String, default: 'Administrator', trim: true },
    passwordHash: { type: String, required: true },
    lastLoginAt: { type: Date, default: null },
    // Sessions issued before this moment are rejected, so changing a password
    // signs the account out everywhere else.
    passwordChangedAt: { type: Date, default: null },
    // Only the SHA-256 of the reset token is stored: a leaked database row
    // cannot be replayed as a reset link.
    resetTokenHash: { type: String, default: null, index: true },
    resetTokenExpiresAt: { type: Date, default: null },
  },
  { timestamps: true },
)

export type AdminDoc = InferSchemaType<typeof adminSchema>

export const Admin = (models.Admin as Model<AdminDoc>) || model<AdminDoc>('Admin', adminSchema)
export default Admin
