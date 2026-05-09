export interface AnalysisResult {
  modelKey: string;
  modelLabel: string;
  company: string;
  color: string;
  rawResponse: string;
  mentioned: boolean;
  mentionPosition: number | null;
  mentionContext: string | null;
  competitors: string[];
  sentiment: "positive" | "neutral" | "negative" | "not_mentioned";
  score: number;
  positionLabel: "top" | "middle" | "bottom" | "not_mentioned";
}

export interface DiagnosticReport {
  query: string;
  brand: string;
  timestamp: string;
  results: AnalysisResult[];
  overallScore: number;
  topEngine: string | null;
  summary: string;
}

function extractSentenceWithBrand(text: string, brand: string): string | null {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  const lower = brand.toLowerCase();
  const match = sentences.find((s) => s.toLowerCase().includes(lower));
  return match ? match.trim() : null;
}

function detectSentiment(text: string, brand: string): "positive" | "neutral" | "negative" | "not_mentioned" {
  const lower = text.toLowerCase();
  const brandLower = brand.toLowerCase();
  if (!lower.includes(brandLower)) return "not_mentioned";
  const idx = lower.indexOf(brandLower);
  const window = lower.slice(Math.max(0, idx - 100), idx + 200);
  const positiveWords = ["best","great","excellent","top","recommend","popular","effective","quality","trusted","leading","superior","highly","well-known","reputable","premium","ideal","perfect"];
  const negativeWords = ["avoid","poor","bad","inferior","not recommend","low quality","overpriced","complaints","issues","problems","worse"];
  const posScore = positiveWords.filter((w) => window.includes(w)).length;
  const negScore = negativeWords.filter((w) => window.includes(w)).length;
  if (posScore > negScore) return "positive";
  if (negScore > posScore) return "negative";
  return "neutral";
}

function extractCompetitors(text: string, brand: string): string[] {
  const stopWords = new Set(["The","This","That","These","Those","When","Where","Which","Some","Many","Most","Also","Note","Here","They","Their","You","Your","For","With","From","Each","Both","However","Additionally","Overall","Consider","Often","Always","Important"]);
  const brandLower = brand.toLowerCase();
  const words = text.match(/\b[A-Z][a-zA-Z]{2,}\b/g) || [];
  const candidates = words.filter((w) => !stopWords.has(w) && w.toLowerCase() !== brandLower && w.length > 2);
  const freq: Record<string, number> = {};
  candidates.forEach((w) => { freq[w] = (freq[w] || 0) + 1; });
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([w]) => w);
}

function getMentionPosition(text: string, brand: string): number | null {
  const lower = text.toLowerCase();
  const idx = lower.indexOf(brand.toLowerCase());
  if (idx === -1) return null;
  return text.slice(0, idx).split(/\s+/).length;
}

function getPositionLabel(position: number | null, totalWords: number): "top" | "middle" | "bottom" | "not_mentioned" {
  if (position === null) return "not_mentioned";
  const pct = position / totalWords;
  if (pct < 0.33) return "top";
  if (pct < 0.66) return "middle";
  return "bottom";
}

function computeScore(mentioned: boolean, positionLabel: string, sentiment: string): number {
  if (!mentioned) return 0;
  let score = 40;
  if (positionLabel === "top") score += 35;
  else if (positionLabel === "middle") score += 20;
  else if (positionLabel === "bottom") score += 10;
  if (sentiment === "positive") score += 25;
  else if (sentiment === "neutral") score += 10;
  else if (sentiment === "negative") score -= 10;
  return Math.max(0, Math.min(100, score));
}

export function analyzeResponse(rawResponse: string, brand: string, modelKey: string, modelLabel: string, company: string, color: string): AnalysisResult {
  const totalWords = rawResponse.split(/\s+/).length;
  const mentioned = rawResponse.toLowerCase().includes(brand.toLowerCase());
  const mentionPosition = getMentionPosition(rawResponse, brand);
  const positionLabel = getPositionLabel(mentionPosition, totalWords);
  const sentiment = detectSentiment(rawResponse, brand);
  const mentionContext = extractSentenceWithBrand(rawResponse, brand);
  const competitors = extractCompetitors(rawResponse, brand);
  const score = computeScore(mentioned, positionLabel, sentiment);
  return { modelKey, modelLabel, company, color, rawResponse, mentioned, mentionPosition, mentionContext, competitors, sentiment, score, positionLabel };
}

export function buildReport(query: string, brand: string, results: AnalysisResult[]): DiagnosticReport {
  const overallScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);
  const topResult = results.reduce((best, r) => r.score > best.score ? r : best);
  const topEngine = topResult.score > 0 ? topResult.modelLabel : null;
  const mentionedCount = results.filter((r) => r.mentioned).length;
  let summary = "";
  if (mentionedCount === 0) summary = `"${brand}" is invisible across all AI engines for this query. Immediate content and authority-building is needed.`;
  else if (mentionedCount === 1) summary = `"${brand}" appears on only 1 of 3 AI engines. Visibility is narrow — you're missing 2/3 of AI-driven traffic.`;
  else if (mentionedCount === 2) summary = `"${brand}" is mentioned by 2 of 3 AI engines. Solid start, but there's a gap to close on ${results.find((r) => !r.mentioned)?.modelLabel}.`;
  else summary = `"${brand}" is visible across all 3 AI engines. Focus on improving your position and sentiment to dominate this query.`;
  return { query, brand, timestamp: new Date().toISOString(), results, overallScore, topEngine, summary };
}
