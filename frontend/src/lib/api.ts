/**
 * ESG Backend API Service
 */

// On Vercel the API is at the same origin — use relative URLs.
// Only fall back to localhost for local dev.
const isServer = typeof window === 'undefined';
const isBrowser = !isServer;
const isVercel = isBrowser && window.location.hostname.includes('vercel.app');
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || (isVercel ? '' : 'http://localhost:8000');

// ESG ERP Platform Types
export interface LoginResponse {
  access_token: string;
  token_type: string;
  role: string;
  email: string;
  full_name?: string;
}

export interface RegisterResponse {
  access_token: string;
  token_type: string;
  role: string;
  email: string;
  full_name: string;
}

export interface DepartmentScore {
  department: string;
  score: number;
}

export interface CarbonTrendPoint {
  month: string;
  kgco2e: number;
}

export interface LeaderboardUser {
  name: string;
  xp: number;
  department?: string;
}

export interface DashboardOverviewResponse {
  overall_esg_score: number;
  department_scores: DepartmentScore[];
  carbon_trend: CarbonTrendPoint[];
  notifications: number;
  active_challenges: number;
  leaderboard: LeaderboardUser[];
}

export interface CarbonSummaryResponse {
  total_kgco2e: number;
  scope_1: number;
  scope_2: number;
  scope_3: number;
  target_progress: number;
}

export interface Policy {
  id: string;
  title: string;
  version: string;
  status: string;
  category?: string;
  acknowledged?: boolean;
}

export interface Notification {
  id: string;
  type: string;
  message: string;
  is_read: boolean;
}

export interface ESGReportResponse {
  report_type: string;
  status: string;
  download_formats: string[];
  summary: string;
  metrics?: {
    carbon_total?: number;
    csr_activities?: number;
    completed_challenges?: number;
    policies?: number;
    open_compliance_issues?: number;
  };
}

export interface AIAdvisorResponse {
  insight: string;
  confidence: number;
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

// Legacy PDF Report Analysis Types (to preserve compilation compatibility)
export interface UploadResponse {
  status: string;
  report_id: string;
  summary: string;
}

export interface MetricsUploadResponse {
  status: string;
  collection_id: string;
  metrics_count: number;
}

export interface ChatRequest {
  message: string;
  include_context?: boolean;
  session_id?: string;
}

export interface ChatResponse {
  session_id: string;
  response: string;
  relevant_segments?: string[];
}

export interface ComplianceAnalysisResponse {
  status: string;
  assessment: {
    report_id: string;
    total_metrics: number;
    overall_score: number;
    disclosure_summary: {
      fully_disclosed: number;
      partially_disclosed: number;
      not_disclosed: number;
    };
    report_path: string;
  };
}

export interface SystemStatus {
  status: string;
  components: {
    report_loaded: boolean;
    metrics_loaded: boolean;
    assessment_available: boolean;
    llm_configured: boolean;
  };
  report_info?: {
    document_id: string;
    segments_count: number;
  };
  metrics_info?: {
    collection_id: string;
    metrics_count: number;
  };
}

class APIService {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (typeof window !== 'undefined') {
      const authData = localStorage.getItem('ecomerge-auth');
      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          if (parsed?.state?.user?.access_token) {
            headers['Authorization'] = `Bearer ${parsed.state.user.access_token}`;
          }
        } catch (e) {
          console.error("Error parsing auth token", e);
        }
      }
    }
    return headers;
  }

  private async fetchWithError<T>(url: string, options?: RequestInit): Promise<T> {
    const headers = {
      ...this.getHeaders(),
      ...(options?.headers || {}),
    };
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }
    return response.json() as Promise<T>;
  }

  // Auth login
  async login(credentials: { email: string; password: string }): Promise<LoginResponse> {
    return this.fetchWithError<LoginResponse>(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Auth register — for original company login
  async register(data: { email: string; password: string; full_name: string; role?: string }): Promise<RegisterResponse> {
    return this.fetchWithError<RegisterResponse>(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get dashboard overview
  async getDashboardOverview(range?: string): Promise<DashboardOverviewResponse> {
    const url = range ? `${API_BASE_URL}/api/dashboard/overview?range=${range}` : `${API_BASE_URL}/api/dashboard/overview`;
    return this.fetchWithError<DashboardOverviewResponse>(url);
  }

  // Get departments
  async getDepartments(): Promise<Department[]> {
    return this.fetchWithError<Department[]>(`${API_BASE_URL}/api/departments`);
  }

  // Get carbon summary
  async getCarbonSummary(): Promise<CarbonSummaryResponse> {
    return this.fetchWithError<CarbonSummaryResponse>(`${API_BASE_URL}/api/carbon/summary`);
  }

  // Get governance policies
  async getPolicies(): Promise<Policy[]> {
    return this.fetchWithError<Policy[]>(`${API_BASE_URL}/api/governance/policies`);
  }

  // Get notifications
  async getNotifications(): Promise<Notification[]> {
    return this.fetchWithError<Notification[]>(`${API_BASE_URL}/api/notifications`);
  }

  // Get ESG report metadata
  async getESGReport(): Promise<ESGReportResponse> {
    return this.fetchWithError<ESGReportResponse>(`${API_BASE_URL}/api/reports/esg`);
  }

  // Ask AI advisor
  async getAIAdvisor(prompt?: string): Promise<AIAdvisorResponse> {
    return this.fetchWithError<AIAdvisorResponse>(`${API_BASE_URL}/api/ai/advisor`, {
      method: 'POST',
      body: JSON.stringify({ prompt: prompt || '' }),
    });
  }

  // Get carbon entries
  async getCarbonEntries(): Promise<any[]> {
    return this.fetchWithError<any[]>(`${API_BASE_URL}/api/carbon/entries`);
  }

  // Create carbon entry
  async createCarbonEntry(payload: any): Promise<any> {
    return this.fetchWithError<any>(`${API_BASE_URL}/api/carbon/entries`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Get social activities
  async getSocialActivities(): Promise<any[]> {
    return this.fetchWithError<any[]>(`${API_BASE_URL}/api/social/activities`);
  }

  // Create social activity
  async createSocialActivity(payload: any): Promise<any> {
    return this.fetchWithError<any>(`${API_BASE_URL}/api/social/activities`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Get challenges
  async getChallenges(): Promise<any[]> {
    return this.fetchWithError<any[]>(`${API_BASE_URL}/api/gamification/challenges`);
  }

  // Create challenge
  async createChallenge(payload: any): Promise<any> {
    return this.fetchWithError<any>(`${API_BASE_URL}/api/gamification/challenges`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Get rewards
  async getRewards(): Promise<any[]> {
    return this.fetchWithError<any[]>(`${API_BASE_URL}/api/gamification/rewards`);
  }

  // Redeem reward
  async redeemReward(rewardId: string): Promise<any> {
    return this.fetchWithError<any>(`${API_BASE_URL}/api/gamification/rewards/${rewardId}/redeem`, {
      method: 'POST',
    });
  }

  // Join challenge
  async joinChallenge(challengeId: string): Promise<any> {
    return this.fetchWithError<any>(`${API_BASE_URL}/api/gamification/challenges/${challengeId}/join`, {
      method: 'POST',
    });
  }

  // Complete challenge
  async completeChallenge(challengeId: string, payload: any): Promise<any> {
    return this.fetchWithError<any>(`${API_BASE_URL}/api/gamification/challenges/${challengeId}/complete`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Get badges
  async getBadges(): Promise<any[]> {
    return this.fetchWithError<any[]>(`${API_BASE_URL}/api/gamification/badges`);
  }

  // --- Legacy Report Analysis Methods (Stubs to maintain file references/compiles) ---
  async getSystemStatus(): Promise<SystemStatus> {
    return this.fetchWithError<SystemStatus>(`${API_BASE_URL}/api/system/status`);
  }

  async getFiles(fileType?: string, status?: string) {
    const params = new URLSearchParams();
    if (fileType) params.append('file_type', fileType);
    if (status) params.append('status', status);
    const url = `${API_BASE_URL}/api/files${params.toString() ? '?' + params.toString() : ''}`;
    return this.fetchWithError(url);
  }

  async deleteFile(fileId: string) {
    return this.fetchWithError(`${API_BASE_URL}/api/files/${fileId}`, {
      method: 'DELETE'
    });
  }

  async uploadReport(file: any, framework?: string, industry?: string, semiIndustry?: string): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (framework) formData.append('framework', framework);
    if (industry) formData.append('industry', industry);
    if (semiIndustry) formData.append('semiIndustry', semiIndustry);

    return this.fetchWithError<UploadResponse>(`${API_BASE_URL}/api/upload-report`, {
      method: 'POST',
      body: formData,
    });
  }

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    return this.fetchWithError<ChatResponse>(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getAssessment() {
    return this.fetchWithError(`${API_BASE_URL}/api/assessment`);
  }

  async getAssessmentByFile(fileId: string) {
    return this.fetchWithError(`${API_BASE_URL}/api/assessment/${fileId}`);
  }

  async getLatestAssessment() {
    return this.fetchWithError(`${API_BASE_URL}/api/assessment/latest`);
  }

  async getLatestReport() {
    return this.fetchWithError(`${API_BASE_URL}/api/reports/latest`);
  }

  async getReportByFileId(fileId: string) {
    return this.fetchWithError(`${API_BASE_URL}/api/reports/${fileId}`);
  }
}

export const apiService = new APIService();