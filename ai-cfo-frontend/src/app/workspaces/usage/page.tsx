"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser, useOrganization } from "@clerk/nextjs";
import { getAuthHeaders } from "@/lib/api";
import { Activity, Database, FileUp, RefreshCw, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

type UsageData = {
  file_uploads: number;
  rows_ingested: number;
  transaction_count: number;
  db_storage_mb: number;
  db_storage_display: string;
};

export default function UsagePage() {
  const { user } = useUser();
  const { organization } = useOrganization();
  const BOT_ID = organization?.id || user?.id || "";

  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsage = useCallback(async () => {
    if (!BOT_ID) return;
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/usage/?bot_id=${BOT_ID}`, { headers });
      if (res.ok) {
        setUsage(await res.json());
      } else {
        toast.error("Failed to load usage metrics");
      }
    } catch { toast.error("Network error"); }
    setLoading(false);
  }, [BOT_ID]);

  useEffect(() => { fetchUsage(); }, [fetchUsage]);

  const metrics = usage ? [
    {
      label: "Files Uploaded",
      value: String(usage.file_uploads),
      sub: "CSV, Excel, PDF, JSON",
      icon: FileUp,
      color: "bg-blue-500",
      percent: Math.min((usage.file_uploads / 50) * 100, 100),
      limitLabel: "50 file limit",
    },
    {
      label: "Rows Ingested",
      value: usage.rows_ingested.toLocaleString(),
      sub: "Total records processed",
      icon: Database,
      color: "bg-emerald-500",
      percent: Math.min((usage.rows_ingested / 100000) * 100, 100),
      limitLabel: "100K row limit",
    },
    {
      label: "Transactions",
      value: usage.transaction_count.toLocaleString(),
      sub: "Ledger entries stored",
      icon: TrendingUp,
      color: "bg-purple-500",
      percent: Math.min((usage.transaction_count / 10000) * 100, 100),
      limitLabel: "10K transaction limit",
    },
    {
      label: "DB Storage",
      value: usage.db_storage_display,
      sub: "Estimated database footprint",
      icon: Database,
      color: "bg-amber-500",
      percent: Math.min((usage.db_storage_mb / 500) * 100, 100),
      limitLabel: "500 MB limit",
    },
  ] : [];

  return (
    <div className="w-full h-full flex flex-col p-8 bg-[#0a0d14] overflow-y-auto text-white">
      <div className="max-w-4xl w-full mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">Organization Usage</h1>
          <button
            onClick={fetchUsage}
            disabled={loading}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
        <p className="text-slate-400 mb-8 max-w-2xl text-sm">
          Real-time resource consumption across all workspaces in your organization for the current billing cycle.
        </p>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <RefreshCw size={20} className="text-slate-500 animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {metrics.map((m) => (
                <div key={m.label} className="p-5 border border-[#1e2637] bg-[#0c0f17] rounded-xl flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                      <m.icon size={18} className="text-slate-300" />
                    </div>
                    <span className="font-semibold text-sm">{m.label}</span>
                  </div>
                  <div className="flex items-end justify-between font-mono">
                    <span className="text-2xl font-bold">{m.value}</span>
                    <span className="text-xs text-slate-500">{m.limitLabel}</span>
                  </div>
                  <div>
                    <div className="h-1.5 w-full bg-[#1e2637] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${m.color} transition-all duration-1000`}
                        style={{ width: `${m.percent}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-600 mt-1">{m.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border border-[#2a3448] bg-[#121622] rounded-xl flex items-center justify-between">
              <div>
                <h3 className="font-bold flex items-center gap-2 mb-1">
                  <Activity size={18} className="text-emerald-400" /> System Status
                </h3>
                <p className="text-sm text-slate-400">All systems operational. No limits reached.</p>
              </div>
              <span className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Healthy
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
