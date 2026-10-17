# ☕ Chai Aur Baat

A beautiful AI chat companion built with Next.js, Google Gemini, and Framer Motion.

## Features

- 🤖 Streaming AI replies (Gemini-style word-by-word)
- ✨ Aceternity-inspired animations & glass UI
- 🎟️ Five free chat messages per browser, then a three-minute cooldown before the next set
- 🚦 Rate limiting (10 requests/min per IP)
- 📱 Fully responsive
- 🔍 SEO + Open Graph optimized
- ⚡ Powered by Gemini 3.8 Flash
- ℹ️ Clearly flags questions that need current information or source verification
- 🇬🇧 English-only assistant responses
- 💜 UPI subscription checkout with a locally generated QR code

## Getting Started

```bash
npm install
# Create .env.local with your GEMINI_API_KEY
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Your Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey) |
| `CHAT_COOKIE_SECRET` | Optional stable secret for signing the free-message quota cookie; defaults to `GEMINI_API_KEY` |
| `NEXT_PUBLIC_SITE_URL` | Your production URL (for OG image) |
| `NEXT_PUBLIC_SUBSCRIPTION_PRICE_INR` | Subscription QR amount in INR (defaults to `99`) |
| `NEXT_PUBLIC_SUBSCRIPTION_DAYS` | Subscription duration in days (defaults to `30`) |

The subscription page accepts UPI payments to `abhisekpraharaj246-1@oksbi`.
Payment verification and paid-access activation are manual; the current app
does not automatically verify payments or activate subscriptions. Paid access
can be requested to skip the free-message cooldown after manual confirmation.

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/praharaj03/Chai-Aur-Baat)
