import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

const MODE = (process.env.ENGINE_MODE || "cloud").toLowerCase();

// === Cloud clients (lazy init) ===
let openaiClient: OpenAI | null = null;
let anthropicClient: Anthropic | null = null;
let googleClient: GoogleGenerativeAI | null = null;

function getOpenAI() {
  if (!openaiClient) openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openaiClient;
}
function getAnthropic() {
  if (!anthropicClient) anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return anthropicClient;
}
function getGoogle() {
  if (!googleClient) googleClient = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
  return googleClient;
}

// === Ollama client (local fallback) ===
const ollama = new OpenAI({
  baseURL: process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1",
  apiKey: "ollama",
});

// === Engine definitions — same shape regardless of provider ===
export interface EngineConfig {
  key: string;
  label: string;
  company: string;
  color: string;
  query: (systemPrompt: string, userQuery: string) => Promise<string>;
}

const SYSTEM_PROMPT = `You are a helpful shopping assistant. When asked about products, give genuine, specific recommendations based on quality, popularity, and effectiveness. Be direct and mention specific brand names. Keep your response to 150-200 words.`;

// CLOUD engines
const CLOUD_ENGINES: EngineConfig[] = [
  {
    key: "openai",
    label: "GPT-4o mini",
    company: "OpenAI",
    color: "#10A37F",
    query: async (system, user) => {
      const r = await getOpenAI().chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
        temperature: 0.7,
        max_tokens: 250,
      });
      return r.choices[0]?.message?.content || "";
    },
  },
  {
    key: "anthropic",
    label: "Claude Haiku",
    company: "Anthropic",
    color: "#C8743E",
    query: async (system, user) => {
      const r = await getAnthropic().messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 250,
        system,
        messages: [{ role: "user", content: user }],
      });
      const block = r.content[0];
      return block.type === "text" ? block.text : "";
    },
  },
  {
    key: "google",
    label: "Gemini 2.5 Flash",
    company: "Google",
    color: "#4285F4",
    query: async (system, user) => {
      const model = getGoogle().getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: system,
      });
      const r = await model.generateContent(user);
      return r.response.text();
    },
  },
];

// LOCAL engines (Ollama)
const LOCAL_ENGINES: EngineConfig[] = [
  {
    key: "llama",
    label: "Llama 3.2",
    company: "Meta",
    color: "#3B82F6",
    query: async (system, user) => {
      const r = await ollama.chat.completions.create({
        model: "llama3.2",
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
        temperature: 0.7,
        max_tokens: 200,
      });
      return r.choices[0]?.message?.content || "";
    },
  },
  {
    key: "gemma",
    label: "Gemma 3",
    company: "Google",
    color: "#10B981",
    query: async (system, user) => {
      const r = await ollama.chat.completions.create({
        model: "gemma3:1b",
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
        temperature: 0.7,
        max_tokens: 200,
      });
      return r.choices[0]?.message?.content || "";
    },
  },
  {
    key: "qwen",
    label: "Qwen 2.5",
    company: "Alibaba",
    color: "#F59E0B",
    query: async (system, user) => {
      const r = await ollama.chat.completions.create({
        model: "qwen2.5:1.5b",
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
        temperature: 0.7,
        max_tokens: 200,
      });
      return r.choices[0]?.message?.content || "";
    },
  },
];

export const ENGINES: EngineConfig[] = MODE === "local" ? LOCAL_ENGINES : CLOUD_ENGINES;
export const ENGINE_MODE = MODE;
export { SYSTEM_PROMPT };

// Dedicated coach query — low temperature for consistent JSON output.
// Cloud: Claude Haiku (reliable instruction following). Local: Mistral via Ollama.
export async function coachQuery(systemPrompt: string, userPrompt: string): Promise<string> {
  if (MODE === "local") {
    const r = await ollama.chat.completions.create({
      model: "mistral",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 800,
    });
    return r.choices[0]?.message?.content || "";
  }
  const r = await getAnthropic().messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 800,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });
  const block = r.content[0];
  return block.type === "text" ? block.text : "";
}
