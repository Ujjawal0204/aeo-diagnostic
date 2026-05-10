"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { DiagnosticReport } from "@/lib/analyzer";
import { BrandMark } from "../components/BrandMark";
import { MonoLabel } from "../components/MonoLabel";
import { ScoreRing } from "../components/ScoreRing";
import { StatusDot } from "../components/StatusDot";
import { EngineCard } from "../components/EngineCard";

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `${y}-${mo}-${day} ${h}:${min}:${s}`;
}

function getScoreColor(score: number): string {
  if (score >= 60) return "#00D982";
  if (score >= 30) return "#FFB547";
  if (score > 0) return "#FF5C5C";
  return "#6B7280";
}

function getHeadlineTakeaway(mentionedCount: number): string {
  if (mentionedCount === 0) return "Your brand is invisible to AI shoppers.";
  if (mentionedCount === 1) return "You're missing two-thirds of AI-driven traffic.";
  if (mentionedCount === 2) return "One engine still doesn't see you.";
  return "You're visible. Now win the position battle.";
}

function priorityLabel(p: 1 | 2 | 3): { text: string; color: string } {
  if (p === 1) return { text: "CRITICAL", color: "#FF5C5C" };
  if (p === 2) return { text: "HIGH",     color: "#FFB547" };
  return           { text: "MEDIUM",    color: "#6B7280" };
}

export default function ResultsPage() {
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const router = useRouter();

  useEffect(() => {
    const raw = sessionStorage.getItem("aeo_report");
    if (!raw) { router.push("/"); return; }
    setReport(JSON.parse(raw));
  }, [router]);

  if (!report) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <MonoLabel>Loading...</MonoLabel>
      </div>
    );
  }

  const mentionedCount = report.results.filter(r => r.mentioned).length;
  const scoreColor = getScoreColor(report.overallScore);
  const sentiments = report.results.filter(r => r.mentioned).map(r => r.sentiment);
  const posCount = sentiments.filter(s => s === "positive").length;
  const neutCount = sentiments.filter(s => s === "neutral").length;
  const negCount = sentiments.filter(s => s === "negative").length;
  const bestEngine = report.topEngine;

  const STATIC_RECO = "Run this diagnostic against 5 variations of the same query — AI responses vary by phrasing.";

  return (
    <main className="min-h-screen flex flex-col">

      {/* Top bar */}
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", height: 56, display: "flex", alignItems: "center" }}>
        <div className="max-w-6xl mx-auto px-8 w-full flex items-center justify-between">
          <BrandMark />
          <button
            onClick={() => router.push("/")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 6,
              padding: "6px 12px",
              cursor: "pointer",
              transition: "border-color 150ms ease-out, color 150ms ease-out",
              color: "rgba(255,255,255,0.5)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "#00D982";
              e.currentTarget.style.color = "#00D982";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              e.currentTarget.style.color = "rgba(255,255,255,0.5)";
            }}
          >
            <ArrowLeft size={13} />
            <MonoLabel style={{ color: "inherit", fontSize: 11 }}>New diagnostic</MonoLabel>
          </button>
        </div>
      </header>

      <div className="flex-1 max-w-6xl mx-auto px-8 w-full">

        {/* Query header */}
        <section style={{ paddingTop: 48, paddingBottom: 32 }} className="fade-up">
          <MonoLabel as="p" style={{ marginBottom: 12 }}>
            QUERY ANALYZED · {formatTimestamp(report.timestamp)}
          </MonoLabel>
          <p style={{
            fontFamily: "var(--font-jbmono, 'JetBrains Mono', monospace)",
            fontSize: "clamp(20px, 2.5vw, 30px)",
            fontWeight: 500,
            color: "rgba(255,255,255,0.95)",
            lineHeight: 1.3,
            marginBottom: 16,
          }}>
            <span style={{ color: "#00D982" }}>&gt; </span>
            {report.query}
          </p>
          <div>
            <MonoLabel as="p" style={{ marginBottom: 4 }}>TESTING BRAND</MonoLabel>
            <span style={{
              fontFamily: "var(--font-jbmono, 'JetBrains Mono', monospace)",
              fontSize: 20,
              fontWeight: 500,
              color: "#00D982",
            }}>
              {report.brand}
            </span>
          </div>
        </section>

        {/* Verdict block */}
        <section
          style={{ background: "#13161B", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", padding: 32, marginBottom: 32 }}
          className="fade-up delay-100"
        >
          <div className="grid grid-cols-12 gap-8 items-start">

            {/* Score ring */}
            <div className="col-span-12 md:col-span-4 flex flex-col items-center" style={{ paddingTop: 8 }}>
              <ScoreRing score={report.overallScore} size={180} animated />
            </div>

            {/* Summary */}
            <div className="col-span-12 md:col-span-8">

              {/* Top metrics row */}
              <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 24 }}>

                {/* Engines mentioning */}
                <div style={{ flex: 1, padding: "0 0 20px 0", paddingRight: 20, borderRight: "1px solid rgba(255,255,255,0.06)" }}>
                  <MonoLabel as="p" style={{ marginBottom: 8 }}>ENGINES MENTIONING YOU</MonoLabel>
                  <span style={{ fontFamily: "var(--font-jbmono, monospace)", fontSize: 32, fontWeight: 500, color: "rgba(255,255,255,0.9)" }}>
                    {mentionedCount}
                  </span>
                  <span style={{ fontFamily: "var(--font-jbmono, monospace)", fontSize: 18, color: "rgba(255,255,255,0.3)", marginLeft: 4 }}>
                    /3
                  </span>
                </div>

                {/* Best performing */}
                <div style={{ flex: 1, padding: "0 20px 20px", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
                  <MonoLabel as="p" style={{ marginBottom: 8 }}>BEST PERFORMING</MonoLabel>
                  {bestEngine ? (
                    <span style={{ fontFamily: "var(--font-jbmono, monospace)", fontSize: 16, fontWeight: 500, color: "#00D982" }}>
                      {bestEngine}
                    </span>
                  ) : (
                    <span style={{ fontFamily: "var(--font-jbmono, monospace)", fontSize: 24, color: "#6B7280" }}>—</span>
                  )}
                </div>

                {/* Sentiment */}
                <div style={{ flex: 1, padding: "0 0 20px 20px" }}>
                  <MonoLabel as="p" style={{ marginBottom: 10 }}>SENTIMENT TREND</MonoLabel>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {[
                      { label: "POS", count: posCount, color: "#00D982" },
                      { label: "NEU", count: neutCount, color: "#FFB547" },
                      { label: "NEG", count: negCount, color: "#FF5C5C" },
                    ].map(({ label, count, color }) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontFamily: "var(--font-jbmono, monospace)", fontSize: 9, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", width: 22 }}>{label}</span>
                        <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ width: `${count > 0 ? (count / mentionedCount) * 100 : 0}%`, height: "100%", background: color, borderRadius: 2, transition: "width 800ms cubic-bezier(0.22,1,0.36,1)" }} />
                        </div>
                        <span style={{ fontFamily: "var(--font-jbmono, monospace)", fontSize: 10, color: "rgba(255,255,255,0.35)", width: 10 }}>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Summary + takeaway */}
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.65, marginBottom: 16 }}>
                {report.summary}
              </p>
              <p style={{ fontSize: 17, fontWeight: 500, color: "rgba(255,255,255,0.9)", lineHeight: 1.45 }}>
                {getHeadlineTakeaway(mentionedCount)}
              </p>
            </div>
          </div>
        </section>

        {/* Engine breakdown */}
        <section style={{ marginBottom: 32 }} className="fade-up delay-200">
          <MonoLabel as="p" style={{ marginBottom: 20 }}>ENGINE BREAKDOWN</MonoLabel>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {report.results.map(r => (
              <EngineCard key={r.modelKey} result={r} animated />
            ))}
          </div>
        </section>

        {/* Recommendations */}
        {(report.coachReport || true) && (
          <section style={{ marginBottom: 64 }} className="fade-up delay-300">
            <div style={{ background: "#13161B", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", padding: 28 }}>
              <MonoLabel as="p" style={{ marginBottom: 24 }}>NEXT STEPS · PRIORITIZED</MonoLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {report.coachReport?.actions.map((action, i) => {
                  const { text: priText, color: priColor } = priorityLabel(action.priority);
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 16,
                        padding: "20px 0",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <div style={{
                        width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                        background: "rgba(0,217,130,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <span style={{ fontFamily: "var(--font-jbmono, monospace)", fontSize: 11, fontWeight: 600, color: "#00D982" }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, marginBottom: 4 }}>
                          {action.action}
                        </p>
                        <MonoLabel style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
                          {action.tactic} · {action.expectedLift} lift
                        </MonoLabel>
                      </div>
                      <span style={{ fontFamily: "var(--font-jbmono, monospace)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: priColor, flexShrink: 0, paddingTop: 2 }}>
                        {priText}
                      </span>
                    </div>
                  );
                })}

                {/* Static 4th recommendation — always shown */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: "20px 0" }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                    background: "rgba(0,217,130,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontFamily: "var(--font-jbmono, monospace)", fontSize: 11, fontWeight: 600, color: "#00D982" }}>
                      {String((report.coachReport?.actions.length ?? 0) + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>
                      {STATIC_RECO}
                    </p>
                  </div>
                  <span style={{ fontFamily: "var(--font-jbmono, monospace)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B7280", flexShrink: 0, paddingTop: 2 }}>
                    MEDIUM
                  </span>
                </div>

                {/* Paper citation */}
                {report.coachReport && (
                  <div style={{ paddingTop: 16 }}>
                    <MonoLabel style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>
                      ¹ Aggarwal et al., &ldquo;GEO: Generative Engine Optimization.&rdquo; KDD 2024. arxiv:2311.09735
                    </MonoLabel>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "20px 0" }}>
        <div className="max-w-6xl mx-auto px-8 flex items-center justify-between">
          <MonoLabel style={{ fontSize: 10 }}>
            ANALYZED {formatTimestamp(report.timestamp)}
          </MonoLabel>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <StatusDot color={report.overallScore >= 60 ? "signal" : report.overallScore >= 30 ? "warn" : report.overallScore > 0 ? "danger" : "slate"} size={5} />
              <MonoLabel style={{ fontSize: 10, color: scoreColor }}>
                {report.overallScore}/100
              </MonoLabel>
            </div>
            <MonoLabel style={{ fontSize: 10 }}>POWERED BY OLLAMA · LOCAL</MonoLabel>
          </div>
        </div>
      </footer>
    </main>
  );
}
