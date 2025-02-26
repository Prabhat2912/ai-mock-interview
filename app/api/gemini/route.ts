import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Ensure your API key is set in environment variables
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY as string;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing in environment variables");
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    return NextResponse.json({ text: response });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
