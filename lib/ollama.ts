import OpenAI from "openai";

export const ollamaClient = new OpenAI({
  baseURL: "http://localhost:11434/v1",
  apiKey: "ollama",
});

export const MODELS = {
  llama: {
    id: "llama3.2",
    label: "Llama 3.2",
    company: "Meta",
    color: "#3B82F6",
  },
  gemma: {
    id: "gemma3",
    label: "Gemma 3",
    company: "Google",
    color: "#10B981",
  },
  mistral: {
    id: "mistral",
    label: "Mistral",
    company: "Mistral AI",
    color: "#F59E0B",
  },
} as const;

export type ModelKey = keyof typeof MODELS;