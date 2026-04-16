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
      const { data: pixels, error: pixelError } = await supabase
        .from('tiktok_pixels')
        .select('*')
        .eq('bc_id', bc_id)
        .eq('user_id', session.user.id);

      if (!pixelError && pixels && pixels.length > 0) {
        return NextResponse.json(pixels);
      }
    }

    // Get advertisers for this BC
    const { data: advertisers, error: advError } = await supabase
      .from('tiktok_advertisers')
      .select('advertiser_id')
      .eq('bc_id', bc_id)
      .eq('user_id', session.user.id);

    if (advError || !advertisers || advertisers.length === 0) {
      return NextResponse.json([]);
    }

    const api = new TikTokApi(bc.access_token);
    const allPixels: any[] = [];

    // Fetch pixels for each advertiser
    const pixelPromises = advertisers.map(async (adv) => {
      try {
        const pixels = await api.getPixels(adv.advertiser_id);
        return pixels.map((pixel: any) => ({
          ...pixel,
          advertiser_id: adv.advertiser_id,
        }));
      } catch (error) {
        console.error(`Failed to fetch pixels for advertiser ${adv.advertiser_id}:`, error);
        return [];
      }
    });

    const pixelResults = await Promise.all(pixelPromises);
    pixelResults.forEach((pixels) => {
      allPixels.push(...pixels);
    });

    // Store in database
    if (allPixels.length > 0) {
      const pixelRecords = allPixels.map((pixel: any) => ({
        user_id: session.user.id,
        bc_id,
        pixel_id: pixel.pixel_id,
        pixel_name: pixel.pixel_name,
        advertiser_id: pixel.advertiser_id,
        status: pixel.status,
        events: pixel.events || [],
        created_at: new Date().toISOString(),
      }));

      const { error: upsertError } = await supabase
        .from('tiktok_pixels')
        .upsert(pixelRecords, {
          onConflict: 'pixel_id'
        });

      if (upsertError) {
        console.error('Failed to upsert pixels:', upsertError);
        // Still return the fresh data from API
      }
    }

    return NextResponse.json(allPixels);
  } catch (error) {
    console.error('Pixels fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pixels' },
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

    // Get advertisers for this BC
    const { data: advertisers, error: advError } = await supabase
      .from('tiktok_advertisers')
      .select('advertiser_id')
      .eq('bc_id', bc_id)
      .eq('user_id', session.user.id);

    if (advError || !advertisers || advertisers.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    const api = new TikTokApi(bc.access_token);
    const allPixels: any[] = [];

    // Fetch pixels for each advertiser
    const pixelPromises = advertisers.map(async (adv) => {
      try {
        const pixels = await api.getPixels(adv.advertiser_id);
        return pixels.map((pixel: any) => ({
          ...pixel,
          advertiser_id: adv.advertiser_id,
        }));
      } catch (error) {
        console.error(`Failed to fetch pixels for advertiser ${adv.advertiser_id}:`, error);
        return [];
      }
    });

    const pixelResults = await Promise.all(pixelPromises);
    pixelResults.forEach((pixels) => {
      allPixels.push(...pixels);
    });

    // Store in database
    if (allPixels.length > 0) {
      const pixelRecords = allPixels.map((pixel: any) => ({
        user_id: session.user.id,
        bc_id,
        pixel_id: pixel.pixel_id,
        pixel_name: pixel.pixel_name,
        advertiser_id: pixel.advertiser_id,
        status: pixel.status,
        events: pixel.events || [],
        created_at: new Date().toISOString(),
      }));

      const { error: upsertError } = await supabase
        .from('tiktok_pixels')
        .upsert(pixelRecords, {
          onConflict: 'pixel_id'
        });

      if (upsertError) {
        console.error('Failed to upsert pixels:', upsertError);
        return NextResponse.json(
          { error: 'Failed to sync pixels' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      count: allPixels.length,
    });
  } catch (error) {
    console.error('Pixels sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync pixels' },
      { status: 500 }
    );
  }
}
