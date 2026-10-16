# ☕ Chai Aur Baat

A beautiful AI chat companion built with Next.js, Groq, and Framer Motion.

## Features

- 🤖 Streaming AI replies (Gemini-style word-by-word)
- ✨ Aceternity-inspired animations & glass UI
- 🎟️ Five free chat messages per browser, enforced by a signed server cookie
- 🚦 Rate limiting (10 requests/min per IP)
- 📱 Fully responsive
- 🔍 SEO + Open Graph optimized
- ⚡ Powered by Groq (openai/gpt-oss-20b)
- 🌐 Live web retrieval and citations for factual and current questions
- 🇬🇧 English-only assistant responses
- 💜 UPI subscription checkout with a locally generated QR code

## Getting Started

```bash
npm install
# Create .env.local with your GROQ_API_KEY
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | Your Groq API key from [console.groq.com](https://console.groq.com) |
| `NEXT_PUBLIC_SITE_URL` | Your production URL (for OG image) |
| `NEXT_PUBLIC_SUBSCRIPTION_PRICE_INR` | Subscription QR amount in INR (defaults to `99`) |
| `NEXT_PUBLIC_SUBSCRIPTION_DAYS` | Subscription duration in days (defaults to `30`) |

The subscription page accepts UPI payments to `abhisekpraharaj246-1@oksbi`.
Payment verification and paid-access activation are manual; the current app
does not automatically verify payments or activate subscriptions.

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/praharaj03/Chai-Aur-Baat)
