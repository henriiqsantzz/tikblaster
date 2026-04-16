import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServiceSupabase } from '@/lib/supabase-server';
import { sendPushNotification, getNotificationPayload } from '@/lib/notifications';

interface TikTokWebhookEvent {
  type: string;
  event_id: string;
  timestamp: number;
  data: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature
    const signature = request.headers.get('x-tiktok-signature');
    const body = await request.text();

    if (!verifyWebhookSignature(body, signature)) {
      console.warn('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event: TikTokWebhookEvent = JSON.parse(body);

    const supabase = createServiceSupabase();

    // Handle different event types
    switch (event.type) {
      case 'CONVERSION':
        await handleConversionEvent(event, supabase);
        break;
      case 'AD_STATUS_CHANGE':
        await handleAdStatusChangeEvent(event, supabase);
        break;
      case 'ACCOUNT_SUSPENSION':
        await handleAccountSuspensionEvent(event, supabase);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return 200 to acknowledge receipt
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

function verifyWebhookSignature(body: string, signature: string | null): boolean {
  if (!signature) {
    return false;
  }

  const secret = process.env.TIKTOK_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('TIKTOK_WEBHOOK_SECRET not configured');
    return false;
  }

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(body);
  const calculated = hmac.digest('hex');

  return crypto.timingSafeEqual(Buffer.from(calculated), Buffer.from(signature));
}

async function handleConversionEvent(event: TikTokWebhookEvent, supabase: any) {
  try {
    const {
      advertiser_id,
      campaign_id,
      conversion_id,
      amount,
      currency,
      timestamp,
    } = event.data;

    // Store conversion in database
    const { error: storeError } = await supabase
      .from('conversions')
      .insert([{
        advertiser_id,
        campaign_id,
        conversion_id,
        amount,
        currency,
        event_timestamp: new Date(timestamp * 1000).toISOString(),
        created_at: new Date().toISOString(),
      }]);

    if (storeError) {
      console.error('Failed to store conversion:', storeError);
      return;
    }

    // Get advertiser and user info
    const { data: advertiser } = await supabase
      .from('tiktok_advertisers')
      .select('advertiser_name, user_id')
      .eq('advertiser_id', advertiser_id)
      .single();

    if (!advertiser) {
      console.warn(`Advertiser ${advertiser_id} not found`);
      return;
    }

    // Get today's total conversions
    const today = new Date().toISOString().split('T')[0];
    const { data: todaysConversions, error: queryError } = await supabase
      .from('conversions')
      .select('amount')
      .eq('advertiser_id', advertiser_id)
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`);

    let dailyTotal = amount || 0;
    if (!queryError && todaysConversions) {
      dailyTotal = todaysConversions.reduce((sum: number, conv: any) => sum + (conv.amount || 0), 0);
    }

    // Send push notification
    const payload = getNotificationPayload('SALE_APPROVED', {
      amount: amount || 0,
      account_name: advertiser.advertiser_name,
      conversion_id,
      daily_total: dailyTotal,
    });

    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', advertiser.user_id);

    if (subscriptions && subscriptions.length > 0) {
      for (const sub of subscriptions) {
        try {
          await sendPushNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                auth: sub.auth,
                p256dh: sub.p256dh,
              },
            },
            payload
          );
        } catch (error) {
          console.error('Failed to send push notification:', error);
        }
      }
    }

    console.log(`Conversion event processed: ${conversion_id}`);
  } catch (error) {
    console.error('Conversion event handling error:', error);
  }
}

async function handleAdStatusChangeEvent(event: TikTokWebhookEvent, supabase: any) {
  try {
    const {
      advertiser_id,
      ad_id,
      status,
      review_status,
      reject_reason,
      timestamp,
    } = event.data;

    // Store ad status change
    const { error: storeError } = await supabase
      .from('ad_monitoring')
      .upsert({
        ad_id,
        advertiser_id,
        status,
        review_status,
        reject_reason,
        checked_at: new Date(timestamp * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'ad_id'
      });

    if (storeError) {
      console.error('Failed to store ad status:', storeError);
      return;
    }

    // Get advertiser and user info
    const { data: advertiser } = await supabase
      .from('tiktok_advertisers')
      .select('advertiser_name, user_id')
      .eq('advertiser_id', advertiser_id)
      .single();

    if (!advertiser) {
      console.warn(`Advertiser ${advertiser_id} not found`);
      return;
    }

    // Send push notification if status is approved or rejected
    if (review_status === 'APPROVED' || review_status === 'REJECTED') {
      const notificationType = review_status === 'APPROVED' ? 'AD_APPROVED' : 'AD_REJECTED';
      const payload = getNotificationPayload(notificationType, {
        ad_id,
        ad_name: `Ad ${ad_id}`,
        account_name: advertiser.advertiser_name,
        reason: reject_reason,
      });

      const { data: subscriptions } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', advertiser.user_id);

      if (subscriptions && subscriptions.length > 0) {
        for (const sub of subscriptions) {
          try {
            await sendPushNotification(
              {
                endpoint: sub.endpoint,
                keys: {
                  auth: sub.auth,
                  p256dh: sub.p256dh,
                },
              },
              payload
            );
          } catch (error) {
            console.error('Failed to send push notification:', error);
          }
        }
      }
    }

    console.log(`Ad status change processed: ${ad_id} -> ${review_status}`);
  } catch (error) {
    console.error('Ad status change event handling error:', error);
  }
}

async function handleAccountSuspensionEvent(event: TikTokWebhookEvent, supabase: any) {
  try {
    const {
      advertiser_id,
      reason,
      timestamp,
    } = event.data;

    // Update advertiser status
    const { error: updateError } = await supabase
      .from('tiktok_advertisers')
      .update({
        status: 'SUSPENDED',
        updated_at: new Date().toISOString(),
      })
      .eq('advertiser_id', advertiser_id);

    if (updateError) {
      console.error('Failed to update advertiser status:', updateError);
      return;
    }

    // Get advertiser and user info
    const { data: advertiser } = await supabase
      .from('tiktok_advertisers')
      .select('advertiser_name, user_id')
      .eq('advertiser_id', advertiser_id)
      .single();

    if (!advertiser) {
      console.warn(`Advertiser ${advertiser_id} not found`);
      return;
    }

    // Send push notification
    const payload = getNotificationPayload('ACCOUNT_SUSPENDED', {
      account_name: advertiser.advertiser_name,
      advertiser_id,
    });

    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', advertiser.user_id);

    if (subscriptions && subscriptions.length > 0) {
      for (const sub of subscriptions) {
        try {
          await sendPushNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                auth: sub.auth,
                p256dh: sub.p256dh,
              },
            },
            payload
          );
        } catch (error) {
          console.error('Failed to send push notification:', error);
        }
      }
    }

    console.log(`Account suspension processed: ${advertiser_id}`);
  } catch (error) {
    console.error('Account suspension event handling error:', error);
  }
}
