type PillVariant = "success" | "warning" | "danger" | "neutral";

interface PillProps {
  children: React.ReactNode;
  variant?: PillVariant;
}

const VARIANT_STYLES: Record<PillVariant, { background: string; color: string; border: string }> = {
  success: { background: "rgba(0,217,130,0.1)", color: "#00D982", border: "1px solid rgba(0,217,130,0.2)" },
  warning: { background: "rgba(255,181,71,0.1)", color: "#FFB547", border: "1px solid rgba(255,181,71,0.2)" },
  danger: { background: "rgba(255,92,92,0.1)", color: "#FF5C5C", border: "1px solid rgba(255,92,92,0.2)" },
  neutral: { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" },
};

export function Pill({ children, variant = "neutral" }: PillProps) {
  const s = VARIANT_STYLES[variant];
  return (
    <span
      style={{
        fontFamily: "var(--font-jbmono, 'JetBrains Mono', monospace)",
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        padding: "2px 8px",
        borderRadius: 4,
        display: "inline-block",
        ...s,
      }}
    >
      {children}
    </span>
  );
}
