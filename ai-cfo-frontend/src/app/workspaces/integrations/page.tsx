"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser, useOrganization } from "@clerk/nextjs";
import { getAuthHeaders } from "@/lib/api";
import {
  IndianRupee, Sheet, Building2, RefreshCw, CheckCircle,
  AlertCircle, Clock, Plus, Trash2, ChevronRight, Zap
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

// ─── Connector Definitions ────────────────────────────────────────────────────
const CONNECTOR_CATALOG = [
  {
    key: "razorpay",
    name: "Razorpay",
    desc: "Import captured payments from your Razorpay account into AI CFO as Revenue transactions.",
    icon: IndianRupee,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    comingSoon: false,
    fields: [
      { name: "key_id", label: "API Key ID", placeholder: "rzp_live_..." },
      { name: "key_secret", label: "Key Secret", placeholder: "Your Razorpay secret", type: "password" },
    ],
  },
  {
    key: "tally",
    name: "Tally Prime",
    desc: "Sync your Tally Prime books into AI CFO for automated ledger analysis and reconciliation.",
    icon: Building2,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    comingSoon: false,
    fields: [
      { name: "host", label: "Tally Host", placeholder: "http://localhost" },
      { name: "port", label: "Port", placeholder: "9000" },
      { name: "company", label: "Company Name", placeholder: "My Company Ltd" },
    ],
  },
  {
    key: "google_sheets",
    name: "Google Sheets",
    desc: "Pull financial data from your custom Google Sheets directly into the transaction ledger.",
    icon: Sheet,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    comingSoon: false,
    fields: [
      { name: "sheet_id", label: "Sheet ID", placeholder: "1BxiMVs0XRA..." },
      { name: "range", label: "Range", placeholder: "Sheet1!A1:E1000" },
      { name: "api_key", label: "API Key", placeholder: "AIzaSy...", type: "password" },
    ],
  },
  {
    key: "zoho",
    name: "Zoho Books",
    desc: "Connect Zoho Books to sync invoices, expenses, and journal entries automatically.",
    icon: Zap,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    comingSoon: false,
    fields: [
      { name: "client_id", label: "Client ID", placeholder: "1000..." },
      { name: "client_secret", label: "Client Secret", placeholder: "Your Zoho secret", type: "password" },
      { name: "organization_id", label: "Organization ID", placeholder: "20..." },
    ],
  },
  // Coming Soon
  {
    key: "quickbooks",
    name: "QuickBooks",
    desc: "Import journal entries and invoices from QuickBooks Online for full P&L visibility.",
    icon: Building2,
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    comingSoon: true,
    fields: [],
  },
  {
    key: "plaid",
    name: "Plaid",
    desc: "Connect your bank account via Plaid for automatic bank statement reconciliation.",
    icon: Building2,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    comingSoon: true,
    fields: [],
  },
  {
    key: "stripe",
    name: "Stripe",
    desc: "Pull charges, payouts, and refunds from Stripe for complete revenue recognition.",
    icon: IndianRupee,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    comingSoon: true,
    fields: [],
  },
];

type ConnectorStatus = "active" | "error" | "pending" | null;
type LiveConnector = { id: number; source_type: string; display_name: string; status: string; last_synced_at: string | null; created_at: string };

export default function IntegrationsPage() {
  const { user } = useUser();
  const { organization } = useOrganization();
  const BOT_ID = organization?.id || user?.id || "";

  const [liveConnectors, setLiveConnectors] = useState<LiveConnector[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<number | null>(null);
  const [showForm, setShowForm] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const fetchConnectors = useCallback(async () => {
    if (!BOT_ID) return;
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/connectors/?bot_id=${BOT_ID}`, { headers });
      if (res.ok) setLiveConnectors(await res.json());
    } catch {}
    setLoading(false);
  }, [BOT_ID]);

  useEffect(() => { fetchConnectors(); }, [fetchConnectors]);

  const getConnectorStatus = (key: string): ConnectorStatus => {
    const lc = liveConnectors.find(c => c.source_type === key);
    if (!lc) return null;
    return lc.status as ConnectorStatus;
  };

  const getLiveConnector = (key: string) => liveConnectors.find(c => c.source_type === key);

  const handleConnect = async (key: string) => {
    if (!BOT_ID) return;
    setConnecting(key);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/connectors/`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ bot_id: BOT_ID, source_type: key, config: formValues }),
      });
      if (res.ok) {
        toast.success(`${key} connected successfully!`);
        setShowForm(null);
        setFormValues({});
        await fetchConnectors();
      } else {
        const err = await res.json();
        toast.error(err.error || "Connection failed");
      }
    } catch { toast.error("Network error"); }
    setConnecting(null);
  };

  const handleSync = async (connectorId: number, name: string) => {
    if (!BOT_ID) return;
    setSyncing(connectorId);
    toast.info(`Syncing ${name}...`);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/connectors/${connectorId}/sync/`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ bot_id: BOT_ID }),
      });
      const data = await res.json();
      if (res.ok && data.status !== "failed") {
        toast.success(`Synced! ${data.records_inserted} new transactions imported.`);
        await fetchConnectors();
      } else {
        toast.error(`Sync failed: ${data.error || "Unknown error"}`);
      }
    } catch { toast.error("Network error during sync"); }
    setSyncing(null);
  };

  const handleDisconnect = async (id: number, name: string) => {
    if (!BOT_ID) return;
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/connectors/${id}/?bot_id=${BOT_ID}`, { method: "DELETE", headers });
      if (res.ok) {
        toast.success(`${name} disconnected.`);
        await fetchConnectors();
      }
    } catch {}
  };

  return (
    <div className="w-full h-full flex flex-col p-8 bg-[#0a0d14] overflow-y-auto text-white">
      <div className="max-w-6xl w-full mx-auto">
        <h1 className="text-2xl font-bold mb-2">Integrations</h1>
        <p className="text-slate-400 mb-8 max-w-2xl text-sm">
          Connect CFOlytics to your financial data sources. Active integrations sync automatically every hour.
          Razorpay is optimized for Indian businesses.
        </p>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <RefreshCw size={20} className="text-slate-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {CONNECTOR_CATALOG.map((cat) => {
              const lc = getLiveConnector(cat.key);
              const connStatus = getConnectorStatus(cat.key);
              const isSyncingThis = lc && syncing === lc.id;
              const isConnecting = connecting === cat.key;
              const isFormOpen = showForm === cat.key;

              return (
                <div key={cat.key} className={`p-5 border rounded-xl flex flex-col gap-4 transition-colors ${
                  cat.comingSoon
                    ? "border-[#1e2637] bg-[#0c0f17] opacity-60"
                    : connStatus === "active" ? "border-emerald-500/20 bg-[#0c0f17]" : "border-[#1e2637] bg-[#0c0f17] hover:border-[#2a3448]"
                }`}>
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className={`p-2.5 rounded-lg ${cat.bg} border ${cat.border}`}>
                      <cat.icon size={20} className={cat.color} />
                    </div>
                    {cat.comingSoon ? (
                      <span className="text-[10px] font-bold tracking-wider px-2 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 uppercase">
                        Coming Soon
                      </span>
                    ) : connStatus === "active" ? (
                      <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Connected
                      </span>
                    ) : connStatus === "error" ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 uppercase">Error</span>
                    ) : null}
                  </div>

                  {/* Info */}
                  <div>
                    <h3 className="font-semibold text-sm mb-1">{cat.name}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{cat.desc}</p>
                    {lc?.last_synced_at && (
                      <p className="text-[10px] text-slate-600 mt-2 flex items-center gap-1">
                        <Clock size={10} /> Last synced: {new Date(lc.last_synced_at).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  {!cat.comingSoon && (
                    <div className="flex flex-col gap-2 mt-auto">
                      {connStatus === "active" ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => lc && handleSync(lc.id, cat.name)}
                            disabled={isSyncingThis || false}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            <RefreshCw size={12} className={isSyncingThis ? "animate-spin" : ""} />
                            {isSyncingThis ? "Syncing..." : "Sync Now"}
                          </button>
                          <button
                            onClick={() => lc && handleDisconnect(lc.id, cat.name)}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ) : isFormOpen ? (
                        <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
                          {cat.fields.map(f => (
                            <input
                              key={f.name}
                              type={f.type || "text"}
                              placeholder={f.label}
                              value={formValues[f.name] || ""}
                              onChange={e => setFormValues(prev => ({ ...prev, [f.name]: e.target.value }))}
                              className="w-full bg-[#131929] border border-[#1e2637] rounded-md px-3 py-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500/40"
                            />
                          ))}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleConnect(cat.key)}
                              disabled={isConnecting}
                              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                            >
                              {isConnecting ? "Connecting..." : "Connect"}
                            </button>
                            <button
                              onClick={() => { setShowForm(null); setFormValues({}); }}
                              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setShowForm(cat.key); setFormValues({}); }}
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <Plus size={12} /> Connect
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
