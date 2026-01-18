#!/usr/bin/env ts-node
/**
 * Database Connection Test Script
 * Tests the database connection locally
 * 
 * Usage: npx tsx scripts/test-db-connection.ts
 * or: npm run test:db
 */

import { Pool } from 'pg';
import { getTableName } from '../lib/tableNames';

// Extract Supabase project ref from URL if provided
function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    // Extract project ref from URL like https://oyhjmwkrpdgwrbufgucg.supabase.co
    const match = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/);
    if (match) {
      const projectRef = match[1];
      return {
        host: `db.${projectRef}.supabase.co`,
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: process.env.DB_PASSWORD || '',
        ssl: {
          rejectUnauthorized: false, // Required for Supabase connections
        },
      };
    }
  }
  return null;
}

async function testConnection() {
  console.log('🔍 Testing Database Connection...\n');
  console.log('📋 Environment Configuration:');
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set (defaults to local)'}`);
  console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL || 'not set'}`);
  console.log(`   DB_PASSWORD: ${process.env.DB_PASSWORD ? '***set***' : 'not set'}`);
  console.log(`   DB_HOST: ${process.env.DB_HOST || 'localhost (default)'}`);
  console.log(`   DB_NAME: ${process.env.DB_NAME || 'fitura (default)'}`);
  console.log('');

  const supabaseConfig = getSupabaseConfig();
  const poolConfig = supabaseConfig
    ? {
        ...supabaseConfig,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'fitura',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      };

  console.log('🔌 Connection Details:');
  if (supabaseConfig) {
    console.log('   Type: Supabase PostgreSQL');
    console.log(`   Host: ${supabaseConfig.host}`);
    console.log(`   Port: ${supabaseConfig.port}`);
    console.log(`   Database: ${supabaseConfig.database}`);
    console.log(`   User: ${supabaseConfig.user}`);
    console.log(`   SSL: Enabled`);
  } else {
    console.log('   Type: Local PostgreSQL');
    console.log(`   Host: ${poolConfig.host}`);
    console.log(`   Port: ${poolConfig.port}`);
    console.log(`   Database: ${poolConfig.database}`);
    console.log(`   User: ${poolConfig.user}`);
  }
  console.log('');

  const pool = new Pool(poolConfig);

  try {
    console.log('⏳ Attempting to connect...');
    
    // Test basic connection
    const client = await pool.connect();
    console.log('✅ Connection successful!');
    console.log('');

    // Test a simple query
    console.log('📊 Testing query...');
    const result = await client.query('SELECT version()');
    console.log('✅ Query successful!');
    console.log(`   PostgreSQL Version: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`);
    console.log('');

    // Check table names
    console.log('📋 Table Names (based on NODE_ENV):');
    const membershipsTable = getTableName('memberships');
    const clientsTable = getTableName('clients');
    const attendanceTable = getTableName('attendance');
    console.log(`   Memberships: ${membershipsTable}`);
    console.log(`   Clients: ${clientsTable}`);
    console.log(`   Attendance: ${attendanceTable}`);
    console.log('');

    // Check if tables exist
    console.log('🔍 Checking if tables exist...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'FT_%'
      ORDER BY table_name
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log(`✅ Found ${tablesResult.rows.length} table(s):`);
      tablesResult.rows.forEach((row) => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('⚠️  No tables found with FT_ prefix');
      console.log('   Run /api/init-db to create tables');
    }
    console.log('');

    client.release();
    await pool.end();
    
    console.log('✨ Database connection test completed successfully!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Connection failed!');
    console.error('');
    console.error('Error Details:');
    console.error(`   Code: ${error.code || 'N/A'}`);
    console.error(`   Message: ${error.message}`);
    console.error('');
    console.error('💡 Troubleshooting:');
    
    if (error.code === 'ENOTFOUND') {
      console.error('   - DNS resolution failed. Check if the hostname is correct.');
      if (supabaseConfig) {
        console.error('   - Verify NEXT_PUBLIC_SUPABASE_URL is correct');
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   - Connection refused. Check if PostgreSQL is running.');
      console.error('   - Verify DB_HOST and DB_PORT are correct');
    } else if (error.code === '28P01') {
      console.error('   - Authentication failed. Check DB_PASSWORD.');
    } else if (error.code === '3D000') {
      console.error('   - Database does not exist. Create the database first.');
    } else {
      console.error('   - Check your environment variables');
      console.error('   - Verify database credentials');
      console.error('   - Check network connectivity');
    }
    
    await pool.end();
    process.exit(1);
  }
}

// Run the test
testConnection();




