import type { Metadata } from "next";
import { Russo_One, Orbitron } from "next/font/google";
import "./globals.css";

const russo = Russo_One({
  variable: "--font-russo",
  subsets: ["latin"],
  weight: "400",
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const BASE_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NEXT_PUBLIC_SITE_URL ?? "https://chai-aur-baat-ds8g-3tixrkqdt-praharaj25.vercel.app";

export const metadata: Metadata = {
  title: "CHAI AUR BAAT — AI Chat",
  description: "Chai aur baat karo apne AI companion ke saath. A friendly AI chatbot powered by Groq.",
  keywords: ["AI chat", "chatbot", "Chai Aur Baat", "Groq AI", "Hindi chatbot", "AI companion"],
  authors: [{ name: "Chai Aur Baat" }],
  icons: { icon: "/icon.svg" },
  metadataBase: new URL(BASE_URL),
  openGraph: {
    title: "CHAI AUR BAAT — AI Chat",
    description: "Apne AI companion se baat karo. Powered by Groq AI.",
    url: BASE_URL,
    siteName: "Chai Aur Baat",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Chai Aur Baat — AI Chat",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CHAI AUR BAAT — AI Chat",
    description: "Apne AI companion se baat karo. Powered by Groq AI.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${russo.variable} ${orbitron.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
