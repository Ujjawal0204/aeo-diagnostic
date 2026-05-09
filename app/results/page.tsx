"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DiagnosticReport, AnalysisResult } from "@/lib/analyzer";

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

function ScoreNumber({ score, mentioned, color }: { score: number; mentioned: boolean; color: string }) {
  if (!mentioned) {
    return <div className="font-serif" style={{ fontSize: 56, fontWeight: 300, lineHeight: 1, color: "var(--ink-3)", letterSpacing: "-0.04em" }}>—</div>;
  }
  return (
    <div className="font-serif tabular" style={{ fontSize: 56, fontWeight: 500, lineHeight: 1, color, letterSpacing: "-0.04em" }}>
      <AnimatedNumber value={score} />
    </div>
  );
}

function StatusLine({ result }: { result: AnalysisResult }) {
  if (!result.mentioned) {
    return <span className="font-serif italic" style={{ fontSize: 14, color: "var(--accent)" }}>Not mentioned</span>;
  }
  const sentimentColor = result.sentiment === "positive" ? "var(--positive)" : result.sentiment === "negative" ? "var(--accent)" : "var(--warning)";
  const positionLabel = result.positionLabel === "top" ? "Mentioned · early" : result.positionLabel === "middle" ? "Mentioned · mid-response" : "Mentioned · buried";
  return <span className="font-serif italic" style={{ fontSize: 14, color: sentimentColor }}>{positionLabel}</span>;
}

function ModelColumn({ result, index }: { result: AnalysisResult; index: number }) {
  const color = result.score >= 70 ? "var(--positive)" : result.score >= 40 ? "var(--warning)" : "var(--accent)";
  return (
    <div className="fade-up" style={{ animationDelay: `${400 + index * 150}ms` }}>
      <div className="label mb-3">{result.modelLabel} · {result.company}</div>
      <ScoreNumber score={result.score} mentioned={result.mentioned} color={color} />
      <div className="mt-2">
        <StatusLine result={result} />
      </div>
    </div>
  );
}

function PullQuote({ text, brand }: { text: string; brand: string }) {
  // highlight brand within the quote
  const regex = new RegExp(`(${brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <blockquote className="font-serif italic" style={{ fontSize: 19, lineHeight: 1.55, color: "var(--ink)", borderLeft: "2px solid var(--ink)", paddingLeft: 20, fontWeight: 400 }}>
      "{parts.map((p, i) => regex.test(p) ? <span key={i} className="highlight">{p}</span> : <span key={i}>{p}</span>)}"
    </blockquote>
  );
}

export default function ResultsPage() {
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [expandedModel, setExpandedModel] = useState<string | null>(null);
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

  const mentionedCount = report.results.filter(r => r.mentioned).length;
  const firstQuote = report.results.find(r => r.mentionContext);
  const date = new Date(report.timestamp).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <main className="min-h-screen flex flex-col">
      {/* Masthead */}
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

        {/* Headline — dynamic */}
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

        {/* Comparison strip — three columns of pure data */}
        <section className="rule pt-10 pb-10 mb-12 border-b" style={{ borderColor: "var(--rule)" }}>
          <div className="grid grid-cols-3 gap-6">
            {report.results.map((r, i) => (
              <ModelColumn key={r.modelKey} result={r} index={i} />
            ))}
          </div>
        </section>

        {/* Body — pull quote + side observations */}
        {firstQuote && firstQuote.mentionContext && (
          <section className="mb-12 fade-up delay-500">
            <p className="label mb-4">What {firstQuote.modelLabel} said</p>
            <PullQuote text={firstQuote.mentionContext} brand={report.brand} />
          </section>
        )}

        {/* Body paragraph — meta */}
        <section className="mb-16 fade-up delay-600">
          <p className="font-serif" style={{ fontSize: 19, lineHeight: 1.65, color: "var(--ink-2)", fontWeight: 400 }}>
            {report.summary}
          </p>
        </section>

        {/* Per-engine deep dive — collapsible */}
        <section className="mb-16 fade-up delay-700">
          <p className="label mb-6">Engine notes</p>
          <div className="space-y-0">
            {report.results.map(r => (
              <div key={r.modelKey} className="border-t" style={{ borderColor: "var(--rule)" }}>
                <button
                  onClick={() => setExpandedModel(expandedModel === r.modelKey ? null : r.modelKey)}
                  className="w-full flex items-center justify-between py-5 text-left"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-[11px] tabular" style={{ color: "var(--ink-3)" }}>0{report.results.indexOf(r) + 1}</span>
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
            3 models · identical prompt · temperature 0.7
          </p>
          <p className="font-mono text-[10px] tracking-[0.15em] uppercase" style={{ color: "var(--ink-3)" }}>
            Score: <span style={{ color: "var(--ink)" }}>{mentionedCount}/3 mentions</span> · <span style={{ color: "var(--accent)" }}>{report.overallScore}/100</span>
          </p>
        </section>
      </article>
    </main>
  );
}
