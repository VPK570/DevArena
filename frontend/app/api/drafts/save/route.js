import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase-server";

export async function POST(request) {
  try {
    const { challengeId, code } = await request.json();
    const { supabase, user } = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Resolve challengeId if it's a slug
    let challengeUUID = challengeId;
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        challengeId,
      );

    if (!isUUID) {
      const { data: challenge } = await supabase
        .from("challenges")
        .select("id")
        .eq("slug", challengeId)
        .single();

      if (!challenge) {
        return NextResponse.json(
          { error: "Challenge not found" },
          { status: 404 },
        );
      }
      challengeUUID = challenge.id;
    }

    // 2. Upsert draft
    const { error } = await supabase.from("drafts").upsert(
      {
        user_id: user.id,
        challenge_id: challengeUUID,
        code: code,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,challenge_id",
      },
    );

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Draft save error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
