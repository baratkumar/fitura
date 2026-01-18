import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Test connection strings - try both direct and pooler with sslmode=require
const connectionStrings = {
  direct: 'postgresql://postgres:FmTXmOaxD5Q6vUzD@db.oyhjmwkrpdgwrbufgucg.supabase.co:5432/postgres?sslmode=require',
  pooler: 'postgres://postgres:FmTXmOaxD5Q6vUzD@db.oyhjmwkrpdgwrbufgucg.supabase.co:6543/postgres?sslmode=require',
  poolerPostgresql: 'postgresql://postgres:FmTXmOaxD5Q6vUzD@db.oyhjmwkrpdgwrbufgucg.supabase.co:6543/postgres?sslmode=require',
  // Session mode pooler (aws region pooler)
  sessionPooler: 'postgresql://postgres.oyhjmwkrpdgwrbufgucg:FmTXmOaxD5Q6vUzD@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require',
};

async function testConnection(connectionString: string, label: string) {
  const pool = new Pool({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
    connectionTimeoutMillis: 10000,
  });

  try {
    const startTime = Date.now();
    const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    const connectTime = Date.now() - startTime;

    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
      LIMIT 20
    `);

    await pool.end();

    return {
      success: true,
      method: label,
      connectionTime: `${connectTime}ms`,
      currentTime: result.rows[0].current_time,
      postgresVersion: result.rows[0].pg_version.split(' ')[0] + ' ' + result.rows[0].pg_version.split(' ')[1],
      tablesFound: tablesResult.rows.length,
      tables: tablesResult.rows.map(row => row.table_name),
    };
  } catch (error: any) {
    await pool.end().catch(() => {});
    return {
      success: false,
      method: label,
      error: error.message,
      code: error.code || 'UNKNOWN',
    };
  }
}

async function testConnectionWithParams(host: string, port: number, database: string, user: string, password: string, label: string) {
  const pool = new Pool({
    host: host,
    port: port,
    database: database,
    user: user,
    password: password,
    ssl: {
      rejectUnauthorized: false,
    },
    connectionTimeoutMillis: 10000,
  });

  try {
    const startTime = Date.now();
    const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    const connectTime = Date.now() - startTime;

    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
      LIMIT 20
    `);

    await pool.end();

    return {
      success: true,
      method: label,
      connectionTime: `${connectTime}ms`,
      currentTime: result.rows[0].current_time,
      postgresVersion: result.rows[0].pg_version.split(' ')[0] + ' ' + result.rows[0].pg_version.split(' ')[1],
      tablesFound: tablesResult.rows.length,
      tables: tablesResult.rows.map(row => row.table_name),
    };
  } catch (error: any) {
    await pool.end().catch(() => {});
    return {
      success: false,
      method: label,
      error: error.message,
      code: error.code || 'UNKNOWN',
    };
  }
}

export async function GET() {
  console.log('Testing Supabase connection...');
  
  const password = 'FmTXmOaxD5Q6vUzD';
  const host = 'db.oyhjmwkrpdgwrbufgucg.supabase.co';
  const port = 5432;
  const database = 'postgres';
  const user = 'postgres';
  
  // Try connection with individual parameters first (as requested)
  console.log('Attempting connection with individual parameters...');
  const paramsResult = await testConnectionWithParams(host, port, database, user, password, 'Individual Parameters');
  
  if (paramsResult.success) {
    return NextResponse.json({
      success: true,
      message: 'Connection successful using individual parameters!',
      details: paramsResult,
      connectionMethod: 'Individual parameters (host, port, database, user)',
    });
  }

  // If individual params fail, try connection string (port 5432)
  console.log('Individual parameters failed. Trying connection string (port 5432)...');
  const directResult = await testConnection(connectionStrings.direct, 'Connection String (5432)');
  
  if (directResult.success) {
    return NextResponse.json({
      success: true,
      message: 'Connection successful via connection string!',
      details: directResult,
    });
  }

  // Try pooler (port 6543) - recommended for serverless
  console.log('Trying connection pooler (port 6543)...');
  const poolerResult = await testConnection(connectionStrings.pooler, 'Pooler postgres:// (6543)');
  const poolerPostgresqlResult = await testConnection(connectionStrings.poolerPostgresql, 'Pooler postgresql:// (6543)');
  const sessionPoolerResult = await testConnection(connectionStrings.sessionPooler, 'Session Pooler (aws-1-ap-south-1)');
  
  // Also try pooler with individual params
  const poolerParamsResult = await testConnectionWithParams(host, 6543, database, user, password, 'Pooler Parameters (6543)');
  
  if (poolerResult.success || poolerPostgresqlResult.success || sessionPoolerResult.success || poolerParamsResult.success) {
    const successfulResult = poolerResult.success ? poolerResult : 
                             (poolerPostgresqlResult.success ? poolerPostgresqlResult : 
                             (sessionPoolerResult.success ? sessionPoolerResult : poolerParamsResult));
    return NextResponse.json({
      success: true,
      message: 'Connection successful via connection pooler!',
      details: successfulResult,
      note: 'Use connection pooler for serverless environments.',
      recommendedConnectionString: sessionPoolerResult.success 
        ? 'postgresql://postgres.oyhjmwkrpdgwrbufgucg:FmTXmOaxD5Q6vUzD@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require'
        : 'postgres://postgres:FmTXmOaxD5Q6vUzD@db.oyhjmwkrpdgwrbufgucg.supabase.co:6543/postgres?sslmode=require',
    });
  }

  // If direct fails with DNS error and pooler also fails
  if (directResult.code === 'ENOTFOUND' || paramsResult.code === 'ENOTFOUND') {

    // All methods failed
    return NextResponse.json(
      {
        success: false,
        message: 'All connection methods failed',
        attempts: [paramsResult, directResult, poolerResult, poolerPostgresqlResult, sessionPoolerResult, poolerParamsResult],
        troubleshooting: {
          dnsError: 'DNS resolution failed for all methods. This usually means:',
          possibleCauses: [
            '1. Supabase project is paused - Go to https://supabase.com/dashboard and check project status',
            '2. Project reference is incorrect - Verify the project ID: oyhjmwkrpdgwrbufgucg',
            '3. Network/DNS issue - Check your internet connection',
            '4. Firewall blocking - Check if port 5432/6543 are blocked',
          ],
          nextSteps: [
            '1. Visit https://supabase.com/dashboard/project/oyhjmwkrpdgwrbufgucg',
            '2. Check if project shows "Paused" - if so, click "Resume"',
            '3. Go to Settings → Database → Connection string',
            '4. Copy the correct connection string from the dashboard',
          ],
        },
      },
      { status: 500 }
    );
  }

  // Connection failed with non-DNS error
  return NextResponse.json(
    {
      success: false,
      message: 'Connection failed',
      attempts: [paramsResult, directResult],
      error: paramsResult.error || directResult.error,
      code: paramsResult.code || directResult.code,
      details: {
        hostname: host,
        port: port,
        troubleshooting: {
          dnsError: (paramsResult.code === 'ENOTFOUND' || directResult.code === 'ENOTFOUND') ? 'DNS resolution failed. Check if Supabase project is active.' : null,
          authError: (paramsResult.code === '28P01' || directResult.code === '28P01') ? 'Authentication failed. Check password.' : null,
          timeoutError: (paramsResult.code === 'ETIMEDOUT' || directResult.code === 'ETIMEDOUT') ? 'Connection timeout. Try port 6543 (connection pooler).' : null,
        },
      },
    },
    { status: 500 }
  );
}

