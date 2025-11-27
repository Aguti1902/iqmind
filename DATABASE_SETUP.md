# 🗄️ Database Setup Guide - Railway PostgreSQL

This guide will help you set up a PostgreSQL database on Railway for MindMetric.

## 📋 Prerequisites

- Railway account (sign up at [railway.app](https://railway.app))
- GitHub account (for Railway deployment)

## 🚀 Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Select "Provision PostgreSQL"
4. Wait for the database to be provisioned

## 🔗 Step 2: Get Database Connection String

1. Click on your PostgreSQL database in Railway
2. Go to the "Connect" tab
3. Copy the **DATABASE_URL** connection string
4. It should look like:
   ```
   postgresql://postgres:password@containers-us-west-xxx.railway.app:7432/railway
   ```

## ⚙️ Step 3: Configure Environment Variables

### For Local Development:
Create `.env.local` file:
```env
DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:7432/railway
```

### For Vercel Production:
Add to Vercel environment variables:
- Key: `DATABASE_URL`
- Value: Your Railway PostgreSQL connection string

## 📊 Step 4: Create Database Schema

We need tables for:
- Users
- Test Results
- Subscriptions

### SQL Schema:

```sql
-- Users table
CREATE TABLE users (
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
CREATE TABLE test_results (
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
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX idx_test_results_user_id ON test_results(user_id);
CREATE INDEX idx_test_results_email ON test_results(email);
CREATE INDEX idx_test_results_date ON test_results(test_date DESC);
```

### How to Run the Schema:

**Option 1: Railway Web Interface**
1. Go to your PostgreSQL database in Railway
2. Click on "Data" tab
3. Click "Query" button
4. Paste the SQL schema above
5. Click "Run Query"

**Option 2: psql CLI**
```bash
psql "postgresql://postgres:password@containers-us-west-xxx.railway.app:7432/railway" < schema.sql
```

## 🔐 Step 5: Set Up Prisma (Optional but Recommended)

If you want to use Prisma ORM:

1. Install Prisma:
```bash
npm install @prisma/client
npm install -D prisma
```

2. Initialize Prisma:
```bash
npx prisma init
```

3. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id                  Int       @id @default(autoincrement())
  email               String    @unique
  name                String?
  stripeCustomerId    String?   @unique @map("stripe_customer_id")
  subscriptionStatus  String?   @default("inactive") @map("subscription_status")
  subscriptionId      String?   @map("subscription_id")
  trialEnd            DateTime? @map("trial_end")
  subscriptionEnd     DateTime? @map("subscription_end")
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")
  
  testResults TestResult[]
  
  @@map("users")
}

model TestResult {
  id              Int      @id @default(autoincrement())
  userId          Int?     @map("user_id")
  email           String
  name            String?
  iqScore         Int      @map("iq_score")
  correctAnswers  Int      @map("correct_answers")
  totalQuestions  Int      @default(20) @map("total_questions")
  testDate        DateTime @default(now()) @map("test_date")
  answers         Json?
  isPremium       Boolean  @default(false) @map("is_premium")
  
  user User? @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([email])
  @@index([testDate])
  @@map("test_results")
}
```

4. Generate Prisma Client:
```bash
npx prisma generate
```

5. Push schema to database:
```bash
npx prisma db push
```

## 🧪 Step 6: Test Connection

Create a test file `test-db.js`:
```javascript
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()')
    console.log('✅ Database connected:', result.rows[0])
  } catch (error) {
    console.error('❌ Database connection error:', error)
  } finally {
    await pool.end()
  }
}

testConnection()
```

Run:
```bash
node test-db.js
```

## 📊 Step 7: Monitor Your Database

In Railway:
- **Metrics**: View CPU, memory, and connection usage
- **Logs**: Monitor database logs
- **Backups**: Railway automatically backs up your data
- **Scaling**: Upgrade plan if needed

## 🔒 Security Best Practices

1. **Never commit** `.env` files to Git
2. **Use environment variables** for all sensitive data
3. **Enable SSL** for database connections in production
4. **Regularly backup** your database
5. **Monitor** for unusual activity
6. **Rotate credentials** periodically

## 💡 Tips

- Railway provides automatic backups
- Database sleeps after inactivity on free tier (upgrade for 24/7)
- Monitor connection limits (20 connections on free tier)
- Use connection pooling for better performance

## 🆘 Troubleshooting

### Connection Timeout
- Check Railway service is running
- Verify DATABASE_URL is correct
- Check firewall/network settings

### Too Many Connections
- Implement connection pooling
- Close connections after use
- Upgrade Railway plan for more connections

### Slow Queries
- Add indexes on frequently queried columns
- Use EXPLAIN ANALYZE to identify bottlenecks
- Consider query optimization

## 📞 Support

For Railway support:
- Docs: [docs.railway.app](https://docs.railway.app)
- Discord: [Railway Community](https://discord.gg/railway)

For MindMetric issues:
- Email: support@mindmetric.io

