export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, createServiceSupabase } from '@/lib/supabase-server';
import { sendPushNotification, getNotificationPayload, PushPayload } from '@/lib/notifications';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

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

    // Fetch notifications for user
    const { data: notifications, error, count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Failed to fetch notifications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch notifications' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      notifications,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Notifications fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, type, data, send_push } = body;

    // Verify authentication (internal endpoint, should use service role or API key)
    const authHeader = request.headers.get('authorization');
    const expectedKey = process.env.NOTIFICATIONS_API_KEY;

    if (expectedKey && authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createServiceSupabase();

    // Create notification record
    const payload = getNotificationPayload(type, data);

    const { error: notifError } = await supabase
      .from('notifications')
      .insert([{
        user_id,
        type,
        title: payload.title,
        message: payload.body,
        data: payload.data,
        read: false,
        created_at: new Date().toISOString(),
      }]);

    if (notifError) {
      console.error('Failed to create notification:', notifError);
      return NextResponse.json(
        { error: 'Failed to create notification' },
        { status: 500 }
      );
    }

    // Send push notification if requested
    if (send_push) {
      try {
        const { data: subscriptions, error: subError } = await supabase
          .from('push_subscriptions')
          .select('*')
          .eq('user_id', user_id);

        if (!subError && subscriptions && subscriptions.length > 0) {
          const pushPromises = subscriptions.map(async (sub) => {
            try {
              const webPushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                  auth: sub.auth,
                  p256dh: sub.p256dh,
                },
              };

              await sendPushNotification(webPushSubscription, payload);
            } catch (error) {
              console.error('Failed to send push notification:', error);
              // If subscription is invalid, delete it
              if (error instanceof Error && error.message.includes('410')) {
                await supabase
                  .from('push_subscriptions')
                  .delete()
                  .eq('endpoint', sub.endpoint);
              }
            }
          });

          await Promise.all(pushPromises);
        }
      } catch (pushError) {
        console.error('Push notification error:', pushError);
        // Don't fail the whole request if push fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Notification created and sent',
    });
  } catch (error) {
    console.error('Notification creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
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

    // Mark notification as read
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Failed to update notification:', error);
      return NextResponse.json(
        { error: 'Failed to update notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    console.error('Notification update error:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}
