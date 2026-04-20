import webPush from 'web-push';

// Lazy VAPID initialization to avoid build-time errors
let vapidInitialized = false;
function ensureVapidInit() {
  if (vapidInitialized) return;
  if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    try {
      webPush.setVapidDetails(
        process.env.VAPID_EMAIL || 'mailto:admin@shadowads.com',
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY.trim(),
        process.env.VAPID_PRIVATE_KEY.trim()
      );
      vapidInitialized = true;
    } catch (e) {
      console.error('VAPID init error:', e);
    }
  }
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
  actions?: Array<{ action: string; title: string }>;
}

export async function sendPushNotification(
  subscription: webPush.PushSubscription,
  payload: PushPayload
): Promise<boolean> {
  try {
    ensureVapidInit();
    await webPush.sendNotification(
      subscription,
      JSON.stringify({
        ...payload,
        icon: payload.icon || '/icons/icon-192x192.png',
        badge: payload.badge || '/icons/badge-72x72.png',
      })
    );
    return true;
  } catch (error: any) {
    if (error.statusCode === 410 || error.statusCode === 404) {
      // Subscription expired or invalid
      return false;
    }
    console.error('Push notification error:', error);
    return false;
  }
}

export function getNotificationPayload(
  type: string,
  data: Record<string, any>
): PushPayload {
  switch (type) {
    case 'AD_APPROVED':
      return {
        title: '✅ Anúncio Aprovado!',
        body: `O anúncio "${data.ad_name}" na conta ${data.account_name} foi aprovado.`,
        tag: `ad-approved-${data.ad_id}`,
        data: { url: '/manager', type },
        actions: [{ action: 'view', title: 'Ver anúncio' }],
      };
    case 'AD_REJECTED':
      return {
        title: '❌ Anúncio Reprovado',
        body: `O anúncio "${data.ad_name}" na conta ${data.account_name} foi reprovado. Motivo: ${data.reason || 'Não especificado'}`,
        tag: `ad-rejected-${data.ad_id}`,
        data: { url: '/manager', type },
        actions: [{ action: 'view', title: 'Ver detalhes' }],
      };
    case 'ACCOUNT_SUSPENDED':
      return {
        title: '⚠️ Conta Suspensa!',
        body: `A conta ${data.account_name} (${data.advertiser_id}) foi suspensa.`,
        tag: `account-suspended-${data.advertiser_id}`,
        data: { url: '/accounts', type },
        actions: [{ action: 'view', title: 'Ver conta' }],
      };
    case 'SALE_APPROVED':
      return {
        title: '💰 Venda Aprovada!',
        body: `Nova venda de R$ ${data.amount} na conta ${data.account_name}. Total hoje: R$ ${data.daily_total}`,
        tag: `sale-${data.conversion_id}`,
        data: { url: '/dashboard', type },
        actions: [{ action: 'view', title: 'Ver dashboard' }],
      };
    case 'BUDGET_ALERT':
      return {
        title: '💸 Alerta de Orçamento',
        body: `A conta ${data.account_name} gastou ${data.percentage}% do orçamento diário.`,
        tag: `budget-${data.advertiser_id}`,
        data: { url: '/manager', type },
      };
    default:
      return {
        title: 'ShadowAds',
        body: data.message || 'Você tem uma nova notificação.',
        data: { url: '/dashboard', type },
      };
  }
}

export { webPush };
