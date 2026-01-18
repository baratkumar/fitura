import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';

export async function GET() {
  console.log('🔍 Testing MongoDB Connection...');
  
  try {
    const startTime = Date.now();
    
    // Connect to MongoDB
    await connectDB();
    const connectTime = Date.now() - startTime;
    
    // Get connection info
    const connection = mongoose.connection;
    
    // Import models to test queries
    const Client = (await import('@/lib/models/Client')).default;
    const Membership = (await import('@/lib/models/Membership')).default;
    const Attendance = (await import('@/lib/models/Attendance')).default;
    
    // Test database operations
    const clientCount = await Client.countDocuments();
    const membershipCount = await Membership.countDocuments();
    const attendanceCount = await Attendance.countDocuments();
    
    // Get collection names
    const collections = await connection.db?.listCollections().toArray();
    const collectionNames = collections?.map(c => c.name) || [];
    
    // Get MongoDB server info
    const adminDb = connection.db?.admin();
    let serverInfo = null;
    if (adminDb) {
      try {
        serverInfo = await adminDb.serverStatus();
      } catch (e) {
        // May not have admin permissions
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'MongoDB connection successful!',
      connection: {
        method: 'MongoDB via Mongoose',
        connectionTime: `${connectTime}ms`,
        host: connection.host || 'unknown',
        port: connection.port || 'unknown',
        name: connection.name || 'unknown',
        readyState: connection.readyState === 1 ? 'connected' : 'disconnected',
      },
      database: {
        name: connection.db?.databaseName || 'unknown',
        collectionsFound: collectionNames.length,
        collections: collectionNames,
      },
      counts: {
        clients: clientCount,
        memberships: membershipCount,
        attendance: attendanceCount,
      },
      server: serverInfo ? {
        version: serverInfo.version,
        uptime: `${Math.floor(serverInfo.uptime / 3600)}h ${Math.floor((serverInfo.uptime % 3600) / 60)}m`,
      } : null,
      environment: {
        nodeEnv: process.env.NODE_ENV || 'not set',
        mongodbUri: process.env.MONGODB_URI ? 'set (masked)' : 'not set',
        databaseUrl: process.env.DATABASE_URL ? 'set (masked)' : 'not set',
      },
    });
  } catch (error: any) {
    console.error('❌ MongoDB connection failed:', error);
    
    const troubleshooting: any = {
      possibleCauses: [],
      nextSteps: [],
    };
    
    if (error.message?.includes('ENOTFOUND') || error.code === 'ENOTFOUND') {
      troubleshooting.dnsError = 'DNS resolution failed for MongoDB hostname';
      troubleshooting.possibleCauses.push('1. MongoDB Atlas cluster is paused or deleted');
      troubleshooting.possibleCauses.push('2. Incorrect connection string hostname');
      troubleshooting.possibleCauses.push('3. Network/DNS issue - Check your internet connection');
      troubleshooting.nextSteps.push('1. Verify MONGODB_URI environment variable is set correctly');
      troubleshooting.nextSteps.push('2. Check MongoDB Atlas Dashboard for cluster status');
      troubleshooting.nextSteps.push('3. Ensure cluster is active and accessible');
    } else if (error.message?.includes('authentication') || error.code === 18 || error.code === 'AuthFailed') {
      troubleshooting.authError = 'Authentication failed';
      troubleshooting.possibleCauses.push('1. Incorrect username or password in connection string');
      troubleshooting.possibleCauses.push('2. User does not have access to the database');
      troubleshooting.nextSteps.push('1. Verify MONGODB_URI credentials are correct');
      troubleshooting.nextSteps.push('2. Check MongoDB Atlas → Database Access for user permissions');
    } else if (error.message?.includes('MongoNetworkError') || error.code === 'MongoNetworkError') {
      troubleshooting.networkError = 'Network error';
      troubleshooting.possibleCauses.push('1. Network connectivity issue');
      troubleshooting.possibleCauses.push('2. Firewall blocking MongoDB connections');
      troubleshooting.possibleCauses.push('3. MongoDB Atlas IP whitelist restrictions');
      troubleshooting.nextSteps.push('1. Check your internet connection');
      troubleshooting.nextSteps.push('2. Verify IP is whitelisted in MongoDB Atlas → Network Access');
      troubleshooting.nextSteps.push('3. Ensure firewall allows MongoDB connections (port 27017 or 27017-27019)');
    } else {
      troubleshooting.possibleCauses.push('1. Check your environment variables (MONGODB_URI or DATABASE_URL)');
      troubleshooting.possibleCauses.push('2. Verify MongoDB credentials are correct');
      troubleshooting.possibleCauses.push('3. Check network connectivity');
      troubleshooting.nextSteps.push('1. Verify MONGODB_URI is set correctly');
      troubleshooting.nextSteps.push('2. Check MongoDB Atlas Dashboard');
      troubleshooting.nextSteps.push('3. Review error details below');
    }
    
    return NextResponse.json(
      {
        success: false,
        message: 'MongoDB connection failed',
        error: error.message || 'Unknown error',
        code: error.code || 'UNKNOWN',
        details: {
          errorType: error.name || 'Error',
          troubleshooting,
        },
      },
      { status: 500 }
    );
  }
}
