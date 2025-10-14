-- =====================================================
-- IQMIND DATABASE SCHEMA
-- PostgreSQL Schema for Railway
-- =====================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  stripe_customer_id VARCHAR(255) UNIQUE,
  subscription_status VARCHAR(50) DEFAULT 'inactive',
  subscription_id VARCHAR(255),
  trial_end TIMESTAMP,
  subscription_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test results table
CREATE TABLE IF NOT EXISTS test_results (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  iq_score INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  total_questions INTEGER DEFAULT 20,
  test_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  answers JSONB,
  is_premium BOOLEAN DEFAULT FALSE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_email ON test_results(email);
CREATE INDEX IF NOT EXISTS idx_test_results_date ON test_results(test_date DESC);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- To verify tables were created:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- To verify indexes:
-- SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public';

-- To check table structure:
-- \d users
-- \d test_results

