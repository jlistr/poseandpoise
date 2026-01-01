/**
 * Outstand.so API Client
 * 
 * A unified social media API that allows connecting to multiple platforms
 * (Instagram, TikTok, Facebook, Twitter, LinkedIn, YouTube, etc.)
 * 
 * Docs: https://www.outstand.so/docs
 */

// Supported social platforms
export type OutstandPlatform = 
  | 'instagram'
  | 'tiktok'
  | 'twitter'
  | 'facebook'
  | 'linkedin'
  | 'youtube'
  | 'pinterest'
  | 'threads'
  | 'bluesky';

// Social account data returned from Outstand
export interface OutstandSocialAccount {
  id: string;
  platform: OutstandPlatform;
  username: string;
  displayName?: string;
  profileUrl?: string;
  profileImageUrl?: string;
  followerCount?: number;
  followingCount?: number;
  verified?: boolean;
  connectedAt: string;
  lastSyncedAt?: string;
}

// Auth URL response
export interface OutstandAuthUrlResponse {
  authUrl: string;
  state: string;
  expiresAt: string;
}

// Pending connection details
export interface OutstandPendingConnection {
  id: string;
  platform: OutstandPlatform;
  state: string;
  status: 'pending' | 'completed' | 'expired' | 'failed';
  createdAt: string;
  expiresAt: string;
}

// API Error
export interface OutstandApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

class OutstandClient {
  private apiKey: string;
  private baseUrl = 'https://api.outstand.so/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OUTSTAND_API_KEY || '';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Outstand API error: ${response.status}`);
    }

    return data as T;
  }

  /**
   * Get OAuth authentication URL for a social platform
   * User should be redirected to this URL to authorize the connection
   */
  async getAuthUrl(
    platform: OutstandPlatform,
    redirectUrl: string,
    userId?: string
  ): Promise<OutstandAuthUrlResponse> {
    return this.request<OutstandAuthUrlResponse>('/social-accounts/auth-url', {
      method: 'POST',
      body: JSON.stringify({
        platform,
        redirectUrl,
        metadata: userId ? { userId } : undefined,
      }),
    });
  }

  /**
   * Get pending connection details by state
   * Called after user returns from OAuth flow
   */
  async getPendingConnection(state: string): Promise<OutstandPendingConnection> {
    return this.request<OutstandPendingConnection>(
      `/social-accounts/pending/${state}`
    );
  }

  /**
   * Finalize a pending connection
   * Completes the OAuth flow and returns the connected account
   */
  async finalizeConnection(
    state: string,
    code: string
  ): Promise<OutstandSocialAccount> {
    return this.request<OutstandSocialAccount>('/social-accounts/finalize', {
      method: 'POST',
      body: JSON.stringify({ state, code }),
    });
  }

  /**
   * List all connected social accounts
   */
  async listAccounts(): Promise<OutstandSocialAccount[]> {
    const response = await this.request<{ accounts: OutstandSocialAccount[] }>(
      '/social-accounts'
    );
    return response.accounts;
  }

  /**
   * Get details of a specific connected account
   */
  async getAccount(accountId: string): Promise<OutstandSocialAccount> {
    return this.request<OutstandSocialAccount>(
      `/social-accounts/${accountId}`
    );
  }

  /**
   * Disconnect a social account
   */
  async disconnectAccount(accountId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(
      `/social-accounts/${accountId}`,
      { method: 'DELETE' }
    );
  }

  /**
   * Refresh account data (sync latest stats)
   */
  async refreshAccount(accountId: string): Promise<OutstandSocialAccount> {
    return this.request<OutstandSocialAccount>(
      `/social-accounts/${accountId}/refresh`,
      { method: 'POST' }
    );
  }
}

// Singleton instance
let outstandClient: OutstandClient | null = null;

export function getOutstandClient(): OutstandClient {
  if (!outstandClient) {
    outstandClient = new OutstandClient();
  }
  return outstandClient;
}

export { OutstandClient };

