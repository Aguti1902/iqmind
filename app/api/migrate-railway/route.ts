import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL
    
    if (!connectionString) {
      return NextResponse.json(
        { error: 'No database connection string found' },
        { status: 500 }
      )
    }

    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    })

    // Migration SQL
    const migrationSQL = `
      -- Drop old tables
      DROP TABLE IF EXISTS test_results CASCADE;
      DROP TABLE IF EXISTS password_resets CASCADE;
      DROP TABLE IF EXISTS users CASCADE;

      -- Create new users table
      CREATE TABLE users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        iq INTEGER DEFAULT 0,
        subscription_status VARCHAR(50) DEFAULT 'trial',
        subscription_id VARCHAR(255),
        trial_end_date TIMESTAMP,
        access_until TIMESTAMP,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create test_results table
      CREATE TABLE test_results (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        iq INTEGER NOT NULL,
        correct_answers INTEGER NOT NULL,
        time_elapsed INTEGER NOT NULL,
        answers JSONB NOT NULL,
        category_scores JSONB NOT NULL,
        completed_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create password_resets table
      CREATE TABLE password_resets (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes
      CREATE INDEX idx_users_email ON users(email);
      CREATE INDEX idx_users_subscription_id ON users(subscription_id);
      CREATE INDEX idx_test_results_user_id ON test_results(user_id);
      CREATE INDEX idx_test_results_completed_at ON test_results(completed_at DESC);
      CREATE INDEX idx_password_resets_token ON password_resets(token);
      CREATE INDEX idx_password_resets_email ON password_resets(email);
    `

    console.log('🔄 Starting database migration...')
    
    await pool.query(migrationSQL)
    
    console.log('✅ Migration completed successfully')

    // Verify tables
    const verification = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)

    await pool.end()

    return NextResponse.json({
      success: true,
      message: 'Database migrated successfully',
      tables: verification.rows.map(r => r.table_name)
    })

  } catch (error: any) {
    console.error('❌ Migration error:', error)
    return NextResponse.json(
      { 
        error: error.message,
        stack: error.stack 
      },
      { status: 500 }
    )
  }
}

