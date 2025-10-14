# 🧠 IQmind - Online Intelligence Test Platform

A modern, professional online IQ testing platform built with Next.js 14, TypeScript, and Tailwind CSS.

## 🌟 Features

- **Visual IQ Test**: 20 unique pattern recognition questions (Raven's Matrices style)
- **Multi-language Support**: English, Spanish, Portuguese, Italian, French, German, Dutch, Polish
- **Premium Subscription**: 2-day free trial + €19.99/month subscription model
- **Payment Processing**: Secure payments via Stripe
- **User Dashboard**: Track multiple tests, view progress, and analytics
- **PDF Certificates**: Downloadable IQ certificates with results
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Analytics Integration**: Google Analytics & Meta Pixel

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (Railway)
- **Payment**: Stripe Checkout & Billing
- **Deployment**: Vercel
- **Icons**: React Icons
- **Charts**: Recharts
- **PDF**: jsPDF

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Stripe account (for payments)
- Railway account (for PostgreSQL database)
- Vercel account (for deployment)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/iqmind.git
cd iqmind
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with:
```env
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
STRIPE_PRICE_ID=your_price_id

# Database
DATABASE_URL=your_postgresql_url

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables (Production)

Make sure to set these in your Vercel project:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID`
- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL`

## 🗄️ Database Setup

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed instructions on setting up PostgreSQL on Railway.

## 💳 Stripe Setup

See [STRIPE_SETUP.md](./STRIPE_SETUP.md) for detailed instructions on configuring Stripe.

## 📱 Project Structure

```
iqmind/
├── app/
│   ├── [lang]/           # Multi-language routes
│   ├── api/              # API routes (Stripe, webhooks)
│   └── layout.tsx
├── components/           # React components
├── hooks/                # Custom hooks (useTranslations)
├── lib/                  # Utilities and helpers
├── messages/             # Translation files (JSON)
├── public/               # Static assets
└── types/                # TypeScript type definitions
```

## 🌍 Supported Languages

- 🇬🇧 English (en)
- 🇪🇸 Spanish (es)
- 🇵🇹 Portuguese (pt)
- 🇮🇹 Italian (it)
- 🇫🇷 French (fr)
- 🇩🇪 German (de)
- 🇳🇱 Dutch (nl)
- 🇵🇱 Polish (pl)

## 💰 Pricing Model

- **Initial Payment**: €0.50 for test results access
- **Premium Trial**: 2 days free
- **Subscription**: €19.99/month (auto-renews after trial)

## 📄 Legal Pages

- Terms and Conditions: `/[lang]/terminos`
- Privacy Policy: `/[lang]/privacidad`
- Refund Policy: `/[lang]/reembolso`

## 🤝 Contributing

This is a private project. For any issues or questions, contact support@iqmind.io

## 📧 Contact

- **Email**: support@iqmind.io
- **Website**: [iqmind.io](https://iqmind.io)

## 📝 License

All rights reserved © 2025 IQmind

---

Built with ❤️ using Next.js and TypeScript
