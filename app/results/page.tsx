"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DiagnosticReport, CoachReport } from "@/lib/analyzer";

function AnimatedNumber({ value, duration = 1400 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, duration]);
  return <span className="tabular">{display}</span>;
}

function PullQuote({ text, brand }: { text: string; brand: string }) {
  const escaped = brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return (
    <blockquote className="font-serif italic" style={{ fontSize: 19, lineHeight: 1.55, color: "var(--ink)", borderLeft: "2px solid var(--ink)", paddingLeft: 20, fontWeight: 400 }}>
      &ldquo;{parts.map((p, i) =>
        i % 2 === 1
          ? <span key={i} className="highlight">{p}</span>
          : <span key={i}>{p}</span>
      )}&rdquo;
    </blockquote>
  );
}

function AggregateScoreSection({ report, expanded, onToggle }: {
  report: DiagnosticReport;
  expanded: boolean;
  onToggle: () => void;
}) {
  const mentionedCount = report.results.filter(r => r.mentioned).length;
  const scoreColor = report.overallScore >= 60 ? "var(--positive)" : report.overallScore >= 30 ? "var(--warning)" : "var(--accent)";

  return (
    <section className="rule pt-10 pb-10 mb-12 border-b fade-up delay-300" style={{ borderColor: "var(--rule)" }}>
      <p className="label mb-6">AEO Score</p>

      <div className="flex items-end gap-3 mb-2">
        <div className="font-serif tabular" style={{ fontSize: 80, fontWeight: 500, lineHeight: 1, color: scoreColor, letterSpacing: "-0.04em" }}>
          <AnimatedNumber value={report.overallScore} />
        </div>
        <span className="font-mono mb-4" style={{ fontSize: 14, color: "var(--ink-3)" }}>/100</span>
      </div>

      <p className="font-mono text-[12px] tracking-wider mb-6" style={{ color: "var(--ink-3)" }}>
        Mentioned by <span style={{ color: "var(--ink)" }}>{mentionedCount} of 3</span> engines
      </p>

      <button onClick={onToggle} className="btn-ghost" style={{ fontSize: 12 }}>
        {expanded ? "— Hide breakdown" : "+ View score breakdown"}
      </button>

      {expanded && (
        <div className="mt-8 fade-in">
          <div className="border-t" style={{ borderColor: "var(--rule)" }}>
            {report.results.map((r) => {
              const color = r.score >= 60 ? "var(--positive)" : r.score >= 30 ? "var(--warning)" : "var(--accent)";
              return (
                <div key={r.modelKey} className="flex items-start justify-between border-b py-5" style={{ borderColor: "var(--rule)" }}>
                  <div>
                    <p className="label mb-2">{r.modelLabel} · {r.company}</p>
                    <p className="font-serif" style={{ fontSize: 15, color: "var(--ink-2)", lineHeight: 1.4 }}>
                      {r.mentioned
                        ? `${r.positionLabel === "top" ? "Early mention" : r.positionLabel === "middle" ? "Mid-response" : "Buried"} · ${r.sentiment} sentiment`
                        : "Not mentioned"
                      }
                    </p>
                    {r.mentioned && (
                      <p className="font-mono text-[11px] mt-2" style={{ color: "var(--ink-3)" }}>
                        PAWC {r.pawcRaw.toFixed(1)} raw
                      </p>
                    )}
                  </div>
                  <span className="font-serif tabular" style={{ fontSize: 36, fontWeight: 500, lineHeight: 1, color: r.mentioned ? color : "var(--ink-3)", letterSpacing: "-0.03em" }}>
                    {r.mentioned ? r.score : "—"}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="font-mono text-[10px] mt-5 tracking-[0.12em] uppercase" style={{ color: "var(--ink-3)" }}>
            Method: Position-Adjusted Word Count · Aggarwal et al., KDD 2024 · arxiv:2311.09735
          </p>
        </div>
      )}
    </section>
  );
}

function CoachSection({ coach }: { coach: CoachReport }) {
  return (
    <section className="mb-16 fade-up delay-600">
      <div className="border-t pt-10" style={{ borderColor: "var(--rule)" }}>
        <div className="flex items-baseline justify-between mb-2">
          <p className="label">AEO Coach · 3 Actions</p>
          <p className="font-mono text-[10px] uppercase tracking-wider" style={{ color: "var(--ink-3)" }}>
            {coach.domain}
          </p>
        </div>

        <p className="font-serif mb-10" style={{ fontSize: 19, lineHeight: 1.55, color: "var(--ink-2)", fontWeight: 400 }}>
          {coach.rationale}
        </p>

        <div>
          {coach.actions.map((action, i) => (
            <div key={i} className="border-t py-8" style={{ borderColor: "var(--rule)" }}>
              <div className="flex items-baseline gap-4 mb-4">
                <span className="font-mono text-[11px] tabular" style={{ color: "var(--ink-3)" }}>0{action.priority}</span>
                <span className="label" style={{ color: "var(--ink)" }}>{action.tactic}</span>
                <span className="font-mono text-[11px]" style={{ color: "var(--accent)" }}>{action.expectedLift} lift</span>
              </div>
              <p className="font-serif italic mb-3" style={{ fontSize: 16, lineHeight: 1.55, color: "var(--ink-2)" }}>
                {action.finding}
              </p>
              <p className="font-serif" style={{ fontSize: 17, lineHeight: 1.6, color: "var(--ink)" }}>
                {action.action}
              </p>
            </div>
          ))}
          <div className="border-t" style={{ borderColor: "var(--rule)" }} />
        </div>
      </div>
    </section>
  );
}

export default function ResultsPage() {
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [expandedModel, setExpandedModel] = useState<string | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const raw = sessionStorage.getItem("aeo_report");
    if (!raw) { router.push("/"); return; }
    setReport(JSON.parse(raw));
  }, [router]);

  if (!report) return (
    <div className="min-h-screen flex items-center justify-center font-mono text-xs tracking-widest" style={{ color: "var(--ink-3)" }}>
      LOADING
    </div>
  );

  const firstQuote = report.results.find(r => r.mentionContext);
  const mentionedCount = report.results.filter(r => r.mentioned).length;
  const date = new Date(report.timestamp).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <main className="min-h-screen flex flex-col">
      <header className="w-full border-b" style={{ borderColor: "var(--rule)" }}>
        <div className="max-w-[720px] mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full" style={{ background: "var(--accent)" }} />
            <span className="font-mono text-[11px] tracking-[0.16em] uppercase">AEO · Diagnostic</span>
          </div>
          <button onClick={() => router.push("/")} className="btn-ghost">
            <span>←</span> Run another
          </button>
        </div>
      </header>

      <article className="flex-1 max-w-[720px] mx-auto px-6 w-full pt-16 pb-24">
        {/* Article meta */}
        <div className="flex items-center gap-4 mb-6 fade-up">
          <span className="kicker">A study in three machines</span>
          <span className="font-mono text-[11px]" style={{ color: "var(--ink-3)" }}>·</span>
          <span className="font-mono text-[11px] uppercase tracking-wider" style={{ color: "var(--ink-3)" }}>{date}</span>
        </div>

        {/* Headline */}
        <h1 className="font-serif fade-up delay-100" style={{ fontSize: "clamp(36px, 5vw, 52px)", lineHeight: 1.08, letterSpacing: "-0.025em", fontWeight: 400, marginBottom: 20 }}>
          {report.headline.split(report.brand).map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && <em style={{ color: "var(--accent)", fontStyle: "italic", fontWeight: 500 }}>{report.brand}</em>}
            </span>
          ))}
        </h1>

        {/* Lede */}
        <p className="font-serif fade-up delay-200" style={{ fontSize: 21, lineHeight: 1.55, color: "var(--ink-2)", fontWeight: 400, marginBottom: 48 }}>
          {report.lede}
        </p>

        {/* Aggregate AEO Score */}
        <AggregateScoreSection
          report={report}
          expanded={showBreakdown}
          onToggle={() => setShowBreakdown(v => !v)}
        />

        {/* Pull quote */}
        {firstQuote && firstQuote.mentionContext && (
          <section className="mb-12 fade-up delay-400">
            <p className="label mb-4">What {firstQuote.modelLabel} said</p>
            <PullQuote text={firstQuote.mentionContext} brand={report.brand} />
          </section>
        )}

        {/* Summary */}
        <section className="mb-16 fade-up delay-500">
          <p className="font-serif" style={{ fontSize: 19, lineHeight: 1.65, color: "var(--ink-2)", fontWeight: 400 }}>
            {report.summary}
          </p>
        </section>

        {/* AEO Coach */}
        {report.coachReport && <CoachSection coach={report.coachReport} />}

        {/* Engine notes — collapsible */}
        <section className="mb-16 fade-up delay-700">
          <p className="label mb-6">Engine notes</p>
          <div>
            {report.results.map((r, i) => (
              <div key={r.modelKey} className="border-t" style={{ borderColor: "var(--rule)" }}>
                <button
                  onClick={() => setExpandedModel(expandedModel === r.modelKey ? null : r.modelKey)}
                  className="w-full flex items-center justify-between py-5 text-left"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-[11px] tabular" style={{ color: "var(--ink-3)" }}>0{i + 1}</span>
                    <span className="font-serif" style={{ fontSize: 17, color: "var(--ink)" }}>{r.modelLabel}</span>
                    <span className="font-serif italic text-sm" style={{ color: r.mentioned ? "var(--ink-2)" : "var(--accent)" }}>
                      {r.mentioned ? `Score ${r.score}` : "Absent"}
                    </span>
                  </div>
                  <span className="font-mono text-xs" style={{ color: "var(--ink-3)" }}>
                    {expandedModel === r.modelKey ? "—" : "+"}
                  </span>
                </button>
                {expandedModel === r.modelKey && (
                  <div className="pb-6 pl-10 fade-in">
                    {r.competitors.length > 0 && (
                      <div className="mb-4">
                        <p className="label mb-2">Brands {r.modelLabel} mentioned</p>
                        <p className="font-serif" style={{ fontSize: 16, color: "var(--ink-2)" }}>
                          {r.competitors.join(" · ")}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="label mb-2">Full response</p>
                      <p className="font-serif" style={{ fontSize: 15, lineHeight: 1.6, color: "var(--ink-2)", whiteSpace: "pre-wrap" }}>
                        {r.rawResponse || "(no response)"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div className="border-t" style={{ borderColor: "var(--rule)" }} />
          </div>
        </section>

        {/* Footer methodology */}
        <section className="border-t pt-6 flex items-center justify-between fade-in delay-700" style={{ borderColor: "var(--rule)" }}>
          <p className="font-mono text-[10px] tracking-[0.15em] uppercase" style={{ color: "var(--ink-3)" }}>
            PAWC scoring · 3 models · temperature 0.7
          </p>
          <p className="font-mono text-[10px] tracking-[0.15em] uppercase" style={{ color: "var(--ink-3)" }}>
            Score: <span style={{ color: "var(--ink)" }}>{mentionedCount}/3 mentions</span> · <span style={{ color: "var(--accent)" }}>{report.overallScore}/100</span>
          </p>
        </section>
      </article>
    </main>
  );
}
