"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Message = { role: "user" | "assistant"; content: string };

const TeaCup = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none">
    <path d="M5 9 L6.5 18 Q7 19.5 8.5 19.5 L15.5 19.5 Q17 19.5 17.5 18 L19 9 Z" fill="white" opacity="0.95"/>
    <path d="M19 11 Q23 11 23 14 Q23 17 19 17" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
    <ellipse cx="12" cy="20.5" rx="7" ry="1.2" fill="white" opacity="0.3"/>
    <path d="M9 8 Q8.5 6 9 4.5" stroke="white" strokeWidth="1.1" strokeLinecap="round" opacity="0.7"/>
    <path d="M12 7.5 Q11.5 5.5 12 4" stroke="white" strokeWidth="1.1" strokeLinecap="round" opacity="0.7"/>
    <path d="M15 8 Q14.5 6 15 4.5" stroke="white" strokeWidth="1.1" strokeLinecap="round" opacity="0.7"/>
  </svg>
);

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated }),
      });
      const data = await res.json();
      setMessages([...updated, { role: "assistant", content: data.reply || data.error }]);
    } catch {
      setMessages([...updated, { role: "assistant", content: "Something went wrong. Try again." }]);
    }

    setLoading(false);
  };

  return (
    <div className="relative flex flex-col h-screen overflow-hidden bg-[#030712]">

      {/* Aurora blobs — warm chai colors */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="aurora-blob absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-orange-600/20 blur-[120px]" />
        <div className="aurora-blob absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-violet-600/20 blur-[120px]" style={{ animationDelay: "4s" }} />
        <div className="aurora-blob absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-pink-600/10 blur-[100px]" style={{ animationDelay: "8s" }} />
      </div>

      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }}
      />

      {/* Header */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex items-center gap-3 px-6 py-4 border-b border-white/[0.06] backdrop-blur-xl bg-white/[0.03]"
      >
        <div className="float">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 via-pink-500 to-violet-500 flex items-center justify-center shadow-lg shadow-orange-500/30 p-1.5">
            <TeaCup className="w-full h-full" />
          </div>
        </div>
        <div>
          <p className="text-sm text-white leading-none tracking-widest font-bold">CHAI AUR BAAT</p>
          <p className="text-[10px] text-white/30 mt-0.5 tracking-[0.2em] uppercase">AI companion · always online</p>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span className="text-xs text-white/30">online</span>
        </div>
      </motion.header>

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center h-full gap-5 text-center pt-20"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 via-pink-500 to-violet-500 flex items-center justify-center shadow-2xl shadow-orange-500/40 p-4"
              >
                <TeaCup className="w-full h-full" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-orange-300 via-pink-300 to-violet-300 bg-clip-text text-transparent tracking-wider">
                  CHAI AUR BAAT
                </h1>
                <p className="text-white/40 text-xs mt-2 max-w-xs tracking-widest uppercase">
                  Apne AI companion se baat karo ☕
                </p>
              </div>

              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {["Ek joke sunao 😄", "Kya kar sakte ho?", "Ek poem likho 🌸", "Koi fun fact batao"].map((s) => (
                  <motion.button
                    key={s}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setInput(s)}
                    className="px-3 py-1.5 rounded-full text-xs border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/90 transition backdrop-blur-sm"
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 via-pink-500 to-violet-500 flex items-center justify-center shrink-0 mt-1 shadow-md shadow-orange-500/30 p-1">
                  <TeaCup className="w-full h-full" />
                </div>
              )}
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line backdrop-blur-md ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-orange-600/80 via-pink-600/80 to-violet-600/80 text-white rounded-br-sm border border-orange-400/20 shadow-lg shadow-orange-500/20"
                    : "bg-white/[0.06] border border-white/[0.08] text-white/90 rounded-bl-sm shadow-lg"
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}

          {loading && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-start gap-2"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 via-pink-500 to-violet-500 flex items-center justify-center shrink-0 shadow-md shadow-orange-500/30 p-1">
                <TeaCup className="w-full h-full" />
              </div>
              <div className="bg-white/[0.06] border border-white/[0.08] px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center backdrop-blur-md">
                {[0, 150, 300].map((delay, i) => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 bg-orange-400 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: delay / 1000 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        className="relative z-10 border-t border-white/[0.06] backdrop-blur-xl bg-white/[0.03] px-4 py-4"
      >
        <div className="max-w-2xl mx-auto flex gap-2 items-center">
          <input
            className="flex-1 bg-white/[0.06] border border-white/[0.1] hover:border-orange-500/40 focus:border-orange-500/70 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none transition backdrop-blur-md"
            placeholder="Kuch bolo... ☕"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={send}
            disabled={!input.trim() || loading}
            className="bg-gradient-to-br from-orange-600 via-pink-600 to-violet-600 hover:from-orange-500 hover:via-pink-500 hover:to-violet-500 disabled:opacity-30 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl transition shadow-lg shadow-orange-500/30"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </motion.button>
        </div>
      </motion.div>

    </div>
  );
}
