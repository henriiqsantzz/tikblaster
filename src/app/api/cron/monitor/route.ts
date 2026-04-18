export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { TikTokApi } from '@/lib/tiktok-api';
import { createServiceSupabase } from '@/lib/supabase-server';
import { sendPushNotification, getNotificationPayload } from '@/lib/notifications';

export async function GET(request: NextRequest) {
  try {
    // Verify CRON_SECRET header for security
    const cronSecret = request.headers.get('authorization');
    const expectedSecret = `Bearer ${process.env.CRON_SECRET}`;

    if (!process.env.CRON_SECRET || cronSecret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createServiceSupabase();

    // Get all active business centers
    const { data: bcs, error: bcError } = await supabase
      .from('business_centers')
      .select('*');

    if (bcError || !bcs) {
      console.error('Failed to fetch business centers:', bcError);
      return NextResponse.json(
        { error: 'Failed to fetch business centers' },
        { status: 500 }
      );
    }

    let checksPerformed = 0;
    let alertsSent = 0;

    // Process each BC
    for (const bc of bcs) {
      try {
        const api = new TikTokApi(bc.access_token);

        // Get advertisers for this BC
        const { data: advertisers, error: advError } = await supabase
          .from('tiktok_advertisers')
          .select('advertiser_id, advertiser_name, status')
          .eq('bc_id', bc.bc_id);

        if (advError || !advertisers) {
          console.error(`Failed to fetch advertisers for BC ${bc.bc_id}:`, advError);
          continue;
        }

        // Check each advertiser
        for (const advertiser of advertisers) {
          try {
            // Check advertiser account status
            const advInfo = await api.getAdvertiserInfo([advertiser.advertiser_id]);

            if (advInfo && advInfo.length > 0) {
              const currentStatus = advInfo[0].status;

              // Check if status changed
              if (currentStatus !== advertiser.status) {
                // Update in database
                await supabase
                  .from('tiktok_advertisers')
                  .update({ status: currentStatus })
                  .eq('advertiser_id', advertiser.advertiser_id);

                // Send alert if suspended
                if (currentStatus === 'SUSPENDED') {
                  const payload = getNotificationPayload('ACCOUNT_SUSPENDED', {
                    account_name: advertiser.advertiser_name,
                    advertiser_id: advertiser.advertiser_id,
                  });

                  // Get user push subscriptions
                  const { data: subscriptions } = await supabase
                    .from('push_subscriptions')
                    .select('*')
                    .eq('user_id', bc.user_id);

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
                        alertsSent++;
                      } catch (error) {
                        console.error('Failed to send push notification:', error);
                      }
                    }
                  }
                }

                checksPerformed++;
              }
            }

            // Check ad review statuses
            const campaigns = await api.getCampaigns(advertiser.advertiser_id, {
              page_size: 100,
            });

            if (campaigns.list && campaigns.list.length > 0) {
              for (const campaign of campaigns.list) {
                // Get ads for this campaign
                const ads = await api.getAds(advertiser.advertiser_id, {
                  filtering: [
                    {
                      field_name: 'campaign_id',
                      filter_operator: 'EQ',
                      filter_value: campaign.campaign_id,
                    },
                  ],
                  page_size: 100,
                });

                if (ads.data?.list) {
                  for (const ad of ads.data.list) {
                    // Check for ad review status changes
                    const { data: adRecord } = await supabase
                      .from('ad_monitoring')
                      .select('review_status')
                      .eq('ad_id', ad.ad_id)
                      .single();

                    const currentReviewStatus = ad.review_status;

                    if (adRecord && adRecord.review_status !== currentReviewStatus) {
                      let notificationType = '';

                      if (currentReviewStatus === 'APPROVED') {
                        notificationType = 'AD_APPROVED';
                      } else if (currentReviewStatus === 'REJECTED') {
                        notificationType = 'AD_REJECTED';
                      }

                      if (notificationType) {
                        const payload = getNotificationPayload(notificationType, {
                          ad_id: ad.ad_id,
                          ad_name: ad.ad_name,
                          account_name: advertiser.advertiser_name,
                          reason: ad.reject_reason || undefined,
                        });

                        // Get user push subscriptions
                        const { data: subscriptions } = await supabase
                          .from('push_subscriptions')
                          .select('*')
                          .eq('user_id', bc.user_id);

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
                              alertsSent++;
                            } catch (error) {
                              console.error('Failed to send push notification:', error);
                            }
                          }
                        }

                        checksPerformed++;
                      }

                      // Update ad monitoring record
                      await supabase
                        .from('ad_monitoring')
                        .update({
                          review_status: currentReviewStatus,
                          updated_at: new Date().toISOString(),
                        })
                        .eq('ad_id', ad.ad_id);
                    }
                  }
                }
              }
            }

            checksPerformed++;
          } catch (error) {
            console.error(`Failed to check advertiser ${advertiser.advertiser_id}:`, error);
          }
        }
      } catch (error) {
        console.error(`Failed to process BC ${bc.bc_id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Monitoring completed',
      checks_performed: checksPerformed,
      alerts_sent: alertsSent,
    });
  } catch (error) {
    console.error('Cron monitor error:', error);
    return NextResponse.json(
      { error: 'Monitoring failed' },
      { status: 500 }
    );
  }
}
