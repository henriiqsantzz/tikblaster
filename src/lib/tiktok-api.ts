// TikTok Marketing API v1.3 Client

const TIKTOK_API_BASE = 'https://business-api.tiktok.com/open_api/v1.3';

interface TikTokApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  request_id: string;
}

class TikTokApi {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async request<T>(
    method: 'GET' | 'POST',
    endpoint: string,
    params?: Record<string, any>
  ): Promise<TikTokApiResponse<T>> {
    const url = new URL(`${TIKTOK_API_BASE}${endpoint}`);

    const options: RequestInit = {
      method,
      headers: {
        'Access-Token': this.accessToken,
        'Content-Type': 'application/json',
      },
    };

    if (method === 'GET' && params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        }
      });
    } else if (method === 'POST' && params) {
      options.body = JSON.stringify(params);
    }

    const response = await fetch(url.toString(), options);
    const data = await response.json();

    if (data.code !== 0) {
      throw new TikTokApiError(data.code, data.message, data.request_id);
    }

    return data;
  }

  // ==================== OAuth ====================

  static async getAccessToken(authCode: string): Promise<{ access_token: string; advertiser_ids: string[] }> {
    const response = await fetch(`${TIKTOK_API_BASE}/oauth2/access_token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: process.env.TIKTOK_APP_ID,
        secret: process.env.TIKTOK_APP_SECRET,
        auth_code: authCode,
      }),
    });
    const data = await response.json();
    if (data.code !== 0) throw new TikTokApiError(data.code, data.message, data.request_id);
    return data.data;
  }

  // ==================== Business Center ====================

  async getBusinessCenters(): Promise<any[]> {
    const res = await this.request<{ list: any[] }>('GET', '/bc/get/', {
      page_size: 100,
    });
    return res.data.list || [];
  }

  async getBcAdvertisers(bcId: string): Promise<any[]> {
    const res = await this.request<{ list: any[] }>('GET', '/bc/advertiser/get/', {
      bc_id: bcId,
      page_size: 100,
    });
    return res.data.list || [];
  }

  // ==================== Advertiser ====================

  async getAdvertiserInfo(advertiserIds: string[]): Promise<any[]> {
    const res = await this.request<{ list: any[] }>('GET', '/advertiser/info/', {
      advertiser_ids: advertiserIds,
    });
    return res.data.list || [];
  }

  // ==================== Campaign ====================

  async createCampaign(advertiserId: string, config: {
    campaign_name: string;
    objective_type: string;
    campaign_type?: string;
    budget_mode?: string;
    budget?: number;
    operation_status?: string;
  }): Promise<{ campaign_id: string }> {
    const res = await this.request<{ campaign_id: string }>('POST', '/campaign/create/', {
      advertiser_id: advertiserId,
      ...config,
    });
    return res.data;
  }

  async getCampaigns(advertiserId: string, filters?: {
    filtering?: Record<string, any>;
    page?: number;
    page_size?: number;
    fields?: string[];
  }): Promise<{ list: any[]; page_info: any }> {
    const res = await this.request<{ list: any[]; page_info: any }>('GET', '/campaign/get/', {
      advertiser_id: advertiserId,
      ...filters,
    });
    return res.data;
  }

  async updateCampaignStatus(advertiserId: string, campaignIds: string[], status: 'ENABLE' | 'DISABLE' | 'DELETE') {
    return this.request('POST', '/campaign/status/update/', {
      advertiser_id: advertiserId,
      campaign_ids: campaignIds,
      opt_status: status,
    });
  }

  // ==================== Ad Group ====================

  async createAdGroup(advertiserId: string, config: Record<string, any>): Promise<{ adgroup_id: string }> {
    const res = await this.request<{ adgroup_id: string }>('POST', '/adgroup/create/', {
      advertiser_id: advertiserId,
      ...config,
    });
    return res.data;
  }

  async getAdGroups(advertiserId: string, filters?: Record<string, any>) {
    return this.request('GET', '/adgroup/get/', {
      advertiser_id: advertiserId,
      ...filters,
    });
  }

  // ==================== Ad ====================

  async createAd(advertiserId: string, config: Record<string, any>): Promise<{ ad_id: string }> {
    const res = await this.request<{ ad_id: string }>('POST', '/ad/create/', {
      advertiser_id: advertiserId,
      ...config,
    });
    return res.data;
  }

  async getAds(advertiserId: string, filters?: Record<string, any>) {
    return this.request('GET', '/ad/get/', {
      advertiser_id: advertiserId,
      ...filters,
    });
  }

  async updateAdStatus(advertiserId: string, adIds: string[], status: 'ENABLE' | 'DISABLE' | 'DELETE') {
    return this.request('POST', '/ad/status/update/', {
      advertiser_id: advertiserId,
      ad_ids: adIds,
      opt_status: status,
    });
  }

  // ==================== Reporting ====================

  async getReport(advertiserId: string, config: {
    report_type: 'BASIC' | 'AUDIENCE' | 'PLAYABLE';
    data_level: 'AUCTION_CAMPAIGN' | 'AUCTION_ADGROUP' | 'AUCTION_AD';
    dimensions: string[];
    metrics: string[];
    start_date: string;
    end_date: string;
    filters?: Record<string, any>[];
    page?: number;
    page_size?: number;
    order_field?: string;
    order_type?: 'ASC' | 'DESC';
  }) {
    return this.request('GET', '/report/integrated/get/', {
      advertiser_id: advertiserId,
      ...config,
    });
  }

  async getRealtimeReport(advertiserId: string, metrics: string[]) {
    const today = new Date().toISOString().split('T')[0];
    return this.getReport(advertiserId, {
      report_type: 'BASIC',
      data_level: 'AUCTION_CAMPAIGN',
      dimensions: ['campaign_id', 'stat_time_hour'],
      metrics,
      start_date: today,
      end_date: today,
    });
  }

  // ==================== Pixels ====================

  async getPixels(advertiserId: string): Promise<any[]> {
    const res = await this.request<{ pixels: any[] }>('GET', '/pixel/list/', {
      advertiser_id: advertiserId,
    });
    return res.data.pixels || [];
  }

  // ==================== Creative ====================

  async uploadVideo(advertiserId: string, videoUrl: string, fileName?: string) {
    return this.request('POST', '/file/video/ad/upload/', {
      advertiser_id: advertiserId,
      upload_type: 'UPLOAD_BY_URL',
      video_url: videoUrl,
      file_name: fileName,
    });
  }

  async getCreativeLibrary(advertiserId: string, filters?: Record<string, any>) {
    return this.request('GET', '/creative/assets/get/', {
      advertiser_id: advertiserId,
      ...filters,
    });
  }

  // ==================== Identity ====================

  async getCustomizedUsers(advertiserId: string) {
    return this.request('GET', '/identity/get/', {
      advertiser_id: advertiserId,
      identity_type: 'CUSTOMIZED_USER',
    });
  }

  // ==================== Account Provisioning ====================

  async createAdvertiserAccount(bcId: string, config: {
    advertiser_name: string;
    company: string;
    industry_id: string;
    contact_name: string;
    contact_email: string;
    contact_phone_number: string;
    timezone: string;
    currency: string;
  }) {
    return this.request('POST', '/bc/advertiser/create/', {
      bc_id: bcId,
      ...config,
    });
  }
}

class TikTokApiError extends Error {
  code: number;
  requestId: string;

  constructor(code: number, message: string, requestId: string) {
    super(message);
    this.code = code;
    this.requestId = requestId;
    this.name = 'TikTokApiError';
  }
}

export { TikTokApi, TikTokApiError };
export default TikTokApi;
