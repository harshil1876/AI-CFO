"use client";

import { useState, useRef, useEffect } from "react";
import { useUser, useOrganization, useAuth } from "@clerk/nextjs";
import { runNLQuery, type NLQueryResult, getAuthHeaders } from "@/lib/api";
import { Send, Database, Sparkles, AlertTriangle, TableProperties, Clock } from "lucide-react";

const EXAMPLE_QUESTIONS = [
  "Show me top 10 expenses",
  "Break down spending by category",
  "What is my current KPI snapshot?",
  "Show all pending invoices",
  "Budget vs actual comparison",
  "Show recent anomaly alerts",
  "What are my recent transactions?",
  "Show revenue breakdown",
];

interface QueryHistoryItem {
  id: number;
  question: string;
  result: NLQueryResult;
  timestamp: Date;
}

export default function NLQueryPage() {
  const { user } = useUser();
  const { organization } = useOrganization();
  const { userId } = useAuth();
  const botId = organization?.id || user?.id || "";

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<QueryHistoryItem[]>([]);
  const [activeResult, setActiveResult] = useState<QueryHistoryItem | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load history from Supabase backend DB on component mount
  useEffect(() => {
    if (!botId) return;
    const fetchHistory = async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/query-history/?bot_id=${botId}`, {
          headers
        });
        if (res.ok) {
          const data = await res.json();
          const hydrated = data.map((item: any) => ({
            id: item.id,
            question: item.question,
            result: item.result,
            timestamp: new Date(item.created_at)
          }));
          setHistory(hydrated);
          if (hydrated.length > 0) setActiveResult(hydrated[0]);
        }
      } catch (e) {
        console.error("Error loading query history:", e);
      }
    };
    fetchHistory();
  }, [botId]);

  const handleQuery = async (q?: string) => {
    const queryText = (q || question).trim();
    if (!queryText || loading) return;

    setLoading(true);
    setQuestion("");
    try {
      const result = await runNLQuery(botId, queryText);
      const item: QueryHistoryItem = {
        id: Date.now(),
        question: queryText,
        result,
        timestamp: new Date(),
      };
      setHistory(prev => [item, ...prev]);
      setActiveResult(item);

      // Save to Supabase backend permanently
      const headers = await getAuthHeaders();
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/query-history/`, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
          "X-User-Id": userId || ""
        },
        body: JSON.stringify({
          bot_id: botId,
          question: queryText,
          result: result
        })
      });
      
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  if (!botId) return null;

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0d14]">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#1e2637] bg-[#0c0f17] flex-shrink-0">
        <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
          <Database size={15} className="text-cyan-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">AI Data Query Agent</h2>
          <p className="text-xs text-slate-500 mt-0.5">Ask questions in plain English — no SQL required.</p>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: History Panel */}
        <div className="w-60 flex-shrink-0 border-r border-[#1e2637] bg-[#0c0f17] flex flex-col overflow-hidden">
          <div className="px-3 py-2.5 border-b border-[#1e2637]">
            <p className="text-[10px] text-slate-600 uppercase font-semibold tracking-wider flex items-center gap-1.5">
              <Clock size={10} /> Query History
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {history.length === 0 ? (
              <p className="text-[11px] text-slate-700 px-3 py-4 text-center">No queries yet</p>
            ) : (
              history.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveResult(item)}
                  className={`w-full text-left px-3 py-2.5 border-b border-[#1e2637] transition-colors hover:bg-white/[0.03] ${activeResult?.id === item.id ? "bg-cyan-500/5 border-l-2 border-l-cyan-500" : ""}`}
                >
                  <p className="text-xs text-slate-300 truncate">{item.question}</p>
                  <p className="text-[9px] text-slate-600 mt-0.5">
                    {item.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Main Query Area */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Result area */}
          <div className="flex-1 overflow-y-auto p-6">
            {!activeResult && !loading && (
              <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
                <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <Sparkles size={24} className="text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">Ask anything about your finances</h3>
                  <p className="text-xs text-slate-500">The AI will query your live data and return structured results.</p>
                </div>
                <div className="grid grid-cols-2 gap-2 max-w-lg w-full">
                  {EXAMPLE_QUESTIONS.map((q) => (
                    <button key={q} onClick={() => handleQuery(q)}
                      className="px-3 py-2.5 text-xs text-left text-slate-400 hover:text-white bg-[#0c0f17] border border-[#1e2637] hover:border-cyan-500/30 rounded-lg transition-colors">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 animate-pulse">
                  <Database size={20} className="text-cyan-400" />
                </div>
                <p className="text-sm text-slate-400 animate-pulse">Querying your financial database…</p>
              </div>
            )}

            {activeResult && !loading && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Question badge */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-cyan-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                    {(user?.firstName || "U")[0]}
                  </div>
                  <div className="bg-[#0c0f17] border border-[#1e2637] rounded-xl rounded-tl-none px-4 py-2.5 text-sm text-white">
                    {activeResult.question}
                  </div>
                </div>

                {/* AI Result */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-[#2a3448] flex items-center justify-center">
                    <Sparkles size={12} className="text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-3">
                    {/* Summary */}
                    {activeResult.result.summary && (
                      <div className="bg-cyan-500/5 border border-cyan-500/15 rounded-xl px-4 py-3">
                        <p className="text-xs text-cyan-300 leading-relaxed">{activeResult.result.summary}</p>
                      </div>
                    )}

                    {/* Error state */}
                    {activeResult.result.error && (
                      <div className="flex items-center gap-2.5 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3">
                        <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
                        <p className="text-xs text-red-300">{activeResult.result.error}</p>
                      </div>
                    )}

                    {/* No data */}
                    {activeResult.result.message && !activeResult.result.error && (
                      <div className="bg-[#0c0f17] border border-[#1e2637] rounded-xl px-4 py-3">
                        <p className="text-xs text-slate-400">{activeResult.result.message}</p>
                      </div>
                    )}

                    {/* Data Table */}
                    {activeResult.result.rows && activeResult.result.rows.length > 0 && (
                      <div className="rounded-xl border border-[#1e2637] bg-[#0c0f17] overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#1e2637]">
                          <TableProperties size={12} className="text-slate-500" />
                          <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">
                            {activeResult.result.rows.length} row{activeResult.result.rows.length !== 1 ? "s" : ""} returned
                          </p>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-[#1e2637]">
                                {activeResult.result.columns?.map((col) => (
                                  <th key={col} className="px-4 py-2.5 text-left text-[10px] text-slate-600 uppercase font-semibold tracking-wider whitespace-nowrap">
                                    {col}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {activeResult.result.rows.map((row, rowIdx) => (
                                <tr key={rowIdx} className="border-b border-[#1e2637] hover:bg-white/[0.02] transition-colors">
                                  {activeResult.result.columns?.map((col) => {
                                    const val = row[col];
                                    const isNum = typeof val === "number";
                                    const isNeg = isNum && val < 0;
                                    const isStatus = col.toLowerCase().includes("status");
                                    return (
                                      <td key={col} className="px-4 py-2.5 text-xs whitespace-nowrap">
                                        {isStatus ? (
                                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                            String(val).includes("Over") || String(val).includes("risk") ? "bg-red-500/10 text-red-400" :
                                            String(val).includes("Under") || String(val).includes("approved") ? "bg-emerald-500/10 text-emerald-400" :
                                            "bg-slate-500/10 text-slate-400"
                                          }`}>{String(val)}</span>
                                        ) : (
                                          <span className={isNum ? (isNeg ? "text-red-400 font-medium" : "text-white font-medium") : "text-slate-300"}>
                                            {isNum ? Number(val).toLocaleString() : String(val ?? "—")}
                                          </span>
                                        )}
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input bar */}
          <div className="flex-shrink-0 border-t border-[#1e2637] bg-[#0c0f17] px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-3 bg-[#131929] border border-[#1e2637] focus-within:border-cyan-500/40 rounded-xl px-4 py-2.5 transition-colors">
                <Database size={14} className="text-slate-600 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleQuery()}
                  placeholder="Ask about your financial data… (e.g. Show top 5 expenses)"
                  className="flex-1 bg-transparent text-sm text-slate-300 placeholder-slate-600 outline-none"
                />
              </div>
              <button
                onClick={() => handleQuery()}
                disabled={!question.trim() || loading}
                className="p-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded-xl transition-colors flex-shrink-0"
              >
                <Send size={14} />
              </button>
            </div>
            <p className="text-[10px] text-slate-700 mt-2 text-center">
              Results are queried live from your workspace data · No SQL knowledge required
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
