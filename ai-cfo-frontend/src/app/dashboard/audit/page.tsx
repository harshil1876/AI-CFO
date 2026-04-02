"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  Shield, Download, Search, ChevronLeft, ChevronRight,
  Loader2, FileText, AlertTriangle, Upload, BarChart,
  Settings, CheckCircle, RefreshCw, ShieldAlert, Activity
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

const ACTION_STYLES: Record<string, { color: string; icon: React.ReactNode }> = {
  EXPORTED_PNL:        { color: "text-blue-400 bg-blue-400/10 border-blue-500/20", icon: <FileText className="h-3 w-3" /> },
  UPLOADED_FILE:       { color: "text-emerald-400 bg-emerald-400/10 border-emerald-500/20", icon: <Upload className="h-3 w-3" /> },
  ANOMALY_STATUS_UPDATE:{ color: "text-amber-400 bg-amber-400/10 border-amber-500/20", icon: <AlertTriangle className="h-3 w-3" /> },
  ANOMALY_COMMENT_ADDED:{ color: "text-purple-400 bg-purple-400/10 border-purple-500/20", icon: <FileText className="h-3 w-3" /> },
  APPROVED_INVOICE:    { color: "text-green-400 bg-green-400/10 border-green-500/20", icon: <CheckCircle className="h-3 w-3" /> },
  PERMISSION_CHANGED:  { color: "text-orange-400 bg-orange-400/10 border-orange-500/20", icon: <Settings className="h-3 w-3" /> },
};

const getActionStyle = (action: string) =>
  ACTION_STYLES[action] || { color: "text-slate-400 bg-slate-400/10 border-slate-500/20", icon: <Shield className="h-3 w-3" /> };

const formatTimestamp = (ts: string) => {
  const d = new Date(ts);
  const userLocale = Intl.DateTimeFormat().resolvedOptions().locale;
  return d.toLocaleString(userLocale, { dateStyle: "medium", timeStyle: "short" });
};

export default function AuditTrailPage() {
  const { getToken, orgId, userId: currentUserId } = useAuth();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [search, setSearch] = useState("");
  const [isAdmin, setIsAdmin] = useState(true); // We check on the backend; assume true and handle 403

  const botId = orgId || "default_org";
  const perPage = 50;
  const totalPages = Math.ceil(total / perPage);

  const fetchAudit = async (pageNum = 1) => {
    setIsLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(
        `http://127.0.0.1:8000/api/audit/?bot_id=${botId}&page=${pageNum}`,
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
        `http://127.0.0.1:8000/api/audit/export/?bot_id=${botId}`,
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

  const filtered = events.filter(
    (e) =>
      search === "" ||
      e.user_email.toLowerCase().includes(search.toLowerCase()) ||
      e.action.toLowerCase().includes(search.toLowerCase()) ||
      e.resource_type.toLowerCase().includes(search.toLowerCase())
  );

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
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-amber-500/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500">
            <Shield className="h-8 w-8 text-amber-500" />
            Immutable Audit Trail
          </h1>
          <p className="text-slate-400 mt-2">
            SOC2-ready compliance ledger &mdash; <span className="text-amber-400 font-semibold">{total}</span> events recorded
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchAudit(page)}
            className="p-2 bg-white/5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            title="Refresh"
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

      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0f172a] rounded-xl border border-white/5 p-5 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Activity</h3>
            <div className="bg-blue-500/10 rounded-lg p-2">
              <Activity className="h-4 w-4 text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white tracking-tight">{total}</p>
          <p className="text-[11px] text-slate-500 mt-1">Audit log entries recorded</p>
        </div>
        
        <div className="bg-[#0f172a] rounded-xl border border-white/5 p-5 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Security Alerts</h3>
            <div className="bg-red-500/10 rounded-lg p-2">
              <ShieldAlert className="h-4 w-4 text-red-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white tracking-tight">
            {events.filter(e => e.action === 'PERMISSION_CHANGED' || e.action === 'ANOMALY_STATUS_UPDATE').length}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">High-priority events on this page</p>
        </div>
        
        <div className="bg-[#0f172a] rounded-xl border border-white/5 p-5 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Data Inflow</h3>
            <div className="bg-emerald-500/10 rounded-lg p-2">
              <Upload className="h-4 w-4 text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white tracking-tight">
            {events.filter(e => e.action === 'UPLOADED_FILE').length}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Files ingested from team</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search by user, action, or resource..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-black/20 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-amber-500/50 transition-colors"
        />
      </div>

      {/* Table */}
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
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-amber-500" />
                    Loading audit events...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No audit events found. Events are logged automatically as your team uses CFOlytics.
                  </td>
                </tr>
              ) : (
                filtered.map((event) => {
                  const style = getActionStyle(event.action);
                  return (
                    <tr key={event.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-3 text-slate-400 whitespace-nowrap text-xs font-mono">
                        {formatTimestamp(event.timestamp)}
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-slate-200 font-medium text-xs">{event.user_email}</span>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${style.color}`}>
                          {style.icon}
                          {event.action.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        {event.resource_type && (
                          <span className="text-slate-300 text-xs">
                            {event.resource_type}
                            {event.resource_id && (
                              <span className="text-slate-500 ml-1">#{event.resource_id}</span>
                            )}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3 max-w-xs">
                        <span className="text-slate-500 text-xs truncate block" title={event.details}>
                          {event.details || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-slate-500 text-xs font-mono">
                          {event.ip_address || "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
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
    </div>
  );
}
