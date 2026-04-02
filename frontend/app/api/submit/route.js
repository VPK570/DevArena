import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase-server";
import { calculateEloChange } from "@/lib/elo";

export async function POST(request) {
  try {
    const { challengeId, code, language } = await request.json();
    const { supabase, user } = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch challenge info
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        challengeId,
      );
    const query = supabase.from("challenges").select("*");
    if (isUUID) {
      query.eq("id", challengeId);
    } else {
      query.eq("slug", challengeId);
    }
    const { data: challenge, error: challengeError } = await query.single();

    if (!challenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 },
      );
    }

    // 2. Call FastAPI for AI evaluation
    const fastapiUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/evaluate`;
    const evalResponse = await fetch(fastapiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId: challenge.slug, code }),
    });

    if (!evalResponse.ok) {
      const errorData = await evalResponse.json().catch(() => ({}));
      throw new Error(
        errorData.detail?.error || "AI evaluation service offline",
      );
    }

    const evaluation = await evalResponse.json();

    // 3. Fetch user's current ELO from profile
    const { data: profile } = await supabase
      .from("users")
      .select("elo_rating")
      .eq("id", user.id)
      .single();

    const currentElo = profile?.elo_rating || 1200;

    // 4. Calculate ELO change
    const { eloChange, newElo } = calculateEloChange(
      currentElo,
      challenge.difficulty,
      evaluation.score,
    );

    // 5. Map verdict to DB enum (FastAPI: Pass/Partial/Fail -> DB: pass/partial/fail)
    const verdictMap = { Pass: "pass", Partial: "partial", Fail: "fail" };
    const dbVerdict = verdictMap[evaluation.verdict] || "fail";

    // 6. Insert submission
    const { data: submission, error: subError } = await supabase
      .from("submissions")
      .insert({
        user_id: user.id,
        challenge_id: challenge.id,
        code: code,
        language: language || "javascript",
        score: evaluation.score,
        verdict: dbVerdict,
        execution_time: null, // AI eval doesn't provide real execution time
      })
      .select()
      .single();

    if (subError) throw subError;

    // 7. Update user ELO
    await supabase
      .from("users")
      .update({ elo_rating: newElo })
      .eq("id", user.id);

    // 8. Return comprehensive results
    return NextResponse.json({
      submissionId: submission.id,
      score: evaluation.score,
      verdict: evaluation.verdict,
      summary: evaluation.summary,
      feedback: evaluation.feedback,
      eloChange: eloChange,
      newElo: newElo,
    });
  } catch (error) {
    console.error("Submission processing error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
