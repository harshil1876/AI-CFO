"use client";

import { useState, useEffect, useCallback } from "react";
import { getAuthHeaders } from "@/lib/api";

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────
interface KPI {
  period: string;
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  profit_margin: number;
  burn_rate: number;
  runway_months: number;
}

interface SyncResult {
  status: string;
  rows_synced?: number;
  error?: string;
}

type Tab = "kpis" | "push" | "sync" | "budget";
type OfficeStatus = "loading" | "ready" | "unavailable";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────
function fmt(val: number, prefix = "$"): string {
  return `${prefix}${Number(val).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

// ─────────────────────────────────────────────────────────────────
// Main Taskpane Component
// ─────────────────────────────────────────────────────────────────
export default function ExcelTaskpane() {
  const [officeStatus, setOfficeStatus] = useState<OfficeStatus>("loading");
  const [activeTab, setActiveTab] = useState<Tab>("kpis");
  const [botId, setBotId] = useState("");
  const [kpi, setKpi] = useState<KPI | null>(null);
  const [kpiLoading, setKpiLoading] = useState(false);
  const [pushStatus, setPushStatus] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncResult | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [budgetMonth, setBudgetMonth] = useState(new Date().toISOString().slice(0, 7));
  const [budgetStatus, setBudgetStatus] = useState<string | null>(null);

  // ── Initialise Office.js ────────────────────────────────────────
  useEffect(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const win = window as any;
      if (win.Office) {
        win.Office.onReady(() => {
          setOfficeStatus("ready");
        });
      } else {
        // Running in a browser without Excel (dev preview mode)
        setOfficeStatus("unavailable");
      }
    } catch {
      setOfficeStatus("unavailable");
    }

    // Load botId from localStorage (set via CFOlytics dashboard)
    const saved = localStorage.getItem("cfolytics_bot_id");
    if (saved) setBotId(saved);
  }, []);

  // ── Fetch KPIs ──────────────────────────────────────────────────
  const fetchKPIs = useCallback(async () => {
    if (!botId) return;
    setKpiLoading(true);
    try {
      const auth = await getAuthHeaders();
      const res = await fetch(`${API_URL}/kpis/?bot_id=${botId}`, { headers: auth });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) setKpi(data[0]);
    } catch (e) {
      console.error(e);
    } finally {
      setKpiLoading(false);
    }
  }, [botId]);

  useEffect(() => {
    if (botId && activeTab === "kpis") fetchKPIs();
  }, [botId, activeTab, fetchKPIs]);

  // ── Push KPIs to Active Sheet ───────────────────────────────────
  const handlePushKPIs = async () => {
    if (!kpi) { setPushStatus("❌ Load KPIs first."); return; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    if (!win.Excel) { pushDemoMode(); return; }

    try {
      await win.Excel.run(async (context: any) => {
        const sheet = context.workbook.worksheets.getActiveWorksheet();

        // Write header row
        const headers = [["CFOlytics KPI Snapshot", kpi.period]];
        const rows = [
          ["Total Revenue", kpi.total_revenue],
          ["Total Expenses", kpi.total_expenses],
          ["Net Profit", kpi.net_profit],
          ["Profit Margin (%)", kpi.profit_margin],
          ["Burn Rate ($/mo)", kpi.burn_rate],
          ["Runway (months)", kpi.runway_months],
        ];

        const headerRange = sheet.getRange("A1:B1");
        headerRange.values = headers;
        headerRange.format.font.bold = true;
        headerRange.format.fill.color = "#0F172A";
        headerRange.format.font.color = "#60A5FA";

        const dataRange = sheet.getRange(`A2:B${1 + rows.length}`);
        dataRange.values = rows;
        dataRange.format.autofitColumns();

        await context.sync();
        setPushStatus(`✅ ${rows.length} KPI rows written to active sheet!`);
      });
    } catch (e: any) {
      setPushStatus(`❌ Error: ${e.message}`);
    }
  };

  const pushDemoMode = () => {
    // Demo mode: simulate the push
    setPushStatus("⚠️ Demo mode — Excel not detected. In Excel, this would write your KPIs to cells A1:B7.");
  };

  // ── Sync Selected Range to Cloud ────────────────────────────────
  const handleSyncToCloud = async () => {
    if (!botId) { setSyncStatus({ status: "error", error: "Bot ID not set." }); return; }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    setSyncLoading(true);
    setSyncStatus(null);

    try {
      let rows: any[] = [];

      if (win.Excel) {
        await win.Excel.run(async (context: any) => {
          const range = context.workbook.getSelectedRange();
          range.load("values, address");
          await context.sync();

          const values: any[][] = range.values;
          // Assume first row is headers, subsequent rows are data
          if (values.length < 2) { setSyncStatus({ status: "error", error: "Select at least 2 rows (header + data)." }); return; }
          const headers: string[] = values[0].map((h: any) => String(h).toLowerCase().replace(/\s+/g, "_"));
          rows = values.slice(1).map(row =>
            Object.fromEntries(headers.map((h, i) => [h, row[i]]))
          );
        });
      } else {
        // Demo mode
        rows = [
          { date: "2026-04-01", category: "Marketing", amount: 5000, transaction_type: "expense" },
          { date: "2026-04-02", category: "Engineering", amount: 12000, transaction_type: "expense" },
        ];
      }

      if (rows.length === 0) { setSyncStatus({ status: "error", error: "No data rows found in selection." }); setSyncLoading(false); return; }

      // POST to backend
      const auth = await getAuthHeaders();
      const res = await fetch(`${API_URL}/v1/transactions/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...auth },
        body: JSON.stringify({ bot_id: botId, transactions: rows }),
      });
      const result = await res.json();
      setSyncStatus({
        status: result.status === "success" ? "success" : "error",
        rows_synced: result.inserted || rows.length,
        error: result.error,
      });
    } catch (e: any) {
      setSyncStatus({ status: "error", error: e.message });
    } finally {
      setSyncLoading(false);
    }
  };

  // ── Push Budget Data to Sheet ────────────────────────────────────
  const handlePullBudget = async () => {
    if (!botId) { setBudgetStatus("❌ Bot ID not set."); return; }
    try {
      const auth = await getAuthHeaders();
      const res = await fetch(`${API_URL}/budgets/?bot_id=${botId}&month_year=${budgetMonth}`, { headers: auth });
      const budgets = await res.json();
      if (!Array.isArray(budgets) || budgets.length === 0) { setBudgetStatus("⚠️ No budget data found for this month."); return; }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const win = window as any;
      if (win.Excel) {
        await win.Excel.run(async (context: any) => {
          const sheet = context.workbook.worksheets.getActiveWorksheet();
          const header = [["Category", "Allocated ($)", "Month"]];
          const rows = budgets.map((b: any) => [b.category, Number(b.allocated_amount), b.month_year]);

          const headerRange = sheet.getRange("A1:C1");
          headerRange.values = header;
          headerRange.format.font.bold = true;

          const dataRange = sheet.getRange(`A2:C${1 + rows.length}`);
          dataRange.values = rows;
          dataRange.format.autofitColumns();
          await context.sync();
          setBudgetStatus(`✅ ${rows.length} budget rows written!`);
        });
      } else {
        setBudgetStatus(`✅ Demo: Would write ${budgets.length} budget rows for ${budgetMonth}.`);
      }
    } catch (e: any) {
      setBudgetStatus(`❌ ${e.message}`);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────
  const tabStyle = (t: Tab) => ({
    padding: "6px 14px", fontSize: 12, borderRadius: 8, cursor: "pointer", border: "none",
    background: activeTab === t ? "#3B82F6" : "#1e2637",
    color: activeTab === t ? "#fff" : "#94A3B8",
    fontWeight: activeTab === t ? 700 : 400,
    transition: "all 0.15s",
  });

  const cardStyle: React.CSSProperties = {
    background: "#0c0f17", border: "1px solid #1e2637", borderRadius: 12,
    padding: "14px 16px", marginBottom: 12,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "#0a0d14", border: "1px solid #1e2637",
    borderRadius: 8, padding: "8px 10px", color: "#fff", fontSize: 12, outline: "none",
    boxSizing: "border-box",
  };

  const btnStyle = (color = "#3B82F6"): React.CSSProperties => ({
    background: color, color: "#fff", border: "none", borderRadius: 8,
    padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer",
    width: "100%", marginTop: 10,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#0a0d14", color: "#fff" }}>
      {/* Header */}
      <div style={{ background: "#0c0f17", borderBottom: "1px solid #1e2637", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <img src="/Logo.png" alt="CFOlytics" style={{ width: 24, height: 24, objectFit: "contain" }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>CFOlytics</div>
          <div style={{ fontSize: 10, color: "#64748B" }}>
            {officeStatus === "ready" ? "🟢 Connected to Excel" : officeStatus === "loading" ? "⏳ Connecting…" : "🟡 Browser Preview Mode"}
          </div>
        </div>
      </div>

      {/* Bot ID input */}
      <div style={{ padding: "10px 14px", borderBottom: "1px solid #1e2637", background: "#0c0f17" }}>
        <label style={{ fontSize: 10, color: "#64748B", display: "block", marginBottom: 4 }}>Workspace ID (Bot ID)</label>
        <input
          style={inputStyle}
          placeholder="Paste your bot_id here…"
          value={botId}
          onChange={e => { setBotId(e.target.value); localStorage.setItem("cfolytics_bot_id", e.target.value); }}
        />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, padding: "10px 14px", borderBottom: "1px solid #1e2637", background: "#0c0f17" }}>
        {(["kpis", "push", "sync", "budget"] as Tab[]).map(t => (
          <button key={t} style={tabStyle(t)} onClick={() => setActiveTab(t)}>
            {t === "kpis" ? "📊 KPIs" : t === "push" ? "⬇️ Push" : t === "sync" ? "⬆️ Sync" : "💰 Budget"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px" }}>

        {/* ── KPIs Tab ── */}
        {activeTab === "kpis" && (
          <div>
            <p style={{ fontSize: 11, color: "#64748B", marginBottom: 12 }}>Live financial KPIs from your CFOlytics workspace.</p>
            {!botId && <p style={{ fontSize: 11, color: "#F59E0B" }}>⚠️ Enter your Workspace ID above to load data.</p>}
            {kpiLoading && <p style={{ fontSize: 11, color: "#64748B" }}>Loading…</p>}
            {kpi && (
              <div>
                <div style={{ fontSize: 10, color: "#3B82F6", marginBottom: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Period: {kpi.period}</div>
                {[
                  ["🟢 Revenue", fmt(kpi.total_revenue)],
                  ["🔴 Expenses", fmt(kpi.total_expenses)],
                  ["💰 Net Profit", fmt(kpi.net_profit)],
                  ["📈 Profit Margin", `${kpi.profit_margin}%`],
                  ["🔥 Burn Rate", `${fmt(kpi.burn_rate)}/mo`],
                  ["🛫 Runway", `${kpi.runway_months} months`],
                ].map(([label, val]) => (
                  <div key={String(label)} style={{ ...cardStyle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#94A3B8" }}>{label}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{val}</span>
                  </div>
                ))}
              </div>
            )}
            <button style={btnStyle()} onClick={fetchKPIs} disabled={!botId}>
              🔄 Refresh KPIs
            </button>
          </div>
        )}

        {/* ── Push Tab ── */}
        {activeTab === "push" && (
          <div>
            <p style={{ fontSize: 11, color: "#64748B", marginBottom: 10 }}>
              Push your live KPI data directly into the active Excel sheet starting from cell A1.
            </p>
            {!kpi && <p style={{ fontSize: 11, color: "#F59E0B", marginBottom: 8 }}>⚠️ Load KPIs from the KPIs tab first.</p>}
            <div style={cardStyle}>
              <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>📋 What gets inserted:</div>
              <ul style={{ fontSize: 11, color: "#64748B", paddingLeft: 16, margin: 0, lineHeight: 2 }}>
                <li>Row 1: Header (KPI name + Period)</li>
                <li>Rows 2–7: Financial metrics with values</li>
                <li>Auto-fit columns + styled header</li>
              </ul>
            </div>
            <button style={btnStyle("#6366F1")} onClick={handlePushKPIs}>
              ⬇️ Push KPIs to Active Sheet
            </button>
            {pushStatus && (
              <div style={{ marginTop: 10, padding: "8px 12px", background: "#1e2637", borderRadius: 8, fontSize: 12, color: pushStatus.startsWith("✅") ? "#34D399" : "#F87171" }}>
                {pushStatus}
              </div>
            )}
          </div>
        )}

        {/* ── Sync Tab ── */}
        {activeTab === "sync" && (
          <div>
            <p style={{ fontSize: 11, color: "#64748B", marginBottom: 10 }}>
              Select a cell range in Excel (with headers in Row 1), then click Sync to upload it as transaction data to CFOlytics.
            </p>
            <div style={cardStyle}>
              <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>📋 Required columns:</div>
              <ul style={{ fontSize: 11, color: "#64748B", paddingLeft: 16, margin: 0, lineHeight: 2 }}>
                <li><strong style={{ color: "#94A3B8" }}>date</strong> — e.g. 2026-04-01</li>
                <li><strong style={{ color: "#94A3B8" }}>category</strong> — e.g. Marketing</li>
                <li><strong style={{ color: "#94A3B8" }}>amount</strong> — numeric value</li>
                <li><strong style={{ color: "#94A3B8" }}>transaction_type</strong> — expense / revenue</li>
              </ul>
            </div>
            <button style={btnStyle("#10B981")} onClick={handleSyncToCloud} disabled={syncLoading || !botId}>
              {syncLoading ? "⏳ Syncing…" : "⬆️ Sync Selected Range to Cloud"}
            </button>
            {syncStatus && (
              <div style={{ marginTop: 10, padding: "10px 12px", background: "#1e2637", borderRadius: 8, fontSize: 12 }}>
                {syncStatus.status === "success" ? (
                  <span style={{ color: "#34D399" }}>✅ {syncStatus.rows_synced} rows synced to CFOlytics!</span>
                ) : (
                  <span style={{ color: "#F87171" }}>❌ {syncStatus.error}</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Budget Tab ── */}
        {activeTab === "budget" && (
          <div>
            <p style={{ fontSize: 11, color: "#64748B", marginBottom: 10 }}>
              Pull your CFOlytics budget allocations into the active Excel sheet.
            </p>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 10, color: "#64748B", display: "block", marginBottom: 4 }}>Budget Month</label>
              <input
                type="month"
                value={budgetMonth}
                onChange={e => setBudgetMonth(e.target.value)}
                style={inputStyle}
              />
            </div>
            <button style={btnStyle("#F59E0B")} onClick={handlePullBudget} disabled={!botId}>
              💰 Pull Budget to Sheet
            </button>
            {budgetStatus && (
              <div style={{ marginTop: 10, padding: "8px 12px", background: "#1e2637", borderRadius: 8, fontSize: 12, color: budgetStatus.startsWith("✅") ? "#34D399" : budgetStatus.startsWith("⚠️") ? "#F59E0B" : "#F87171" }}>
                {budgetStatus}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #1e2637", padding: "8px 14px", background: "#0c0f17", textAlign: "center" }}>
        <span style={{ fontSize: 10, color: "#334155" }}>CFOlytics AI Finance — Excel Add-in v1.0</span>
      </div>
    </div>
  );
}
