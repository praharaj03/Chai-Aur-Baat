# ☕ Chai Aur Baat

A beautiful AI chat companion built with Next.js, a configurable LLM provider, and Framer Motion.

## Features

- 🤖 Streaming AI replies (Gemini-style word-by-word)
- ✨ Aceternity-inspired animations & glass UI
- 🎟️ Five free chat messages per browser, then a three-minute cooldown before the next set
- 🚦 Rate limiting (10 requests/min per IP)
- 📱 Fully responsive
- 🔍 SEO + Open Graph optimized
- ⚡ Switch between Gemini and OpenAI-compatible providers through deployment environment variables
- ℹ️ Clearly flags questions that need current information or source verification
- 🇬🇧 English-only assistant responses
- 💜 UPI subscription checkout with a locally generated QR code

## Getting Started

```bash
npm install
# Configure an LLM provider in .env.local (see below)
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `LLM_PROVIDER` | `gemini` (default) or `openai-compatible` |
| `GEMINI_API_KEY` | Gemini API key, required when `LLM_PROVIDER=gemini` |
| `LLM_API_KEY` | API key for an OpenAI-compatible provider |
| `LLM_BASE_URL` | Optional Gemini API base (defaults to Google's API); required for `openai-compatible`, usually ending in `/v1` |
| `LLM_MODEL` | Model name; defaults to `gemini-3.5-flash-lite` for Gemini and is required for `openai-compatible` |
| `CHAT_COOKIE_SECRET` | Optional stable secret for signing the free-message quota cookie; otherwise the selected provider's API key is used |
| `NEXT_PUBLIC_SITE_URL` | Your production URL (for OG image) |
| `NEXT_PUBLIC_SUBSCRIPTION_PRICE_INR` | Subscription QR amount in INR (defaults to `99`) |
| `NEXT_PUBLIC_SUBSCRIPTION_DAYS` | Subscription duration in days (defaults to `30`) |

The subscription page accepts UPI payments to `abhisekpraharaj246-1@oksbi`.
Payment verification and paid-access activation are manual; the current app
does not automatically verify payments or activate subscriptions. Paid access
can be requested to skip the free-message cooldown after manual confirmation.

### Change LLM provider

For Gemini, set `LLM_PROVIDER=gemini` and `GEMINI_API_KEY`. To use a provider
that implements the OpenAI chat-completions streaming API, set these instead:

```dotenv
LLM_PROVIDER=openai-compatible
LLM_BASE_URL=https://api.example.com/v1
LLM_API_KEY=your-provider-api-key
LLM_MODEL=your-model-name
```

Set the same values in your deployment's environment settings and redeploy.
The browser and chat API route stay the same. Switching providers invalidates
existing free-message cookies if `CHAT_COOKIE_SECRET` is not set; set a stable
`CHAT_COOKIE_SECRET` once to keep those cookies valid across provider changes.

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/praharaj03/Chai-Aur-Baat)
