import { coachQuery } from "./engines";
import { AnalysisResult, CoachReport } from "./analyzer";

export async function runCoach(
  query: string,
  brand: string,
  results: AnalysisResult[]
): Promise<CoachReport | null> {
  const mentionedCount = results.filter((r) => r.mentioned).length;
  const sentimentSummary = results
    .map((r) => `${r.modelLabel}: ${r.sentiment}`)
    .join(", ");
  const allCompetitors = [...new Set(results.flatMap((r) => r.competitors))]
    .slice(0, 6)
    .join(", ");

  const responseBlocks = results
    .map((r) => `[${r.modelLabel}]\n${r.rawResponse || "(no response)"}`)
    .join("\n\n");

  const userPrompt = `Brand: ${brand}
Query: ${query}

${responseBlocks}

Scoring context:
- ${brand} mentioned by ${mentionedCount}/3 engines
- Sentiments: ${sentimentSummary}
- Competitors named: ${allCompetitors || "none detected"}

GEO tactic library (Aggarwal et al., KDD 2024 — arxiv 2311.09735):
1. Statistics Addition — avg lift +32.1% (Health, Science, Law)
2. Quotation Addition — avg lift +29.7% (People & Society, History)
3. Fluency Optimization — avg lift +31.4% (Business, Health)
4. Cite Sources — up to +115% lift for low-ranked sites (Law, Facts)
5. Authoritative Tone — modest lift (Debate, History)
6. Easy-to-Understand — moderate lift (general consumer)
7. Unique Words — modest lift
8. Technical Terms — moderate lift
WARNING: Keyword Stuffing DOES NOT WORK. Never recommend it.

Infer the domain (Health / Tech / Consumer Goods / Food & Beverage / Finance / Other).
Return ONLY valid JSON, no prose, no markdown fences:
{
  "domain": "...",
  "rationale": "...",
  "actions": [
    { "priority": 1, "tactic": "...", "finding": "...", "action": "...", "expectedLift": "..." },
    { "priority": 2, "tactic": "...", "finding": "...", "action": "...", "expectedLift": "..." },
    { "priority": 3, "tactic": "...", "finding": "...", "action": "...", "expectedLift": "..." }
  ]
}`;

  try {
    const raw = await coachQuery(
      "You are an AEO (Answer Engine Optimization) coach. Prescribe concrete fixes based on GEO research. Respond ONLY with valid JSON — no prose, no markdown code fences.",
      userPrompt
    );
    const json = raw
      .replace(/^```(?:json)?\n?/, "")
      .replace(/\n?```$/, "")
      .trim();
    return JSON.parse(json) as CoachReport;
  } catch {
    return null;
  }
}
