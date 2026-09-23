import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

/**
 * Mongoose connections are cached on `globalThis` so that Next.js hot reloads
 * and serverless invocations reuse a single pool instead of opening a new
 * connection on every request.
 */
type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

const globalForMongoose = globalThis as unknown as { _mongoose?: MongooseCache }

const cached: MongooseCache = globalForMongoose._mongoose ?? { conn: null, promise: null }
globalForMongoose._mongoose = cached

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error(
      'MONGODB_URI is not set. Copy .env.example to .env.local and add your MongoDB connection string.',
    )
  }

  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10_000,
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (error) {
    cached.promise = null
    throw error
  }

  return cached.conn
}

/** True when the app has a database configured at all. */
export function isDatabaseConfigured() {
  return Boolean(MONGODB_URI)
}

export default connectToDatabase
