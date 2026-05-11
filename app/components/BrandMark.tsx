import { Waveform } from "./Waveform";

export function BrandMark() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Waveform size={16} />
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <span
          style={{
            fontFamily: "var(--font-jbmono, 'JetBrains Mono', monospace)",
            fontSize: 16,
            fontWeight: 500,
            letterSpacing: "-0.01em",
            color: "rgba(255,255,255,0.95)",
          }}
        >
          aeo
        </span>
        <span style={{ color: "rgba(255,255,255,0.22)", fontSize: 13, lineHeight: 1 }}>·</span>
        <span
          style={{
            fontSize: 14,
            fontWeight: 400,
            color: "rgba(255,255,255,0.52)",
            letterSpacing: "0.01em",
          }}
        >
          diagnostic
        </span>
      </div>
      <span
        style={{
          fontFamily: "var(--font-jbmono, 'JetBrains Mono', monospace)",
          fontSize: 10,
          letterSpacing: "0.08em",
          padding: "2px 8px",
          borderRadius: 999,
          border: "1px solid rgba(0,217,130,0.3)",
          color: "#00D982",
          lineHeight: 1.6,
        }}
      >
        BETA
      </span>
    </div>
  );
}
