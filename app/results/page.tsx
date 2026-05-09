"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DiagnosticReport, AnalysisResult } from "@/lib/analyzer";

function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
      <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="5" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 36 36)" style={{ transition: "stroke-dashoffset 1s ease" }} />
      <text x="36" y="40" textAnchor="middle" fill="white" fontSize="14" fontWeight="700">{score}</text>
    </svg>
  );
}

function SentimentBadge({ sentiment }: { sentiment: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    positive: { label: "Positive ↑", cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    neutral: { label: "Neutral →", cls: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
    negative: { label: "Negative ↓", cls: "text-red-400 bg-red-500/10 border-red-500/20" },
    not_mentioned: { label: "Not Mentioned", cls: "text-white/30 bg-white/5 border-white/10" },
  };
  const { label, cls } = map[sentiment] || map.not_mentioned;
  return <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${cls}`}>{label}</span>;
}

function ModelCard({ result }: { result: AnalysisResult }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-2xl border bg-white/3 overflow-hidden transition-all" style={{ borderColor: result.mentioned ? `${result.color}30` : "rgba(255,255,255,0.06)" }}>
      <div className="h-1 w-full" style={{ backgroundColor: result.mentioned ? result.color : "rgba(255,255,255,0.06)" }} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="font-semibold text-white/90 text-sm">{result.modelLabel}</p>
            <p className="text-white/30 text-xs">{result.company}</p>
          </div>
          <ScoreRing score={result.score} color={result.mentioned ? result.color : "rgba(255,255,255,0.15)"} />
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className={`w-2 h-2 rounded-full ${result.mentioned ? "bg-emerald-400" : "bg-white/20"}`} />
          <span className="text-xs text-white/50">
            {result.mentioned ? `Mentioned · ${result.positionLabel === "top" ? "Early in response" : result.positionLabel === "middle" ? "Mid-response" : "Late in response"}` : "Not mentioned"}
          </span>
        </div>
        <SentimentBadge sentiment={result.sentiment} />
        {result.mentionContext && (
          <div className="mt-3 px-3 py-2 rounded-lg bg-white/4 border border-white/8">
            <p className="text-white/50 text-xs leading-relaxed italic">"{result.mentionContext}"</p>
          </div>
        )}
        {result.competitors.length > 0 && (
          <div className="mt-3">
            <p className="text-[10px] text-white/25 uppercase tracking-wider mb-1.5">Brands mentioned</p>
            <div className="flex flex-wrap gap-1.5">
              {result.competitors.slice(0, 4).map((c) => (
                <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/40">{c}</span>
              ))}
            </div>
          </div>
        )}
        <button onClick={() => setExpanded(!expanded)} className="mt-4 text-[10px] text-white/25 hover:text-white/50 transition-colors">
          {expanded ? "Hide" : "Show"} full response ↓
        </button>
        {expanded && (
          <div className="mt-2 p-3 rounded-lg bg-black/30 border border-white/5 max-h-40 overflow-y-auto">
            <p className="text-white/40 text-[11px] leading-relaxed whitespace-pre-wrap">{result.rawResponse}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function OverallScore({ score }: { score: number }) {
  const label = score >= 80 ? "Dominant" : score >= 60 ? "Visible" : score >= 40 ? "Partial" : score >= 20 ? "Weak" : "Invisible";
  const color = score >= 80 ? "#10B981" : score >= 60 ? "#3B82F6" : score >= 40 ? "#F59E0B" : score >= 20 ? "#EF4444" : "#6B7280";
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <circle cx="60" cy="60" r="50" fill="none" stroke={color} strokeWidth="8" strokeDasharray={`${2 * Math.PI * 50}`} strokeDashoffset={`${2 * Math.PI * 50 * (1 - score / 100)}`} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.2s ease" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{score}</span>
          <span className="text-[10px] text-white/30">/100</span>
        </div>
      </div>
      <span className="mt-2 text-sm font-semibold" style={{ color }}>{label}</span>
    </div>
  );
}

export default function ResultsPage() {
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const router = useRouter();

  useEffect(() => {
    const raw = sessionStorage.getItem("aeo_report");
    if (!raw) { router.push("/"); return; }
    setReport(JSON.parse(raw));
  }, [router]);

  if (!report) return <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center text-white/30 text-sm">Loading...</div>;

  const mentionedCount = report.results.filter((r) => r.mentioned).length;

  return (
    <main className="min-h-screen bg-[#0A0A0F] text-white">
      <header className="border-b border-white/5 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold">A</div>
          <span className="font-semibold tracking-tight text-white/90">AEO Diagnostic</span>
        </div>
        <button onClick={() => router.push("/")} className="text-xs text-white/30 hover:text-white/60 transition-colors border border-white/10 px-3 py-1.5 rounded-lg">← New Query</button>
      </header>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <p className="text-xs text-white/30 uppercase tracking-widest mb-2">Query analyzed</p>
          <h2 className="text-2xl font-bold text-white/90">"{report.query}"</h2>
          <p className="text-white/40 mt-1">Brand: <span className="text-violet-400 font-medium">{report.brand}</span></p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-8 bg-white/3 border border-white/8 rounded-2xl p-6 mb-10">
          <OverallScore score={report.overallScore} />
          <div className="flex-1">
            <p className="text-white/70 text-sm leading-relaxed mb-4">{report.summary}</p>
            <div className="flex gap-6">
              <div>
                <p className="text-2xl font-bold text-white">{mentionedCount}<span className="text-white/30 text-base">/3</span></p>
                <p className="text-xs text-white/30">Engines mention you</p>
              </div>
              {report.topEngine && (
                <div>
                  <p className="text-sm font-semibold text-violet-400">{report.topEngine}</p>
                  <p className="text-xs text-white/30">Best performing engine</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {report.results.map((result) => (
            <ModelCard key={result.modelKey} result={result} />
          ))}
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
          <h3 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-wider">What to do next</h3>
          <div className="space-y-3">
            {mentionedCount < 3 && (
              <div className="flex gap-3 text-sm text-white/50">
                <span className="text-violet-400 mt-0.5">→</span>
                <p>Build third-party editorial coverage (reviews, listicles, comparison articles) — AIs are trained on these more than brand-owned content.</p>
              </div>
            )}
            <div className="flex gap-3 text-sm text-white/50">
              <span className="text-violet-400 mt-0.5">→</span>
              <p>Add specific attribute language to your product pages: include stats, use-case specifics, and trust signals that AIs can extract.</p>
            </div>
            {report.overallScore < 60 && (
              <div className="flex gap-3 text-sm text-white/50">
                <span className="text-violet-400 mt-0.5">→</span>
                <p>Run this diagnostic weekly as you publish new content — AEO is a long-term signal, not a quick fix.</p>
              </div>
            )}
          </div>
        </div>
        <p className="text-center text-white/15 text-xs mt-8">Analyzed at {new Date(report.timestamp).toLocaleString()} · Powered by local Ollama models</p>
      </div>
    </main>
  );
}
