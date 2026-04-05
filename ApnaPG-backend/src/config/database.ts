import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    throw new Error('❌ MONGO_URI is not defined in environment variables');
}

mongoose.set('bufferCommands', false);

/** 
 * Global is used here to maintain a cached connection across hot reloads
 * in development and across function invocations in serverless environments.
 */
let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
    if (cached.conn) {
        console.log('✅ Reusing cached MongoDB connection...');
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            tls: true,
            tlsAllowInvalidCertificates: false,
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            family: 4,
            maxPoolSize: 1,
        };

        console.log('⏳ Establishing new MongoDB connection (Cached Pattern)...');
        cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
            console.log('🚀 MongoDB Connected successfully!');
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        console.error('❌ MongoDB connection error:', e);
        throw e;
    }

    return cached.conn;
};
