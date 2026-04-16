import { NextRequest, NextResponse } from 'next/server';
import { TikTokApi } from '@/lib/tiktok-api';
import { createServerSupabase } from '@/lib/supabase-server';
import { AccountProvisioningConfig, ProvisioningJob, ProvisioningResult } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as AccountProvisioningConfig & { job_id?: string };
    const { bc_id, company_name, industry_id, contact_name, contact_email, contact_phone, timezone, currency, quantity, name_prefix } = body;

    if (!bc_id || !company_name || !industry_id || !contact_name || !contact_email || !contact_phone || !timezone || !currency || !quantity || !name_prefix) {
      return NextResponse.json(
        { error: 'All configuration fields are required' },
        { status: 400 }
      );
    }

    if (quantity < 1 || quantity > 100) {
      return NextResponse.json(
        { error: 'Quantity must be between 1 and 100' },
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

    // Verify BC belongs to user
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

    // Create provisioning job record
    const jobId = `prov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const job: ProvisioningJob = {
      id: jobId,
      user_id: session.user.id,
      bc_id,
      status: 'PENDING',
      total_accounts: quantity,
      created_accounts: 0,
      failed_accounts: 0,
      config: {
        bc_id,
        company_name,
        industry_id,
        contact_name,
        contact_email,
        contact_phone,
        timezone,
        currency,
        quantity,
        name_prefix,
      },
      results: [],
      created_at: now,
    };

    // Store job in database
    const { error: jobError } = await supabase
      .from('provisioning_jobs')
      .insert([job]);

    if (jobError) {
      console.error('Failed to create provisioning job:', jobError);
      return NextResponse.json(
        { error: 'Failed to create job' },
        { status: 500 }
      );
    }

    // Start processing asynchronously
    processAccountProvisioning(
      jobId,
      bc_id,
      quantity,
      name_prefix,
      company_name,
      industry_id,
      contact_name,
      contact_email,
      contact_phone,
      timezone,
      currency,
      bc.access_token,
      session.user.id
    ).catch((error) => {
      console.error('Async account provisioning error:', error);
    });

    return NextResponse.json({
      job_id: jobId,
      status: 'PENDING',
      total_accounts: quantity,
    });
  } catch (error) {
    console.error('Account provisioning error:', error);
    return NextResponse.json(
      { error: 'Failed to start account provisioning' },
      { status: 500 }
    );
  }
}

async function processAccountProvisioning(
  jobId: string,
  bcId: string,
  quantity: number,
  namePrefix: string,
  companyName: string,
  industryId: string,
  contactName: string,
  contactEmail: string,
  contactPhone: string,
  timezone: string,
  currency: string,
  accessToken: string,
  userId: string
) {
  const supabase = createServerSupabase();
  const results: ProvisioningResult[] = [];
  let created = 0;
  let failed = 0;

  // Update job status to PROCESSING
  await supabase
    .from('provisioning_jobs')
    .update({ status: 'PROCESSING' })
    .eq('id', jobId);

  const api = new TikTokApi(accessToken);

  for (let i = 1; i <= quantity; i++) {
    try {
      const advertiserName = `${namePrefix} ${i}`;

      const result = await api.createAdvertiserAccount(bcId, {
        advertiser_name: advertiserName,
        company: companyName,
        industry_id: industryId,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone_number: contactPhone,
        timezone,
        currency,
      });

      const advertiserId = result.data?.advertiser_id;

      if (!advertiserId) {
        results.push({
          advertiser_name: advertiserName,
          status: 'FAILED',
          error_message: 'No advertiser ID returned',
        });
        failed++;
        continue;
      }

      // Store in database
      await supabase
        .from('tiktok_advertisers')
        .insert([{
          user_id: userId,
          advertiser_id: advertiserId,
          advertiser_name: advertiserName,
          bc_id: bcId,
          status: 'ACTIVE',
          balance: 0,
          currency,
          timezone,
          created_at: new Date().toISOString(),
        }]);

      results.push({
        advertiser_id: advertiserId,
        advertiser_name: advertiserName,
        status: 'SUCCESS',
      });

      created++;
    } catch (error: any) {
      console.error(`Failed to provision account ${namePrefix} ${i}:`, error);

      results.push({
        advertiser_name: `${namePrefix} ${i}`,
        status: 'FAILED',
        error_message: error.message || 'Failed to create account',
      });

      failed++;
    }
  }

  // Update job with final status and results
  const finalStatus = failed === 0 ? 'COMPLETED' : failed === quantity ? 'FAILED' : 'COMPLETED';

  await supabase
    .from('provisioning_jobs')
    .update({
      status: finalStatus,
      created_accounts: created,
      failed_accounts: failed,
      results,
    })
    .eq('id', jobId);
}
