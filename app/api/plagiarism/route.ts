import { NextRequest, NextResponse } from "next/server";
import { checkPlagiarismCore } from "@/lib/analysis/plagiarism";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text = "", searchApiKey } = body;

    const report = await checkPlagiarismCore({
      text,
      searchApiKey,
    });

    return NextResponse.json(report);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to execute plagiarism analysis" },
      { status: 500 }
    );
  }
}
