const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export type DashboardOverview = {
  overall_esg_score: number;
  department_scores: { department: string; score: number }[];
  carbon_trend: { month: string; kgco2e: number }[];
  notifications: number;
  active_challenges: number;
  leaderboard: { name: string; xp: number }[];
};

export type CarbonSummary = {
  total_kgco2e: number;
  scope_1: number;
  scope_2: number;
  scope_3: number;
  target_progress: number;
};

export type Policy = {
  id: string;
  title: string;
  version: string;
  status: string;
};

export type Notification = {
  id: string;
  type: string;
  message: string;
  is_read: boolean;
};

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`EcoSphere API returned ${response.status}`);
  }

  return response.json();
}

export const ecoSphereApi = {
  dashboard: () => request<DashboardOverview>("/api/dashboard/overview"),
  carbon: () => request<CarbonSummary>("/api/carbon/summary"),
  policies: () => request<Policy[]>("/api/governance/policies"),
  notifications: () => request<Notification[]>("/api/notifications"),
};
