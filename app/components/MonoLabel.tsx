import { CSSProperties } from "react";

interface MonoLabelProps {
  children: React.ReactNode;
  accent?: boolean;
  className?: string;
  style?: CSSProperties;
  as?: "span" | "p" | "div";
}

export function MonoLabel({ children, accent, className, style, as: Tag = "span" }: MonoLabelProps) {
  return (
    <Tag
      className={className}
      style={{
        fontFamily: "var(--font-jbmono, 'JetBrains Mono', monospace)",
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: accent ? "#00D982" : "rgba(255,255,255,0.4)",
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
