# AEO Diagnostic — Project Context

## What this is
A diagnostic tool that measures how visible a brand is across multiple AI engines (Llama 3.2, Gemma 3, Mistral via Ollama). User enters a query + brand, the tool queries all 3 models in parallel, and produces an editorial-style report card.

Built for submission to Pixii.ai (founding engineer role). Demo target audience: Pixii's founders and investors. Aesthetic direction: editorial / NYT Upshot style — single 720px column, Fraunces serif headlines, JetBrains Mono labels, oxblood accent (#B8434E), cream paper background.

## Stack
- Next.js 15 (App Router, TypeScript, Tailwind)
- Ollama (OpenAI-compatible API at localhost:11434) running 3 local models
- No external API keys, no cloud — runs entirely local

## Architecture
- `lib/ollama.ts` — Ollama client + 3 model configs (llama3.2, gemma3, mistral)
- `lib/analyzer.ts` — scoring logic: mention detection, position, sentiment, competitor extraction, headline/lede generation
- `app/api/analyze/route.ts` — fires all 3 models in Promise.allSettled
- `app/page.tsx` — landing page (editorial single-column)
- `app/results/page.tsx` — article-style results with staggered fade-up animations

## Current scoring (naive, must replace)
- Mention detected: +40
- Position: top +35 / middle +20 / bottom +10
- Sentiment: positive +25 / neutral +10 / negative -10
- Capped 0-100

## The research foundation
This product is grounded in **Aggarwal et al., "GEO: Generative Engine Optimization", KDD 2024 (arxiv 2311.09735)**. The paper provides:

### Position-Adjusted Word Count (PAWC) — paper's rigorous metric
Imp_pwc(c_i, r) = Σ (|s| / pos(s)^|s|) for each sentence s citing source c_i
Sentences earlier in the response carry exponentially higher weight (matches power-law CTR in search engines).

### 9 named GEO tactics, with measured lift
1. **Statistics Addition** — adds quantitative stats. Avg lift +32.1%. Best for: Law/Gov, Debate, Opinion
2. **Quotation Addition** — adds quotes from credible sources. Avg lift +29.7%. Best for: People & Society, Explanation, History
3. **Fluency Optimization** — improves prose readability. Avg lift +31.4%. Best for: Business, Science, Health
4. **Cite Sources** — adds citations. Highest lift for low-ranked sites (+115% at rank-5). Best for: Statement, Facts, Law & Gov
5. **Authoritative Tone** — more persuasive. Modest lift. Best for: Debate, History, Science
6. **Easy-to-Understand** — simplifies language
7. **Unique Words** — adds distinctive vocabulary
8. **Technical Terms** — adds domain-specific terms
9. **Keyword Stuffing** — DOES NOT WORK. SEO tactics don't transfer. Important negative result.

### Critical empirical findings
- **Combining Fluency + Statistics yields the maximum lift** (figure 4 in paper)
- **GEO disproportionately helps low-ranked / small brands** (+115% lift for rank-5 sites with Cite Sources, while rank-1 sites *lose* 30% — a huge story for SMB e-commerce, exactly Pixii's audience)
- **LLMs are robust to authoritative tone alone** — persuasiveness without substance doesn't work
- **Domain matters** — different tactics work best in different verticals

## Roadmap (build in this order)

### Tier 1 — demo-critical
**A. AEO Coach (prescriptive fixes)** — after scoring, run one more local LLM call that takes (brand, query, responses, paper's 9 tactics) and outputs 3 specific, prioritized action items with concrete examples scoped to the user's product page.

**B. Replace naive scoring with PAWC** — implement the paper's Position-Adjusted Word Count, layer on sentiment. Cite the paper in the footer. Investor-credibility multiplier.

**C. Domain-aware recommendations** — detect the query's domain (Health, Tech, Law/Gov, etc.), weight tactic recommendations by the per-domain effectiveness data from the paper. Show "Because this is a Health query, Statistics Addition has the highest expected lift."

### Tier 2 — narrative amplifiers
**D. Brand mode** — accept a brand name, auto-generate 5-10 plausible shopper queries, score across all of them. Category-wide visibility, not anecdotal.
**E. Competitor mode** — user inputs brand + 3 competitors, side-by-side comparison.
**F. Run history (SQLite)** — track score over time after fixes.

### Tier 3 — polish
**G. Inline citation footnotes to the paper** next to scoring decisions
**H. PDF export** of the diagnostic report

## Design constraints (do not violate)
- Stay editorial. No dashboard cards, no sidebars, no rounded-2xl-shadow-xl.
- Single 720px column, max.
- Two fonts: Fraunces (serif) + JetBrains Mono (data labels). No third font.
- One accent color: #B8434E (oxblood). Used sparingly.
- No icons, no emojis, no gradients.
- Animations matter — staggered fade-up on results, numbers count up, transitions on cubic-bezier easing.

## Demo target
3-minute video for Pixii submission. Hero moment: dynamic headline that names the finding ("Two engines remember NatureMade. Gemma forgot."). One specific actionable fix. Re-run shows the fix worked.
