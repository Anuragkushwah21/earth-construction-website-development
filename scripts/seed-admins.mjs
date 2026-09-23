/**
 * Creates the admin accounts listed in ADMIN_EMAILS, using ADMIN_PASSWORD as
 * the initial password. Accounts that already exist are left untouched — the
 * script never overwrites a password someone has since changed.
 *
 *   node --env-file=.env scripts/seed-admins.mjs
 *
 * ADMIN_EMAILS is a comma-separated list. Each entry is an email address, with
 * an optional display name after a pipe:
 *
 *   ADMIN_EMAILS="a@example.com|Rajesh Baghel,b@example.com|Anurag Kushwah"
 */

import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

const BCRYPT_ROUNDS = 12

function parseEntries(raw) {
  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [email, name] = entry.split('|')
      return { email: email.trim().toLowerCase(), name: name?.trim() || 'Administrator' }
    })
    .filter((entry) => entry.email.includes('@'))
}

async function main() {
  const uri = process.env.MONGODB_URI
  const password = process.env.ADMIN_PASSWORD
  const raw = process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? ''

  if (!uri) throw new Error('MONGODB_URI is not set.')
  if (!password) throw new Error('ADMIN_PASSWORD is not set.')

  const entries = parseEntries(raw)
  if (entries.length === 0) throw new Error('ADMIN_EMAILS is empty — nothing to create.')

  await mongoose.connect(uri)
  const admins = mongoose.connection.db.collection('admins')

  for (const { email, name } of entries) {
    const existing = await admins.findOne({ email })
    if (existing) {
      console.log(`· ${email} — already exists, left unchanged`)
      continue
    }

    const now = new Date()
    await admins.insertOne({
      email,
      name,
      passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
      lastLoginAt: null,
      passwordChangedAt: null,
      resetTokenHash: null,
      resetTokenExpiresAt: null,
      createdAt: now,
      updatedAt: now,
    })
    console.log(`✓ ${email} — created as "${name}"`)
  }

  const total = await admins.countDocuments()
  console.log(`\nAdmin accounts in the database: ${total}`)

  await mongoose.disconnect()
}

main().catch(async (error) => {
  console.error('Failed:', error.message)
  await mongoose.disconnect().catch(() => {})
  process.exit(1)
})
