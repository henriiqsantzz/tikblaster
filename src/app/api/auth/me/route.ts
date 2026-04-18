export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: bcs, error: bcError } = await supabase
      .from('business_centers')
      .select('bc_id, name, token_expires_at, created_at, updated_at')
      .eq('user_id', session.user.id);

    const tiktokConnected = !bcError && bcs && bcs.length > 0;

    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
      },
      tiktok_connected: tiktokConnected,
      business_centers: bcs || [],
    });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
