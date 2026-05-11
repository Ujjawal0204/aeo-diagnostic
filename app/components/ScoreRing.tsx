"use client";

import { useEffect, useState } from "react";

type RingSize = 60 | 100 | 180;

interface ScoreRingProps {
  score: number;
  size?: RingSize;
  animated?: boolean;
}

export function getScoreColor(score: number): string {
  if (score >= 60) return "#00D982";
  if (score >= 40) return "#FFB547";
  if (score >= 20) return "#FF5C5C";
  return "#6B7280";
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return "DOMINANT";
  if (score >= 60) return "VISIBLE";
  if (score >= 40) return "PARTIAL";
  if (score >= 20) return "WEAK";
  return "INVISIBLE";
}

const SIZE_CONFIG: Record<RingSize, { stroke: number; scoreFontSize: number; showLabel: boolean }> = {
  60:  { stroke: 5,  scoreFontSize: 18, showLabel: false },
  100: { stroke: 7,  scoreFontSize: 30, showLabel: false },
  180: { stroke: 10, scoreFontSize: 52, showLabel: true  },
};

export function ScoreRing({ score, size = 100, animated = true }: ScoreRingProps) {
  const [displayed, setDisplayed] = useState(animated ? 0 : score);
  const color = getScoreColor(score);
  const { stroke, scoreFontSize, showLabel } = SIZE_CONFIG[size];
  const center = size / 2;
  const radius = center - stroke / 2 - 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - displayed / 100);

  useEffect(() => {
    if (!animated) { setDisplayed(score); return; }
    const start = performance.now();
    const duration = 1200;
    const frame = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      setDisplayed(Math.round(score * eased));
      if (t < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [score, animated]);

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: "rotate(-90deg)" }}
        aria-label={`Score: ${score} out of 100`}
        role="img"
      >
        {/* Track */}
        <circle cx={center} cy={center} r={radius} stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} fill="none" />
        {/* Progress arc */}
        <circle
          cx={center} cy={center} r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: animated ? "stroke-dashoffset 50ms linear" : "none" }}
        />
      </svg>
      {/* Center content */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{
          fontFamily: "var(--font-jbmono, 'JetBrains Mono', monospace)",
          fontSize: scoreFontSize,
          fontWeight: 500,
          lineHeight: 1,
          color: score > 0 ? color : "#6B7280",
          fontVariantNumeric: "tabular-nums",
        }}>
          {displayed}
        </span>
        <span style={{
          fontFamily: "var(--font-jbmono, 'JetBrains Mono', monospace)",
          fontSize: size >= 180 ? 13 : 10,
          color: "rgba(255,255,255,0.3)",
          marginTop: 4,
        }}>
          /100
        </span>
        {showLabel && (
          <span style={{
            fontFamily: "var(--font-jbmono, 'JetBrains Mono', monospace)",
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color,
            marginTop: 10,
          }}>
            {getScoreLabel(score)}
          </span>
        )}
      </div>
    </div>
  );
}
