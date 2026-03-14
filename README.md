# ☕ Chai Aur Baat

A beautiful AI chat companion built with Next.js, Groq, and Framer Motion.

## Features

- 🤖 Streaming AI replies (Gemini-style word-by-word)
- ✨ Aceternity-inspired animations & glass UI
- 🚦 Rate limiting (10 requests/min per IP)
- 📱 Fully responsive
- 🔍 SEO + Open Graph optimized
- ⚡ Powered by Groq (llama-3.1-8b-instant)

## Getting Started

```bash
npm install
cp .env.example .env.local
# Add your GROQ_API_KEY to .env.local
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | Your Groq API key from [console.groq.com](https://console.groq.com) |
| `NEXT_PUBLIC_SITE_URL` | Your production URL (for OG image) |

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/praharaj03/Chai-Aur-Baat)
