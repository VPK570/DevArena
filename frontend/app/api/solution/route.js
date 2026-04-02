import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase-server";

export async function POST(request) {
  try {
    const { challengeId, userCode } = await request.json();
    const { user } = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!challengeId || !userCode) {
      return NextResponse.json(
        { error: "Missing challengeId or userCode" },
        { status: 400 },
      );
    }

    // Call FastAPI for AI solution
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    const fastapiUrl = `${baseUrl}/api/solution`;

    console.log(`[DEBUG] Proxying to FastAPI: ${fastapiUrl}`);

    const solutionResponse = await fetch(fastapiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId, userCode }),
    });

    if (!solutionResponse.ok) {
      const errorText = await solutionResponse.text().catch(() => "Unknown");
      console.error(
        `[ERROR] FastAPI returned ${solutionResponse.status}: ${errorText}`,
      );
      throw new Error(`AI solution service error (${solutionResponse.status})`);
    }

    const data = await solutionResponse.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Solution fetching error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
