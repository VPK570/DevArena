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

    // Call FastAPI for AI hint
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    const fastapiUrl = `${baseUrl}/api/hint`;

    console.log(`[DEBUG] Proxying hint to FastAPI: ${fastapiUrl}`);

    const response = await fetch(fastapiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId, userCode }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown");
      console.error(
        `[ERROR] FastAPI hint returned ${response.status}: ${errorText}`,
      );
      throw new Error(`AI hint service error (${response.status})`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Hint fetching error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
