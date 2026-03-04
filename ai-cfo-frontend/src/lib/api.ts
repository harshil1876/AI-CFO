/**
 * API Client for Django Backend
 * Handles all communication with the AI CFO Intelligence Engine.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

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
  const res = await fetch(`${API_URL}/chat/${botId}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });
  return res.json();
}

// ─── File Upload ───────────────────────────

export async function uploadFile(
  botId: string,
  file: File
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("bot_id", botId);
  formData.append("file", file);

  const res = await fetch(`${API_URL}/upload/`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

// ─── Analytics ─────────────────────────────

export async function runAnalytics(botId: string, period: string) {
  const res = await fetch(`${API_URL}/analytics/run/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bot_id: botId, period }),
  });
  return res.json();
}

export async function runForecast(botId: string, periods: number = 6) {
  const res = await fetch(`${API_URL}/forecast/run/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bot_id: botId, periods }),
  });
  return res.json();
}

export async function syncRAG(botId: string) {
  const res = await fetch(`${API_URL}/rag/sync/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bot_id: botId }),
  });
  return res.json();
}

// ─── Read Endpoints ────────────────────────

export async function getKPIs(botId: string): Promise<KPI[]> {
  const res = await fetch(`${API_URL}/kpis/?bot_id=${botId}`);
  return res.json();
}

export async function getAnomalies(botId: string): Promise<Anomaly[]> {
  const res = await fetch(`${API_URL}/anomalies/?bot_id=${botId}`);
  return res.json();
}

export async function getRecommendations(
  botId: string
): Promise<Recommendation[]> {
  const res = await fetch(`${API_URL}/recommendations/?bot_id=${botId}`);
  return res.json();
}

export async function getUploadedFiles(
  botId: string
): Promise<UploadedFile[]> {
  const res = await fetch(`${API_URL}/files/?bot_id=${botId}`);
  return res.json();
}
