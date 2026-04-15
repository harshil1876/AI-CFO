"use client";

import { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from "recharts";
import { 
  getBudgets, saveBudget, uploadExcelBudget, getVarianceAnalysis, getMonteCarloSimulation,
  generateAIBudget,
  type Budget, type VarianceReport, type MonteCarloResult, type GeneratedBudget
} from "@/lib/api";
import { Sparkles, Check, AlertTriangle } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

export default function BudgetPanel({ botId }: { botId: string }) {
  const [activeTab, setActiveTab] = useState<"builder" | "variance" | "montecarlo" | "ai-draft">("variance");
  const { formatAmount, symbol } = useCurrency();
  
  // Budget Builder State
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isUploading, setIsUploading] = useState(false);

  // Variance State
  const [varianceData, setVarianceData] = useState<VarianceReport | null>(null);
  
  // Monte Carlo State
  const [monteCarloData, setMonteCarloData] = useState<MonteCarloResult | null>(null);

  // AI Draft State
  const [aiGrowth, setAiGrowth] = useState<number>(10);
  const [aiInstructions, setAiInstructions] = useState("");
  const [aiTargetMonth, setAiTargetMonth] = useState(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 7));
  const [aiResult, setAiResult] = useState<GeneratedBudget | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiApplying, setAiApplying] = useState(false);

  useEffect(() => {
    loadBudgets();
    loadVariance();
  }, [selectedMonth]);

  const loadBudgets = async () => {
    try {
      const data = await getBudgets(botId, selectedMonth);
      setBudgets(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadVariance = async () => {
    try {
      const data = await getVarianceAnalysis(botId, selectedMonth);
      setVarianceData(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadMonteCarlo = async () => {
    try {
      const data = await getMonteCarloSimulation(botId);
      setMonteCarloData(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeTab === "montecarlo" && !monteCarloData) {
      loadMonteCarlo();
    }
  }, [activeTab]);

  const handleManualSave = async () => {
    if (!newCategory || !newAmount) return;
    await saveBudget(botId, newCategory, selectedMonth, parseFloat(newAmount));
    setNewCategory("");
    setNewAmount("");
    loadBudgets();
    loadVariance();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    try {
      await uploadExcelBudget(botId, e.target.files[0]);
      await loadBudgets();
      await loadVariance();
    } catch (err) {
      console.error(err);
      alert("Failed to upload budget excel.");
    } finally {
      setIsUploading(false);
      e.target.value = ""; // reset
    }
  };

  const handleAIDraft = async () => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await generateAIBudget(botId, aiTargetMonth, aiGrowth, aiInstructions, false);
      setAiResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyAIDraft = async () => {
    if (!aiResult) return;
    setAiApplying(true);
    try {
      await generateAIBudget(botId, aiTargetMonth, aiGrowth, aiInstructions, true);
      await loadBudgets();
      await loadVariance();
      alert(`AI budget applied successfully to ${aiTargetMonth}!`);
    } catch (e) {
      console.error(e);
    } finally {
      setAiApplying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
      <div className="flex bg-black/20 border border-amber-500/10 rounded-xl p-1">
          <button onClick={() => setActiveTab("variance")} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === "variance" ? "bg-amber-600 text-white shadow-lg shadow-amber-500/20" : "text-gray-400 hover:text-white"}`}>Variance Analysis</button>
          <button onClick={() => setActiveTab("builder")} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === "builder" ? "bg-yellow-700 text-white shadow-lg shadow-yellow-800/20" : "text-gray-400 hover:text-white"}`}>Budget Builder</button>
          <button onClick={() => setActiveTab("montecarlo")} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === "montecarlo" ? "bg-amber-800 text-white shadow-lg shadow-amber-900/20" : "text-gray-400 hover:text-white"}`}>Monte Carlo</button>
          <button onClick={() => setActiveTab("ai-draft")} className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === "ai-draft" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-gray-400 hover:text-white"}`}><Sparkles size={13} />AI Draft</button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400 font-medium">Month:</label>
          <input 
            type="month" 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-[#0a1128] border border-amber-500/10 rounded-lg px-3 py-1.5 text-sm text-white focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Tab Contents */}
      
      {activeTab === "builder" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Manual Input Panel */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <h3 className="text-lg font-semibold mb-1">Define Budgets</h3>
            <p className="text-xs text-gray-400 mb-6">Manually input allocations for {selectedMonth}</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Category / Department</label>
                <input 
                  type="text" placeholder="e.g. Marketing, Engineering, Travel" 
                  className="w-full bg-[#0a1128] border border-amber-500/10 rounded-xl px-4 py-2 focus:ring-1 focus:ring-amber-500 outline-none placeholder-gray-600"
                  value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Allocated Amount ($)</label>
                <input 
                  type="number" placeholder="5000.00" 
                  className="w-full bg-[#0a1128] border border-amber-500/10 rounded-xl px-4 py-2 focus:ring-1 focus:ring-amber-500 outline-none placeholder-gray-600"
                  value={newAmount} onChange={(e) => setNewAmount(e.target.value)}
                />
              </div>
              <button 
                onClick={handleManualSave}
                disabled={!newCategory || !newAmount}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black rounded-xl py-2 font-bold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                Save Allocation
              </button>
            </div>
          </div>

          {/* Excel / Bulk Upload */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 flex flex-col justify-center items-center text-center border-dashed">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">Import via Excel</h3>
            <p className="text-xs text-gray-400 mb-6 max-w-xs">
              Upload an Excel file with columns: <br/><strong className="text-gray-200">category</strong>, <strong className="text-gray-200">allocated_amount</strong>, <strong className="text-gray-200">month_year</strong>
            </p>
            <label className="bg-white/10 hover:bg-white/20 text-white rounded-xl px-6 py-2 cursor-pointer transition-colors border border-white/20">
              {isUploading ? "Importing..." : "Choose Excel File"}
              <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
            </label>
          </div>

          {/* List of current budgets */}
          <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <h4 className="text-sm font-semibold mb-4 text-gray-300">Active Allocations ({selectedMonth})</h4>
            {budgets.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No budgets defined for this month.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {budgets.map(b => (
                  <div key={b.id} className="bg-[#0a1128] border border-amber-500/10 rounded-xl p-4">
                    <p className="text-gray-500 text-xs truncate mb-1">{b.category}</p>
                    <p className="text-lg font-semibold text-white tracking-tight">{formatAmount(Number(b.allocated_amount))}</p>
                    <p className="text-[10px] text-gray-600 mt-2 text-right">v{b.version}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "variance" && varianceData && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {varianceData.error ? (
            <div className="rounded-2xl border border-dashed border-amber-500/10 bg-[#0a1128] p-12 flex flex-col justify-center items-center text-center">
              <div className="text-5xl mb-4 opacity-50 ml-4">🤷‍♂️📊</div>
              <h3 className="text-lg font-semibold mb-2">No Active Data Found</h3>
              <p className="text-sm text-gray-400 max-w-md">
                {varianceData.error}
                <br /><br />
                Please define budgets for this month in the "Budget Builder" or sync a connector to track your variance.
              </p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-amber-500/10 bg-[#0a1128] p-5 border-l-4 border-l-amber-500">
              <p className="text-xs text-gray-400 uppercase tracking-wider">Total Budgeted</p>
              <p className="text-2xl font-bold mt-1">{formatAmount(varianceData.total_budget)}</p>
            </div>
            <div className="rounded-2xl border border-amber-500/10 bg-[#0a1128] p-5 border-l-4 border-l-yellow-600">
              <p className="text-xs text-gray-400 uppercase tracking-wider">Total Actual Spend</p>
              <p className="text-2xl font-bold mt-1">{formatAmount(varianceData.total_actual)}</p>
            </div>
            <div className={`rounded-2xl border border-white/10 bg-white/[0.02] p-5 border-l-4 ${varianceData.total_variance < 0 ? 'border-l-red-500' : 'border-l-emerald-500'}`}>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Variance</p>
              <div className="flex items-end gap-2 mt-1">
                <p className="text-2xl font-bold">{formatAmount(Math.abs(varianceData.total_variance))}</p>
                <p className={`text-sm mb-1 font-medium ${varianceData.total_variance < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {varianceData.total_variance < 0 ? 'Over Budget' : 'Under Budget'} ({Math.abs(varianceData.total_variance_percent)}%)
                </p>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="rounded-2xl border border-amber-500/10 bg-[#0a1128] p-6">
            <h3 className="text-lg font-semibold mb-6">Budget vs Actuals by Category</h3>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={varianceData.details} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="category" stroke="#ffffff50" tick={{fill: '#ffffff80', fontSize: 12}} axisLine={false} tickLine={false} />
                  <YAxis stroke="#ffffff50" tick={{fill: '#ffffff80', fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(val: number) => `${symbol}${(val/1000).toFixed(0)}k`} />
                  <Tooltip 
                    cursor={{fill: '#ffffff05'}}
                    contentStyle={{ backgroundColor: '#0a1128', borderColor: 'rgba(245,158,11,0.2)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
                    itemStyle={{ color: '#fbbf24' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="budgeted" name="Budget" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={60} />
                  <Bar dataKey="actual" name="Actual Spend" fill="#78350f" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
            </>
          )}
        </div>
      )}

      {activeTab === "montecarlo" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="rounded-2xl border border-amber-500/10 bg-[#0a1128] p-6 text-center shadow-lg">
            <h3 className="text-lg font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-500">Monte Carlo Simulation</h3>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto">
              We simulated <strong className="text-amber-400">1,000 algorithmic futures</strong> based on your historical cash flow variance (Mean: {formatAmount(monteCarloData?.historical_mean || 0)}). 
              Below is the 12-month projected probability tunnel for upcoming expenses/cash flows.
            </p>
          </div>

          {monteCarloData?.error ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-12 flex flex-col justify-center items-center text-center">
              <div className="text-5xl mb-4 opacity-50 ml-4">🤷‍♂️📊</div>
              <h3 className="text-lg font-semibold mb-2">Insufficient Historical Data</h3>
              <p className="text-sm text-gray-400 max-w-md">
                {monteCarloData.error}
                <br /><br />
                The Monte Carlo algorithmic engine requires historical cash flows to calculate standard deviations and probability curves. Please upload data or sync a connector first.
              </p>
            </div>
          ) : monteCarloData?.projections ? (
            <div className="rounded-2xl border border-amber-500/10 bg-[#0a1128] p-6">
              <div className="h-[500px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monteCarloData.projections} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorWorst" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                    <XAxis dataKey="month_year" stroke="#ffffff50" tick={{fill: '#ffffff80', fontSize: 12}} axisLine={false} tickLine={false} />
                    <YAxis stroke="#ffffff50" tick={{fill: '#ffffff80', fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(val: number) => `${symbol}${(val/1000).toFixed(0)}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a1128', borderColor: 'rgba(245,158,11,0.2)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
                      itemStyle={{ color: '#fff', fontSize: '12px' }}
                      labelStyle={{ color: '#aaa', marginBottom: '8px' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    
                    {/* The bounds of the simulation */}
                    <Area type="monotone" dataKey="p90_worst_case" name="90th Percentile (Worst Case)" stroke="#ef4444" strokeDasharray="5 5" fillOpacity={1} fill="url(#colorWorst)" strokeWidth={2} />
                    <Area type="monotone" dataKey="p50_expected" name="50th Percentile (Expected)" stroke="#f59e0b" fillOpacity={1} fill="url(#colorExpected)" strokeWidth={3} />
                    <Area type="monotone" dataKey="p10_best_case" name="10th Percentile (Best Case)" stroke="#fde68a" strokeDasharray="3 3" fill="none" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            </div>
          )}
        </div>
      )}

      {/* ── AI Draft Tab ── */}
      {activeTab === "ai-draft" && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Config Panel */}
          <div className="rounded-xl border border-indigo-500/20 bg-[#0c0f17] p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <Sparkles size={14} className="text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Generative Budget Planner</h3>
                <p className="text-xs text-slate-500">AI models a full budget plan from your historical spend data.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Target Month</label>
                <input type="month" value={aiTargetMonth} onChange={e => setAiTargetMonth(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-[#1e2637] rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Growth Assumption (%)</label>
                <input type="number" value={aiGrowth} onChange={e => setAiGrowth(Number(e.target.value))}
                  className="w-full bg-[#0a0d14] border border-[#1e2637] rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                  placeholder="e.g. 15 for +15%" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs text-slate-500 mb-1.5">Special Instructions</label>
                <input type="text" value={aiInstructions} onChange={e => setAiInstructions(e.target.value)}
                  placeholder="e.g. Cut travel by 20%, increase R&D"
                  className="w-full bg-[#0a0d14] border border-[#1e2637] rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none" />
              </div>
            </div>
            <button onClick={handleAIDraft} disabled={aiLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors">
              {aiLoading ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating…</>) : (<><Sparkles size={14} />Generate AI Budget Draft</>)}
            </button>
          </div>

          {/* AI Result */}
          {aiResult && (
            <div className="rounded-xl border border-indigo-500/20 bg-[#0c0f17] overflow-hidden">
              {aiResult.error ? (
                <div className="flex items-center gap-2.5 p-5 text-red-400">
                  <AlertTriangle size={16} />
                  <p className="text-sm">{aiResult.error}</p>
                </div>
              ) : (
                <>
                  {/* Rationale */}
                  <div className="px-5 py-4 border-b border-[#1e2637] bg-indigo-500/5">
                    <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-1">AI Rationale</p>
                    <p className="text-sm text-slate-300 leading-relaxed">{aiResult.ai_rationale}</p>
                    <p className="text-xs text-slate-500 mt-2">Total Draft Budget: <span className="font-bold text-white">{formatAmount(Number(aiResult.total_budget))}</span></p>
                  </div>

                  {/* Line Items Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-[10px] text-slate-600 uppercase border-b border-[#1e2637]">
                        <tr>
                          <th className="px-4 py-2 text-left">Category</th>
                          <th className="px-4 py-2 text-right">Allocated ({symbol})</th>
                          <th className="px-4 py-2 text-left">AI Rationale</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(aiResult.budget_items || []).map((item, i) => (
                          <tr key={i} className="border-b border-[#1e2637] hover:bg-white/[0.02]">
                            <td className="px-4 py-3 font-medium text-white text-xs">{item.category}</td>
                            <td className="px-4 py-3 text-right text-indigo-400 font-bold text-xs">{formatAmount(Number(item.allocated_amount))}</td>
                            <td className="px-4 py-3 text-slate-500 text-xs">{item.rationale}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Apply Button */}
                  <div className="px-5 py-4 border-t border-[#1e2637] flex items-center gap-3">
                    <button onClick={handleApplyAIDraft} disabled={aiApplying}
                      className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors">
                      {aiApplying ? "Saving…" : (<><Check size={13} />Apply to Budget & Save</>)}
                    </button>
                    <p className="text-xs text-slate-600">This will save all {aiResult.budget_items?.length} categories to {aiResult.target_month}.</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
