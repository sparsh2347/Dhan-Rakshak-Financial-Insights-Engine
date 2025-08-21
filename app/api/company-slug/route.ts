import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json(); // match frontend
    const { name } = body;
    console.log(name);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Return only the company_slug from the URL 'https://www.screener.in/company/{company_slug}/consolidated/' that matches the given Indian stock ${name}. Respond with only the slug, nothing else.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    return NextResponse.json({ company_slug: text });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}
