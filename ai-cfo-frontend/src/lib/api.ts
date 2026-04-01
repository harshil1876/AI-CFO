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
export async function getAuthHeaders(): Promise<Record<string, string>> {
  // Retry up to 6 times with 500ms delay, waiting for Clerk session to be ready
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      // @ts-expect-error — Clerk attaches to window globally
      const token = await window.Clerk?.session?.getToken();
      if (token) {
        return { Authorization: `Bearer ${token}` };
      }
    } catch {
      // Clerk not ready yet, will retry
    }
    // Wait 500ms before next attempt
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  // Last resort fallback — return empty (will get 401 if auth is required)
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
): Promise<UploadedFileRecord[]> {
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

// ─── Sprint 7: Advanced Budgeting & Forecasting ────────────────────

export interface Budget {
  id: number;
  bot_id: string;
  category: string;
  allocated_amount: string | number;
  month_year: string;
  version: number;
  is_active: boolean;
  created_at: string;
}

export interface VarianceDetail {
  category: string;
  budgeted: number;
  actual: number;
  variance: number;
  variance_percent: number;
  status: "over" | "under" | "on_track";
}

export interface VarianceReport {
  month_year: string;
  total_budget: number;
  total_actual: number;
  total_variance: number;
  total_variance_percent: number;
  details: VarianceDetail[];
  error?: string;
}

export interface MonteCarloProjection {
  month_year: string;
  p10_best_case: number;
  p50_expected: number;
  p90_worst_case: number;
}

export interface MonteCarloResult {
  status: string;
  bot_id: string;
  historical_mean: number;
  historical_std: number;
  projections: MonteCarloProjection[];
  error?: string;
}

export async function getBudgets(botId: string, monthYear?: string): Promise<Budget[]> {
  const auth = await getAuthHeaders();
  const url = monthYear 
    ? `${API_URL}/budgets/?bot_id=${botId}&month_year=${monthYear}`
    : `${API_URL}/budgets/?bot_id=${botId}`;
    
  const res = await fetch(url, { headers: auth });
  return res.json();
}

export async function saveBudget(
  botId: string, 
  category: string, 
  monthYear: string, 
  allocatedAmount: number
): Promise<Budget> {
  const auth = await getAuthHeaders();
  const res = await fetch(`${API_URL}/budgets/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...auth },
    body: JSON.stringify({
      bot_id: botId,
      category,
      month_year: monthYear,
      allocated_amount: allocatedAmount
    }),
  });
  return res.json();
}

export async function uploadExcelBudget(botId: string, file: File): Promise<{ message?: string; error?: string }> {
  const auth = await getAuthHeaders();
  const formData = new FormData();
  formData.append("bot_id", botId);
  formData.append("file", file);

  const res = await fetch(`${API_URL}/budgets/upload/`, {
    method: "POST",
    headers: auth, // Do not set Content-Type for FormData (browser does it with boundary)
    body: formData,
  });
  return res.json();
}

export async function getVarianceAnalysis(botId: string, monthYear: string): Promise<VarianceReport> {
  const auth = await getAuthHeaders();
  const res = await fetch(`${API_URL}/budgets/variance/?bot_id=${botId}&month_year=${monthYear}`, {
    headers: auth,
  });
  return res.json();
}

export async function getMonteCarloSimulation(botId: string): Promise<MonteCarloResult> {
  const auth = await getAuthHeaders();
  const res = await fetch(`${API_URL}/forecast/monte-carlo/?bot_id=${botId}`, {
    headers: auth,
  });
  return res.json();
}

// ==========================================
// Accounts Payable & Invoice API
// ==========================================

export interface PurchaseOrder {
  id: number;
  bot_id: string;
  po_number: string;
  vendor_name: string;
  expected_amount: string | number;
  status: string;
  created_at: string;
}

export interface LineItem {
  description: string;
  amount: number;
}

export interface InvoiceRecord {
  id: number;
  bot_id: string;
  vendor_name: string;
  invoice_number?: string;
  total_amount?: string | number;
  tax_amount?: string | number;
  date_issued?: string;
  line_items: LineItem[];
  gl_code?: string;
  matched_po?: PurchaseOrder; // This might be nested or an ID in your API, assuming ID for now
  fraud_confidence_score: number;
  fraud_flags: string[];
  status: string;
  additional_notes?: string;
  file_path?: string;
  uploaded_at: string;
}

export async function getInvoices(botId: string): Promise<InvoiceRecord[]> {
  const auth = await getAuthHeaders();
  const res = await fetch(`${API_URL}/invoices/?bot_id=${botId}`, { headers: auth });
  if (!res.ok) throw new Error("Failed to fetch invoices");
  return res.json();
}

export async function uploadInvoiceDocument(botId: string, file: File): Promise<any> {
  const auth = await getAuthHeaders();
  const formData = new FormData();
  formData.append("bot_id", botId);
  formData.append("file", file);

  const res = await fetch(`${API_URL}/invoices/upload/`, {
    method: "POST",
    headers: auth,
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to process invoice");
  }
  return res.json();
}

export async function getPurchaseOrders(botId: string): Promise<PurchaseOrder[]> {
  const auth = await getAuthHeaders();
  const res = await fetch(`${API_URL}/purchase-orders/?bot_id=${botId}`, { headers: auth });
  if (!res.ok) throw new Error("Failed to fetch purchase orders");
  return res.json();
}

export async function updateInvoiceStatus(
  botId: string,
  invoiceId: number,
  status: "approved" | "rejected" | "paid"
): Promise<{ success: boolean; status: string }> {
  const auth = await getAuthHeaders();
  const res = await fetch(`${API_URL}/invoices/${invoiceId}/status/`, {
    method: "PATCH",
    headers: { ...auth, "Content-Type": "application/json" },
    body: JSON.stringify({ bot_id: botId, status }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to update invoice status");
  }
  return res.json();
}

// -- Sprint 11 Polish: File History --
export interface UploadedFileRecord {
  id: number;
  original_filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  row_count: number | null;
  error_message: string | null;
  uploaded_at: string;
  file_type: string;
  ai_summary: string | null;
}

