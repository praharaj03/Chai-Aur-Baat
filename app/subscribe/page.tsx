"use client";

import Link from "next/link";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

const UPI_ID = "abhisekpraharaj246-1@oksbi";
const SUBSCRIPTION_PRICE_INR = Number(process.env.NEXT_PUBLIC_SUBSCRIPTION_PRICE_INR ?? "99");
const SUBSCRIPTION_DAYS = Number(process.env.NEXT_PUBLIC_SUBSCRIPTION_DAYS ?? "30");
const paymentUrl = `upi://pay?${new URLSearchParams({
  pa: UPI_ID,
  pn: "Chai Aur Baat",
  am: String(SUBSCRIPTION_PRICE_INR),
  cu: "INR",
  tn: `Chai Aur Baat - ${SUBSCRIPTION_DAYS}-day subscription`,
})}`;

export default function SubscribePage() {
  const [copied, setCopied] = useState(false);

  async function copyUpiId() {
    await navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070511] px-5 py-12 text-white">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-700/25 blur-[110px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-[30rem] w-[30rem] rounded-full bg-fuchsia-700/20 blur-[130px]" />

      <section className="relative z-10 w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#100c1c]/90 shadow-2xl shadow-violet-950/50 backdrop-blur-xl">
        <div className="grid md:grid-cols-[1.1fr_0.9fr]">
          <div className="p-7 sm:p-10 lg:p-14">
            <Link href="/" className="text-sm font-medium text-violet-200 transition hover:text-white">
              ← Back to chat
            </Link>

            <p className="mt-12 text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">
              Chai Aur Baat Plus
            </p>
            <h1 className="mt-4 max-w-xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">
              Good conversations
              <span className="block bg-gradient-to-r from-violet-300 via-fuchsia-300 to-indigo-300 bg-clip-text text-transparent">
                shouldn’t stop.
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/60">
              Enjoy five free messages, then go Plus for more room to think,
              explore, and keep the conversation flowing.
            </p>

            <div className="mt-9 flex items-end gap-3">
              <span className="text-5xl font-bold tracking-tight">₹{SUBSCRIPTION_PRICE_INR}</span>
              <span className="pb-1 text-sm text-white/50">for {SUBSCRIPTION_DAYS} days</span>
            </div>

            <ul className="mt-8 space-y-3 text-sm text-white/75">
              <li className="flex gap-3"><span className="text-violet-300">✦</span> Keep chatting beyond your free messages</li>
              <li className="flex gap-3"><span className="text-violet-300">✦</span> A thoughtful AI companion, whenever inspiration strikes</li>
              <li className="flex gap-3"><span className="text-violet-300">✦</span> Simple UPI payment</li>
            </ul>

            <p className="mt-8 text-xs leading-5 text-white/40">
              After paying, share your UPI transaction reference with the account
              owner through your usual contact channel. Access is confirmed
              manually; this version does not activate subscriptions automatically.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center border-t border-white/10 bg-white/[0.025] p-7 sm:p-10 md:border-l md:border-t-0">
            <div className="rounded-3xl bg-white p-4 shadow-2xl shadow-violet-950/40">
              <QRCodeSVG value={paymentUrl} size={224} level="H" includeMargin />
            </div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">
              Scan with any UPI app
            </p>
            <p className="mt-2 text-sm text-white/55">Pay ₹{SUBSCRIPTION_PRICE_INR} to</p>

            <button
              type="button"
              onClick={copyUpiId}
              className="mt-3 rounded-xl border border-violet-300/20 bg-violet-400/10 px-4 py-3 text-sm font-medium text-violet-100 transition hover:border-violet-300/50 hover:bg-violet-400/15"
            >
              {copied ? "UPI ID copied" : UPI_ID}
            </button>

            <a
              href={paymentUrl}
              className="mt-4 w-full max-w-xs rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-violet-950/50 transition hover:from-violet-500 hover:to-fuchsia-500"
            >
              Open UPI app
            </a>

            <p className="mt-5 max-w-xs text-center text-xs leading-5 text-white/40">
              Keep your payment reference and contact the account owner to
              request activation after payment.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
