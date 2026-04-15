"use client";

import { useEffect, useState } from "react";
import { useAuth, useOrganization, useUser } from "@clerk/nextjs";
import { useCurrency } from "@/context/CurrencyContext";
import {
  AlertTriangle, MessageSquare, CheckCircle, Clock,
  User, Send, Loader2, ChevronDown, ChevronUp, RefreshCw,
  ShieldAlert
} from "lucide-react";

interface Comment {
  id: number;
  user_email: string;
  text: string;
  created_at: string;
}

interface Anomaly {
  id: number;
  category: string;
  description: string;
  severity: string;
  amount: number | null;
  status: string;
  assigned_to: string | null;
  detected_at: string;
  comments?: Comment[];
  commentCount?: number;
}

const SEVERITY_STYLE: Record<string, string> = {
  critical: "text-red-400 bg-red-500/10 border-red-500/30",
  high:     "text-orange-400 bg-orange-500/10 border-orange-500/30",
  medium:   "text-amber-400 bg-amber-500/10 border-amber-500/30",
  low:      "text-blue-400 bg-blue-500/10 border-blue-500/30",
};

const STATUS_STYLE: Record<string, string> = {
  open:       "text-red-400 bg-red-500/10 border-red-500/20",
  "in-review":"text-amber-400 bg-amber-500/10 border-amber-500/20",
  resolved:   "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  open:       <AlertTriangle className="h-3 w-3" />,
  "in-review":<Clock className="h-3 w-3" />,
  resolved:   <CheckCircle className="h-3 w-3" />,
};

// ─── Feature D: Risk Type Classification ─────────────────────────────────────
type RiskType = "Duplicate" | "Unusual Amount" | "Vendor Change" | "Timing Anomaly" | "Pattern Deviation" | "High Value";

function deriveRiskType(anomaly: Anomaly): RiskType {
  const desc = (anomaly.description || "").toLowerCase();
  const cat  = (anomaly.category  || "").toLowerCase();
  if (desc.includes("duplicate") || desc.includes("repeated"))        return "Duplicate";
  if (desc.includes("vendor") || desc.includes("supplier"))           return "Vendor Change";
  if (desc.includes("timing") || desc.includes("late") || desc.includes("early")) return "Timing Anomaly";
  if (anomaly.amount && anomaly.amount > 50000)                       return "High Value";
  if (desc.includes("unusual") || desc.includes("unexpected"))        return "Unusual Amount";
  return "Pattern Deviation";
}

const RISK_TYPE_STYLE: Record<RiskType, string> = {
  "Duplicate":        "text-rose-400 bg-rose-500/10 border-rose-500/20",
  "Unusual Amount":   "text-amber-400 bg-amber-500/10 border-amber-500/20",
  "Vendor Change":    "text-orange-400 bg-orange-500/10 border-orange-500/20",
  "Timing Anomaly":   "text-sky-400 bg-sky-500/10 border-sky-500/20",
  "Pattern Deviation":"text-purple-400 bg-purple-500/10 border-purple-500/20",
  "High Value":       "text-red-400 bg-red-500/10 border-red-500/20",
};

const SEVERITY_SCORE: Record<string, number> = { critical: 92, high: 74, medium: 48, low: 22 };

function RiskScoreBar({ score, severity }: { score: number; severity: string }) {
  const color = severity === "critical" ? "bg-red-500" :
                severity === "high"     ? "bg-orange-500" :
                severity === "medium"   ? "bg-amber-500" : "bg-blue-400";
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-slate-500 whitespace-nowrap">Risk Score</span>
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden" style={{ minWidth: "60px" }}>
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`text-[10px] font-bold ${
        score >= 80 ? "text-red-400" : score >= 50 ? "text-amber-400" : "text-blue-400"
      }`}>{score}</span>
    </div>
  );
}

export default function AnomalyHubPage() {
  const { getToken, orgId, userId: currentUserId } = useAuth();
  const { user } = useUser();
  const { formatAmount } = useCurrency();
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [commentText, setCommentText] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState("");

  // Pre-fill email from Clerk but allow override (Hybrid)
  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress && !userEmail) {
      setUserEmail(user.primaryEmailAddress.emailAddress);
    }
  }, [user]);

  const botId = orgId || "default_org";

  const fetchAnomalies = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/anomalies/?bot_id=${botId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAnomalies(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async (anomalyId: number) => {
    try {
      const token = await getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/anomalies/${anomalyId}/comments/?bot_id=${botId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setComments((prev) => ({ ...prev, [anomalyId]: data }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateStatus = async (anomalyId: number, newStatus: string) => {
    try {
      const token = await getToken();
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/anomalies/${anomalyId}/status/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-User-Id": currentUserId || "",
          "X-User-Email": userEmail,
          "X-Org-Role": "org:admin",
        },
        body: JSON.stringify({ bot_id: botId, status: newStatus }),
      });
      fetchAnomalies();
    } catch (e) {
      console.error(e);
    }
  };

  const submitComment = async (anomalyId: number) => {
    const text = (commentText[anomalyId] || "").trim();
    if (!text) return;
    setSubmitting(anomalyId);
    try {
      const token = await getToken();
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/anomalies/${anomalyId}/comments/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-User-Id": currentUserId || "",
          "X-User-Email": userEmail,
        },
        body: JSON.stringify({ bot_id: botId, text, user_email: userEmail }),
      });
      setCommentText((prev) => ({ ...prev, [anomalyId]: "" }));
      fetchComments(anomalyId);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(null);
    }
  };

  const toggleExpand = (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      if (!comments[id]) fetchComments(id);
    }
  };

  useEffect(() => { fetchAnomalies(); }, [botId]);

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0d14] overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-[#1e2637] flex-shrink-0 bg-[#0c0f17] gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Anomaly Resolution Hub</h2>
            <p className="text-xs text-slate-500 mt-0.5">Collaborate, assign, and resolve AI-detected financial anomalies.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="email"
            placeholder="Your email (for @mentions)"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            className="bg-[#1e2637] border border-[#2a3441] rounded-lg px-3 py-2 text-xs text-slate-300 placeholder-slate-500 outline-none focus:border-amber-500/50 w-52"
          />
          <button
            onClick={fetchAnomalies}
            className="p-2 bg-[#1e2637] rounded-lg border border-[#2a3441] text-slate-400 hover:text-white transition-all"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Anomaly List Content */}
      <div className="flex-1 overflow-y-auto p-6 max-w-5xl w-full space-y-3">
      {isLoading ? (
        <div className="flex justify-center items-center h-48 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500 mr-3" /> Loading anomalies...
        </div>
      ) : anomalies.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <CheckCircle className="h-16 w-16 text-emerald-500/40 mx-auto mb-4" />
          <p className="text-lg font-semibold text-slate-400">No anomalies detected</p>
          <p className="text-sm mt-1">Run the Intelligence Pipeline to detect anomalies.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {anomalies.map((anomaly) => {
            const isExpanded = expandedId === anomaly.id;
            const anomalyComments = comments[anomaly.id] || [];
            const riskType = deriveRiskType(anomaly);
            const riskScore = SEVERITY_SCORE[anomaly.severity] || 40;
            return (
              <div
                key={anomaly.id}
                className="bg-[#0f172a] rounded-xl border border-white/5 overflow-hidden shadow-lg hover:border-white/10 transition-all"
              >
                {/* Top Row */}
                <div
                  className="px-6 py-4 flex items-center gap-4 cursor-pointer"
                  onClick={() => toggleExpand(anomaly.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold uppercase ${SEVERITY_STYLE[anomaly.severity] || SEVERITY_STYLE.medium}`}>
                        {anomaly.severity}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${STATUS_STYLE[anomaly.status] || STATUS_STYLE.open}`}>
                        {STATUS_ICON[anomaly.status]}
                        {anomaly.status.replace("-", " ").toUpperCase()}
                      </span>
                      {/* Feature D: Risk Type Tag */}
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${RISK_TYPE_STYLE[riskType]}`}>
                        {riskType}
                      </span>
                      <span className="text-slate-400 text-xs">{anomaly.category}</span>
                      {anomaly.amount !== null && (
                        <span className="text-white font-semibold text-sm ml-auto">
                          {formatAmount(Number(anomaly.amount))}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300 text-sm mt-2 leading-relaxed">{anomaly.description}</p>
                    {/* Feature D: Risk Score Bar */}
                    <div className="mt-2 max-w-xs">
                      <RiskScoreBar score={riskScore} severity={anomaly.severity} />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-slate-500 text-xs hidden md:block">
                      {new Date(anomaly.detected_at).toLocaleDateString("en-IN")}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-500" />
                    )}
                  </div>
                </div>

                {/* Expanded: Actions + Comments */}
                {isExpanded && (
                  <div className="border-t border-white/5 px-6 py-5 space-y-5 bg-black/20">
                    {/* Status Controls */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Change Status:</span>
                      {["open", "in-review", "resolved"].map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatus(anomaly.id, s)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                            anomaly.status === s
                              ? STATUS_STYLE[s] + " opacity-100"
                              : "border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20"
                          }`}
                        >
                          {s.replace("-", " ").toUpperCase()}
                        </button>
                      ))}
                    </div>

                    {/* Comments Thread */}
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <MessageSquare className="h-3.5 w-3.5" />
                        Discussion ({anomalyComments.length})
                      </h4>
                      <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
                        {anomalyComments.length === 0 ? (
                          <p className="text-slate-600 text-xs italic">No comments yet. Start the discussion below.</p>
                        ) : (
                          anomalyComments.map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-amber-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center text-xs font-bold text-amber-400 shrink-0">
                                {comment.user_email.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 bg-white/[0.03] rounded-lg px-3 py-2 border border-white/5">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-amber-400 text-xs font-semibold">{comment.user_email}</span>
                                  <span className="text-slate-600 text-xs">{new Date(comment.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                                </div>
                                <p className="text-slate-300 text-sm leading-relaxed">{comment.text}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Comment Input */}
                      <div className="flex gap-3">
                        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-amber-500/30 to-blue-500/30 border border-white/10 flex items-center justify-center text-xs font-bold text-amber-400 shrink-0">
                          {userEmail.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            placeholder="Add a comment... Use @email to notify someone"
                            value={commentText[anomaly.id] || ""}
                            onChange={(e) => setCommentText((prev) => ({ ...prev, [anomaly.id]: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitComment(anomaly.id); }}}
                            className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-amber-500/50 transition-colors"
                          />
                          <button
                            onClick={() => submitComment(anomaly.id)}
                            disabled={submitting === anomaly.id || !commentText[anomaly.id]?.trim()}
                            className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg hover:bg-amber-500/20 transition-all disabled:opacity-40"
                          >
                            {submitting === anomaly.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
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
