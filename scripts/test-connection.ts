#!/usr/bin/env tsx
/**
 * Test database connection
 * Run with: npx tsx scripts/test-connection.ts
 */

import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function testConnection() {
  console.log('Testing database connection...\n');
  
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in .env.local');
    console.log('Please add: DATABASE_URL=postgresql://postgres:PASSWORD@db.PROJECT-REF.supabase.co:5432/postgres');
    process.exit(1);
  }
  
  console.log('✓ DATABASE_URL is set');
  
  // Parse connection string to show hostname (without password)
  try {
    const url = new URL(process.env.DATABASE_URL);
    console.log(`✓ Hostname: ${url.hostname}`);
    console.log(`✓ Port: ${url.port || '5432'}`);
    console.log(`✓ Database: ${url.pathname.slice(1) || 'postgres'}`);
    console.log(`✓ User: ${url.username}\n`);
  } catch (error) {
    console.error('❌ Invalid DATABASE_URL format');
    process.exit(1);
  }
  
  // Try to connect
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
    connectionTimeoutMillis: 10000,
  });
  
  try {
    console.log('Attempting to connect...');
    const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Connection successful!');
    console.log(`   Current time: ${result.rows[0].current_time}`);
    console.log(`   PostgreSQL version: ${result.rows[0].pg_version.split(' ')[0]} ${result.rows[0].pg_version.split(' ')[1]}`);
    
    // Test a simple query
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      LIMIT 5
    `);
    console.log(`\n✓ Found ${tableCheck.rows.length} tables in public schema`);
    
    await pool.end();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Connection failed!');
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code || 'N/A'}`);
    
    if (error.code === 'ENOTFOUND') {
      console.error('\n💡 DNS resolution failed. Possible causes:');
      console.error('   1. Supabase project is paused - check your Supabase dashboard');
      console.error('   2. Hostname is incorrect - verify the connection string');
      console.error('   3. Network/DNS issue - try using connection pooler instead');
      console.error('\n   Try using transaction mode pooler (port 6543):');
      console.error('   DATABASE_URL=postgresql://postgres:PASSWORD@db.PROJECT-REF.supabase.co:6543/postgres');
    }
    
    await pool.end();
    process.exit(1);
  }
}

testConnection();



