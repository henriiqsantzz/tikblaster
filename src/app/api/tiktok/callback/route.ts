export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { TikTokApi } from '@/lib/tiktok-api';
import { createServiceSupabase } from '@/lib/supabase-server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Check for OAuth errors
    if (error) {
      const errorDescription = searchParams.get('error_description') || 'Unknown error';
      console.error('TikTok OAuth error:', error, errorDescription);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/auth/error?error=${encodeURIComponent(errorDescription)}`
      );
    }

    // Verify state CSRF token
    const cookieStore = cookies();
    const storedState = cookieStore.get('tiktok_oauth_state')?.value;

    if (!state || !storedState || state !== storedState) {
      console.error('State mismatch - possible CSRF attack');
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/auth/error?error=${encodeURIComponent('Invalid state')}`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/auth/error?error=${encodeURIComponent('No authorization code')}`
      );
    }

    // Exchange code for access token
    const { access_token, advertiser_ids } = await TikTokApi.getAccessToken(code);

    // Get user from session
    const supabase = createServiceSupabase();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login`
      );
    }

    // Get BC info and store credentials
    const api = new TikTokApi(access_token);
    const bcs = await api.getBusinessCenters();

    if (!bcs || bcs.length === 0) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/auth/error?error=${encodeURIComponent('No business centers found')}`
      );
    }

    const bc = bcs[0]; // Use first BC
    const token_expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

    // Store BC info in database
    const { error: bcError } = await supabase
      .from('business_centers')
      .upsert({
        user_id: session.user.id,
        bc_id: bc.bc_id,
        name: bc.name || 'Default Business Center',
        access_token,
        token_expires_at,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'bc_id'
      });

    if (bcError) {
      console.error('Failed to store BC info:', bcError);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/auth/error?error=${encodeURIComponent('Failed to store credentials')}`
      );
    }

    // Sync advertisers from BC
    try {
      const advertisers = await api.getBcAdvertisers(bc.bc_id);

      if (advertisers && advertisers.length > 0) {
        const advertiserRecords = advertisers.map((adv: any) => ({
          user_id: session.user.id,
          advertiser_id: adv.advertiser_id,
          advertiser_name: adv.advertiser_name,
          bc_id: bc.bc_id,
          status: adv.status || 'ACTIVE',
          balance: adv.balance || 0,
          currency: adv.currency || 'BRL',
          timezone: adv.timezone,
          created_at: new Date().toISOString(),
        }));

        const { error: advError } = await supabase
          .from('tiktok_advertisers')
          .upsert(advertiserRecords, {
            onConflict: 'advertiser_id'
          });

        if (advError) {
          console.error('Failed to sync advertisers:', advError);
          // Don't fail the whole auth flow if advertisers sync fails
        }
      }
    } catch (syncError) {
      console.error('Error syncing advertisers:', syncError);
      // Don't fail the whole auth flow if advertiser sync fails
    }

    // Clear the state cookie
    const response = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
    );
    response.cookies.set('tiktok_oauth_state', '', { maxAge: 0 });

    return response;
  } catch (error) {
    console.error('TikTok callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/error?error=${encodeURIComponent('Authentication failed')}`
    );
  }
}
