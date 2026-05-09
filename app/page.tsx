"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const EXAMPLES = [
  { query: "best magnesium supplement for seniors", brand: "NatureMade" },
  { query: "best protein powder for muscle building", brand: "Optimum Nutrition" },
  { query: "best anti-aging face serum", brand: "The Ordinary" },
  { query: "best budget mechanical keyboard", brand: "Keychron" },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

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
    } finally {
      setLoading(false);
    }
  }

  function fillExample(ex: (typeof EXAMPLES)[0]) {
    setQuery(ex.query);
    setBrand(ex.brand);
  }

  return (
    <main className="min-h-screen bg-[#0A0A0F] text-white flex flex-col">
      <header className="border-b border-white/5 px-8 py-5 flex items-center gap-3">
        <div className="w-7 h-7 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold">A</div>
        <span className="font-semibold tracking-tight text-white/90">AEO Diagnostic</span>
        <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full border border-violet-500/30 text-violet-400 bg-violet-500/10">BETA</span>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="text-center mb-14 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Powered by Llama 3.2 · Gemma 3 · Mistral
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-4 leading-tight">
            Is your brand{" "}
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              visible to AI?
            </span>
          </h1>
          <p className="text-white/40 text-lg leading-relaxed">
            When shoppers ask AI for recommendations, does your brand get mentioned?
            Find out in 30 seconds — across 3 different AI engines, for free.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/40 mb-2 tracking-wider uppercase">Shopper query</label>
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="best magnesium supplement for seniors" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/60 transition-all text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/40 mb-2 tracking-wider uppercase">Your brand name</label>
            <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="NatureMade" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/60 transition-all text-sm" />
          </div>
          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">⚠ {error}</div>
          )}
          <button type="submit" disabled={loading || !query.trim() || !brand.trim()} className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all text-sm tracking-wide">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Querying 3 AI engines...
              </span>
            ) : "Run AEO Diagnostic →"}
          </button>
        </form>
        <div className="mt-10 w-full max-w-xl">
          <p className="text-xs text-white/30 mb-3 uppercase tracking-widest text-center">Try an example</p>
          <div className="grid grid-cols-2 gap-2">
            {EXAMPLES.map((ex, i) => (
              <button key={i} onClick={() => fillExample(ex)} className="text-left px-3 py-2.5 rounded-lg bg-white/3 border border-white/8 hover:border-white/20 hover:bg-white/6 transition-all group">
                <p className="text-xs text-white/60 group-hover:text-white/80 transition-colors leading-relaxed">{ex.query}</p>
                <p className="text-[10px] text-violet-400/60 mt-0.5">{ex.brand}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
      <footer className="text-center text-white/15 text-xs py-6">Runs entirely on local AI models via Ollama · No data sent to the cloud</footer>
    </main>
  );
}
