export interface CoachAction {
  priority: 1 | 2 | 3;
  tactic: string;
  finding: string;
  action: string;
  expectedLift: string;
}

export interface CoachReport {
  domain: string;
  rationale: string;
  actions: CoachAction[];
}

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
  pawcRaw: number;
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
  headline: string;
  lede: string;
  coachReport?: CoachReport;
  mode?: string;
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

// PAWC: Position-Adjusted Word Count from Aggarwal et al., KDD 2024 (arxiv 2311.09735).
// Imp_pwc = Σ (sentence_word_count / sentence_position) for each sentence mentioning the brand.
// Sentences at the top carry exponentially more weight, mirroring power-law CTR in search.
function computePAWC(text: string, brand: string): number {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  const brandLower = brand.toLowerCase();
  let raw = 0;
  sentences.forEach((s, idx) => {
    if (s.toLowerCase().includes(brandLower)) {
      const wordCount = s.trim().split(/\s+/).length;
      raw += wordCount / (idx + 1);
    }
  });
  return Math.round(raw * 10) / 10;
}

function computeScore(pawcRaw: number, mentioned: boolean, sentiment: string): number {
  if (!mentioned) return 0;
  // Normalize: a 25-word brand mention at sentence 1 = max single contribution → 100
  const base = Math.min(Math.round((pawcRaw / 25) * 100), 100);
  if (sentiment === "positive") return Math.min(100, base + 10);
  if (sentiment === "negative") return Math.max(0, base - 10);
  return base;
}

export function analyzeResponse(
  rawResponse: string,
  brand: string,
  modelKey: string,
  modelLabel: string,
  company: string,
  color: string
): AnalysisResult {
  const totalWords = rawResponse.split(/\s+/).length;
  const mentioned = rawResponse.toLowerCase().includes(brand.toLowerCase());
  const mentionPosition = getMentionPosition(rawResponse, brand);
  const positionLabel = getPositionLabel(mentionPosition, totalWords);
  const sentiment = detectSentiment(rawResponse, brand);
  const mentionContext = extractSentenceWithBrand(rawResponse, brand);
  const competitors = extractCompetitors(rawResponse, brand);
  const pawcRaw = computePAWC(rawResponse, brand);
  const score = computeScore(pawcRaw, mentioned, sentiment);
  return { modelKey, modelLabel, company, color, rawResponse, mentioned, mentionPosition, mentionContext, competitors, sentiment, pawcRaw, score, positionLabel };
}

function generateHeadline(brand: string, results: AnalysisResult[]): string {
  const mentioned = results.filter(r => r.mentioned);
  const absent = results.filter(r => !r.mentioned);
  if (mentioned.length === 0) return `${brand} is invisible to the artificial mind.`;
  if (mentioned.length === 3) {
    const top = results.reduce((a, b) => a.score > b.score ? a : b);
    return `${brand} is seen — but ${top.modelLabel} sees it best.`;
  }
  if (mentioned.length === 2) return `Two engines remember ${brand}. ${absent[0].modelLabel} forgot.`;
  return `Only ${mentioned[0].modelLabel} remembers ${brand}.`;
}

function generateLede(brand: string, query: string, results: AnalysisResult[]): string {
  const mentioned = results.filter(r => r.mentioned);
  const absent = results.filter(r => !r.mentioned);
  const queryClean = query.replace(/^best\s+/i, "the best ").replace(/\?$/, "");
  if (mentioned.length === 0) {
    return `Asked for ${queryClean}, three of today's most-used AI systems answered with confidence — and none mentioned ${brand}. The brand's absence, across models trained by three different companies, suggests a gap not in product, but in narrative.`;
  }
  if (mentioned.length === 3) {
    return `Asked for ${queryClean}, all three AIs return ${brand} by name. Position and framing differ — and that's where the work begins.`;
  }
  const presentList = mentioned.map(r => r.modelLabel).join(" and ");
  const absentList = absent.map(r => r.modelLabel).join(" and ");
  return `Asked for ${queryClean}, ${presentList} mentioned ${brand}. ${absentList} did not. Three systems, three different memories of who matters in this category.`;
}

export function buildReport(query: string, brand: string, results: AnalysisResult[]): DiagnosticReport {
  const overallScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);
  const topResult = results.reduce((best, r) => r.score > best.score ? r : best);
  const topEngine = topResult.score > 0 ? topResult.modelLabel : null;
  const mentionedCount = results.filter((r) => r.mentioned).length;
  let summary = "";
  if (mentionedCount === 0) summary = `${brand} is invisible across all AI engines for this query. Immediate content and authority-building is needed.`;
  else if (mentionedCount === 1) summary = `${brand} appears on only 1 of 3 AI engines. Visibility is narrow — you're missing two-thirds of AI-driven traffic.`;
  else if (mentionedCount === 2) summary = `${brand} is mentioned by 2 of 3 AI engines. Solid start, but there's a gap to close.`;
  else summary = `${brand} is visible across all 3 AI engines. Focus on improving position and sentiment to dominate this query.`;

  const headline = generateHeadline(brand, results);
  const lede = generateLede(brand, query, results);
  return { query, brand, timestamp: new Date().toISOString(), results, overallScore, topEngine, summary, headline, lede };
}
