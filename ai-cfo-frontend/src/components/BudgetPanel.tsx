"use client";

import { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from "recharts";
import { 
  getBudgets, saveBudget, uploadExcelBudget, getVarianceAnalysis, getMonteCarloSimulation,
  type Budget, type VarianceReport, type MonteCarloResult 
} from "@/lib/api";

export default function BudgetPanel({ botId }: { botId: string }) {
  const [activeTab, setActiveTab] = useState<"builder" | "variance" | "montecarlo">("variance");
  
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

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
        <div className="flex bg-black/20 border border-amber-500/10 rounded-xl p-1">
          <button
            onClick={() => setActiveTab("variance")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === "variance" ? "bg-amber-600 text-white shadow-lg shadow-amber-500/20" : "text-gray-400 hover:text-white"
            }`}
          >
            Variance Analysis
          </button>
          <button
            onClick={() => setActiveTab("builder")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === "builder" ? "bg-yellow-700 text-white shadow-lg shadow-yellow-800/20" : "text-gray-400 hover:text-white"
            }`}
          >
            Budget Builder
          </button>
          <button
            onClick={() => setActiveTab("montecarlo")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === "montecarlo" ? "bg-amber-800 text-white shadow-lg shadow-amber-900/20" : "text-gray-400 hover:text-white"
            }`}
          >
            Monte Carlo Simulation
          </button>
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
                    <p className="text-lg font-semibold text-white tracking-tight">${Number(b.allocated_amount).toLocaleString()}</p>
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
              <p className="text-2xl font-bold mt-1">${varianceData.total_budget.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-amber-500/10 bg-[#0a1128] p-5 border-l-4 border-l-yellow-600">
              <p className="text-xs text-gray-400 uppercase tracking-wider">Total Actual Spend</p>
              <p className="text-2xl font-bold mt-1">${varianceData.total_actual.toLocaleString()}</p>
            </div>
            <div className={`rounded-2xl border border-white/10 bg-white/[0.02] p-5 border-l-4 ${varianceData.total_variance < 0 ? 'border-l-red-500' : 'border-l-emerald-500'}`}>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Variance</p>
              <div className="flex items-end gap-2 mt-1">
                <p className="text-2xl font-bold">${Math.abs(varianceData.total_variance).toLocaleString()}</p>
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
                  <YAxis stroke="#ffffff50" tick={{fill: '#ffffff80', fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(val: number) => `$${val/1000}k`} />
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
              We simulated <strong className="text-amber-400">1,000 algorithmic futures</strong> based on your historical cash flow variance (Mean: ${monteCarloData?.historical_mean?.toLocaleString() || 0}). 
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
                    <YAxis stroke="#ffffff50" tick={{fill: '#ffffff80', fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(val: number) => `$${val/1000}k`} />
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
    </div>
  );
}
