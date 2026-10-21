import { createHmac, timingSafeEqual } from "node:crypto";

// In-memory rate limit: 10 requests per minute per IP
const rateLimitMap = new Map<string, { count: number; reset: number }>();
const PROVIDER_REQUESTS_PER_MINUTE = 15;
const providerRequestTimes: number[] = [];
const FREE_MESSAGE_LIMIT = 5;
const FREE_MESSAGE_COOLDOWN_MS = 3 * 60 * 1000;
const QUOTA_COOKIE = "free_message_count";
const QUOTA_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const SYSTEM_INSTRUCTION =
  "You are Chai Aur Baat, a friendly and helpful AI assistant. Always respond in English, even if the user writes in another language. Answer factual questions using your knowledge, but clearly say when a question depends on current information you cannot verify. Never invent sources or citations. For greetings and casual conversation, respond naturally. Be concise but warm.";

type ChatMessage = { role: "user" | "assistant"; content: string };
type QuotaState = { used: number; cooldownUntil: number };

type ProviderConfig = {
  kind: "gemini" | "openai-compatible";
  apiKey: string;
  model: string;
  baseUrl: string;
};

function getProvider(): ProviderConfig | null {
  const kind = (process.env.LLM_PROVIDER || "gemini").toLowerCase();
  const apiKey = kind === "gemini"
    ? process.env.GEMINI_API_KEY
    : process.env.LLM_API_KEY;
  if (!apiKey) return null;

  if (kind === "gemini") {
    return {
      kind,
      apiKey,
      model: process.env.LLM_MODEL || "gemini-3.5-flash-lite",
      baseUrl: process.env.LLM_BASE_URL || "https://generativelanguage.googleapis.com/v1beta",
    };
  }
  if (kind === "openai-compatible") {
    const baseUrl = process.env.LLM_BASE_URL;
    const model = process.env.LLM_MODEL;
    if (!baseUrl || !model) return null;
    return { kind, apiKey, model, baseUrl: baseUrl.replace(/\/$/, "") };
  }
  return null;
}

function getProviderKey(): string | undefined {
  return getProvider()?.apiKey;
}

function getCookieSecret(): string {
  const secret = process.env.CHAT_COOKIE_SECRET || getProviderKey();
  if (!secret) {
    throw new Error("Configure the selected LLM provider or set CHAT_COOKIE_SECRET");
  }
  return secret;
}

function signQuota(payload: string): string {
  return createHmac("sha256", getCookieSecret()).update(payload).digest("base64url");
}

function hasValidSignature(payload: string, signature: string): boolean {
  const expectedBuffer = Buffer.from(signQuota(payload));
  const suppliedBuffer = Buffer.from(signature);
  return (
    suppliedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(suppliedBuffer, expectedBuffer)
  );
}

function getQuotaState(request: Request, now = Date.now()): { state: QuotaState; refreshCookie: boolean } {
  const cookie = request.headers.get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${QUOTA_COOKIE}=`))
    ?.slice(QUOTA_COOKIE.length + 1);

  if (!cookie) return { state: { used: 0, cooldownUntil: 0 }, refreshCookie: false };

  const parts = cookie.split(".");
  const used = Number(parts[0]);
  if (
    !Number.isInteger(used) ||
    used < 0 ||
    used > FREE_MESSAGE_LIMIT
  ) {
    return { state: { used: 0, cooldownUntil: 0 }, refreshCookie: false };
  }

  if (parts.length === 2) {
    if (!hasValidSignature(String(used), parts[1])) {
      return { state: { used: 0, cooldownUntil: 0 }, refreshCookie: false };
    }

    const cooldownUntil = used === FREE_MESSAGE_LIMIT ? now + FREE_MESSAGE_COOLDOWN_MS : 0;
    return { state: { used, cooldownUntil }, refreshCookie: true };
  }

  const cooldownUntil = Number(parts[1]);
  const payload = `${used}.${parts[1]}`;
  if (
    parts.length !== 3 ||
    !Number.isSafeInteger(cooldownUntil) ||
    cooldownUntil < 0 ||
    !hasValidSignature(payload, parts[2])
  ) {
    return { state: { used: 0, cooldownUntil: 0 }, refreshCookie: false };
  }

  if (cooldownUntil > 0 && cooldownUntil <= now) {
    return { state: { used: 0, cooldownUntil: 0 }, refreshCookie: true };
  }

  return { state: { used, cooldownUntil }, refreshCookie: false };
}

function quotaCookie(state: QuotaState, request: Request): string {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  const payload = `${state.used}.${state.cooldownUntil}`;
  return `${QUOTA_COOKIE}=${payload}.${signQuota(payload)}; Max-Age=${QUOTA_COOKIE_MAX_AGE}; Path=/; HttpOnly; SameSite=Lax${secure}`;
}

function jsonResponse(body: object, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export function GET(request: Request) {
  try {
    const { state, refreshCookie } = getQuotaState(request);
    const response = jsonResponse({
      used: state.used,
      remaining: FREE_MESSAGE_LIMIT - state.used,
      limit: FREE_MESSAGE_LIMIT,
      waitSeconds: Math.max(0, Math.ceil((state.cooldownUntil - Date.now()) / 1000)),
    });
    if (refreshCookie) response.headers.set("Set-Cookie", quotaCookie(state, request));
    return response;
  } catch (error) {
    console.error("Chat configuration error:", error);
    return jsonResponse({ error: "Chat is not configured. Check the selected LLM provider settings." }, 503);
  }
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

function checkProviderRateLimit(now = Date.now()): { allowed: boolean; retryAfter?: number } {
  while (providerRequestTimes.length > 0 && providerRequestTimes[0] <= now - 60_000) {
    providerRequestTimes.shift();
  }

  if (providerRequestTimes.length >= PROVIDER_REQUESTS_PER_MINUTE) {
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((providerRequestTimes[0] + 60_000 - now) / 1000)),
    };
  }

  providerRequestTimes.push(now);
  return { allowed: true };
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Record<string, unknown>;
  return (
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string" &&
    message.content.trim().length > 0
  );
}

function getText(parts: unknown): string {
  if (!Array.isArray(parts)) return "";
  return parts
    .map((part) => {
      if (part && typeof part === "object" && "text" in part && typeof part.text === "string") {
        return part.text;
      }
      return "";
    })
    .join("");
}

export async function POST(req: Request) {
  const provider = getProvider();
  if (!provider) {
    return jsonResponse({ error: "Chat is not configured. Check LLM_PROVIDER and its required environment variables." }, 503);
  }

  let quota: QuotaState;
  let refreshCookie: boolean;
  try {
    ({ state: quota, refreshCookie } = getQuotaState(req));
  } catch (error) {
    console.error("Chat configuration error:", error);
    return jsonResponse({ error: "Chat is not configured. Check LLM_PROVIDER and its required environment variables." }, 503);
  }

  if (quota.cooldownUntil > Date.now()) {
    const waitSeconds = Math.ceil((quota.cooldownUntil - Date.now()) / 1000);
    const response = jsonResponse({
      error: `You’ve used your 5 free messages. You can chat again in ${waitSeconds}s, or upgrade to skip the wait.`,
      remaining: 0,
      waitSeconds,
      cooldown: true,
    }, 429);
    if (refreshCookie) response.headers.set("Set-Cookie", quotaCookie(quota, req));
    return response;
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed, retryAfter } = checkRateLimit(ip);
  if (!allowed) {
    return jsonResponse({ error: `Rate limit exceeded. Try again in ${retryAfter}s.` }, 429);
  }

  try {
    const body: unknown = await req.json();
    if (
      !body ||
      typeof body !== "object" ||
      !("messages" in body) ||
      !Array.isArray(body.messages) ||
      body.messages.length === 0 ||
      !body.messages.every(isChatMessage)
    ) {
      return jsonResponse({ error: "Please provide a non-empty list of valid messages." }, 400);
    }

    const providerRate = checkProviderRateLimit();
    if (!providerRate.allowed) {
      const waitSeconds = providerRate.retryAfter ?? 60;
      return new Response(JSON.stringify({
        error: `Chat is temporarily busy. Please wait ${waitSeconds}s before trying again.`,
        waitSeconds,
      }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
          "Retry-After": String(waitSeconds),
        },
      });
    }

    const apiUrl = provider.kind === "gemini"
      ? new URL(`${provider.baseUrl}/models/${provider.model}:streamGenerateContent?alt=sse`)
      : new URL(`${provider.baseUrl}/chat/completions`);
    const providerResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(provider.kind === "gemini"
          ? { "x-goog-api-key": provider.apiKey }
          : { Authorization: `Bearer ${provider.apiKey}` }),
      },
      body: JSON.stringify(provider.kind === "gemini"
        ? {
            systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
            contents: body.messages.map((message: ChatMessage) => ({
              role: message.role === "assistant" ? "model" : "user",
              parts: [{ text: message.content }],
            })),
          }
        : {
            model: provider.model,
            stream: true,
            messages: [
              { role: "system", content: SYSTEM_INSTRUCTION },
              ...body.messages,
            ],
          }),
    });

    if (!providerResponse.ok || !providerResponse.body) {
      const providerError: unknown = await providerResponse.json().catch(() => null);
      console.error("LLM provider API error:", providerResponse.status, providerError);
      if (providerResponse.status === 429) {
        return new Response(JSON.stringify({
          error: "The AI provider is temporarily rate-limited. Please wait a minute and try again.",
          waitSeconds: 60,
        }), {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
            "Retry-After": "60",
          },
        });
      }
      return jsonResponse({
        error: `The AI provider request failed (${providerResponse.status}). Check the provider URL, model, and API key.`,
      }, 502);
    }

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        const reader = providerResponse.body!.getReader();
        const decoder = new TextDecoder();
        let pending = "";

        const consumeEvent = (event: string) => {
          const data = event
            .split(/\r?\n/)
            .filter((line) => line.startsWith("data:"))
            .map((line) => line.slice(5).trim())
            .join("\n");
          if (!data || data === "[DONE]") return;

          const chunk: unknown = JSON.parse(data);
          if (!chunk || typeof chunk !== "object") return;
          if (provider.kind === "openai-compatible") {
            const choices = "choices" in chunk ? chunk.choices : undefined;
            if (!Array.isArray(choices) || !choices[0] || typeof choices[0] !== "object") return;
            const delta = "delta" in choices[0] ? choices[0].delta : undefined;
            if (delta && typeof delta === "object" && "content" in delta && typeof delta.content === "string") {
              controller.enqueue(encoder.encode(delta.content));
            }
            return;
          }
          const candidates = "candidates" in chunk ? chunk.candidates : undefined;
          if (!Array.isArray(candidates) || !candidates[0] || typeof candidates[0] !== "object") return;

          const candidate = candidates[0];
          const content = "content" in candidate ? candidate.content : undefined;
          if (content && typeof content === "object" && "parts" in content) {
            const text = getText(content.parts);
            if (text) controller.enqueue(encoder.encode(text));
          }
        };

        try {
          while (true) {
            const { done, value } = await reader.read();
            pending += decoder.decode(value, { stream: !done });
            const events = pending.split(/\r?\n\r?\n/);
            pending = events.pop() ?? "";
            for (const event of events) consumeEvent(event);
            if (done) break;
          }
          if (pending.trim()) consumeEvent(pending);

          controller.close();
        } catch (error) {
          console.error("LLM provider stream error:", error);
          controller.error(error);
        } finally {
          reader.releaseLock();
        }
      },
    });

    const nextUsed = quota.used + 1;
    const nextQuota: QuotaState = {
      used: nextUsed,
      cooldownUntil: nextUsed === FREE_MESSAGE_LIMIT ? Date.now() + FREE_MESSAGE_COOLDOWN_MS : 0,
    };
    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store",
        "Set-Cookie": quotaCookie(nextQuota, req),
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return jsonResponse({ error: "Failed to get a response from the AI provider. Please try again." }, 502);
  }
}
