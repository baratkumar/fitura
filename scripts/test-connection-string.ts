#!/usr/bin/env tsx
/**
 * Test a specific database connection string
 * Usage: npx tsx scripts/test-connection-string.ts
 */

import { Pool } from 'pg';

const connectionString = 'postgresql://postgres:FmTXmOaxD5Q6vUzD@db.oyhjmwkrpdgwrbufgucg.supabase.co:5432/postgres';

async function testConnection() {
  console.log('Testing database connection...\n');
  console.log('Connection string:', connectionString.replace(/:[^:@]+@/, ':****@')); // Hide password
  
  const pool = new Pool({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
    connectionTimeoutMillis: 10000,
  });
  
  try {
    console.log('\nAttempting to connect...');
    const startTime = Date.now();
    
    const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    
    const connectTime = Date.now() - startTime;
    console.log(`✅ Connection successful! (${connectTime}ms)`);
    console.log(`   Current time: ${result.rows[0].current_time}`);
    console.log(`   PostgreSQL: ${result.rows[0].pg_version.split(' ')[0]} ${result.rows[0].pg_version.split(' ')[1]}`);
    
    // Test querying tables
    console.log('\nChecking database tables...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
      LIMIT 10
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log(`✅ Found ${tablesResult.rows.length} tables:`);
      tablesResult.rows.forEach((row, i) => {
        console.log(`   ${i + 1}. ${row.table_name}`);
      });
    } else {
      console.log('ℹ No tables found in public schema');
    }
    
    // Test a simple insert/select (if tables exist)
    console.log('\nTesting query execution...');
    const testQuery = await pool.query('SELECT 1 as test');
    console.log(`✅ Query execution successful: ${testQuery.rows[0].test}`);
    
    await pool.end();
    console.log('\n✅ All tests passed! Connection is working correctly.');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Connection failed!');
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code || 'N/A'}`);
    
    if (error.code === 'ENOTFOUND') {
      console.error('\n💡 DNS resolution failed. Possible causes:');
      console.error('   1. Supabase project is paused - check your Supabase dashboard');
      console.error('   2. Hostname is incorrect');
      console.error('   3. Network/DNS issue');
      console.error('\n   Try using connection pooler (port 6543):');
      console.error('   postgresql://postgres:FmTXmOaxD5Q6vUzD@db.oyhjmwkrpdgwrbufgucg.supabase.co:6543/postgres');
    } else if (error.code === '28P01' || error.message.includes('password')) {
      console.error('\n💡 Authentication failed. Check:');
      console.error('   1. Password is correct');
      console.error('   2. User "postgres" has access');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      console.error('\n💡 Connection timeout. Possible causes:');
      console.error('   1. Firewall blocking connection');
      console.error('   2. Supabase project is paused');
      console.error('   3. Network connectivity issue');
    }
    
    await pool.end();
    process.exit(1);
  }
}

testConnection();



