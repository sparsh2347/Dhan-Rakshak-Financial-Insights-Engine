import { NextRequest, NextResponse } from "next/server";
import { askGemini } from "@/lib/Gemini";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { prompt, stockData } = body;

  if (!prompt || !stockData) {
    return NextResponse.json(
      { error: "Prompt and stockData are required" },
      { status: 400 },
    );
  }

  try {
    const reply = await askGemini(prompt, stockData);
    return NextResponse.json({ reply });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Gemini call failed", details: error.message },
      { status: 500 },
    );
  }
}
