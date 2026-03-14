import { groq } from "@/lib/groq";

// In-memory rate limit: 10 requests per minute per IP
const rateLimitMap = new Map<string, { count: number; reset: number }>();

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
      model: "llama-3.1-8b-instant",
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
      headers: { "Content-Type": "text/plain; charset=utf-8", "X-Content-Type-Options": "nosniff" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: "Failed to get response" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
