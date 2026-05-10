export function BrandMark() {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <polyline
          points="1,10 4,10 6,4 8,16 10,7 12,13 14,10 19,10"
          stroke="#00D982"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <span
        style={{
          fontFamily: "var(--font-jbmono, 'JetBrains Mono', monospace)",
          fontSize: 14,
          fontWeight: 500,
          letterSpacing: "-0.01em",
          color: "rgba(255,255,255,0.9)",
        }}
      >
        aeo
      </span>
      <span style={{ color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-jbmono, monospace)", fontSize: 12 }}>·</span>
      <span
        style={{
          fontFamily: "var(--font-jbmono, 'JetBrains Mono', monospace)",
          fontSize: 14,
          fontWeight: 400,
          letterSpacing: "-0.01em",
          color: "rgba(255,255,255,0.4)",
        }}
      >
        diagnostic
      </span>
      <span
        style={{
          fontFamily: "var(--font-jbmono, 'JetBrains Mono', monospace)",
          fontSize: 10,
          letterSpacing: "0.06em",
          padding: "2px 7px",
          borderRadius: 999,
          border: "1px solid rgba(0,217,130,0.3)",
          color: "#00D982",
          marginLeft: 4,
        }}
      >
        BETA
      </span>
    </div>
  );
}
