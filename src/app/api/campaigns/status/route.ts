import { NextRequest, NextResponse } from 'next/server';
import { TikTokApi } from '@/lib/tiktok-api';
import { createServerSupabase } from '@/lib/supabase-server';

type EntityType = 'campaign' | 'adgroup' | 'ad';
type Action = 'ENABLE' | 'DISABLE' | 'DELETE';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { advertiser_id, entity_type, entity_ids, action } = body;

    if (!advertiser_id || !entity_type || !entity_ids || !action) {
      return NextResponse.json(
        { error: 'advertiser_id, entity_type, entity_ids, and action are required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(entity_ids) || entity_ids.length === 0) {
      return NextResponse.json(
        { error: 'entity_ids must be a non-empty array' },
        { status: 400 }
      );
    }

    const validEntityTypes = ['campaign', 'adgroup', 'ad'];
    const validActions = ['ENABLE', 'DISABLE', 'DELETE'];

    if (!validEntityTypes.includes(entity_type)) {
      return NextResponse.json(
        { error: 'entity_type must be one of: campaign, adgroup, ad' },
        { status: 400 }
      );
    }

    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: 'action must be one of: ENABLE, DISABLE, DELETE' },
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

    // Verify advertiser belongs to user's BC
    const { data: advertiser, error: advError } = await supabase
      .from('tiktok_advertisers')
      .select('bc_id')
      .eq('advertiser_id', advertiser_id)
      .eq('user_id', session.user.id)
      .single();

    if (advError || !advertiser) {
      return NextResponse.json(
        { error: 'Advertiser not found' },
        { status: 404 }
      );
    }

    // Get BC access token
    const { data: bc, error: bcError } = await supabase
      .from('business_centers')
      .select('access_token')
      .eq('bc_id', advertiser.bc_id)
      .eq('user_id', session.user.id)
      .single();

    if (bcError || !bc) {
      return NextResponse.json(
        { error: 'Business center not found' },
        { status: 404 }
      );
    }

    const api = new TikTokApi(bc.access_token);

    try {
      // Update entity status based on type
      let result;

      switch (entity_type) {
        case 'campaign':
          result = await api.updateCampaignStatus(advertiser_id, entity_ids, action as Action);
          break;
        case 'adgroup':
          result = await api.request('POST', '/adgroup/status/update/', {
            advertiser_id,
            adgroup_ids: entity_ids,
            opt_status: action,
          });
          break;
        case 'ad':
          result = await api.updateAdStatus(advertiser_id, entity_ids, action as Action);
          break;
      }

      return NextResponse.json({
        success: true,
        message: `${entity_type} status updated successfully`,
        entity_type,
        entity_ids,
        action,
      });
    } catch (apiError: any) {
      console.error(`Failed to update ${entity_type} status:`, apiError);
      return NextResponse.json(
        { error: apiError.message || 'Failed to update status' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Campaign status update error:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign status' },
      { status: 500 }
    );
  }
}
