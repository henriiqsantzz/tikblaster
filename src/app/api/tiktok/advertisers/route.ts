export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { TikTokApi } from '@/lib/tiktok-api';
import { createServerSupabase } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bc_id = searchParams.get('bc_id');
    const refresh = searchParams.get('refresh') === 'true';

    if (!bc_id) {
      return NextResponse.json(
        { error: 'bc_id is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get BC and access token
    const { data: bc, error: bcError } = await supabase
      .from('business_centers')
      .select('access_token')
      .eq('bc_id', bc_id)
      .eq('user_id', session.user.id)
      .single();

    if (bcError || !bc) {
      return NextResponse.json(
        { error: 'Business center not found' },
        { status: 404 }
      );
    }

    // If not refresh, try to fetch from database
    if (!refresh) {
      const { data: advertisers, error: advError } = await supabase
        .from('tiktok_advertisers')
        .select('*')
        .eq('bc_id', bc_id)
        .eq('user_id', session.user.id);

      if (!advError && advertisers && advertisers.length > 0) {
        return NextResponse.json(advertisers);
      }
    }

    // Fetch from TikTok API
    const api = new TikTokApi(bc.access_token);
    const advertisers = await api.getBcAdvertisers(bc_id);

    if (!advertisers || advertisers.length === 0) {
      return NextResponse.json([]);
    }

    // Store in database
    const advertiserRecords = advertisers.map((adv: any) => ({
      user_id: session.user.id,
      advertiser_id: adv.advertiser_id,
      advertiser_name: adv.advertiser_name,
      bc_id,
      status: adv.status || 'ACTIVE',
      balance: adv.balance || 0,
      currency: adv.currency || 'BRL',
      timezone: adv.timezone,
      created_at: new Date().toISOString(),
    }));

    const { error: upsertError } = await supabase
      .from('tiktok_advertisers')
      .upsert(advertiserRecords, {
        onConflict: 'advertiser_id'
      });

    if (upsertError) {
      console.error('Failed to upsert advertisers:', upsertError);
      // Still return the fresh data from API
    }

    return NextResponse.json(advertisers);
  } catch (error) {
    console.error('Advertisers fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch advertisers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { bc_id } = await request.json();

    if (!bc_id) {
      return NextResponse.json(
        { error: 'bc_id is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get BC and access token
    const { data: bc, error: bcError } = await supabase
      .from('business_centers')
      .select('access_token')
      .eq('bc_id', bc_id)
      .eq('user_id', session.user.id)
      .single();

    if (bcError || !bc) {
      return NextResponse.json(
        { error: 'Business center not found' },
        { status: 404 }
      );
    }

    // Fetch from TikTok API
    const api = new TikTokApi(bc.access_token);
    const advertisers = await api.getBcAdvertisers(bc_id);

    if (!advertisers || advertisers.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    // Store in database
    const advertiserRecords = advertisers.map((adv: any) => ({
      user_id: session.user.id,
      advertiser_id: adv.advertiser_id,
      advertiser_name: adv.advertiser_name,
      bc_id,
      status: adv.status || 'ACTIVE',
      balance: adv.balance || 0,
      currency: adv.currency || 'BRL',
      timezone: adv.timezone,
      created_at: new Date().toISOString(),
    }));

    const { error: upsertError } = await supabase
      .from('tiktok_advertisers')
      .upsert(advertiserRecords, {
        onConflict: 'advertiser_id'
      });

    if (upsertError) {
      console.error('Failed to upsert advertisers:', upsertError);
      return NextResponse.json(
        { error: 'Failed to sync advertisers' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: advertisers.length,
    });
  } catch (error) {
    console.error('Advertisers sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync advertisers' },
      { status: 500 }
    );
  }
}
