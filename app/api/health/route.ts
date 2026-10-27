import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "Lingually",
    version: "1.0.0",
    timestamp: Date.now(),
    providers: ["openai", "gemini", "anthropic", "groq", "ollama", "openai-compatible"],
  });
}
