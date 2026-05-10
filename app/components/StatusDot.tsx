const COLOR_MAP = {
  signal: "#00D982",
  warn: "#FFB547",
  danger: "#FF5C5C",
  slate: "#6B7280",
} as const;

interface StatusDotProps {
  color?: keyof typeof COLOR_MAP;
  pulse?: boolean;
  size?: number;
}

export function StatusDot({ color = "signal", pulse, size = 6 }: StatusDotProps) {
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
      }}
    />
  );
}
