"use client";

import { useState, useEffect } from "react";
import { useUser, useOrganization } from "@clerk/nextjs";
import {
  getCustomKPIs, createCustomKPI, evaluateCustomKPI, deleteCustomKPI,
  type CustomKPI,
} from "@/lib/api";
import { Plus, Trash2, RefreshCw, TriangleAlert, Check, Lightbulb } from "lucide-react";

const COLOR_OPTIONS = [
  { label: "Indigo", value: "indigo", cls: "bg-indigo-500" },
  { label: "Violet", value: "violet", cls: "bg-violet-500" },
  { label: "Emerald", value: "emerald", cls: "bg-emerald-500" },
  { label: "Amber", value: "amber", cls: "bg-amber-500" },
  { label: "Rose", value: "rose", cls: "bg-rose-500" },
  { label: "Cyan", value: "cyan", cls: "bg-cyan-500" },
];

const UNIT_OPTIONS = ["$", "%", "x", "days", "K", "M"];

const EXAMPLE_FORMULAS = [
  { name: "Gross Margin", formula: "Total Revenue - Total Expenses", unit: "$", icon: "📈" },
  { name: "Profit Margin %", formula: "net profit / total revenue * 100", unit: "%", icon: "💰" },
  { name: "Pending Invoices", formula: "pending invoices", unit: "x", icon: "🧾" },
  { name: "Cash Burn Rate", formula: "burn rate", unit: "$", icon: "🔥" },
  { name: "Runway (months)", formula: "runway", unit: "months", icon: "🛫" },
];

const COLOR_MAP: Record<string, string> = {
  indigo: "border-l-indigo-500 text-indigo-400",
  violet: "border-l-violet-500 text-violet-400",
  emerald: "border-l-emerald-500 text-emerald-400",
  amber: "border-l-amber-500 text-amber-400",
  rose: "border-l-rose-500 text-rose-400",
  cyan: "border-l-cyan-500 text-cyan-400",
};

const UNIT_COLOR_MAP: Record<string, string> = {
  indigo: "text-indigo-400", violet: "text-violet-400", emerald: "text-emerald-400",
  amber: "text-amber-400", rose: "text-rose-400", cyan: "text-cyan-400",
};

export default function KpiBuilderPage() {
  const { user } = useUser();
  const { organization } = useOrganization();
  const botId = organization?.id || user?.id || "";

  const [kpis, setKpis] = useState<(CustomKPI & { loading?: boolean })[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formula, setFormula] = useState("");
  const [unit, setUnit] = useState("$");
  const [icon, setIcon] = useState("📊");
  const [color, setColor] = useState("indigo");

  useEffect(() => { if (botId) loadKPIs(); }, [botId]);

  const loadKPIs = async () => {
    const data = await getCustomKPIs(botId);
    setKpis(data);
  };

  const handleEvaluate = async (kpiId: number) => {
    setKpis(prev => prev.map(k => k.id === kpiId ? { ...k, loading: true } : k));
    try {
      const result = await evaluateCustomKPI(botId, kpiId);
      setKpis(prev => prev.map(k => k.id === kpiId ? { ...k, ...result, loading: false } : k));
    } catch {
      setKpis(prev => prev.map(k => k.id === kpiId ? { ...k, loading: false } : k));
    }
  };

  const handleEvaluateAll = async () => {
    for (const kpi of kpis) {
      await handleEvaluate(kpi.id);
    }
  };

  const handleDelete = async (kpiId: number, kpiName: string) => {
    if (!confirm(`Delete "${kpiName}"?`)) return;
    await deleteCustomKPI(botId, kpiId);
    setKpis(prev => prev.filter(k => k.id !== kpiId));
  };

  const handleCreate = async () => {
    if (!name || !formula) return;
    setSaving(true);
    try {
      const newKpi = await createCustomKPI(botId, { name, description, formula, unit, icon, color });
      setKpis(prev => [...prev, newKpi]);
      setName(""); setDescription(""); setFormula(""); setUnit("$"); setIcon("📊"); setColor("indigo");
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const applyExample = (ex: typeof EXAMPLE_FORMULAS[0]) => {
    setName(ex.name); setFormula(ex.formula); setUnit(ex.unit); setIcon(ex.icon);
  };

  const formatResult = (kpi: CustomKPI) => {
    if (!kpi.success || kpi.result === undefined) return null;
    const val = Number(kpi.result);
    if (kpi.unit === "$") return `$${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    if (kpi.unit === "%") return `${val.toFixed(1)}%`;
    return `${val.toLocaleString()} ${kpi.unit}`;
  };

  if (!botId) return null;

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0d14]">
      {/* Page Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2637] bg-[#0c0f17] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
            <span className="text-sm">📐</span>
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Custom KPI Builder</h2>
            <p className="text-xs text-slate-500 mt-0.5">Define your own financial metrics using plain-English formulas.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {kpis.length > 0 && (
            <button onClick={handleEvaluateAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white border border-[#1e2637] hover:border-[#2a3448] rounded-lg transition-colors">
              <RefreshCw size={11} /> Refresh All
            </button>
          )}
          <button onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-lg transition-colors">
            <Plus size={13} /> New KPI
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* Create Form */}
        {showForm && (
          <div className="rounded-xl border border-violet-500/20 bg-[#0c0f17] p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <h3 className="text-sm font-semibold text-white">Create New Custom KPI</h3>

            {/* Example Formulas */}
            <div>
              <p className="text-[10px] text-slate-600 uppercase font-semibold mb-2 flex items-center gap-1"><Lightbulb size={10} /> Quick Templates</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_FORMULAS.map((ex) => (
                  <button key={ex.name} onClick={() => applyExample(ex)}
                    className="px-3 py-1 text-xs bg-[#0a0d14] border border-[#1e2637] hover:border-violet-500/40 text-slate-400 hover:text-white rounded-lg transition-colors">
                    {ex.icon} {ex.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">KPI Name *</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Gross Margin"
                  className="w-full bg-[#0a0d14] border border-[#1e2637] focus:border-violet-500/60 rounded-lg px-3 py-2 text-sm text-white outline-none" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Description</label>
                <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional short description"
                  className="w-full bg-[#0a0d14] border border-[#1e2637] focus:border-violet-500/60 rounded-lg px-3 py-2 text-sm text-white outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-slate-500 mb-1.5">Formula * <span className="text-violet-400">(use plain English variable names)</span></label>
                <input value={formula} onChange={e => setFormula(e.target.value)}
                  placeholder="e.g. Total Revenue - Total Expenses"
                  className="w-full bg-[#0a0d14] border border-[#1e2637] focus:border-violet-500/60 rounded-lg px-3 py-2 text-sm text-white outline-none font-mono" />
                <p className="text-[10px] text-slate-600 mt-1">
                  Available: <span className="text-slate-500">total revenue, total expenses, net profit, burn rate, runway, profit margin, pending invoices, approved invoices, [Category] spend</span>
                </p>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Unit</label>
                <div className="flex gap-2 flex-wrap">
                  {UNIT_OPTIONS.map(u => (
                    <button key={u} onClick={() => setUnit(u)}
                      className={`px-3 py-1 text-xs rounded-lg border transition-colors ${unit === u ? "bg-violet-600 border-violet-500 text-white" : "border-[#1e2637] text-slate-500 hover:text-white"}`}>
                      {u}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Color & Icon</label>
                <div className="flex gap-2 items-center flex-wrap">
                  {COLOR_OPTIONS.map(c => (
                    <button key={c.value} onClick={() => setColor(c.value)}
                      className={`w-6 h-6 rounded-full ${c.cls} transition-all ${color === c.value ? "ring-2 ring-white ring-offset-2 ring-offset-[#0a0d14]" : ""}`} />
                  ))}
                  <input value={icon} onChange={e => setIcon(e.target.value)}
                    className="w-12 bg-[#0a0d14] border border-[#1e2637] rounded-lg px-2 py-1 text-center text-sm text-white outline-none" maxLength={2} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-[#1e2637]">
              <button onClick={handleCreate} disabled={!name || !formula || saving}
                className="flex items-center gap-2 px-5 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors">
                {saving ? "Saving…" : <><Check size={12} /> Create KPI</>}
              </button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-xs text-slate-500 hover:text-white transition-colors">Cancel</button>
            </div>
          </div>
        )}

        {/* KPI Cards Grid */}
        {kpis.length === 0 && !showForm ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <div className="text-5xl">📐</div>
            <div>
              <p className="text-slate-300 font-medium">No custom KPIs yet</p>
              <p className="text-xs text-slate-600 mt-1 max-w-xs">Build your own financial metrics using plain-English formulas like <span className="text-violet-400 font-mono text-[10px]">Total Revenue - Total Expenses</span></p>
            </div>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-lg mt-2">
              <Plus size={14} /> Create Your First KPI
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {kpis.map((kpi) => {
              const colorClass = COLOR_MAP[kpi.color] || COLOR_MAP.indigo;
              const valueColorClass = UNIT_COLOR_MAP[kpi.color] || UNIT_COLOR_MAP.indigo;
              const formattedValue = formatResult(kpi);
              return (
                <div key={kpi.id} className={`bg-[#0c0f17] border border-l-4 ${colorClass} border-[#1e2637] rounded-xl p-5 flex flex-col gap-3 hover:border-[#2a3448] transition-colors group`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{kpi.icon}</span>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{kpi.name}</h3>
                        {kpi.description && <p className="text-[10px] text-slate-600">{kpi.description}</p>}
                      </div>
                    </div>
                    <button onClick={() => handleDelete(kpi.id, kpi.name)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-all">
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {/* Formula */}
                  <div className="bg-[#0a0d14] border border-[#1e2637] rounded-lg px-3 py-2">
                    <p className="text-[10px] text-slate-600 mb-0.5">Formula</p>
                    <p className="text-xs text-slate-400 font-mono truncate">{kpi.formula}</p>
                  </div>

                  {/* Result */}
                  {kpi.loading ? (
                    <div className="flex items-center gap-2 text-slate-600 text-xs"><div className="w-3 h-3 border border-slate-600 border-t-slate-400 rounded-full animate-spin" /> Computing…</div>
                  ) : kpi.error ? (
                    <div className="flex items-center gap-1.5 text-red-400 text-xs"><TriangleAlert size={11} />{kpi.error}</div>
                  ) : formattedValue ? (
                    <p className={`text-2xl font-bold ${valueColorClass}`}>{formattedValue}</p>
                  ) : (
                    <p className="text-xs text-slate-600 italic">Not evaluated yet</p>
                  )}

                  {/* Variable breakdown */}
                  {kpi.variable_values && Object.keys(kpi.variable_values).length > 0 && (
                    <div className="text-[10px] text-slate-700 space-y-0.5 border-t border-[#1e2637] pt-2">
                      {Object.entries(kpi.variable_values).map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="text-slate-600 capitalize">{k}</span>
                          <span className="text-slate-500">{typeof v === "number" ? v.toLocaleString() : v}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <button onClick={() => handleEvaluate(kpi.id)}
                    className="flex items-center justify-center gap-1.5 w-full py-1.5 text-[10px] font-medium text-slate-600 hover:text-white border border-[#1e2637] hover:border-[#2a3448] rounded-lg transition-colors mt-auto">
                    <RefreshCw size={10} /> Recalculate
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
