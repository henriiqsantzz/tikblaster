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
      .select('*')
      .eq('user_id', session.user.id);

    if (bcError) {
      return NextResponse.json({ error: 'Failed to fetch BCs' }, { status: 500 });
    }

    const results = await Promise.all(
      (bcs || []).map(async (bc: any) => {
        const { count } = await supabase
          .from('tiktok_advertisers')
          .select('*', { count: 'exact', head: true })
          .eq('bc_id', bc.bc_id)
          .eq('user_id', session.user.id);

        return {
          bc_id: bc.bc_id,
          name: bc.name,
          token_expires_at: bc.token_expires_at,
          created_at: bc.created_at,
          updated_at: bc.updated_at,
          advertiser_count: count || 0,
          is_expired: new Date(bc.token_expires_at) < new Date(),
        };
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error('Business centers error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
