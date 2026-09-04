import "server-only";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not defined");
}

const ai = new GoogleGenAI({ apiKey });
const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export async function generateJSON<T = unknown>(prompt: string): Promise<T> {
  const result = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      temperature: 1,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
    },
  });
  const raw = (result.text ?? "").replace(/```json|```/g, "").trim();
  return JSON.parse(raw) as T;
}
