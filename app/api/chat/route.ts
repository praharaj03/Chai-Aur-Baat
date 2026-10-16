import { groq } from "@/lib/groq";
import { createHmac, timingSafeEqual } from "node:crypto";

// In-memory rate limit: 10 requests per minute per IP
const rateLimitMap = new Map<string, { count: number; reset: number }>();
const FREE_MESSAGE_LIMIT = 5;
const QUOTA_COOKIE = "free_message_count";
const QUOTA_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function signMessageCount(count: number): string {
  const secret = process.env.GROQ_API_KEY;
  if (!secret) throw new Error("GROQ_API_KEY is not set in environment variables");

  return createHmac("sha256", secret).update(String(count)).digest("base64url");
}

function getMessageCount(request: Request): number {
  const cookie = request.headers.get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${QUOTA_COOKIE}=`))
    ?.slice(QUOTA_COOKIE.length + 1);

  if (!cookie) return 0;

  const [countText, signature, ...extra] = cookie.split(".");
  const count = Number(countText);
  if (
    extra.length > 0 ||
    !Number.isInteger(count) ||
    count < 0 ||
    count > FREE_MESSAGE_LIMIT ||
    !signature
  ) {
    return 0;
  }

  const expected = signMessageCount(count);
  const suppliedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    suppliedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(suppliedBuffer, expectedBuffer)
  ) {
    return 0;
  }

  return count;
}

function quotaCookie(count: number, request: Request): string {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${QUOTA_COOKIE}=${count}.${signMessageCount(count)}; Max-Age=${QUOTA_COOKIE_MAX_AGE}; Path=/; HttpOnly; SameSite=Lax${secure}`;
}

function quotaResponse(request: Request): Response {
  const used = getMessageCount(request);
  return new Response(JSON.stringify({ used, remaining: FREE_MESSAGE_LIMIT - used, limit: FREE_MESSAGE_LIMIT }), {
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export function GET(request: Request) {
  return quotaResponse(request);
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const windowMs = 60_000;
  const limit = 10;

  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + windowMs });
    return { allowed: true };
  }

  if (entry.count >= limit) {
    return { allowed: false, retryAfter: Math.ceil((entry.reset - now) / 1000) };
  }

  entry.count++;
  return { allowed: true };
}

export async function POST(req: Request) {
  const usedMessages = getMessageCount(req);
  if (usedMessages >= FREE_MESSAGE_LIMIT) {
    return new Response(JSON.stringify({ error: "Your 5 free messages are used. Subscribe to keep chatting.", remaining: 0 }), {
      status: 402,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed, retryAfter } = checkRateLimit(ip);

  if (!allowed) {
    return new Response(
      JSON.stringify({ error: `Rate limit exceeded. Try again in ${retryAfter}s.` }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { messages } = await req.json();

    if (!messages?.length) {
      return new Response(JSON.stringify({ error: "No messages provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const stream = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      stream: true,
      messages: [
        {
          role: "system",
          content: "You are Chai Aur Baat, a friendly and helpful AI assistant. Have natural, engaging conversations. Be concise but warm.",
        },
        ...messages,
      ],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const token = chunk.choices[0]?.delta?.content ?? "";
          if (token) controller.enqueue(encoder.encode(token));
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store",
        "Set-Cookie": quotaCookie(usedMessages + 1, req),
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: "Failed to get response" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
