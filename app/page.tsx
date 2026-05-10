"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { BrandMark } from "./components/BrandMark";
import { StatusDot } from "./components/StatusDot";
import { MonoLabel } from "./components/MonoLabel";
import { Console } from "./components/Console";
import { EngineCard } from "./components/EngineCard";
import type { AnalysisResult } from "@/lib/analyzer";

const EXAMPLES = [
  { query: "best magnesium supplement for seniors", brand: "NatureMade" },
  { query: "best protein powder for muscle building", brand: "Optimum Nutrition" },
  { query: "best anti-aging face serum", brand: "The Ordinary" },
  { query: "best budget mechanical keyboard", brand: "Keychron" },
];

const SAMPLE_RESULTS: AnalysisResult[] = [
  {
    modelKey: "llama",
    modelLabel: "Llama 3.2",
    company: "Meta",
    color: "#3B82F6",
    rawResponse: "NatureMade is a trusted name in supplements, especially for seniors looking for magnesium support. Their magnesium glycinate formula is well-absorbed and widely recommended.",
    mentioned: true,
    mentionPosition: 3,
    mentionContext: "NatureMade is a trusted name in supplements, especially for seniors looking for magnesium support.",
    competitors: ["Doctor's Best", "Pure Encapsulations", "Thorne"],
    sentiment: "positive",
    pawcRaw: 22.4,
    score: 85,
    positionLabel: "top",
  },
  {
    modelKey: "gemma",
    modelLabel: "Gemma 3",
    company: "Google",
    color: "#10B981",
    rawResponse: "Several brands are popular for magnesium supplements, including NatureMade, Solgar, and Life Extension. The best choice depends on absorption type and dosage needs.",
    mentioned: true,
    mentionPosition: 28,
    mentionContext: "Several brands are popular for magnesium supplements, including NatureMade, Solgar, and Life Extension.",
    competitors: ["Solgar", "Life Extension", "NOW Foods"],
    sentiment: "neutral",
    pawcRaw: 12.1,
    score: 50,
    positionLabel: "middle",
  },
  {
    modelKey: "mistral",
    modelLabel: "Mistral",
    company: "Mistral AI",
    color: "#F59E0B",
    rawResponse: "For magnesium supplements for seniors, Doctor's Best and Pure Encapsulations are excellent choices, offering high bioavailability forms like glycinate and malate.",
    mentioned: false,
    mentionPosition: null,
    mentionContext: null,
    competitors: ["Doctor's Best", "Pure Encapsulations", "Thorne"],
    sentiment: "not_mentioned",
    pawcRaw: 0,
    score: 0,
    positionLabel: "not_mentioned",
  },
];

const ENGINE_LABELS = ["LLAMA 3.2", "GEMMA 3", "MISTRAL"];

export default function Home() {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeEngine, setActiveEngine] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setActiveEngine(i => (i + 1) % ENGINE_LABELS.length);
    }, 700);
    return () => clearInterval(interval);
  }, [loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || !brand.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), brand: brand.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }
      const report = await res.json();
      sessionStorage.setItem("aeo_report", JSON.stringify(report));
      router.push("/results");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setLoading(false);
    }
  }

  function fillExample(ex: (typeof EXAMPLES)[0]) {
    setQuery(ex.query);
    setBrand(ex.brand);
  }

  const consoleFooter = (
    <div style={{ display: "flex", alignItems: "center", gap: 16, width: "100%" }}>
      {ENGINE_LABELS.map((label, i) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <StatusDot
            color="signal"
            pulse={loading && activeEngine === i}
            size={5}
          />
          <MonoLabel style={{ fontSize: 10, opacity: loading && activeEngine !== i ? 0.3 : 1, transition: "opacity 200ms ease-out" }}>
            {label}
          </MonoLabel>
        </div>
      ))}
    </div>
  );

  return (
    <main className="min-h-screen flex flex-col">

      {/* Top bar */}
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", height: 56, display: "flex", alignItems: "center" }}>
        <div className="max-w-6xl mx-auto px-8 w-full flex items-center justify-between">
          <BrandMark />
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <StatusDot color="signal" pulse size={6} />
              <MonoLabel>3 ENGINES ONLINE</MonoLabel>
            </div>
            <span style={{ color: "rgba(255,255,255,0.1)", fontSize: 12 }}>|</span>
            <MonoLabel>LOCAL · OLLAMA</MonoLabel>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-6xl mx-auto px-8 w-full">

        {/* Hero */}
        <section className="py-24 fade-up">
          <div className="grid grid-cols-12 gap-12 items-start">

            {/* Left — copy */}
            <div className="col-span-12 lg:col-span-7">
              <MonoLabel accent style={{ display: "block", marginBottom: 20 }}>
                BRAND VISIBILITY · ANSWER ENGINES
              </MonoLabel>
              <h1
                style={{
                  fontSize: "clamp(36px, 4vw, 56px)",
                  fontWeight: 500,
                  lineHeight: 1.05,
                  letterSpacing: "-0.025em",
                  color: "rgba(255,255,255,0.95)",
                  marginBottom: 24,
                }}
              >
                How does AI see{" "}
                <em style={{ fontStyle: "italic", color: "#00D982" }}>your brand?</em>
              </h1>
              <p
                style={{
                  fontSize: 17,
                  lineHeight: 1.6,
                  color: "rgba(255,255,255,0.55)",
                  maxWidth: 480,
                  marginBottom: 32,
                }}
              >
                When shoppers ask Llama, Gemma, or Mistral for a recommendation,
                three different brands often answer back. Find out where you stand —
                across all three, in under a minute.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["~45s SCAN", "3 LLMs QUERIED", "0 DATA SENT TO CLOUD"].map(chip => (
                  <span
                    key={chip}
                    style={{
                      fontFamily: "var(--font-jbmono, 'JetBrains Mono', monospace)",
                      fontSize: 11,
                      letterSpacing: "0.08em",
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.02)",
                      color: "rgba(255,255,255,0.5)",
                    }}
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — console */}
            <div className="col-span-12 lg:col-span-5 fade-up delay-200">
              <Console footer={consoleFooter} loading={loading}>
                <form onSubmit={handleSubmit} style={{ padding: 28, display: "flex", flexDirection: "column", gap: 24 }}>

                  <div>
                    <MonoLabel as="p" style={{ marginBottom: 10 }}>01 / SHOPPER&apos;S QUERY</MonoLabel>
                    <input
                      type="text"
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder="e.g. best magnesium supplement for seniors"
                      disabled={loading}
                      autoFocus
                      style={{
                        width: "100%",
                        background: "transparent",
                        border: "none",
                        borderBottom: "1px solid rgba(255,255,255,0.12)",
                        padding: "10px 0",
                        fontSize: 16,
                        color: "rgba(255,255,255,0.9)",
                        outline: "none",
                        fontFamily: "inherit",
                      }}
                      onFocus={e => (e.currentTarget.style.borderBottomColor = "#00D982")}
                      onBlur={e => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.12)")}
                    />
                  </div>

                  <div>
                    <MonoLabel as="p" style={{ marginBottom: 10 }}>02 / YOUR BRAND</MonoLabel>
                    <input
                      type="text"
                      value={brand}
                      onChange={e => setBrand(e.target.value)}
                      placeholder="e.g. NatureMade"
                      disabled={loading}
                      style={{
                        width: "100%",
                        background: "transparent",
                        border: "none",
                        borderBottom: "1px solid rgba(255,255,255,0.12)",
                        padding: "10px 0",
                        fontSize: 16,
                        color: "rgba(255,255,255,0.9)",
                        outline: "none",
                        fontFamily: "inherit",
                      }}
                      onFocus={e => (e.currentTarget.style.borderBottomColor = "#00D982")}
                      onBlur={e => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.12)")}
                    />
                  </div>

                  {error && (
                    <div style={{ border: "1px solid rgba(255,92,92,0.3)", background: "rgba(255,92,92,0.06)", borderRadius: 6, padding: "10px 12px" }}>
                      <MonoLabel style={{ color: "#FF5C5C", display: "block", marginBottom: 4 }}>ERROR</MonoLabel>
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-jbmono, monospace)" }}>{error}</p>
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <MonoLabel style={{ fontSize: 10 }}>
                      {loading
                        ? <span style={{ color: "#00D982" }}>QUERYING ENGINES...</span>
                        : "PRESS ↵ TO RUN"
                      }
                    </MonoLabel>
                    <button
                      type="submit"
                      disabled={loading || !query.trim() || !brand.trim()}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: "#00D982",
                        color: "#0B0D10",
                        fontWeight: 500,
                        fontSize: 14,
                        padding: "9px 18px",
                        borderRadius: 6,
                        border: "none",
                        cursor: loading || !query.trim() || !brand.trim() ? "not-allowed" : "pointer",
                        opacity: (!query.trim() || !brand.trim()) && !loading ? 0.4 : loading ? 0.7 : 1,
                        transition: "opacity 150ms ease-out, background 150ms ease-out",
                        fontFamily: "inherit",
                      }}
                    >
                      {loading ? "Running..." : "Run diagnostic"}
                      {!loading && <ArrowRight size={15} />}
                    </button>
                  </div>
                </form>
              </Console>
            </div>
          </div>
        </section>

        {/* Sample output */}
        <section style={{ paddingBottom: 80 }} className="fade-up delay-300">
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 56 }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28 }}>
              <div>
                <MonoLabel as="p" style={{ marginBottom: 8 }}>SAMPLE OUTPUT</MonoLabel>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-jbmono, monospace)" }}>
                  What you get back, in under a minute.
                </p>
              </div>
              <MonoLabel style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>
                SAMPLE · NOT REAL DATA
              </MonoLabel>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {SAMPLE_RESULTS.map(r => (
                <EngineCard key={r.modelKey} result={r} sample animated={false} />
              ))}
            </div>
          </div>
        </section>

        {/* Examples */}
        <section style={{ paddingBottom: 80 }} className="fade-up delay-400">
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 48 }}>
            <MonoLabel as="p" style={{ marginBottom: 24 }}>OR START FROM A KNOWN CASE</MonoLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => fillExample(ex)}
                  style={{
                    background: "#13161B",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 8,
                    padding: 20,
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "border-color 150ms ease-out, background 150ms ease-out",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "rgba(0,217,130,0.4)";
                    e.currentTarget.style.background = "rgba(0,217,130,0.03)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.background = "#13161B";
                  }}
                >
                  <MonoLabel style={{ fontSize: 10 }}>CASE {String(i + 1).padStart(2, "0")}</MonoLabel>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.45 }}>{ex.query}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <MonoLabel style={{ fontSize: 10, display: "block", marginBottom: 3 }}>BRAND</MonoLabel>
                      <span style={{ fontFamily: "var(--font-jbmono, 'JetBrains Mono', monospace)", fontSize: 12, color: "#00D982" }}>
                        {ex.brand}
                      </span>
                    </div>
                    <ArrowRight size={14} color="rgba(255,255,255,0.2)" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "20px 0" }}>
        <div className="max-w-6xl mx-auto px-8 flex items-center justify-between">
          <MonoLabel style={{ fontSize: 10 }}>AN INDEPENDENT INSTRUMENT · NOT AFFILIATED WITH META, GOOGLE, OR MISTRAL AI</MonoLabel>
          <MonoLabel style={{ fontSize: 10 }}>v0.1 · MAY 2026 · LOCAL OLLAMA</MonoLabel>
        </div>
      </footer>
    </main>
  );
}
