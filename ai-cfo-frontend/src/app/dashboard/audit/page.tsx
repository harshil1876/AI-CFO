"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  Shield, Download, Search, ChevronLeft, ChevronRight,
  Loader2, FileText, AlertTriangle, Upload, BarChart,
  Settings, CheckCircle, RefreshCw, ShieldAlert, Activity,
  User, Globe, Filter
} from "lucide-react";
import { toast } from "sonner";

interface AuditEvent {
  id: number;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: string;
  ip_address: string | null;
  timestamp: string;
}

// ─── Action Metadata ─────────────────────────────────────────────────────────
const ACTION_META: Record<string, { color: string; dot: string; icon: React.ReactNode; label: string }> = {
  EXPORTED_PNL:         { color: "text-blue-400 bg-blue-400/10 border-blue-500/20",     dot: "bg-blue-400",    icon: <FileText className="h-3.5 w-3.5" />,     label: "Report Exported" },
  UPLOADED_FILE:        { color: "text-emerald-400 bg-emerald-400/10 border-emerald-500/20", dot: "bg-emerald-400", icon: <Upload className="h-3.5 w-3.5" />,     label: "File Uploaded" },
  ANOMALY_STATUS_UPDATE:{ color: "text-amber-400 bg-amber-400/10 border-amber-500/20",  dot: "bg-amber-400",   icon: <AlertTriangle className="h-3.5 w-3.5" />, label: "Anomaly Updated" },
  ANOMALY_COMMENT_ADDED:{ color: "text-purple-400 bg-purple-400/10 border-purple-500/20",dot: "bg-purple-400", icon: <FileText className="h-3.5 w-3.5" />,     label: "Comment Added" },
  APPROVED_INVOICE:     { color: "text-green-400 bg-green-400/10 border-green-500/20",  dot: "bg-green-400",   icon: <CheckCircle className="h-3.5 w-3.5" />,  label: "Invoice Approved" },
  PERMISSION_CHANGED:   { color: "text-orange-400 bg-orange-400/10 border-orange-500/20",dot: "bg-orange-400", icon: <Settings className="h-3.5 w-3.5" />,     label: "Permission Changed" },
};

const getActionMeta = (action: string) =>
  ACTION_META[action] || { color: "text-slate-400 bg-slate-400/10 border-slate-500/20", dot: "bg-slate-400", icon: <Shield className="h-3.5 w-3.5" />, label: action.replace(/_/g, " ") };

const formatTimestamp = (ts: string) => {
  const d = new Date(ts);
  return {
    date: d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
    time: d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
    relative: getRelativeTime(d),
  };
};

function getRelativeTime(date: Date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ─── Timeline Entry ───────────────────────────────────────────────────────────
function TimelineEntry({ event, isLast }: { event: AuditEvent; isLast: boolean }) {
  const meta = getActionMeta(event.action);
  const ts = formatTimestamp(event.timestamp);

  return (
    <div className="relative flex gap-4 group">
      {/* Vertical line */}
      {!isLast && (
        <div className="absolute left-5 top-10 bottom-0 w-px bg-gradient-to-b from-white/10 to-transparent" />
      )}

      {/* Dot + Icon */}
      <div className="relative z-10 flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-[#0f172a] border border-white/10 shadow-lg group-hover:border-white/20 transition-all">
        <span className={meta.color.split(" ")[0]}>{meta.icon}</span>
      </div>

      {/* Content card */}
      <div className="flex-1 mb-4 bg-[#0f172a] rounded-xl border border-white/5 px-5 py-4 shadow-sm group-hover:border-white/10 transition-all">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${meta.color}`}>
              {meta.icon}
              {meta.label}
            </span>
            {event.resource_type && (
              <span className="text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                {event.resource_type}
                {event.resource_id && <span className="text-slate-600 ml-1">#{event.resource_id}</span>}
              </span>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-slate-400 font-mono">{ts.time}</p>
            <p className="text-[10px] text-slate-600">{ts.date}</p>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <User className="h-3 w-3 text-slate-500" />
            <span className="text-xs text-slate-300 font-medium">{event.user_email}</span>
          </div>
          {event.ip_address && (
            <div className="flex items-center gap-1.5">
              <Globe className="h-3 w-3 text-slate-600" />
              <span className="text-xs text-slate-500 font-mono">{event.ip_address}</span>
            </div>
          )}
        </div>

        {event.details && (
          <p className="mt-2 text-xs text-slate-500 leading-relaxed border-t border-white/5 pt-2">
            {event.details}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Summary Stat Card ────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-[#0f172a] rounded-xl border border-white/5 p-5 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</h3>
        <div className={`${color} rounded-lg p-2`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AuditTrailPage() {
  const { getToken, orgId, userId: currentUserId } = useAuth();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("ALL");
  const [isAdmin, setIsAdmin] = useState(true);
  const [viewMode, setViewMode] = useState<"timeline" | "table">("timeline");

  const botId = orgId || "default_org";
  const perPage = 50;
  const totalPages = Math.ceil(total / perPage);

  const fetchAudit = async (pageNum = 1) => {
    setIsLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/audit/?bot_id=${botId}&page=${pageNum}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-User-Id": currentUserId || "",
            "X-Org-Role": "org:admin",
          },
        }
      );
      if (res.status === 403) { setIsAdmin(false); return; }
      const data = await res.json();
      setEvents(data.results || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error("Failed to load audit trail", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAudit(page); }, [page, botId]);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const token = await getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/audit/export/?bot_id=${botId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-User-Id": currentUserId || "",
            "X-Org-Role": "org:admin",
          },
        }
      );
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit_trail_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Audit log exported successfully!");
    } catch (e) {
      toast.error("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const actionTypes = ["ALL", ...Array.from(new Set(events.map(e => e.action)))];

  const filtered = events.filter((e) => {
    const matchSearch = search === "" ||
      e.user_email.toLowerCase().includes(search.toLowerCase()) ||
      e.action.toLowerCase().includes(search.toLowerCase()) ||
      e.resource_type.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filterAction === "ALL" || e.action === filterAction;
    return matchSearch && matchFilter;
  });

  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-center mt-20">
        <ShieldAlert className="h-20 w-20 text-red-500 mx-auto mb-6 opacity-80" />
        <h1 className="text-3xl font-bold text-red-400 mb-4">Access Denied</h1>
        <p className="text-slate-400">Only Organization Admins can view the Audit Trail.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0d14] overflow-y-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2637] flex-shrink-0 bg-[#0c0f17]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Shield className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Immutable Audit Trail</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              SOC2-ready compliance ledger —{" "}
              <span className="text-amber-400 font-semibold">{total}</span> events
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode toggle */}
          <div className="flex bg-black/20 border border-white/10 rounded-lg p-1 gap-1">
            {(["timeline", "table"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all capitalize ${
                  viewMode === mode ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          <button
            onClick={() => fetchAudit(page)}
            className="p-2 bg-white/5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg font-semibold text-sm hover:bg-amber-500/20 transition-all disabled:opacity-60"
          >
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export CSV
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 p-6 lg:p-8 flex flex-col gap-6">

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="Total Events" value={total} icon={<Activity className="h-4 w-4 text-blue-400" />} color="bg-blue-500/10" />
          <StatCard label="Uploads" value={events.filter(e => e.action === "UPLOADED_FILE").length} icon={<Upload className="h-4 w-4 text-emerald-400" />} color="bg-emerald-500/10" />
          <StatCard label="Security Events" value={events.filter(e => ["PERMISSION_CHANGED", "ANOMALY_STATUS_UPDATE"].includes(e.action)).length} icon={<ShieldAlert className="h-4 w-4 text-orange-400" />} color="bg-orange-500/10" />
          <StatCard label="Reports Exported" value={events.filter(e => e.action === "EXPORTED_PNL").length} icon={<BarChart className="h-4 w-4 text-purple-400" />} color="bg-purple-500/10" />
        </div>

        {/* Search + Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by user, action, or resource..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500 flex-shrink-0" />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none focus:border-amber-500/50 transition-colors"
            >
              {actionTypes.map((a) => (
                <option key={a} value={a}>{a === "ALL" ? "All Actions" : getActionMeta(a).label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Loading ── */}
        {isLoading ? (
          <div className="flex justify-center items-center h-48 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500 mr-3" />
            Loading audit trail...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <Shield className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-semibold text-slate-400">No events found</p>
            <p className="text-sm mt-1">Events are logged automatically as your team uses CFOlytics.</p>
          </div>
        ) : viewMode === "timeline" ? (
          /* ── TIMELINE VIEW ── */
          <div className="max-w-3xl w-full">
            {filtered.map((event, idx) => (
              <TimelineEntry key={event.id} event={event} isLast={idx === filtered.length - 1} />
            ))}
          </div>
        ) : (
          /* ── TABLE VIEW ── */
          <div className="bg-[#0f172a] rounded-xl border border-white/5 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-400 bg-black/40 border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Action</th>
                    <th className="px-6 py-4">Resource</th>
                    <th className="px-6 py-4">Details</th>
                    <th className="px-4 py-4">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((event) => {
                    const meta = getActionMeta(event.action);
                    const ts = formatTimestamp(event.timestamp);
                    return (
                      <tr key={event.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-3 text-slate-400 whitespace-nowrap text-xs font-mono">
                          <div>{ts.date}</div>
                          <div className="text-slate-600">{ts.time}</div>
                        </td>
                        <td className="px-6 py-3">
                          <span className="text-slate-200 font-medium text-xs">{event.user_email}</span>
                        </td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${meta.color}`}>
                            {meta.icon}
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          {event.resource_type && (
                            <span className="text-slate-300 text-xs">
                              {event.resource_type}
                              {event.resource_id && <span className="text-slate-500 ml-1">#{event.resource_id}</span>}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3 max-w-xs">
                          <span className="text-slate-500 text-xs truncate block" title={event.details}>
                            {event.details || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-slate-500 text-xs font-mono">{event.ip_address || "—"}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 flex items-center justify-between border-t border-white/5 bg-black/20">
                <span className="text-xs text-slate-500">
                  Page {page} of {totalPages} &bull; {total} total events
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-40 transition-all"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-40 transition-all"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
