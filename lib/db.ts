import mongoose, { Mongoose } from 'mongoose';

// Get MongoDB URI from environment variables
// Prioritize MONGODB_URI, but also check DATABASE_URL if it's a MongoDB connection string
let MONGODB_URI = process.env.MONGODB_URI;

// If MONGODB_URI is not set, check DATABASE_URL but only use it if it's a MongoDB connection string
if (!MONGODB_URI && process.env.DATABASE_URL) {
  const dbUrl = process.env.DATABASE_URL;
  // Check if it's a MongoDB connection string
  if (dbUrl.startsWith('mongodb://') || dbUrl.startsWith('mongodb+srv://')) {
    MONGODB_URI = dbUrl;
  }
}

// Fallback to local MongoDB if nothing is set
if (!MONGODB_URI) {
  MONGODB_URI = 'mongodb://localhost:27017/fitura';
  console.warn('⚠️  No MONGODB_URI found. Using default local MongoDB: mongodb://localhost:27017/fitura');
}

// Validate that the connection string is a valid MongoDB URI
if (!MONGODB_URI || (!MONGODB_URI.startsWith('mongodb://') && !MONGODB_URI.startsWith('mongodb+srv://'))) {
  throw new Error(
    `Invalid MongoDB connection string. Expected URI to start with "mongodb://" or "mongodb+srv://", but got: ${MONGODB_URI?.substring(0, 50) || 'undefined'}...\n` +
    `Please set MONGODB_URI in your .env.local file with a valid MongoDB connection string.\n` +
    `Example: mongodb://localhost:27017/fitura or mongodb+srv://username:password@cluster.mongodb.net/fitura`
  );
}

// At this point, MONGODB_URI is guaranteed to be a string
const MONGODB_URI_FINAL: string = MONGODB_URI;

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Use global cache to prevent multiple connections in development
declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB(): Promise<Mongoose> {
  if (cached.conn) {
    console.log('✓ Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    // Log connection attempt (mask password in URI)
    const maskedUri = MONGODB_URI_FINAL.replace(/(mongodb:\/\/[^:]+:)([^@]+)(@)/, '$1****$3');
    console.log('Connecting to MongoDB...');
    console.log(`Connection URI: ${maskedUri}`);
    
    cached.promise = mongoose.connect(MONGODB_URI_FINAL, opts).then((mongooseInstance: Mongoose) => {
      console.log('✓ MongoDB connected successfully');
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;

// Initialize database with default data
export async function initDatabase() {
  try {
    await connectDB();
    
    // Import models to ensure they're registered
    await import('./models/Membership');
    await import('./models/Client');
    await import('./models/Attendance');
    
    // Create default memberships if they don't exist
    const Membership = (await import('./models/Membership')).default;
    const membershipCount = await Membership.countDocuments();
    
    if (membershipCount === 0) {
      await Membership.insertMany([
        { membershipId: 1, name: 'Monthly', description: 'Monthly membership', durationDays: 30, price: 0, isActive: true },
        { membershipId: 2, name: 'Quarterly', description: 'Quarterly membership (3 months)', durationDays: 90, price: 0, isActive: true },
        { membershipId: 3, name: 'Yearly', description: 'Yearly membership', durationDays: 365, price: 0, isActive: true },
        { membershipId: 4, name: 'Day Pass', description: 'Single day pass', durationDays: 1, price: 0, isActive: true },
        { membershipId: 5, name: 'Trial', description: 'Trial membership (7 days)', durationDays: 7, price: 0, isActive: true },
      ]);
      console.log('✓ Default memberships created');
    }
    
    console.log('✓ Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}
