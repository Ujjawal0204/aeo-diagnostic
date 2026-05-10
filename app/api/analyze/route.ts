import { NextRequest, NextResponse } from "next/server";
import { ENGINES, SYSTEM_PROMPT, ENGINE_MODE } from "@/lib/engines";
import { analyzeResponse, buildReport } from "@/lib/analyzer";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { query, brand } = await req.json();
    if (!query || !brand) {
      return NextResponse.json({ error: "query and brand are required" }, { status: 400 });
    }

    // Fire all engines in parallel
    const responses = await Promise.allSettled(
      ENGINES.map((engine) =>
        engine.query(SYSTEM_PROMPT, query).then((text) => ({ engine, text }))
      )
    );

    const results = responses.map((res, i) => {
      const engine = ENGINES[i];
      if (res.status === "fulfilled") {
        return analyzeResponse(res.value.text, brand, engine.key, engine.label, engine.company, engine.color);
      } else {
        console.error(`${engine.label} failed:`, res.reason);
        return analyzeResponse("", brand, engine.key, engine.label, engine.company, engine.color);
      }
    });

    const report = { ...buildReport(query, brand, results), mode: ENGINE_MODE };
    return NextResponse.json(report);
  } catch (err) {
    console.error("Analyze error:", err);
    const msg = ENGINE_MODE === "local"
      ? "Failed to connect to Ollama. Is it running on port 11434?"
      : "Failed to query cloud APIs. Check your API keys in .env.local.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
