const COLOR_MAP = {
  signal:    "#00D982",
  warn:      "#FFB547",
  danger:    "#FF5C5C",
  slate:     "#6B7280",
  openai:    "#10A37F",
  anthropic: "#D97757",
  google:    "#4285F4",
} as const;

interface StatusDotProps {
  color?: keyof typeof COLOR_MAP;
  pulse?: boolean;
  size?: number;
  style?: React.CSSProperties;
}

export function StatusDot({ color = "signal", pulse, size = 6, style }: StatusDotProps) {
  return (
    <span
      className={pulse ? "pulse" : undefined}
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        background: COLOR_MAP[color],
        flexShrink: 0,
        ...style,
      }}
    />
  );
}
