export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { TikTokApi } from '@/lib/tiktok-api';
import { createServerSupabase } from '@/lib/supabase-server';
import { DashboardMetrics } from '@/types';

type DateRange = 'today' | '3days' | '7days' | '30days';

function getDateRange(range: DateRange): { start_date: string; end_date: string } {
  const today = new Date();
  const end_date = today.toISOString().split('T')[0];
  let start_date = end_date;

  switch (range) {
    case '3days':
      start_date = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      break;
    case '7days':
      start_date = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      break;
    case '30days':
      start_date = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      break;
    case 'today':
    default:
      break;
  }

  return { start_date, end_date };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bc_id = searchParams.get('bc_id');
    const date_range = (searchParams.get('date_range') || 'today') as DateRange;

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

    if (advError || !advertisers) {
      return NextResponse.json(
        { error: 'Failed to fetch advertisers' },
        { status: 500 }
      );
    }

    const api = new TikTokApi(bc.access_token);
    const { start_date, end_date } = getDateRange(date_range);

    // Fetch reports for each advertiser
    const metrics: DashboardMetrics = {
      revenue: 0,
      spend: 0,
      cpa: 0,
      cpm: 0,
      ctr: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      roas: 0,
      active_accounts: 0,
      revenue_trend: 'STABLE',
      spend_trend: 'STABLE',
    };

    const reportPromises = advertisers.map(async (adv) => {
      try {
        const report = await api.getReport(adv.advertiser_id, {
          report_type: 'BASIC',
          data_level: 'AUCTION_CAMPAIGN',
          dimensions: ['campaign_id'],
          metrics: [
            'spend',
            'impressions',
            'clicks',
            'conversions',
            'total_complete_payment_rate',
            'conversion_cost',
          ],
          start_date,
          end_date,
        });

        return report.data?.list || [];
      } catch (error) {
        console.error(`Failed to fetch report for advertiser ${adv.advertiser_id}:`, error);
        return [];
      }
    });

    const allReports = await Promise.all(reportPromises);

    // Aggregate metrics
    allReports.forEach((reportList) => {
      reportList.forEach((item: any) => {
        metrics.spend += parseFloat(item.spend) || 0;
        metrics.impressions += parseInt(item.impressions) || 0;
        metrics.clicks += parseInt(item.clicks) || 0;
        metrics.conversions += parseInt(item.conversions) || 0;

        const cost = parseFloat(item.conversion_cost) || 0;
        if (metrics.conversions > 0) {
          metrics.cpa = metrics.spend / metrics.conversions;
        }

        if (metrics.impressions > 0) {
          metrics.cpm = (metrics.spend / metrics.impressions) * 1000;
          metrics.ctr = (metrics.clicks / metrics.impressions) * 100;
        }
      });
    });

    // Calculate ROAS (assuming revenue is tracked separately)
    // For now, using a placeholder - should be from conversion tracking
    metrics.roas = metrics.spend > 0 ? (metrics.revenue || 0) / metrics.spend : 0;
    metrics.active_accounts = advertisers.length;

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Report fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}
