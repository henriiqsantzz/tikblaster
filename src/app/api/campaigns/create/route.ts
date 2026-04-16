import { NextRequest, NextResponse } from 'next/server';
import { TikTokApi } from '@/lib/tiktok-api';
import { createServerSupabase } from '@/lib/supabase-server';
import { BulkCampaignJob, BulkCampaignResult } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { target_accounts, campaign_config, adgroup_config, creative_config } = body;

    if (!target_accounts || !Array.isArray(target_accounts) || target_accounts.length === 0) {
      return NextResponse.json(
        { error: 'target_accounts is required and must be a non-empty array' },
        { status: 400 }
      );
    }

    if (!campaign_config || !adgroup_config || !creative_config) {
      return NextResponse.json(
        { error: 'campaign_config, adgroup_config, and creative_config are required' },
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

    // Create bulk job record
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const job: BulkCampaignJob = {
      id: jobId,
      user_id: session.user.id,
      status: 'PENDING',
      total_campaigns: target_accounts.length,
      completed_campaigns: 0,
      failed_campaigns: 0,
      target_accounts,
      campaign_config,
      adgroup_config,
      creative_config,
      results: [],
      created_at: now,
    };

    // Store job in database
    const { error: jobError } = await supabase
      .from('bulk_jobs')
      .insert([job]);

    if (jobError) {
      console.error('Failed to create bulk job:', jobError);
      return NextResponse.json(
        { error: 'Failed to create job' },
        { status: 500 }
      );
    }

    // Start processing asynchronously
    processBulkCampaigns(
      jobId,
      target_accounts,
      campaign_config,
      adgroup_config,
      creative_config,
      session.user.id
    ).catch((error) => {
      console.error('Async bulk campaign processing error:', error);
    });

    return NextResponse.json({
      job_id: jobId,
      status: 'PENDING',
      total_campaigns: target_accounts.length,
    });
  } catch (error) {
    console.error('Campaign creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create campaigns' },
      { status: 500 }
    );
  }
}

async function processBulkCampaigns(
  jobId: string,
  targetAccounts: string[],
  campaignConfig: any,
  adgroupConfig: any,
  creativeConfig: any,
  userId: string
) {
  const supabase = createServerSupabase();
  const results: BulkCampaignResult[] = [];
  let completed = 0;
  let failed = 0;

  // Update job status to PROCESSING
  await supabase
    .from('bulk_jobs')
    .update({ status: 'PROCESSING' })
    .eq('id', jobId);

  for (const advertiserIdStr of targetAccounts) {
    const advertiserId = advertiserIdStr.toString();

    try {
      // Get advertiser info and BC access token
      const { data: advertiser, error: advError } = await supabase
        .from('tiktok_advertisers')
        .select('advertiser_id, bc_id, advertiser_name')
        .eq('advertiser_id', advertiserId)
        .eq('user_id', userId)
        .single();

      if (advError || !advertiser) {
        results.push({
          advertiser_id: advertiserId,
          advertiser_name: 'Unknown',
          status: 'FAILED',
          error_message: 'Advertiser not found',
        });
        failed++;
        continue;
      }

      // Get BC access token
      const { data: bc, error: bcError } = await supabase
        .from('business_centers')
        .select('access_token')
        .eq('bc_id', advertiser.bc_id)
        .eq('user_id', userId)
        .single();

      if (bcError || !bc) {
        results.push({
          advertiser_id: advertiserId,
          advertiser_name: advertiser.advertiser_name,
          status: 'FAILED',
          error_message: 'Business center not found',
        });
        failed++;
        continue;
      }

      const api = new TikTokApi(bc.access_token);

      // 1. Create campaign
      const campaignResult = await api.createCampaign(advertiserId, {
        campaign_name: campaignConfig.campaign_name || `Campaign ${Date.now()}`,
        objective_type: campaignConfig.objective_type || 'CONVERSIONS',
        campaign_type: campaignConfig.campaign_type,
        budget_mode: campaignConfig.budget_mode,
        budget: campaignConfig.budget,
        operation_status: 'ENABLE',
      });

      const campaignId = campaignResult.campaign_id;

      // 2. Create ad group
      const adgroupResult = await api.createAdGroup(advertiserId, {
        campaign_id: campaignId,
        adgroup_name: adgroupConfig.name || `Ad Group ${Date.now()}`,
        ...adgroupConfig,
      });

      const adgroupId = adgroupResult.adgroup_id;

      // 3. Create ad
      const adResult = await api.createAd(advertiserId, {
        adgroup_id: adgroupId,
        ad_name: creativeConfig.ad_text || `Ad ${Date.now()}`,
        ...creativeConfig,
      });

      const adId = adResult.ad_id;

      results.push({
        advertiser_id: advertiserId,
        advertiser_name: advertiser.advertiser_name,
        campaign_id: campaignId,
        adgroup_id: adgroupId,
        ad_id: adId,
        status: 'SUCCESS',
      });

      completed++;
    } catch (error: any) {
      console.error(`Failed to create campaign for advertiser ${advertiserId}:`, error);

      const { data: advertiser } = await supabase
        .from('tiktok_advertisers')
        .select('advertiser_name')
        .eq('advertiser_id', advertiserId)
        .eq('user_id', userId)
        .single();

      results.push({
        advertiser_id: advertiserId,
        advertiser_name: advertiser?.advertiser_name || 'Unknown',
        status: 'FAILED',
        error_message: error.message || 'Failed to create campaign',
      });

      failed++;
    }
  }

  // Update job with final status and results
  const finalStatus = failed === 0 ? 'COMPLETED' : failed === targetAccounts.length ? 'FAILED' : 'PARTIAL';

  await supabase
    .from('bulk_jobs')
    .update({
      status: finalStatus,
      completed_campaigns: completed,
      failed_campaigns: failed,
      results,
      completed_at: new Date().toISOString(),
    })
    .eq('id', jobId);
}
