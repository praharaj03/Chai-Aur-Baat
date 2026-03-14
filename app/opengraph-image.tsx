import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #030712 0%, #1a0a2e 50%, #030712 100%)",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow blobs */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(249,115,22,0.25) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)",
          }}
        />

        {/* Dot grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Tea cup icon */}
        <div
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "28px",
            background: "linear-gradient(135deg, #f97316, #ec4899, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "32px",
            boxShadow: "0 0 60px rgba(249,115,22,0.5), 0 0 120px rgba(139,92,246,0.3)",
          }}
        >
          <span style={{ fontSize: "64px" }}>☕</span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "80px",
            fontWeight: 900,
            letterSpacing: "6px",
            background: "linear-gradient(90deg, #fdba74, #f472b6, #c084fc)",
            backgroundClip: "text",
            color: "transparent",
            marginBottom: "16px",
            textAlign: "center",
          }}
        >
          CHAI AUR BAAT
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "24px",
            color: "rgba(255,255,255,0.45)",
            letterSpacing: "4px",
            textTransform: "uppercase",
            marginBottom: "40px",
          }}
        >
          Apne AI Companion Se Baat Karo
        </div>

        {/* Bottom badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 24px",
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#34d399",
            }}
          />
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "16px", letterSpacing: "2px" }}>
            POWERED BY GROQ AI
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
