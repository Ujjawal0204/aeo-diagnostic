"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Container } from "./components/Container";
import { BrandMark } from "./components/BrandMark";
import { MonoLabel } from "./components/MonoLabel";
import { Console } from "./components/Console";
import { EngineCard } from "./components/EngineCard";
import type { AnalysisResult } from "@/lib/analyzer";

/* ─── constants ──────────────────────────────────────────────── */

const EXAMPLES = [
  { query: "best magnesium supplement for seniors",    brand: "NatureMade" },
  { query: "best protein powder for muscle building",  brand: "Optimum Nutrition" },
  { query: "best anti-aging face serum",               brand: "The Ordinary" },
  { query: "best budget mechanical keyboard",          brand: "Keychron" },
];

const ENGINE_PILLS = [
  { label: "CHATGPT", color: "#10A37F", delay: "0ms"    },
  { label: "CLAUDE",  color: "#D97757", delay: "700ms"  },
  { label: "GEMINI",  color: "#4285F4", delay: "1400ms" },
];

const SAMPLE_RESULTS: AnalysisResult[] = [
  {
    modelKey:        "chatgpt-sample",
    modelLabel:      "ChatGPT",
    company:         "OpenAI",
    color:           "#10A37F",
    rawResponse:     "NatureMade is a trusted name in supplements, especially for seniors looking for magnesium support. Their magnesium glycinate formula offers excellent bioavailability.",
    mentioned:       true,
    mentionPosition: 3,
    mentionContext:  "NatureMade is a trusted name in supplements, especially for seniors looking for magnesium support.",
    competitors:     ["Nature's Bounty", "Doctor's Best"],
    sentiment:       "positive",
    pawcRaw:         22.4,
    score:           85,
    positionLabel:   "top",
  },
  {
    modelKey:        "claude-sample",
    modelLabel:      "Claude",
    company:         "Anthropic",
    color:           "#D97757",
    rawResponse:     "Several reputable brands offer magnesium for seniors, including NatureMade, Pure Encapsulations, and Thorne. The best depends on absorption preference.",
    mentioned:       true,
    mentionPosition: 35,
    mentionContext:  "Several reputable brands offer magnesium for seniors, including NatureMade, Pure Encapsulations, and Thorne.",
    competitors:     ["Pure Encapsulations", "Thorne"],
    sentiment:       "neutral",
    pawcRaw:         12.1,
    score:           50,
    positionLabel:   "middle",
  },
  {
    modelKey:        "gemini-sample",
    modelLabel:      "Gemini",
    company:         "Google",
    color:           "#4285F4",
    rawResponse:     "For seniors needing magnesium, Doctor's Best and Pure Encapsulations are excellent choices due to their chelated forms and high absorption rates.",
    mentioned:       false,
    mentionPosition: null,
    mentionContext:  null,
    competitors:     ["Doctor's Best", "Pure Encapsulations", "Thorne", "Solgar"],
    sentiment:       "not_mentioned",
    pawcRaw:         0,
    score:           0,
    positionLabel:   "not_mentioned",
  },
];

/* ─── component ──────────────────────────────────────────────── */

export default function Home() {
  const [query,        setQuery]        = useState("");
  const [brand,        setBrand]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [activeEngine, setActiveEngine] = useState(0);
  const router = useRouter();

  // Cycle the active engine dot while loading
  useEffect(() => {
    if (!loading) return;
    const iv = setInterval(() => setActiveEngine(i => (i + 1) % ENGINE_PILLS.length), 700);
    return () => clearInterval(iv);
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
        throw new Error(data.error || "Failed to query one or more AI engines. Try again in a moment.");
      }
      const report = await res.json();
      sessionStorage.setItem("aeo_report", JSON.stringify(report));
      router.push("/results");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to query one or more AI engines. Try again in a moment.");
      setLoading(false);
    }
  }

  function fillExample(ex: (typeof EXAMPLES)[0]) {
    setQuery(ex.query);
    setBrand(ex.brand);
  }

  /* ── console footer ── */
  const consoleFooter = (
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      {ENGINE_PILLS.map((e, i) => (
        <div key={e.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span
            style={{
              display: "inline-block",
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: e.color,
              flexShrink: 0,
              opacity: loading ? (activeEngine === i ? 1 : 0.25) : 0.75,
              transition: "opacity 200ms ease-out",
              animation: !loading ? `pulse-dot 2s ease-in-out ${e.delay} infinite` : "none",
            }}
          />
          <MonoLabel style={{ fontSize: 10 }}>{e.label}</MonoLabel>
        </div>
      ))}
    </div>
  );

  /* ─── render ─────────────────────────────────────────────── */
  return (
    <main className="min-h-screen flex flex-col">

      {/* ── Top bar ─────────────────────────────────────────── */}
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", height: 56, display: "flex", alignItems: "center" }}>
        <Container className="flex items-center justify-between h-full">
          <BrandMark />
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span
              style={{
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#00D982",
                animation: "pulse-dot 2s ease-in-out infinite",
              }}
            />
            <MonoLabel accent>LIVE · 3 FRONTIER MODELS</MonoLabel>
          </div>
        </Container>
      </header>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <Container className="py-20 fade-up">
        <div className="grid grid-cols-12 gap-12 items-start">

          {/* Left — copy (col-span-7) */}
          <div className="col-span-12 lg:col-span-7">
            <MonoLabel accent style={{ display: "block", marginBottom: 20 }}>
              BRAND VISIBILITY · ANSWER ENGINE OPTIMIZATION
            </MonoLabel>
            <h1
              style={{
                fontSize: "clamp(40px, 5vw, 60px)",
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
              When shoppers ask ChatGPT, Claude, or Gemini for a recommendation,
              three different brands often answer back. Find out where you stand —
              across all three, in under a minute.
            </p>
            {/* Proof chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["~45s SCAN", "3 FRONTIER MODELS", "REAL-TIME QUERIES"].map(chip => (
                <span
                  key={chip}
                  style={{
                    fontFamily: "var(--font-jbmono, 'JetBrains Mono', monospace)",
                    fontSize: 11,
                    letterSpacing: "0.08em",
                    padding: "6px 12px",
                    borderRadius: 6,
                    border: "1px solid rgba(255,255,255,0.06)",
                    background: "rgba(255,255,255,0.02)",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>

          {/* Right — diagnostic console (col-span-5) */}
          <div className="col-span-12 lg:col-span-5 fade-up delay-200">
            <Console footer={consoleFooter} loading={loading}>
              <form onSubmit={handleSubmit} style={{ padding: 28, display: "flex", flexDirection: "column", gap: 24 }}>

                {/* Field 1 */}
                <div>
                  <MonoLabel as="p" style={{ marginBottom: 10 }}>01 / Shopper&apos;s Query</MonoLabel>
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
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                      padding: "10px 0",
                      fontSize: 17,
                      color: "rgba(255,255,255,0.9)",
                      outline: "none",
                      fontFamily: "inherit",
                      transition: "border-color 150ms ease-out",
                    }}
                    onFocus={e => (e.currentTarget.style.borderBottomColor = "#00D982")}
                    onBlur={e => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.1)")}
                  />
                </div>

                {/* Field 2 */}
                <div>
                  <MonoLabel as="p" style={{ marginBottom: 10 }}>02 / Your Brand</MonoLabel>
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
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                      padding: "10px 0",
                      fontSize: 17,
                      color: "rgba(255,255,255,0.9)",
                      outline: "none",
                      fontFamily: "inherit",
                      transition: "border-color 150ms ease-out",
                    }}
                    onFocus={e => (e.currentTarget.style.borderBottomColor = "#00D982")}
                    onBlur={e => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.1)")}
                  />
                </div>

                {/* Error */}
                {error && (
                  <div style={{ border: "1px solid rgba(255,92,92,0.3)", background: "rgba(255,92,92,0.06)", borderRadius: 6, padding: "10px 12px" }}>
                    <MonoLabel style={{ color: "#FF5C5C", display: "block", marginBottom: 4 }}>Error</MonoLabel>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-jbmono, monospace)" }}>{error}</p>
                  </div>
                )}

                {/* Submit row */}
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
                      opacity: (!query.trim() || !brand.trim()) ? 0.4 : loading ? 0.65 : 1,
                      transition: "opacity 150ms ease-out, background 150ms ease-out",
                      fontFamily: "inherit",
                    }}
                    onMouseEnter={e => { if (!loading && query.trim() && brand.trim()) e.currentTarget.style.background = "#00C075"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#00D982"; }}
                  >
                    {loading ? "Running..." : "Run diagnostic"}
                    {!loading && <ArrowRight size={15} />}
                  </button>
                </div>
              </form>
            </Console>
          </div>
        </div>
      </Container>

      {/* ── Sample output ─────────────────────────────────────── */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <Container className="py-16 fade-up delay-300">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28 }}>
            <div>
              <MonoLabel as="p" style={{ marginBottom: 8 }}>SAMPLE OUTPUT</MonoLabel>
              <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", fontFamily: "inherit" }}>
                What you get back, in under a minute.
              </p>
            </div>
            <MonoLabel style={{ fontSize: 10, color: "rgba(255,255,255,0.22)" }}>
              SAMPLE · NOT REAL DATA
            </MonoLabel>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SAMPLE_RESULTS.map(r => (
              <EngineCard key={r.modelKey} result={r} sample animated={false} />
            ))}
          </div>
        </Container>
      </div>

      {/* ── Examples ──────────────────────────────────────────── */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <Container className="py-16 fade-up delay-400">
          <MonoLabel as="p" style={{ marginBottom: 24 }}>OR START FROM A KNOWN CASE</MonoLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {EXAMPLES.map((ex, i) => (
              <ExampleCard key={i} ex={ex} index={i} onClick={() => fillExample(ex)} />
            ))}
          </div>
        </Container>
      </div>

      {/* Spacer so footer sticks to the bottom */}
      <div className="flex-1" />

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <Container className="py-6 flex items-center justify-between">
          <MonoLabel style={{ fontSize: 10 }}>
            AN INDEPENDENT INSTRUMENT · NOT AFFILIATED WITH OPENAI, ANTHROPIC, OR GOOGLE
          </MonoLabel>
          <MonoLabel style={{ fontSize: 10 }}>v0.1 · MAY 2026</MonoLabel>
        </Container>
      </footer>
    </main>
  );
}

/* ─── sub-component (inlined to keep imports minimal) ─────── */

function ExampleCard({
  ex,
  index,
  onClick,
}: {
  ex: { query: string; brand: string };
  index: number;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#13161B",
        border: `1px solid ${hovered ? "rgba(0,217,130,0.4)" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 8,
        padding: 20,
        textAlign: "left",
        cursor: "pointer",
        transition: "border-color 150ms ease-out",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        width: "100%",
      }}
    >
      <MonoLabel style={{ fontSize: 10 }}>CASE {String(index + 1).padStart(2, "0")}</MonoLabel>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.82)", lineHeight: 1.45 }}>{ex.query}</p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <MonoLabel style={{ fontSize: 10, display: "block", marginBottom: 3 }}>BRAND</MonoLabel>
          <span style={{ fontFamily: "var(--font-jbmono, 'JetBrains Mono', monospace)", fontSize: 12, color: "#00D982" }}>
            {ex.brand}
          </span>
        </div>
        <ArrowRight size={14} color={hovered ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)"} style={{ transition: "color 150ms ease-out" }} />
      </div>
    </button>
  );
}
