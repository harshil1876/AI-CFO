"use client";

import { useState, useEffect, useCallback } from "react";
import {
  listConnectors,
  registerConnector,
  deleteConnector,
  triggerSync,
  type DataSource,
  type SyncResult,
} from "@/lib/api";

// ─── Connector Metadata ───────────────────────────────────────────
const CONNECTOR_META = {
  tally: {
    label: "Tally Prime",
    icon: "📊",
    color: "#3b82f6",
    description: "India's #1 accounting software. Syncs vouchers & ledger entries.",
    fields: [
      { key: "host", label: "Host", placeholder: "localhost", type: "text" },
      { key: "port", label: "Port", placeholder: "9000", type: "number" },
      { key: "company_name", label: "Company Name", placeholder: "My Company Ltd", type: "text" },
    ],
  },
  razorpay: {
    label: "Razorpay",
    icon: "💳",
    color: "#0ea5e9",
    description: "Automatically import captured payments & refunds from Razorpay.",
    fields: [
      { key: "key_id", label: "API Key ID", placeholder: "rzp_live_...", type: "text" },
      { key: "key_secret", label: "API Secret", placeholder: "••••••••••••••••", type: "password" },
    ],
  },
  google_sheets: {
    label: "Google Sheets",
    icon: "📋",
    color: "#22c55e",
    description: "Live sync from a Google Sheet with columns: Date, Amount, Description, Category.",
    fields: [
      { key: "spreadsheet_id", label: "Spreadsheet ID", placeholder: "1BxiMVs...", type: "text" },
      { key: "sheet_name", label: "Sheet Name", placeholder: "Sheet1", type: "text" },
    ],
  },
  zoho: {
    label: "Zoho Books",
    icon: "📒",
    color: "#f97316",
    description: "Imports paid invoices (Revenue) and bills (Expenses) from Zoho Books.",
    fields: [
      { key: "client_id", label: "Client ID", placeholder: "1000...", type: "text" },
      { key: "client_secret", label: "Client Secret", placeholder: "••••••••", type: "password" },
      { key: "refresh_token", label: "Refresh Token", placeholder: "1000.xxx...", type: "password" },
      { key: "organization_id", label: "Organization ID", placeholder: "5551...", type: "text" },
    ],
  },
} as const;

type ConnectorType = keyof typeof CONNECTOR_META;

interface ConnectorsPanelProps {
  botId: string;
}

// ─── Badge ───────────────────────────────────────────────────────
function StatusBadge({ status }: { status: DataSource["status"] }) {
  const styles: Record<string, string> = {
    active: "bg-green-500/10 text-green-400 border-green-500/20",
    inactive: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    error: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  const dots: Record<string, string> = {
    active: "bg-green-400",
    inactive: "bg-gray-400",
    error: "bg-red-400",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${styles[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dots[status]}`} />
      {status}
    </span>
  );
}

// ─── Add Connector Modal ─────────────────────────────────────────
function AddConnectorModal({
  botId,
  onClose,
  onAdded,
}: {
  botId: string;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [step, setStep] = useState<"pick" | "configure">("pick");
  const [selectedType, setSelectedType] = useState<ConnectorType | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const meta = selectedType ? CONNECTOR_META[selectedType] : null;

  const handleAdd = async () => {
    if (!selectedType || !displayName.trim()) return;
    setLoading(true);
    setError("");
    try {
      await registerConnector(botId, selectedType, displayName, fieldValues);
      onAdded();
      onClose();
    } catch {
      setError("Failed to register connector. Please check the configuration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0a111f] p-6 shadow-2xl shadow-black/50">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">
            {step === "pick" ? "Connect a Data Source" : `Configure ${meta?.label}`}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {step === "pick" && (
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(CONNECTOR_META) as ConnectorType[]).map((type) => {
              const m = CONNECTOR_META[type];
              return (
                <button
                  key={type}
                  onClick={() => { setSelectedType(type); setStep("configure"); }}
                  className="group rounded-xl border border-white/5 bg-white/[0.02] p-4 text-left transition-all hover:border-white/20 hover:bg-white/5"
                >
                  <div className="mb-2 text-2xl">{m.icon}</div>
                  <p className="text-sm font-medium text-gray-200">{m.label}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-gray-500">{m.description}</p>
                </button>
              );
            })}
          </div>
        )}

        {step === "configure" && meta && (
          <div className="space-y-4">
            <button
              onClick={() => setStep("pick")}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              ← Back
            </button>

            {/* Display Name */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-400">Connection Name</label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={`e.g. ${meta.label} Production`}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
              />
            </div>

            {/* Dynamic Fields */}
            {meta.fields.map((field) => (
              <div key={field.key}>
                <label className="mb-1 block text-xs font-medium text-gray-400">{field.label}</label>
                <input
                  type={field.type}
                  value={fieldValues[field.key] || ""}
                  onChange={(e) => setFieldValues((p) => ({ ...p, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                />
              </div>
            ))}

            {error && <p className="text-xs text-red-400">{error}</p>}

            <button
              onClick={handleAdd}
              disabled={loading || !displayName.trim()}
              className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Connecting..." : `Connect ${meta.label}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Connectors Panel ───────────────────────────────────────
export default function ConnectorsPanel({ botId }: ConnectorsPanelProps) {
  const [connectors, setConnectors] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [syncing, setSyncing] = useState<number | null>(null);
  const [syncResults, setSyncResults] = useState<Record<number, SyncResult | null>>({});

  const fetchConnectors = useCallback(async () => {
    try {
      const data = await listConnectors(botId);
      setConnectors(Array.isArray(data) ? data : []);
    } catch {
      setConnectors([]);
    } finally {
      setLoading(false);
    }
  }, [botId]);

  useEffect(() => {
    if (botId) fetchConnectors();
  }, [botId, fetchConnectors]);

  const handleSync = async (sourceId: number) => {
    setSyncing(sourceId);
    setSyncResults((p) => ({ ...p, [sourceId]: null }));
    try {
      const result = await triggerSync(botId, sourceId);
      setSyncResults((p) => ({ ...p, [sourceId]: result }));
      await fetchConnectors(); // refresh last_synced_at
    } finally {
      setSyncing(null);
    }
  };

  const handleDelete = async (sourceId: number) => {
    if (!confirm("Remove this connector? Existing transactions will not be deleted.")) return;
    await deleteConnector(botId, sourceId);
    await fetchConnectors();
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Data Connectors</h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Connect external sources to automatically sync your financial data.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-500 hover:shadow-blue-500/40"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Connector
        </button>
      </div>

      {/* Connector Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      ) : connectors.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-2xl">🔌</div>
          <p className="text-sm font-medium text-gray-300">No connectors yet</p>
          <p className="mt-1 text-xs text-gray-600">Add Tally, Razorpay, Google Sheets or Zoho to auto-import data.</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-400 transition-all hover:bg-blue-500/20"
          >
            Add your first connector →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {connectors.map((conn) => {
            const meta = CONNECTOR_META[conn.source_type as ConnectorType];
            const result = syncResults[conn.id];
            const isSyncing = syncing === conn.id;
            return (
              <div
                key={conn.id}
                className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-all hover:border-white/10"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-xl">
                      {meta?.icon || "🔌"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{conn.display_name}</p>
                      <p className="text-xs text-gray-500">{meta?.label || conn.source_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={conn.status} />
                    <button
                      onClick={() => handleSync(conn.id)}
                      disabled={isSyncing}
                      className="rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-400 transition-all hover:bg-blue-500/20 disabled:opacity-50"
                    >
                      {isSyncing ? "Syncing..." : "Sync Now"}
                    </button>
                    <button
                      onClick={() => handleDelete(conn.id)}
                      className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-all hover:bg-red-500/20"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Last synced */}
                <div className="mt-3 flex items-center gap-4 text-[11px] text-gray-600">
                  <span>
                    Last synced:{" "}
                    {conn.last_synced_at
                      ? new Date(conn.last_synced_at).toLocaleString("en-IN")
                      : "Never"}
                  </span>
                </div>

                {/* Sync result */}
                {result && (
                  <div
                    className={`mt-3 rounded-xl border p-3 text-xs ${
                      result.status === "success"
                        ? "border-green-500/20 bg-green-500/5 text-green-400"
                        : result.status === "partial"
                        ? "border-yellow-500/20 bg-yellow-500/5 text-yellow-400"
                        : "border-red-500/20 bg-red-500/5 text-red-400"
                    }`}
                  >
                    {result.status === "failed" ? (
                      <p>❌ Sync failed: {result.error}</p>
                    ) : (
                      <p>
                        ✅ Synced {result.records_inserted} / {result.records_fetched} records
                        {result.currency !== "INR" && ` (converted from ${result.currency} @ ₹${result.exchange_rate})`}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Currency Info Box */}
      <div className="mt-6 rounded-2xl border border-white/5 bg-gradient-to-r from-blue-500/5 to-purple-500/5 p-4">
        <p className="text-xs font-medium text-gray-400">🌐 Multi-Currency Support</p>
        <p className="mt-1 text-[11px] leading-relaxed text-gray-600">
          All imported transactions are automatically converted to <strong className="text-gray-400">INR</strong> using
          live approximate exchange rates. Supported: INR, USD, EUR, GBP, AED, SGD.
        </p>
      </div>

      {showModal && (
        <AddConnectorModal
          botId={botId}
          onClose={() => setShowModal(false)}
          onAdded={fetchConnectors}
        />
      )}
    </div>
  );
}
