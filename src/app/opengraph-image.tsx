import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Pregatire Licenta UTM - 665 grile informatica";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0C0C0E 0%, #1C1C22 50%, #0C0C0E 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Grid pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(232,166,49,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(232,166,49,0.05) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 20px",
            borderRadius: "100px",
            border: "1px solid #2A2A32",
            background: "#141418",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#34D399",
            }}
          />
          <span style={{ color: "#9B978F", fontSize: "16px", letterSpacing: "2px", textTransform: "uppercase" }}>
            Sesiunea 2026
          </span>
        </div>

        {/* Title */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "#E8E6E1", fontSize: "72px", fontWeight: 800, lineHeight: 1.1 }}>
            Pregătire{" "}
            <span style={{ color: "#E8A631" }}>Licență</span>
          </span>
          <span style={{ color: "#E8E6E1", fontSize: "72px", fontWeight: 800, lineHeight: 1.1 }}>
            UTM
          </span>
        </div>

        {/* Description */}
        <p style={{ color: "#9B978F", fontSize: "24px", marginTop: "24px", textAlign: "center", maxWidth: "700px" }}>
          665 grile gratuite - Informatică
        </p>

        {/* Module pills */}
        <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
          {[
            { name: "Programare", color: "#A78BFA" },
            { name: "Baze de Date", color: "#34D399" },
            { name: "Rețele", color: "#F97316" },
            { name: "Web", color: "#38BDF8" },
          ].map((mod) => (
            <div
              key={mod.name}
              style={{
                padding: "8px 20px",
                borderRadius: "8px",
                background: `${mod.color}15`,
                border: `1px solid ${mod.color}40`,
                color: mod.color,
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              {mod.name}
            </div>
          ))}
        </div>

        {/* URL */}
        <span style={{ position: "absolute", bottom: "32px", color: "#6B675F", fontSize: "18px" }}>
          utmlearn.com
        </span>
      </div>
    ),
    { ...size }
  );
}
