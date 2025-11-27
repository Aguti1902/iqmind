# 🚀 Deployment Guide - IQmind

This guide will help you deploy IQmind to production using GitHub, Vercel, and Railway.

## 📋 Prerequisites

- ✅ GitHub account
- ✅ Vercel account (free tier available)
- ✅ Railway account (free tier available)
- ✅ Stripe account (for payments)

---

## 🔷 PART 1: GitHub Setup

### Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the "+" icon in the top right → "New repository"
3. Fill in:
   - **Repository name**: `iqmind` (or your preferred name)
   - **Description**: "Online Intelligence Test Platform"
   - **Visibility**: Private (recommended) or Public
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click "Create repository"

### Step 2: Push Code to GitHub

Run these commands in your terminal:

```bash
# Navigate to project directory
cd /Users/guti/Desktop/CURSOR\ WEBS/IQLEVEL

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/iqmind.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Note**: You'll be prompted for your GitHub credentials. Use a Personal Access Token (not password):
- Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
- Generate new token with `repo` scope
- Copy and use it as your password

### Step 3: Verify Upload

1. Go to your repository on GitHub
2. Verify all files are present
3. Check that `.gitignore` is working (no `node_modules` or `.env` files)

---

## 🔷 PART 2: Railway Database Setup

### Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Click "Login with GitHub"
3. Authorize Railway to access your GitHub account

### Step 2: Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `iqmind` repository
4. Railway will detect it's a Next.js app

### Step 3: Add PostgreSQL Database

1. In your Railway project, click "+ New"
2. Select "Database" → "Add PostgreSQL"
3. Wait for the database to provision (1-2 minutes)

### Step 4: Get Database Connection String

1. Click on your PostgreSQL service
2. Go to the "Variables" tab
3. Copy the `DATABASE_URL` value
4. It looks like:
   ```
   postgresql://postgres:password@containers-us-west-xxx.railway.app:7432/railway
   ```

### Step 5: Create Database Tables

1. Click on your PostgreSQL service
2. Click "Query" tab
3. Run this SQL to create tables:

```sql
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_email ON test_results(email);
CREATE INDEX IF NOT EXISTS idx_test_results_date ON test_results(test_date DESC);
```

4. Click "Run" to execute

---

## 🔷 PART 3: Vercel Deployment

### Step 1: Import Project to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Login" → "Continue with GitHub"
3. Authorize Vercel
4. Click "Add New..." → "Project"
5. Import your `iqmind` repository
6. Vercel will auto-detect Next.js settings

### Step 2: Configure Build Settings

Vercel should auto-detect:
- **Framework Preset**: Next.js
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

Click "Deploy" (don't add environment variables yet)

### Step 3: Add Environment Variables

After first deployment, go to:
1. Project Settings → Environment Variables
2. Add these variables:

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRICE_ID=price_xxxxx
DATABASE_URL=postgresql://postgres:xxx@xxx.railway.app:7432/railway
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

3. Click "Save"
4. Go to "Deployments" tab
5. Click "..." on latest deployment → "Redeploy"

### Step 4: Get Your Vercel URL

1. After deployment, you'll get a URL like: `https://iqmind-xxxxx.vercel.app`
2. Copy this URL (you'll need it for Stripe webhook)

---

## 🔷 PART 4: Stripe Configuration

### Step 1: Get Stripe Keys

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Click "Developers" → "API keys"
3. Copy:
   - **Publishable key**: `pk_live_xxxxx`
   - **Secret key**: `sk_live_xxxxx`

### Step 2: Create Product & Price

1. Go to "Products" → "Add product"
2. Fill in:
   - **Name**: IQmind Premium Subscription
   - **Description**: Monthly subscription for unlimited tests
3. Add pricing:
   - **Price**: €19.99
   - **Billing period**: Monthly
4. Save and copy the **Price ID** (starts with `price_`)

### Step 3: Configure Webhook

1. Go to "Developers" → "Webhooks" → "Add endpoint"
2. Endpoint URL: `https://your-vercel-url.vercel.app/api/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Click "Add endpoint"
5. Copy the **Signing secret** (starts with `whsec_`)

### Step 4: Update Vercel Environment Variables

1. Go back to Vercel → Project Settings → Environment Variables
2. Update with your actual Stripe keys:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
   STRIPE_SECRET_KEY=sk_live_xxxxx
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   STRIPE_PRICE_ID=price_xxxxx
   ```
3. Redeploy

---

## 🔷 PART 5: Custom Domain (Optional)

### Step 1: Add Domain to Vercel

1. Go to Project Settings → Domains
2. Add your domain: `mindmetric.io`
3. Follow DNS configuration instructions

### Step 2: Update Environment Variables

Update `NEXT_PUBLIC_APP_URL` to your custom domain:
```
NEXT_PUBLIC_APP_URL=https://mindmetric.io
```

---

## ✅ Post-Deployment Checklist

- [ ] GitHub repository created and code pushed
- [ ] Railway PostgreSQL database provisioned
- [ ] Database tables created
- [ ] Vercel project deployed
- [ ] Environment variables configured in Vercel
- [ ] Stripe product and price created
- [ ] Stripe webhook configured
- [ ] Test payment flow end-to-end
- [ ] Test subscription cancellation
- [ ] Test email delivery
- [ ] Verify all pages load correctly
- [ ] Test multi-language switching
- [ ] Monitor Vercel logs for errors
- [ ] Monitor Railway database connections

---

## 🧪 Testing Your Deployment

### Test 1: Homepage
Visit your Vercel URL and verify:
- ✅ Homepage loads
- ✅ Language selector works
- ✅ "Start Test" button works

### Test 2: Test Flow
1. Click "Start Test"
2. Complete the test
3. Verify email input page appears
4. Verify checkout page loads
5. **Use Stripe test card**: `4242 4242 4242 4242`
6. Verify results page shows

### Test 3: Webhook
1. Check Vercel logs for webhook events
2. Check Railway database for new user/test records
3. Verify subscription status

### Test 4: Dashboard
1. Log in to account page
2. Verify test history loads
3. Check analytics display correctly

---

## 🆘 Troubleshooting

### Build Fails in Vercel
- Check build logs for errors
- Verify all dependencies in `package.json`
- Ensure TypeScript errors are fixed

### Database Connection Errors
- Verify `DATABASE_URL` is correct
- Check Railway database is running
- Ensure SSL is enabled

### Stripe Webhook Not Working
- Verify webhook URL is correct
- Check webhook secret matches
- View webhook logs in Stripe dashboard

### Images Not Loading
- Check `public/` folder structure
- Verify image paths are correct
- Clear browser cache

---

## 📊 Monitoring

### Vercel Analytics
- Go to Analytics tab in Vercel
- Monitor page views, performance
- Set up alerts for errors

### Railway Metrics
- Monitor database connections
- Check CPU/memory usage
- Review logs for errors

### Stripe Dashboard
- Monitor payments
- Check webhook deliveries
- Review subscription metrics

---

## 🔐 Security Best Practices

1. **Never commit** `.env` files
2. **Use environment variables** for all secrets
3. **Enable HTTPS** (automatic with Vercel)
4. **Regular backups** (automatic with Railway)
5. **Monitor logs** for suspicious activity
6. **Keep dependencies updated**
7. **Use Stripe test mode** during development

---

## 📞 Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Stripe Docs**: [stripe.com/docs](https://stripe.com/docs)
- **IQmind Support**: support@mindmetric.io

---

## 🎉 You're Live!

Once all steps are complete, your IQmind platform will be:
- ✅ Accessible worldwide
- ✅ Processing payments securely
- ✅ Storing data reliably
- ✅ Scaling automatically
- ✅ Monitored 24/7

**Congratulations!** 🎊
