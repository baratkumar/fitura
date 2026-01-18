import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';

export async function GET() {
  try {
    console.log('🔍 Testing MongoDB Connection...');
    
    // Test connection
    await connectDB();
    
    // Import models to test queries
    const Client = (await import('@/lib/models/Client')).default;
    const Membership = (await import('@/lib/models/Membership')).default;
    const Attendance = (await import('@/lib/models/Attendance')).default;
    
    // Test a simple query
    const clientCount = await Client.countDocuments();
    const membershipCount = await Membership.countDocuments();
    const attendanceCount = await Attendance.countDocuments();
    
    // Get MongoDB connection info
    const mongoose = await import('mongoose');
    const connection = mongoose.default.connection;
    
    return NextResponse.json({
      success: true,
      message: 'MongoDB connection successful!',
      connection: {
        host: connection.host || 'unknown',
        port: connection.port || 'unknown',
        name: connection.name || 'unknown',
        readyState: connection.readyState === 1 ? 'connected' : 'disconnected',
      },
      database: {
        name: connection.db?.databaseName || 'unknown',
        collections: Object.keys(connection.collections),
      },
      counts: {
        clients: clientCount,
        memberships: membershipCount,
        attendance: attendanceCount,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'not set',
        mongodbUri: process.env.MONGODB_URI ? 'set' : 'not set',
        databaseUrl: process.env.DATABASE_URL ? 'set' : 'not set',
      },
    });
  } catch (error: any) {
    console.error('❌ MongoDB connection failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'MongoDB connection failed',
        details: {
          code: error.code || 'N/A',
          message: error.message,
        },
        troubleshooting: getTroubleshootingTips(error),
      },
      { status: 500 }
    );
  }
}

function getTroubleshootingTips(error: any): string[] {
  const tips: string[] = [];
  
  if (error.message?.includes('ENOTFOUND') || error.code === 'ENOTFOUND') {
    tips.push('DNS resolution failed. Check if the MongoDB hostname is correct.');
    tips.push('Verify MONGODB_URI or DATABASE_URL is correct.');
  } else if (error.message?.includes('ECONNREFUSED') || error.code === 'ECONNREFUSED') {
    tips.push('Connection refused. Check if MongoDB is running.');
    tips.push('Verify MongoDB host and port are correct.');
  } else if (error.message?.includes('authentication') || error.code === 18) {
    tips.push('Authentication failed. Check MongoDB username and password.');
  } else if (error.message?.includes('MongoNetworkError')) {
    tips.push('Network error. Check your internet connection.');
    tips.push('Verify MongoDB server is accessible.');
  } else {
    tips.push('Check your environment variables (MONGODB_URI or DATABASE_URL).');
    tips.push('Verify MongoDB credentials.');
    tips.push('Check network connectivity.');
  }
  
  return tips;
}
