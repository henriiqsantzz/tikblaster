export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { TikTokApi } from '@/lib/tiktok-api';
import { createServerSupabase } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bc_id = searchParams.get('bc_id');

    if (!bc_id) {
      return NextResponse.json({ error: 'bc_id is required' }, { status: 400 });
    }

    const supabase = createServerSupabase();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: bc, error: bcError } = await supabase
      .from('business_centers')
      .select('access_token')
      .eq('bc_id', bc_id)
      .eq('user_id', session.user.id)
      .single();

    if (bcError || !bc) {
      return NextResponse.json({ error: 'BC not found' }, { status: 404 });
    }

    const { data: advertisers } = await supabase
      .from('tiktok_advertisers')
      .select('advertiser_id, advertiser_name, status')
      .eq('bc_id', bc_id)
      .eq('user_id', session.user.id);

    if (!advertisers || advertisers.length === 0) {
      return NextResponse.json([]);
    }

    const api = new TikTokApi(bc.access_token);
    const allCampaigns: any[] = [];

    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    for (const adv of advertisers) {
      try {
        const campaignData = await api.getCampaigns(adv.advertiser_id, {
          page_size: 100,
          fields: ['campaign_id', 'campaign_name', 'objective_type', 'budget', 'budget_mode', 'operation_status', 'create_time'],
        });

        let metricsMap: Record<string, any> = {};
        try {
          const report = await api.getReport(adv.advertiser_id, {
            report_type: 'BASIC',
            data_level: 'AUCTION_CAMPAIGN',
            dimensions: ['campaign_id'],
            metrics: ['spend', 'impressions', 'clicks', 'conversions', 'conversion_cost', 'ctr', 'cpm'],
            start_date: weekAgo,
            end_date: today,
          });
          if (report.data?.list) {
            report.data.list.forEach((item: any) => {
              const dims = item.dimensions || {};
              const mets = item.metrics || {};
              metricsMap[dims.campaign_id] = mets;
            });
          }
        } catch (reportErr) {
          console.error('Report error for ' + adv.advertiser_id + ':', reportErr);
        }

        const campaigns = campaignData?.list || [];
        campaigns.forEach((c: any) => {
          const m = metricsMap[c.campaign_id] || {};
          allCampaigns.push({
            campaign_id: c.campaign_id,
            campaign_name: c.campaign_name,
            objective: c.objective_type,
            status: c.operation_status || 'UNKNOWN',
            budget: parseFloat(c.budget) || 0,
            budget_mode: c.budget_mode,
            advertiser_id: adv.advertiser_id,
            advertiser_name: adv.advertiser_name,
            spend: parseFloat(m.spend) || 0,
            impressions: parseInt(m.impressions) || 0,
            clicks: parseInt(m.clicks) || 0,
            conversions: parseInt(m.conversions) || 0,
            cpa: parseFloat(m.conversion_cost) || 0,
            ctr: parseFloat(m.ctr) || 0,
            cpm: parseFloat(m.cpm) || 0,
            roas: 0,
            create_time: c.create_time,
          });
        });
      } catch (err) {
        console.error('Campaign fetch error for ' + adv.advertiser_id + ':', err);
      }
    }

    return NextResponse.json(allCampaigns);
  } catch (error) {
    console.error('Manager campaigns error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
