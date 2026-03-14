import { NextResponse } from "next/server";
import { groq } from "@/lib/groq";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages?.length) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are Chai Aur Baat, a friendly and helpful AI assistant. Have natural, engaging conversations. Be concise but warm.",
        },
        ...messages,
      ],
    });

    const reply = response.choices?.[0]?.message?.content || "I didn't get that.";
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Failed to get response" }, { status: 500 });
  }
}
