// ==================== TikTok API Types ====================

export interface TikTokBusinessCenter {
  id: string;
  bc_id: string;
  name: string;
  user_id: string;
  access_token: string;
  token_expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface TikTokAdvertiser {
  id: string;
  advertiser_id: string;
  advertiser_name: string;
  bc_id: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'DISABLED';
  balance: number;
  currency: string;
  timezone: string;
  created_at: string;
}

export interface TikTokPixel {
  pixel_id: string;
  pixel_name: string;
  advertiser_id: string;
  status: string;
  events: TikTokPixelEvent[];
}

export interface TikTokPixelEvent {
  event_name: string;
  event_count: number;
  last_fired: string;
}

// ==================== Campaign Types ====================

export interface CampaignTemplate {
  id: string;
  name: string;
  objective: CampaignObjective;
  campaign_type: 'MANUAL' | 'SMART_PLUS';
  budget_mode: 'BUDGET_MODE_DAY' | 'BUDGET_MODE_TOTAL' | 'BUDGET_MODE_INFINITE';
  budget: number;
  budget_optimize_on: boolean;
  status: 'ACTIVE' | 'PAUSED';
}

export type CampaignObjective =
  | 'CONVERSIONS'
  | 'TRAFFIC'
  | 'REACH'
  | 'VIDEO_VIEWS'
  | 'LEAD_GENERATION'
  | 'APP_PROMOTION'
  | 'PRODUCT_SALES';

export interface AdGroupConfig {
  name: string;
  budget: number;
  budget_mode: 'BUDGET_MODE_DAY' | 'BUDGET_MODE_TOTAL';
  bid_type: 'BID_TYPE_NO_BID' | 'BID_TYPE_CUSTOM';
  bid_price?: number;
  billing_event: 'OCPM' | 'CPM' | 'CPC' | 'CPV';
  optimization_goal: 'CONVERT' | 'CLICK' | 'REACH' | 'IMPRESSION';
  schedule_type: 'SCHEDULE_FROM_NOW' | 'SCHEDULE_START_END';
  schedule_start_time?: string;
  schedule_end_time?: string;
  pacing: 'PACING_MODE_SMOOTH' | 'PACING_MODE_FAST';
  targeting: TargetingConfig;
  pixel_id?: string;
  identity_type?: 'CUSTOMIZED_USER' | 'AUTH_CODE' | 'TT_USER';
  identity_id?: string;
}

export interface TargetingConfig {
  location_ids: string[];
  languages?: string[];
  gender?: 'GENDER_UNLIMITED' | 'GENDER_MALE' | 'GENDER_FEMALE';
  age_groups?: string[];
  operating_systems?: string[];
  connection_type?: string[];
  interests?: string[];
  behaviors?: string[];
}

export interface CreativeConfig {
  format: 'SINGLE_VIDEO' | 'SINGLE_IMAGE' | 'CAROUSEL';
  call_to_action: string;
  ad_text: string;
  landing_page_url: string;
  url_params?: string;
  video_id?: string;
  image_ids?: string[];
  display_name?: string;
  impression_tracking_url?: string;
  click_tracking_url?: string;
  interactive_addon?: string;
}

export interface BulkCampaignJob {
  id: string;
  user_id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'PARTIAL';
  total_campaigns: number;
  completed_campaigns: number;
  failed_campaigns: number;
  target_accounts: string[];
  campaign_config: CampaignTemplate;
  adgroup_config: AdGroupConfig;
  creative_config: CreativeConfig;
  results: BulkCampaignResult[];
  created_at: string;
  completed_at?: string;
}

export interface BulkCampaignResult {
  advertiser_id: string;
  advertiser_name: string;
  campaign_id?: string;
  adgroup_id?: string;
  ad_id?: string;
  status: 'SUCCESS' | 'FAILED';
  error_message?: string;
}

// ==================== Analytics Types ====================

export interface DashboardMetrics {
  revenue: number;
  spend: number;
  cpa: number;
  cpm: number;
  ctr: number;
  impressions: number;
  clicks: number;
  conversions: number;
  roas: number;
  active_accounts: number;
  revenue_trend: 'UP' | 'DOWN' | 'STABLE';
  spend_trend: 'UP' | 'DOWN' | 'STABLE';
}

export interface HourlyData {
  hour: string;
  revenue: number;
  spend: number;
  conversions: number;
}

export interface CampaignMetrics {
  campaign_id: string;
  campaign_name: string;
  advertiser_id: string;
  advertiser_name: string;
  status: string;
  budget: number;
  spend: number;
  revenue: number;
  impressions: number;
  clicks: number;
  conversions: number;
  cpa: number;
  ctr: number;
  roas: number;
}

// ==================== Notification Types ====================

export interface AppNotification {
  id: string;
  user_id: string;
  type: 'AD_APPROVED' | 'AD_REJECTED' | 'ACCOUNT_SUSPENDED' | 'SALE_APPROVED' | 'CAMPAIGN_CREATED' | 'BUDGET_ALERT';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  created_at: string;
}

// ==================== Account Provisioning ====================

export interface AccountProvisioningConfig {
  bc_id: string;
  company_name: string;
  cnpj?: string;
  industry_id: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  timezone: string;
  currency: string;
  quantity: number;
  name_prefix: string;
}

export interface ProvisioningJob {
  id: string;
  user_id: string;
  bc_id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  total_accounts: number;
  created_accounts: number;
  failed_accounts: number;
  config: AccountProvisioningConfig;
  results: ProvisioningResult[];
  created_at: string;
}

export interface ProvisioningResult {
  advertiser_id?: string;
  advertiser_name: string;
  status: 'SUCCESS' | 'FAILED';
  error_message?: string;
}

// ==================== UI Types ====================

export interface SelectOption {
  value: string;
  label: string;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface DateRange {
  start: string;
  end: string;
}
