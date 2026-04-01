import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase-server';

export async function GET(request, { params }) {
  try {
    const { challengeId } = await params;
    const { supabase, user } = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Resolve challengeId if it's a slug
    let challengeUUID = challengeId;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(challengeId);
    
    if (!isUUID) {
      const { data: challenge } = await supabase
        .from('challenges')
        .select('id')
        .eq('slug', challengeId)
        .single();
      
      if (!challenge) {
        return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
      }
      challengeUUID = challenge.id;
    }

    // 2. Fetch draft
    const { data, error } = await supabase
      .from('drafts')
      .select('code, updated_at')
      .eq('user_id', user.id)
      .eq('challenge_id', challengeUUID)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is not found
      throw error;
    }

    if (!data) {
      return NextResponse.json({ code: '', updatedAt: null });
    }

    return NextResponse.json({ 
      code: data.code, 
      updatedAt: data.updated_at 
    });
  } catch (error) {
    console.error('Draft fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
