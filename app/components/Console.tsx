import { ReactNode } from "react";

interface ConsoleProps {
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  loading?: boolean;
}

export function Console({ title = "DIAGNOSTIC CONSOLE", children, footer, loading }: ConsoleProps) {
  return (
    <div style={{
      background: "#13161B",
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.06)",
      overflow: "hidden",
      position: "relative",
    }}>
      {/* Top strip */}
      <div style={{
        height: 32,
        background: "#1A1E25",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "0 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <span style={{
          fontFamily: "var(--font-jbmono, 'JetBrains Mono', monospace)",
          fontSize: 11,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.4)",
        }}>
          {title}
        </span>
        <div style={{ display: "flex", gap: 5 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
          ))}
        </div>
      </div>

      {/* Body */}
      {children}

      {/* Footer strip */}
      {footer && (
        <div style={{
          background: "#1A1E25",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "0 16px",
          minHeight: 36,
          display: "flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          {footer}
          {/* Progress bar — shown when loading */}
          {loading && (
            <div style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              height: 2,
              background: "#00D982",
              opacity: 0.8,
            }} className="progress-bar" />
          )}
        </div>
      )}
    </div>
  );
}
