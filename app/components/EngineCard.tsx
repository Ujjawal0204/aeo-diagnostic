"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { AnalysisResult } from "@/lib/analyzer";
import { ScoreRing } from "./ScoreRing";
import { StatusDot } from "./StatusDot";
import { MonoLabel } from "./MonoLabel";
import { Pill } from "./Pill";

interface EngineCardProps {
  result: AnalysisResult;
  sample?: boolean;
  animated?: boolean;
}

function sentimentVariant(s: string): "success" | "warning" | "danger" | "neutral" {
  if (s === "positive") return "success";
  if (s === "negative") return "danger";
  if (s === "neutral") return "warning";
  return "neutral";
}

function getScoreColor(score: number): string {
  if (score >= 60) return "#00D982";
  if (score >= 30) return "#FFB547";
  if (score > 0) return "#FF5C5C";
  return "#6B7280";
}

export function EngineCard({ result, sample, animated = true }: EngineCardProps) {
  const [expanded, setExpanded] = useState(false);
  const color = getScoreColor(result.score);

  const positionText = result.mentioned
    ? result.positionLabel === "top"    ? "MENTIONED · TOP OF RESPONSE"
    : result.positionLabel === "middle" ? "MENTIONED · MID-RESPONSE"
    :                                     "MENTIONED · END OF RESPONSE"
    : "NOT MENTIONED";

  return (
    <div style={{ background: "#13161B", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", display: "flex", flexDirection: "column" }}>

      {/* 2px top edge — score band color */}
      <div style={{ height: 2, background: color, flexShrink: 0 }} />

      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.9)", lineHeight: 1.3 }}>{result.modelLabel}</p>
          <MonoLabel style={{ display: "block", marginTop: 3 }}>{result.company}</MonoLabel>
        </div>
        <ScoreRing score={result.score} size={60} animated={animated} />
      </div>

      {/* Body */}
      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>

        {/* Status */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <StatusDot color={result.mentioned ? "signal" : "slate"} />
          <MonoLabel>{positionText}</MonoLabel>
        </div>

        {/* Sentiment */}
        {result.mentioned && result.sentiment !== "not_mentioned" && (
          <div>
            <Pill variant={sentimentVariant(result.sentiment)}>{result.sentiment}</Pill>
          </div>
        )}

        {/* Mention context */}
        {result.mentionContext && (
          <div style={{ background: "#0B0D10", borderRadius: 6, padding: "10px 12px", borderLeft: "2px solid rgba(0,217,130,0.35)" }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.55, fontStyle: "italic" }}>
              &ldquo;{result.mentionContext}&rdquo;
            </p>
          </div>
        )}

        {/* Competitors */}
        {result.competitors.length > 0 && (
          <div>
            <MonoLabel as="p" style={{ marginBottom: 8 }}>Also mentioned</MonoLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {result.competitors.slice(0, 4).map(c => (
                <span key={c} style={{
                  fontFamily: "var(--font-jbmono, 'JetBrains Mono', monospace)",
                  fontSize: 11,
                  padding: "2px 8px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 4,
                  color: "rgba(255,255,255,0.45)",
                }}>
                  {c}
                </span>
              ))}
              {result.competitors.length > 4 && (
                <span style={{ fontFamily: "var(--font-jbmono, monospace)", fontSize: 11, color: "rgba(255,255,255,0.3)", padding: "2px 4px" }}>
                  +{result.competitors.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Sample ribbon */}
        {sample && (
          <MonoLabel style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>sample data</MonoLabel>
        )}
      </div>

      {/* Footer toggle */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
        <button
          onClick={() => setExpanded(v => !v)}
          style={{ width: "100%", padding: "11px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "transparent", border: "none", cursor: "pointer" }}
          aria-expanded={expanded}
        >
          <MonoLabel>View raw response</MonoLabel>
          <ChevronDown size={14} color="rgba(255,255,255,0.35)" style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 150ms ease-out" }} />
        </button>
        {expanded && (
          <div style={{ background: "#0B0D10", margin: "0 12px 12px", borderRadius: 6, padding: 12, maxHeight: 240, overflowY: "auto" }}>
            <p style={{ fontFamily: "var(--font-jbmono, 'JetBrains Mono', monospace)", fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
              {result.rawResponse || "(no response)"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
