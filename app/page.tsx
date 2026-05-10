"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const EXAMPLES = [
  { query: "best magnesium supplement for seniors", brand: "NatureMade" },
  { query: "best protein powder for muscle building", brand: "Optimum Nutrition" },
  { query: "best anti-aging face serum", brand: "The Ordinary" },
  { query: "best budget mechanical keyboard", brand: "Keychron" },
];

const LOADING_STATES = [
  "Querying Llama 3.2",
  "Querying Gemma 3",
  "Querying Mistral",
  "Reading the responses",
  "Composing the report",
  "Consulting AEO Coach",
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingStep(s => (s + 1) % LOADING_STATES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || !brand.trim()) return;
    setLoading(true);
    setLoadingStep(0);
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

  return (
    <main className="min-h-screen flex flex-col">
      {/* Top nav — minimal, centered logo */}
      <header className="w-full border-b" style={{ borderColor: "var(--rule)" }}>
        <div className="max-w-[720px] mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full" style={{ background: "var(--accent)" }} />
            <span className="font-mono text-[11px] tracking-[0.16em] uppercase" style={{ color: "var(--ink)" }}>AEO · Diagnostic</span>
          </div>
          <span className="font-mono text-[10px] tracking-[0.15em] uppercase" style={{ color: "var(--ink-3)" }}>Vol. 01 · No. 0042</span>
        </div>
      </header>

      <div className="flex-1 max-w-[720px] mx-auto px-6 w-full">
        {/* Hero — editorial */}
        <section className="pt-24 pb-16">
          <p className="kicker fade-up">An instrument for the new search</p>
          <h1 className="font-serif fade-up delay-100" style={{ fontSize: "clamp(40px, 6vw, 64px)", lineHeight: 1.05, letterSpacing: "-0.025em", fontWeight: 400, marginTop: 20 }}>
            How does AI see <em style={{ color: "var(--accent)", fontStyle: "italic", fontWeight: 500 }}>your brand?</em>
          </h1>
          <p className="font-serif fade-up delay-200" style={{ fontSize: "21px", lineHeight: 1.55, color: "var(--ink-2)", marginTop: 24, fontWeight: 400 }}>
            When shoppers ask Llama, Gemma, or Mistral for a recommendation, three different brands often answer back. Find out where you stand — across all three, in under a minute.
          </p>
        </section>

        {/* Form — single column, generous, Linear-grade inputs */}
        <section className="pb-12 fade-up delay-300">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="field">
              <label className="field-label">01 · The shopper's question</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="best magnesium supplement for seniors"
                disabled={loading}
                autoFocus
              />
            </div>

            <div className="field">
              <label className="field-label">02 · Your brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="NatureMade"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="font-mono text-xs py-3 px-4 rounded-lg" style={{ background: "var(--accent-soft)", color: "var(--accent)", border: "1px solid rgba(184,67,78,0.2)" }}>
                {error}
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              <p className="font-mono text-[11px] tracking-wider" style={{ color: "var(--ink-3)" }}>
                {loading ? (
                  <span className="pulse">{LOADING_STATES[loadingStep]}…</span>
                ) : (
                  <>Press <span className="kbd" style={{ background: "rgba(26,26,26,0.04)", color: "var(--ink)", border: "1px solid var(--rule)" }}>↵</span> to run</>
                )}
              </p>
              <button
                type="submit"
                disabled={loading || !query.trim() || !brand.trim()}
                className="btn-primary"
              >
                {loading ? "Running diagnostic" : "Run diagnostic"}
                {!loading && <span style={{ fontSize: 14 }}>→</span>}
              </button>
            </div>
          </form>
        </section>

        {/* Examples — discovered, not promoted */}
        <section className="py-10 border-t fade-up delay-400" style={{ borderColor: "var(--rule)" }}>
          <p className="label mb-6">Or start from a known case</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => fillExample(ex)}
                className="example"
              >
                <p className="font-serif" style={{ fontSize: 16, lineHeight: 1.4, color: "var(--ink)" }}>{ex.query}</p>
                <p className="font-mono text-[11px] mt-2" style={{ color: "var(--ink-3)" }}>
                  testing <span style={{ color: "var(--accent)" }}>{ex.brand}</span>
                </p>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t" style={{ borderColor: "var(--rule)" }}>
        <div className="max-w-[720px] mx-auto px-6 py-6 flex items-center justify-between font-mono text-[10px] tracking-[0.15em] uppercase" style={{ color: "var(--ink-3)" }}>
          <span>An independent instrument</span>
          <span>3 AI engines · GPT-4o · Claude · Gemini</span>
        </div>
      </footer>
    </main>
  );
}

