export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    // Generate CSRF state token
    const state = crypto.randomBytes(32).toString('hex');

    // Store state in response headers (to be set in cookie on client)
    const appId = process.env.TIKTOK_APP_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/tiktok/callback`;
    const scope = 'business_management,ad_management,offline_access';

    const authUrl = new URL('https://business-api.tiktok.com/oauth/authorize');
    authUrl.searchParams.append('app_id', appId!);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('scope', scope);
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('response_type', 'code');

    // Create response and set state in cookie
    const response = NextResponse.redirect(authUrl.toString());
    response.cookies.set('tiktok_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
    });

    return response;
  } catch (error) {
    console.error('TikTok auth error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate authentication' },
      { status: 500 }
    );
  }
}
