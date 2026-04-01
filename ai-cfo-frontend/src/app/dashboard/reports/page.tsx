"use client";

import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useCurrency } from "@/context/CurrencyContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";
import { 
  FileText, Printer, RefreshCw, 
  Calendar, FileSpreadsheet, AlertTriangle
} from "lucide-react";

// The STRATOS theme definitions
const THEME = {
  bg: "bg-[#0a1128]",
  card: "bg-[#0c142e]/80",
  border: "border-amber-500/10",
  text: "text-slate-200",
  accent: "text-amber-500",
  gradient_text: "bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500",
  button: "bg-amber-500 hover:bg-amber-600 text-[#0a1128] font-semibold transition-colors",
  button_outline: "border border-amber-500 pl-4 py-2 hover:bg-amber-500/10 text-amber-500 transition-colors"
};

export default function ReportsPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const { formatAmount } = useCurrency();
  const bot_id = user?.organizationMemberships[0]?.organization?.id || "default_org";

  const [activeTab, setActiveTab] = useState<"pnl" | "cashflow" | "balancesheet">("pnl");
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Default date ranges
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2026-12-31");

  const [isExporting, setIsExporting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const token = await getToken();
      
      let url = `http://127.0.0.1:8000/api/reports/${activeTab}/?bot_id=${bot_id}`;
      if (activeTab === "balancesheet") {
        url += `&target_date=${endDate}`;
      } else {
        url += `&start_date=${startDate}&end_date=${endDate}`;
      }

      const res = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error("Failed to load report data");
      
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "An error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (bot_id && bot_id !== "default_org") {
      fetchData();
    }
  }, [activeTab, bot_id, startDate, endDate]);

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const token = await getToken();
      let url = `http://127.0.0.1:8000/api/reports/export/?bot_id=${bot_id}&type=${activeTab}`;
      if (activeTab === "balancesheet") {
        url += `&end_date=${endDate}`;
      } else {
        url += `&start_date=${startDate}&end_date=${endDate}`;
      }
      
      const res = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to export Excel");
      
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `CFOlytics_${activeTab}_report.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export Excel document.");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (val: number) => {
    return formatAmount(val);
  };

  // ------------------------------------------------------------------
  // Render Helpers
  // ------------------------------------------------------------------
  const renderRow = (label: string, amount: number, isSubtotal = false, isGrandTotal = false) => (
    <div className={`flex justify-between py-2 px-1 ${
      isGrandTotal ? 'border-y-4 border-double border-amber-500/30' : 
      isSubtotal ? 'border-t border-amber-500/20' : ''
    }`}>
      <span className={`${isGrandTotal ? 'font-bold text-lg text-amber-500' : isSubtotal ? 'font-semibold text-slate-100' : 'text-slate-400 pl-4'}`}>
        {label}
      </span>
      <span className={`${isGrandTotal ? 'font-bold text-lg text-amber-500' : isSubtotal ? 'font-semibold text-slate-100' : 'text-slate-300'}`}>
        {formatCurrency(amount)}
      </span>
    </div>
  );

  const renderSection = (title: string, objData: any) => {
    if (!objData) return null;
    return (
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2 uppercase tracking-wide text-slate-100 border-b border-amber-500/10 pb-2">{title}</h3>
        {Object.keys(objData.items || {}).map(item => (
          renderRow(item, objData.items[item])
        ))}
        {renderRow(`Total ${title}`, objData.total, true)}
      </div>
    );
  };

  const renderCashflowSection = (title: string, objData: any) => {
    if (!objData) return null;
    return (
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2 uppercase tracking-wide text-slate-100 border-b border-amber-500/10 pb-2">{title}</h3>
        {renderRow("Inflows", objData.inflows)}
        {renderRow("Outflows", -objData.outflows)}
        {renderRow(`Net Cash from ${title}`, objData.net_cash, true)}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-8">
      
      {/* 1. Dynamic De-Cardified Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-amber-500/10 pb-6 print:hidden">
        <div>
          <h1 className={`text-3xl font-bold flex items-center gap-3 ${THEME.gradient_text}`}>
            <FileText className="h-8 w-8 text-amber-500" />
            Financial Reports
          </h1>
          <p className="text-slate-400 mt-2">Dynamically generated boardroom-ready statements perfectly formatted for executives.</p>
        </div>

        <div className="flex items-center gap-4 bg-black/20 p-3 rounded-lg border border-amber-500/20 backdrop-blur-sm shadow-xl">
          {activeTab !== "balancesheet" && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-500" />
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-sm font-semibold text-slate-100 outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:invert hover:text-amber-500 transition-colors"
                title="Select Start Date"
              />
              <span className="text-slate-500 font-bold px-2">TO</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            {activeTab === "balancesheet" && <Calendar className="h-4 w-4 text-amber-500" />}
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-100 outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:invert hover:text-amber-500 transition-colors"
              title="Select End Date"
            />
          </div>
          {isLoading && <RefreshCw className="h-4 w-4 animate-spin text-amber-500 ml-2" />}
        </div>
      </div>

      {/* 2. Controls & Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
        
        {/* Tab Navigation */}
        <div className="flex p-1 bg-black/20 rounded-lg border border-white/5 backdrop-blur-sm">
          {[
            { id: "pnl", label: "Profit & Loss" },
            { id: "cashflow", label: "Cash Flow" },
            { id: "balancesheet", label: "Balance Sheet" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                activeTab === tab.id 
                  ? "bg-amber-500 text-[#0a1128] shadow-lg shadow-amber-500/20" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Export Buttons */}
        <div className="flex gap-3">
          <button 
            onClick={handleExportExcel}
            disabled={isExporting}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
              isExporting 
                ? 'bg-amber-500/50 cursor-not-allowed' 
                : 'bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500 text-amber-500'
            }`}
          >
            {isExporting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
            Excel / CSV
          </button>

          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all duration-300"
          >
            <Printer className="h-4 w-4" />
            PDF / Print
          </button>
        </div>
      </div>

      {/* 3. Document Viewer (CSS styling built for both Screen and Print) */}
      <div className="relative mt-8">
        {/* Glow effect for screen only */}
        <div className="absolute inset-0 bg-blue-500/5 blur-3xl -z-10 rounded-3xl print:hidden"></div>

        <div className={`p-8 md:p-12 rounded-2xl border ${THEME.border} ${THEME.card} shadow-2xl overflow-hidden print:shadow-none print:border-none print:bg-white print:text-black min-h-[500px]`}>
          
          {/* Print Header */}
          <div className="mb-8 border-b-2 border-slate-700 pb-4 print:border-black">
            <h2 className={`text-2xl font-bold uppercase tracking-widest ${activeTab === 'pnl' ? 'text-amber-500 print:text-black' : 'text-slate-100 print:text-black'}`}>
              {activeTab === 'pnl' ? 'Statement of Profit and Loss' : 
               activeTab === 'cashflow' ? 'Statement of Cash Flows' : 
               'Balance Sheet'}
            </h2>
            <p className="text-slate-400 print:text-slate-600 mt-2 font-mono">
              {activeTab === 'balancesheet' ? `As of ${endDate}` : `For the period ${startDate} to ${endDate}`}
            </p>
          </div>

          {/* Loading State */}
          {isLoading && !data && (
            <div className="flex flex-col items-center justify-center h-64 text-amber-500">
              <RefreshCw className="h-10 w-10 animate-spin mb-4" />
              <p>Compiling Statement...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg flex items-center gap-3">
              <AlertTriangle />
              {error}
            </div>
          )}

          {/* Data Render */}
          {!isLoading && data && (
            <div className="max-w-4xl mx-auto text-sm md:text-base print:text-[12pt] font-mono leading-relaxed">
              
              {/* === PROFIT & LOSS === */}
              {activeTab === "pnl" && (
                <>
                  <div className="mb-8 h-64 print:hidden">
                    <h3 className="text-slate-400 mb-4 text-center font-sans tracking-widest text-sm uppercase">Financial Snapshot</h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: "Revenue", value: data.Revenue?.total || 0, fill: "#10b981" },
                        { name: "COGS", value: data.COGS?.total || 0, fill: "#f59e0b" },
                        { name: "OPEX", value: data.OPEX?.total || 0, fill: "#ef4444" },
                        { name: "Net Income", value: data.NetIncome || 0, fill: data.NetIncome >= 0 ? "#10b981" : "#ef4444" }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2B3654" vertical={false} />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" tickFormatter={(val) => `${val / 1000}k`} />
                        <RechartsTooltip 
                           contentStyle={{ backgroundColor: '#0c142e', borderColor: '#f59e0b', color: '#fff' }}
                           formatter={(value: any) => formatCurrency(Number(value) || 0)}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                           {
                             [
                               { name: "Revenue", value: data.Revenue?.total || 0, fill: "#10b981" },
                               { name: "COGS", value: data.COGS?.total || 0, fill: "#f59e0b" },
                               { name: "OPEX", value: data.OPEX?.total || 0, fill: "#ef4444" },
                               { name: "Net Income", value: data.NetIncome || 0, fill: data.NetIncome >= 0 ? "#10b981" : "#ef4444" }
                             ].map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={entry.fill} />
                             ))
                           }
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {renderSection("Revenue", data.Revenue)}
                  {renderSection("Cost of Goods Sold", data.COGS)}
                  {renderRow("Gross Margin", data.GrossMargin, false, true)}
                  <div className="h-8"></div>
                  {renderSection("Operating Expenses", data.OPEX)}
                  <div className="h-4"></div>
                  {renderRow("Net Income", data.NetIncome, false, true)}
                </>
              )}

              {/* === CASH FLOW === */}
              {activeTab === "cashflow" && (
                <>
                  {renderCashflowSection("Operating Activities", data.OperatingActivities)}
                  {renderCashflowSection("Investing Activities", data.InvestingActivities)}
                  {renderCashflowSection("Financing Activities", data.FinancingActivities)}
                  <div className="h-8"></div>
                  {renderRow("Net Change in Cash", data.NetCashFlow, false, true)}
                </>
              )}

              {/* === BALANCE SHEET === */}
              {activeTab === "balancesheet" && (
                <>
                  {renderSection("Assets", data.Assets)}
                  <div className="h-8"></div>
                  {renderSection("Liabilities", data.Liabilities)}
                  <div className="h-4"></div>
                  {renderSection("Equity", data.Equity)}
                  {renderRow("Retained Earnings", data.RetainedEarnings)}
                  <div className="border-t border-amber-500/20 my-2"></div>
                  {renderRow("Total Equity", data.Equity?.total + (data.RetainedEarnings || 0), true)}
                  <div className="h-8"></div>
                  {renderRow("Total Liabilities & Equity", data.LiabilitiesAndEquity, false, true)}
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
