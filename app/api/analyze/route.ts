import { NextRequest, NextResponse } from "next/server";
import { ollamaClient, MODELS, ModelKey } from "@/lib/ollama";
import { analyzeResponse, buildReport } from "@/lib/analyzer";
import { runCoach } from "@/lib/coach";

const SYSTEM_PROMPT = `You are a helpful shopping assistant. When asked about products, give genuine, specific recommendations based on quality, popularity, and effectiveness. Be direct and mention specific brand names. Keep your response to 150-200 words.`;

async function queryModel(modelId: string, query: string): Promise<string> {
  const response = await ollamaClient.chat.completions.create({
    model: modelId,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: query },
    ],
    temperature: 0.7,
    max_tokens: 200,
  });
  return response.choices[0]?.message?.content || "";
}

export async function POST(req: NextRequest) {
  try {
    const { query, brand } = await req.json();
    if (!query || !brand) {
      return NextResponse.json({ error: "query and brand are required" }, { status: 400 });
    }
    const modelEntries = Object.entries(MODELS) as [ModelKey, (typeof MODELS)[ModelKey]][];
    const responses = await Promise.allSettled(
      modelEntries.map(([key, model]) =>
        queryModel(model.id, query).then((text) => ({ key, model, text }))
      )
    );
    const results = responses.map((res, i) => {
      const [key, model] = modelEntries[i];
      if (res.status === "fulfilled") {
        return analyzeResponse(res.value.text, brand, key, model.label, model.company, model.color);
      } else {
        return analyzeResponse("", brand, key, model.label, model.company, model.color);
      }
    });
    const report = buildReport(query, brand, results);
    const coachReport = await runCoach(query, brand, results);
    if (coachReport) report.coachReport = coachReport;
    return NextResponse.json(report);
  } catch (err) {
    console.error("Analyze error:", err);
    return NextResponse.json({ error: "Failed to connect to Ollama. Is it running on port 11434?" }, { status: 500 });
  }
}

