"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  uploadInvoiceDocument, getInvoices, getPurchaseOrders, updateInvoiceStatus,
  getAuthHeaders,
  type InvoiceRecord, type PurchaseOrder
} from "@/lib/api";
import { Send, Bot, MailOpen, Zap, Clock, CheckCircle2, XCircle, AlertTriangle, Mail, ExternalLink } from "lucide-react";
import { toast } from "sonner";

// ── API helpers for Sprint 18 ──────────────────────────────────────────────
async function fetchInvoiceThreads(invoiceId: number) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/${invoiceId}/threads/`, { headers });
  if (!res.ok) return [];
  return res.json();
}

async function postInvoiceThread(invoiceId: number, payload: {
  bot_id: string; user_id: string; user_email: string; user_name: string; message: string;
}) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/${invoiceId}/threads/`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

async function fetchEmailLogs(botId: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ap/email-logs/?bot_id=${botId}`, { headers });
  if (!res.ok) return [];
  return res.json();
}

// ── Types ─────────────────────────────────────────────────────────────────
interface ThreadMessage {
  id: number;
  user_id: string;
  user_email: string;
  user_name: string;
  message: string;
  mentions: string[];
  created_at: string;
}

interface EmailLog {
  id: number;
  sender_email: string;
  subject: string;
  status: string;
  invoice_id: number | null;
  error_message: string | null;
  received_at: string;
}

// ── Invoice Workspace Chat Panel ───────────────────────────────────────────
function InvoiceWorkspace({ invoiceId, botId }: { invoiceId: number; botId: string }) {
  const { user } = useUser();
  const [threads, setThreads] = useState<ThreadMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInvoiceThreads(invoiceId).then(setThreads);
  }, [invoiceId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threads]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return;
    setIsSending(true);
    const payload = {
      bot_id: botId,
      user_id: user.id,
      user_email: user.primaryEmailAddress?.emailAddress || "",
      user_name: user.fullName || user.firstName || "Team Member",
      message: newMessage.trim(),
    };
    const result = await postInvoiceThread(invoiceId, payload);
    if (result.id) {
      setThreads(prev => [...prev, { ...result, user_id: user.id }]);
    }
    setNewMessage("");
    setIsSending(false);
  };

  const renderMessage = (msg: string) => {
    // Highlight @mentions
    const parts = msg.split(/(@[\w.+-]+@[\w-]+\.[\w.]+)/g);
    return parts.map((part, i) =>
      part.startsWith("@") ? (
        <span key={i} className="text-indigo-400 font-medium">{part}</span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#080b11] rounded-xl border border-[#1e2637]">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#1e2637] flex-shrink-0">
        <div className="p-1.5 rounded-md bg-indigo-500/10 border border-indigo-500/20">
          <Send size={13} className="text-indigo-400" />
        </div>
        <div>
          <p className="text-xs font-semibold text-white">Invoice Workspace</p>
          <p className="text-[10px] text-slate-500">Type @email to notify a team member</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
        {threads.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-600 py-8 gap-2">
            <Send size={20} className="opacity-40" />
            <p className="text-xs">No messages yet. Start the conversation.</p>
          </div>
        )}
        {threads.map((t) => {
          const isMe = user?.id === t.user_id;
          return (
            <div key={t.id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-[9px] font-bold text-white uppercase">
                {(t.user_name || t.user_email)[0]}
              </div>
              <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                <span className="text-[10px] text-slate-500 px-1">{isMe ? "You" : t.user_name || t.user_email}</span>
                <div className={`px-3 py-2 rounded-xl text-xs leading-relaxed ${isMe ? "bg-indigo-600/30 text-white rounded-tr-none" : "bg-[#141928] text-slate-300 rounded-tl-none border border-[#1e2637]"}`}>
                  {renderMessage(t.message)}
                </div>
                <span className="text-[9px] text-slate-600 px-1">
                  {new Date(t.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-3 py-3 border-t border-[#1e2637] flex-shrink-0">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Message or @email to mention…"
          className="flex-1 bg-[#111827] border border-[#1e2637] rounded-lg px-3 py-2 text-xs text-slate-300 placeholder-slate-600 outline-none focus:border-indigo-500/50 transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={!newMessage.trim() || isSending}
          className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 transition-colors"
        >
          <Send size={13} className="text-white" />
        </button>
      </div>
    </div>
  );
}

// ── Email Inbox Log Panel ─────────────────────────────────────────────────
function EmailInboxLog({ botId }: { botId: string }) {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmailLogs(botId).then((d) => { setLogs(d); setLoading(false); });
  }, [botId]);

  const statusIcon = (s: string) => {
    if (s === "processed") return <CheckCircle2 size={12} className="text-emerald-400" />;
    if (s === "failed") return <XCircle size={12} className="text-red-400" />;
    if (s === "no_attachment") return <AlertTriangle size={12} className="text-amber-400" />;
    return <Clock size={12} className="text-slate-400" />;
  };

  return (
    <div className="rounded-xl border border-[#1e2637] bg-[#0c0f17] overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-[#1e2637]">
        <div className="p-1.5 rounded-md bg-violet-500/10 border border-violet-500/20">
          <MailOpen size={13} className="text-violet-400" />
        </div>
        <div>
          <p className="text-xs font-semibold text-white">Email Ingestion Log</p>
          <p className="text-[10px] text-slate-500">Mailgun webhook history</p>
        </div>
        <div className="ml-auto">
          <div className="flex items-center gap-1.5 bg-[#111827] border border-[#1e2637] rounded-lg px-3 py-1.5">
            <Mail size={11} className="text-slate-500" />
            <code className="text-[10px] text-indigo-400">invoices.{botId.slice(0,10)}…@cfolytics.com</code>
          </div>
        </div>
      </div>
      <div className="p-4">
        {loading ? (
          <div className="flex items-center gap-2 text-slate-600 text-xs py-4"><Clock size={13} className="animate-spin" />Loading logs…</div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <MailOpen size={28} className="text-slate-700" />
            <div>
              <p className="text-sm text-slate-400 font-medium">No emails received yet</p>
              <p className="text-xs text-slate-600 mt-1">Forward vendor invoices to your CFOlytics address above to auto-process them.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#0a0d14] border border-[#1e2637] hover:border-[#2a3448] transition-colors">
                {statusIcon(log.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-300 truncate">{log.subject || "(No Subject)"}</p>
                  <p className="text-[10px] text-slate-500">From: {log.sender_email}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    log.status === "processed" ? "bg-emerald-500/10 text-emerald-400" :
                    log.status === "failed" ? "bg-red-500/10 text-red-400" :
                    log.status === "no_attachment" ? "bg-amber-500/10 text-amber-400" :
                    "bg-slate-500/10 text-slate-400"
                  }`}>{log.status}</span>
                  <span className="text-[10px] text-slate-600">{new Date(log.received_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


// ── Main Panel ─────────────────────────────────────────────────────────────
export default function InvoiceAnalysisPanel({ botId }: { botId: string }) {
  const [activeTab, setActiveTab] = useState<"upload" | "invoices" | "pos" | "email">("upload");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [scanProgress, setScanProgress] = useState(0);
  
  const [showPoForm, setShowPoForm] = useState(false);
  const [poForm, setPoForm] = useState({ po_number: '', vendor_name: '', expected_amount: '' });

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/purchase-orders/`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...poForm, bot_id: botId, status: 'open' })
      });
      if (!res.ok) throw new Error('Failed to create PO');
      const newPo = await res.json();
      setPos([newPo, ...pos]);
      setShowPoForm(false);
      setPoForm({ po_number: '', vendor_name: '', expected_amount: '' });
      toast.success("Purchase Order created successfully");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [currentResult, setCurrentResult] = useState<any>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeTab === "invoices") loadInvoices();
    if (activeTab === "pos") loadPos();
  }, [activeTab]);

  const loadInvoices = async () => {
    try { setInvoices(await getInvoices(botId)); } catch (e) { console.error(e); }
  };
  const loadPos = async () => {
    try { setPos(await getPurchaseOrders(botId)); } catch (e) { console.error(e); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsProcessing(true);
    setCurrentResult(null);
    setSelectedInvoiceId(null);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress((prev) => prev < 90 ? prev + Math.random() * 15 : prev);
      const statuses = ["Uploading to Gemini…", "Running OCR…", "Extracting Line Items…", "Verifying Mathematics…", "Checking Purchase Orders…", "Running Fraud Intelligence…", "Checking Autopilot Rules…"];
      setProcessingStatus(statuses[Math.floor(Math.random() * statuses.length)]);
    }, 800);

    try {
      const result = await uploadInvoiceDocument(botId, file);
      setScanProgress(100);
      setTimeout(() => {
        setCurrentResult(result);
        setSelectedInvoiceId(result.invoice_id || result.id || null);
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }, 500);
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
      setIsProcessing(false);
    } finally {
      clearInterval(interval);
    }
  };

  const handleStatusUpdate = async (invoiceId: number, status: "approved" | "rejected") => {
    try {
      const result = await updateInvoiceStatus(botId, invoiceId, status);
      if (currentResult && currentResult.id === invoiceId) setCurrentResult({ ...currentResult, status: result.status });
      setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status: result.status } : inv));
    } catch (e: any) {
      toast.error("Failed to update status: " + e.message);
    }
  };

  const getFraudColor = (score: number) => score < 20 ? "text-emerald-400" : score < 50 ? "text-yellow-400" : "text-red-500";
  const getFraudBorderColor = (score: number) => score < 20 ? "border-emerald-500/50" : score < 50 ? "border-yellow-500/50" : "border-red-500/50";

  const getStatusBadge = (status: string, autopilot?: boolean) => {
    if (status === "approved" && autopilot) return (
      <span className="flex items-center gap-1 px-2 py-1 bg-indigo-500/15 text-indigo-400 text-xs rounded-full border border-indigo-500/25">
        <Zap size={10} /> Autopilot Approved
      </span>
    );
    switch (status) {
      case "approved": return <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/20">✓ Approved</span>;
      case "rejected": return <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/20">✕ Rejected</span>;
      default: return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/20">⏳ Pending Approval</span>;
    }
  };

  const tabs = [
    { id: "upload", label: "Process Invoice" },
    { id: "invoices", label: "Invoice Inbox" },
    { id: "pos", label: "Purchase Orders" },
    { id: "email", label: "Email Ingestion" },
  ] as const;

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex bg-[#0c0f17] border border-[#1e2637] rounded-xl p-1 w-fit gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Upload / Detail Tab ── */}
      {activeTab === "upload" && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {!isProcessing && !currentResult && (
            <div
              className="rounded-2xl border-2 border-dashed border-[#1e2637] bg-[#0c0f17] p-16 flex flex-col items-center text-center cursor-pointer hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mb-5">
                <Bot size={28} className="text-indigo-400" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Upload Invoice for AI Analysis</h3>
              <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
                Drag & drop or click to upload a PDF or image. Gemini Vision will extract fields, verify math integrity, check POs, and apply Autopilot approval rules.
              </p>
              <button className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
                Select File
              </button>
              <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} accept="image/jpeg,image/png,application/pdf" />
            </div>
          )}

          {isProcessing && (
            <div className="rounded-2xl border border-[#1e2637] bg-[#0c0f17] p-16 flex flex-col items-center text-center">
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 rounded-full border-b-2 border-indigo-500 animate-spin" />
                <div className="absolute inset-2 rounded-full border-t-2 border-violet-400 animate-spin flex items-center justify-center" style={{ animationDuration: "2s", animationDirection: "reverse" }}>
                  <Bot size={20} className="text-indigo-400" />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-300 animate-pulse mb-4">{processingStatus}</p>
              <div className="w-full max-w-xs bg-white/5 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-violet-500 h-1.5 transition-all duration-300" style={{ width: `${Math.min(scanProgress, 100)}%` }} />
              </div>
              <p className="mt-2 text-[10px] text-slate-600">{Math.round(Math.min(scanProgress, 100))}% complete</p>
            </div>
          )}

          {currentResult && !isProcessing && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Left: Summary + Workspace */}
              <div className="lg:col-span-1 space-y-4">
                {/* Autopilot Badge */}
                {currentResult.autopilot_approved && (
                  <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <Zap size={14} className="text-indigo-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-indigo-400">Autopilot Approved</p>
                      <p className="text-[10px] text-slate-500">Low risk score & within threshold. No human action needed.</p>
                    </div>
                  </div>
                )}

                {/* Fraud Card */}
                <div className={`rounded-xl border bg-[#0c0f17] p-5 ${getFraudBorderColor(currentResult.fraud_score)}`}>
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Fraud Intelligence</p>
                  </div>
                  <div className="flex items-end gap-2 mb-3">
                    <p className={`text-4xl font-bold ${getFraudColor(currentResult.fraud_score)}`}>{currentResult.fraud_score}%</p>
                    <p className="text-xs text-slate-500 mb-1">Risk Score</p>
                  </div>
                  {currentResult.fraud_flags?.length > 0 ? (
                    <div className="space-y-1.5 pt-3 border-t border-[#1e2637]">
                      <p className="text-[10px] text-red-400 font-semibold uppercase">Risk Factors:</p>
                      <ul className="list-disc list-inside text-[10px] text-red-300 space-y-1">
                        {currentResult.fraud_flags.map((f: string, i: number) => <li key={i}>{f}</li>)}
                      </ul>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 pt-3 border-t border-[#1e2637]">
                      <CheckCircle2 size={12} className="text-emerald-400" />
                      <p className="text-[10px] text-emerald-400">All integrity checks passed.</p>
                    </div>
                  )}
                </div>

                {/* Action Card */}
                <div className="rounded-xl border border-[#1e2637] bg-[#0c0f17] p-5">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-4">Action Required</p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] text-slate-600 mb-1">Status</p>
                      {getStatusBadge(currentResult.status, currentResult.autopilot_approved)}
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-600 mb-1">PO Match</p>
                      {currentResult.matched_po ? (
                        <span className="text-emerald-400 text-xs">🔗 Matched PO #{currentResult.matched_po}</span>
                      ) : (
                        <span className="text-slate-500 text-xs">⚠ No Associated PO</span>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-600 mb-1">GL Code</p>
                      <span className="text-xs font-medium text-slate-300 bg-[#0a0d14] border border-[#1e2637] px-2 py-0.5 rounded">{currentResult.gl_code || "Uncategorized"}</span>
                    </div>
                  </div>
                  {currentResult.status === "pending_approval" && !currentResult.autopilot_approved && (
                    <div className="flex gap-2 mt-5">
                      <button onClick={() => handleStatusUpdate(currentResult.id || currentResult.invoice_id, "approved")} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg py-2 text-xs font-semibold transition-colors">Approve</button>
                      <button onClick={() => handleStatusUpdate(currentResult.id || currentResult.invoice_id, "rejected")} className="flex-1 bg-[#0a0d14] hover:bg-white/5 text-slate-300 rounded-lg py-2 text-xs font-semibold border border-[#1e2637] transition-colors">Reject</button>
                    </div>
                  )}
                  <button onClick={() => { setCurrentResult(null); setSelectedInvoiceId(null); }} className="w-full mt-3 text-[10px] text-slate-600 hover:text-slate-400 transition-colors underline underline-offset-4">
                    Process Another Document
                  </button>
                </div>

                {/* Invoice Workspace Chat */}
                {(selectedInvoiceId || currentResult.invoice_id) && (
                  <div className="h-80">
                    <InvoiceWorkspace invoiceId={selectedInvoiceId || currentResult.invoice_id} botId={botId} />
                  </div>
                )}
              </div>

              {/* Right: Invoice Details */}
              <div className="lg:col-span-2 rounded-xl border border-[#1e2637] bg-[#0c0f17] p-6">
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-white">{currentResult.vendor_name}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Issued: {currentResult.date_issued || "Unknown"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-white">${Number(currentResult.total_amount).toLocaleString()}</p>
                  </div>
                </div>

                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-[#1e2637] pb-2 mb-3">Line Items</h3>
                <div className="overflow-x-auto mb-5">
                  <table className="w-full text-sm">
                    <thead className="text-[10px] text-slate-600 uppercase">
                      <tr>
                        <th className="px-3 py-2 text-left">Description</th>
                        <th className="px-3 py-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(currentResult.line_items || []).map((item: any, i: number) => (
                        <tr key={i} className="border-b border-[#1e2637]">
                          <td className="px-3 py-2.5 text-slate-300 text-xs">{item.description}</td>
                          <td className="px-3 py-2.5 text-right text-xs font-medium text-white">${Number(item.amount).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {currentResult.additional_notes && (
                  <div className="pt-4 border-t border-[#1e2637]">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold mb-2">📝 Additional Notes Extracted</p>
                    <p className="text-xs text-slate-400 leading-relaxed bg-[#0a0d14] p-3 rounded-lg border border-[#1e2637] whitespace-pre-wrap">{currentResult.additional_notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Invoice Inbox Tab ── */}
      {activeTab === "invoices" && (
        <div className="rounded-xl border border-[#1e2637] bg-[#0c0f17] overflow-hidden animate-in fade-in duration-300">
          <div className="px-5 py-4 border-b border-[#1e2637]">
            <h3 className="text-sm font-semibold text-white">Invoice Inbox</h3>
            <p className="text-xs text-slate-500 mt-0.5">Click any invoice to view details and the workspace chat.</p>
          </div>
          <div className="p-4">
            {invoices.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No invoices processed yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] text-slate-600 uppercase border-b border-[#1e2637]">
                    <tr>
                      <th className="px-4 py-2">Vendor</th>
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2">Amount</th>
                      <th className="px-4 py-2 text-center">Fraud Score</th>
                      <th className="px-4 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr
                        key={inv.id}
                        onClick={() => {
                          setCurrentResult({
                            id: inv.id, invoice_id: inv.id,
                            vendor_name: inv.vendor_name,
                            date_issued: inv.date_issued,
                            total_amount: inv.total_amount,
                            fraud_score: inv.fraud_confidence_score,
                            fraud_flags: inv.fraud_flags || [],
                            status: inv.status,
                            matched_po: inv.matched_po || null,
                            line_items: inv.line_items || [],
                            additional_notes: inv.additional_notes,
                            gl_code: inv.gl_code,
                            autopilot_approved: false,
                          });
                          setSelectedInvoiceId(inv.id);
                          setActiveTab("upload");
                        }}
                        className="border-b border-[#1e2637] hover:bg-white/[0.03] transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3 font-medium text-white text-xs">{inv.vendor_name}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{inv.date_issued}</td>
                        <td className="px-4 py-3 text-xs">${Number(inv.total_amount).toLocaleString()}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-bold text-xs ${getFraudColor(inv.fraud_confidence_score)}`}>{inv.fraud_confidence_score}%</span>
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(inv.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── POs Tab ── */}
      {activeTab === "pos" && (
        <div className="rounded-xl border border-[#1e2637] bg-[#0c0f17] overflow-hidden animate-in fade-in duration-300">
          <div className="px-5 py-4 border-b border-[#1e2637] flex justify-between items-center">
            <h3 className="text-sm font-semibold text-white">Purchase Orders</h3>
            <button onClick={() => setShowPoForm(!showPoForm)} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-md transition-colors">+ New PO</button>
          </div>
          {showPoForm && (
            <div className="p-5 border-b border-[#1e2637] bg-[#111827]">
              <form onSubmit={handleCreatePO} className="flex flex-col md:flex-row gap-3 items-end">
                <div className="flex-1 w-full">
                  <label className="text-[10px] text-slate-500 uppercase font-semibold mb-1 block">PO Number</label>
                  <input required value={poForm.po_number} onChange={e => setPoForm({...poForm, po_number: e.target.value})} placeholder="e.g. PO-2026-001" className="w-full bg-[#0a0d14] border border-[#1e2637] rounded-md px-3 py-2 text-xs text-white outline-none focus:border-indigo-500/50" />
                </div>
                <div className="flex-1 w-full">
                  <label className="text-[10px] text-slate-500 uppercase font-semibold mb-1 block">Vendor Name</label>
                  <input required value={poForm.vendor_name} onChange={e => setPoForm({...poForm, vendor_name: e.target.value})} placeholder="e.g. Acme Corp" className="w-full bg-[#0a0d14] border border-[#1e2637] rounded-md px-3 py-2 text-xs text-white outline-none focus:border-indigo-500/50" />
                </div>
                <div className="flex-1 w-full">
                  <label className="text-[10px] text-slate-500 uppercase font-semibold mb-1 block">Amount ($)</label>
                  <input required type="number" step="0.01" value={poForm.expected_amount} onChange={e => setPoForm({...poForm, expected_amount: e.target.value})} placeholder="0.00" className="w-full bg-[#0a0d14] border border-[#1e2637] rounded-md px-3 py-2 text-xs text-white outline-none focus:border-indigo-500/50" />
                </div>
                <button type="submit" className="w-full md:w-auto px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-md transition-colors h-[34px]">Save PO</button>
              </form>
            </div>
          )}
          <div className="p-4">
            {pos.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No Purchase Orders available.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {pos.map((p) => (
                  <div key={p.id} className="bg-[#0a0d14] border border-[#1e2637] rounded-xl p-4 hover:border-[#2a3448] transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-[10px] text-slate-600 font-medium">#{p.po_number}</p>
                      <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${p.status === "open" ? "bg-indigo-500/10 text-indigo-400" : p.status === "fulfilled" ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-500/10 text-slate-500"}`}>{p.status}</span>
                    </div>
                    <h4 className="font-semibold text-sm text-white">{p.vendor_name}</h4>
                    <p className="text-lg font-bold text-indigo-400 mt-2">${Number(p.expected_amount).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Email Ingestion Tab ── */}
      {activeTab === "email" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Setup Guide */}
          <div className="rounded-xl border border-[#1e2637] bg-[#0c0f17] p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 flex-shrink-0">
                <Mail size={14} className="text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white mb-1">VicInbox — Email-to-Invoice Automation</p>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">
                  Forward any vendor invoice email to your CFOlytics address. Gemini Vision will automatically extract, verify, and process it — no manual upload required.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">1</span>
                    <span className="text-slate-400">Create a Mailgun account and verify your domain at <code className="text-indigo-400">mailgun.com</code></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">2</span>
                    <span className="text-slate-400">Set inbound route to forward to: <code className="text-indigo-400">{process.env.NEXT_PUBLIC_API_URL}/api/ap/webhooks/mailgun-inbound/</code></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">3</span>
                    <span className="text-slate-400">Have vendors send invoices to: <code className="text-indigo-400">invoices.{botId.slice(0, 12)}@yourdomain.com</code></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <EmailInboxLog botId={botId} />
        </div>
      )}
    </div>
  );
}
