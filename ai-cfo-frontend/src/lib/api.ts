/**
 * API Client for Django Backend
 * Handles all communication with the AI CFO Intelligence Engine.
 * All requests include Clerk JWT Bearer token for authentication.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/**
 * Get auth headers with Clerk Bearer token.
 * Falls back to empty headers if Clerk is not loaded yet.
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    // @ts-expect-error — Clerk attaches to window globally
    const token = await window.Clerk?.session?.getToken();
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  } catch {
    // Clerk not ready yet, continue without auth
  }
  return {};
}

export interface ChatResponse {
  answer: string;
  suggestedQuestions: string[];
  error?: string;
}

export interface UploadResponse {
  status: string;
  file_id?: number;
  filename?: string;
  row_count?: number;
  detected_schema?: Record<string, unknown>;
  ai_summary?: string;
  error?: string;
}

export interface KPI {
  id: number;
  bot_id: string;
  period: string;
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  profit_margin: number;
  burn_rate: number;
  runway_months: number;
}

export interface Anomaly {
  id: number;
  category: string;
  description: string;
  severity: string;
  amount: number;
  detected_at: string;
}

export interface Recommendation {
  id: number;
  title: string;
  detail: string;
  priority: string;
  related_kpi: string;
}

export interface UploadedFile {
  id: number;
  bot_id: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  status: string;
  row_count: number;
  ai_summary: string;
  uploaded_at: string;
}

// ─── Chat ──────────────────────────────────

export async function sendMessage(
  botId: string,
  message: string,
  history: { role: string; content: string }[] = []
): Promise<ChatResponse> {
  const auth = await getAuthHeaders();
  const res = await fetch(`${API_URL}/chat/${botId}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...auth },
    body: JSON.stringify({ message, history }),
  });
  return res.json();
}

// ─── File Upload ───────────────────────────

export async function uploadFile(
  botId: string,
  file: File
): Promise<UploadResponse> {
  const auth = await getAuthHeaders();
  const formData = new FormData();
  formData.append("bot_id", botId);
  formData.append("file", file);

  const res = await fetch(`${API_URL}/upload/`, {
    method: "POST",
    headers: { ...auth },
    body: formData,
  });
  return res.json();
}

// ─── Analytics ─────────────────────────────

export async function runAnalytics(botId: string, period: string) {
  const auth = await getAuthHeaders();
  const res = await fetch(`${API_URL}/analytics/run/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...auth },
    body: JSON.stringify({ bot_id: botId, period }),
  });
  return res.json();
}

export async function runForecast(botId: string, periods: number = 6) {
  const auth = await getAuthHeaders();
  const res = await fetch(`${API_URL}/forecast/run/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...auth },
    body: JSON.stringify({ bot_id: botId, periods }),
  });
  return res.json();
}

export async function syncRAG(botId: string) {
  const auth = await getAuthHeaders();
  const res = await fetch(`${API_URL}/rag/sync/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...auth },
    body: JSON.stringify({ bot_id: botId }),
  });
  return res.json();
}

// ─── Read Endpoints ────────────────────────

export async function getKPIs(botId: string): Promise<KPI[]> {
  const auth = await getAuthHeaders();
  const res = await fetch(`${API_URL}/kpis/?bot_id=${botId}`, {
    headers: { ...auth },
  });
  return res.json();
}

export async function getAnomalies(botId: string): Promise<Anomaly[]> {
  const auth = await getAuthHeaders();
  const res = await fetch(`${API_URL}/anomalies/?bot_id=${botId}`, {
    headers: { ...auth },
  });
  return res.json();
}

export async function getRecommendations(
  botId: string
): Promise<Recommendation[]> {
  const auth = await getAuthHeaders();
  const res = await fetch(`${API_URL}/recommendations/?bot_id=${botId}`, {
    headers: { ...auth },
  });
  return res.json();
}

export async function getUploadedFiles(
  botId: string
): Promise<UploadedFile[]> {
  const auth = await getAuthHeaders();
  const res = await fetch(`${API_URL}/files/?bot_id=${botId}`, {
    headers: { ...auth },
  });
  return res.json();
}

// ─── Sprint 4: Simulation ──────────────────

export interface SimulationScenario {
  type: "adjust_revenue" | "adjust_expense" | "adjust_department";
  value: number; // percentage change
  target?: string; // department name (for adjust_department)
}

export interface SimulationResult {
  status: string;
  bot_id: string;
  period: string;
  baseline: Record<string, number>;
  simulated: Record<string, number>;
  impact: Record<string, number>;
  risk_level: string;
  risk_message: string;
  scenarios_applied: { type: string; description: string; impact: number }[];
  error?: string;
}

export async function runSimulation(
  botId: string,
  period: string,
  scenarios: SimulationScenario[]
): Promise<SimulationResult> {
  const auth = await getAuthHeaders();
  const res = await fetch(`${API_URL}/simulate/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...auth },
    body: JSON.stringify({ bot_id: botId, period, scenarios }),
  });
  return res.json();
}

// ─── Sprint 4: Alerts ──────────────────────

export async function sendAlerts(botId: string) {
  const auth = await getAuthHeaders();
  const res = await fetch(`${API_URL}/alerts/send/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...auth },
    body: JSON.stringify({ bot_id: botId }),
  });
  return res.json();
}

// ─── Sprint 6: Data Connectors ─────────────────────────────────────

export interface DataSource {
  id: number;
  source_type: "tally" | "razorpay" | "google_sheets" | "zoho";
  display_name: string;
  status: "active" | "inactive" | "error";
  last_synced_at: string | null;
  created_at: string;
}

export interface SyncResult {
  status: "success" | "partial" | "failed";
  records_fetched: number;
  records_inserted: number;
  currency: string;
  exchange_rate: string;
  error: string | null;
  synced_at: string;
}

export async function listConnectors(botId: string): Promise<DataSource[]> {
  const auth = await getAuthHeaders();
  const res = await fetch(`${API_URL}/connectors/?bot_id=${botId}`, {
    headers: auth,
  });
  return res.json();
}

export async function registerConnector(
  botId: string,
  sourceType: string,
  displayName: string,
  config: Record<string, unknown>
): Promise<DataSource> {
  const auth = await getAuthHeaders();
  const res = await fetch(`${API_URL}/connectors/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...auth },
    body: JSON.stringify({ bot_id: botId, source_type: sourceType, display_name: displayName, config }),
  });
  return res.json();
}

export async function deleteConnector(botId: string, sourceId: number): Promise<void> {
  const auth = await getAuthHeaders();
  await fetch(`${API_URL}/connectors/${sourceId}/?bot_id=${botId}`, {
    method: "DELETE",
    headers: auth,
  });
}

export async function triggerSync(botId: string, sourceId: number): Promise<SyncResult> {
  const auth = await getAuthHeaders();
  const res = await fetch(`${API_URL}/connectors/${sourceId}/sync/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...auth },
    body: JSON.stringify({ bot_id: botId }),
  });
  return res.json();
}
