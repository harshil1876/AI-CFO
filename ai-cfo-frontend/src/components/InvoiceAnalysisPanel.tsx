"use client";

import { useState, useRef, useEffect } from "react";
import { 
  uploadInvoiceDocument, getInvoices, getPurchaseOrders, updateInvoiceStatus,
  type InvoiceRecord, type PurchaseOrder 
} from "@/lib/api";

export default function InvoiceAnalysisPanel({ botId }: { botId: string }) {
  const [activeTab, setActiveTab] = useState<"upload" | "invoices" | "pos">("upload");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [scanProgress, setScanProgress] = useState(0);

  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [currentResult, setCurrentResult] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeTab === "invoices") loadInvoices();
    if (activeTab === "pos") loadPos();
  }, [activeTab]);

  const loadInvoices = async () => {
    try {
      setInvoices(await getInvoices(botId));
    } catch (e) {
      console.error(e);
    }
  };

  const loadPos = async () => {
    try {
      setPos(await getPurchaseOrders(botId));
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsProcessing(true);
    setCurrentResult(null);
    setScanProgress(0);

    // Fake progress animation for UX
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev < 90) return prev + Math.random() * 15;
        return prev;
      });
      
      const statuses = ["Uploading to VertexAI...", "Running OCR...", "Extracting Line Items...", "Verifying Mathematics...", "Checking against Purchase Orders...", "Running Fraud Integrity Checks...", "Finalizing Output..."];
      setProcessingStatus(statuses[Math.floor(Math.random() * statuses.length)]);
    }, 800);

    try {
      const result = await uploadInvoiceDocument(botId, file);
      setScanProgress(100);
      setTimeout(() => {
        setCurrentResult(result);
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }, 500);
    } catch (err: any) {
      alert("Error: " + err.message);
      setIsProcessing(false);
    } finally {
      clearInterval(interval);
    }
  };

  const handleStatusUpdate = async (invoiceId: number, status: "approved" | "rejected") => {
    try {
      const result = await updateInvoiceStatus(botId, invoiceId, status);
      // Update UI state
      if (currentResult && currentResult.id === invoiceId) {
        setCurrentResult({ ...currentResult, status: result.status });
      }
      // Update inbox list if we switch back
      setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status: result.status } : inv));
    } catch (e: any) {
      alert("Failed to update status: " + e.message);
    }
  };

  const getFraudColor = (score: number) => {
    if (score < 20) return "text-emerald-400";
    if (score < 50) return "text-yellow-400";
    return "text-red-500";
  };
  const getFraudBorderColor = (score: number) => {
    if (score < 20) return "border-emerald-500/50";
    if (score < 50) return "border-yellow-500/50";
    return "border-red-500/50";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">Approved</span>;
      case 'rejected': return <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">Rejected / Fraud</span>;
      default: return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">Pending Approval</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
        <div className="flex bg-white/5 rounded-xl p-1">
          <button
            onClick={() => setActiveTab("upload")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === "upload" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-gray-400 hover:text-white"
            }`}
          >
            Process Invoice
          </button>
          <button
            onClick={() => setActiveTab("invoices")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === "invoices" ? "bg-amber-600 text-white shadow-lg shadow-amber-500/20" : "text-gray-400 hover:text-white"
            }`}
          >
            Invoice Inbox
          </button>
          <button
            onClick={() => setActiveTab("pos")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === "pos" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" : "text-gray-400 hover:text-white"
            }`}
          >
            Purchase Orders
          </button>
        </div>
      </div>

      {activeTab === "upload" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          
          {!isProcessing && !currentResult && (
            <div 
              className="rounded-2xl border-2 border-dashed border-indigo-500/30 bg-indigo-500/5 p-16 flex flex-col justify-center items-center text-center cursor-pointer hover:bg-indigo-500/10 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-5xl mb-4 opacity-80">📄 ✨</div>
              <h3 className="text-xl font-bold mb-2">Upload Invoice for AI Analysis</h3>
              <p className="text-sm text-gray-400 max-w-sm mb-6">
                Drag & drop or click to upload a PDF/Image. Our multimodal Gemini Vision model will extract fields, perform math integrity checks, and cross-reference POs.
              </p>
              <button className="bg-white hover:bg-gray-100 text-black px-6 py-2 rounded-xl font-semibold transition-all">
                Select File
              </button>
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileUpload}
                accept="image/jpeg, image/png, application/pdf"
              />
            </div>
          )}

          {isProcessing && (
            <div className="rounded-2xl border border-white/10 bg-[#080d18] p-16 flex flex-col justify-center items-center text-center shadow-xl">
              <div className="relative w-32 h-32 mb-8">
                {/* Glowing ring animation */}
                <div className="absolute inset-0 rounded-full border-b-2 border-indigo-500 animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-t-2 border-cyan-400 animate-spin flex items-center justify-center" style={{ animationDuration: '2s', animationDirection: 'reverse' }}>
                  <span className="text-2xl">🤖</span>
                </div>
              </div>
              <h3 className="text-lg font-bold mb-2 animate-pulse">{processingStatus}</h3>
              
              <div className="w-full max-w-md bg-white/5 rounded-full h-2 mt-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-2 transition-all duration-300 ease-out" 
                  style={{ width: `${Math.min(scanProgress, 100)}%` }}
                ></div>
              </div>
              <p className="mt-2 text-xs text-gray-500">{Math.round(Math.min(scanProgress, 100))}% complete</p>
            </div>
          )}

          {currentResult && !isProcessing && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Summary */}
              <div className="lg:col-span-1 space-y-4">
                <div className={`rounded-2xl border bg-[#080d18] p-6 shadow-xl ${getFraudBorderColor(currentResult.fraud_score)}`}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-sm text-gray-400 uppercase tracking-wider font-semibold">Fraud Intelligence</h3>
                    <div className="bg-[#0f172a] p-2 rounded-lg">🛡️</div>
                  </div>
                  <div className="flex items-end gap-2 mb-4">
                    <p className={`text-4xl font-bold ${getFraudColor(currentResult.fraud_score)}`}>{currentResult.fraud_score}%</p>
                    <p className="text-xs text-gray-500 mb-1">Risk Score</p>
                  </div>
                  
                  {currentResult.fraud_flags.length > 0 ? (
                    <div className="space-y-2 mt-4 pt-4 border-t border-white/10">
                      <p className="text-xs text-red-400 font-semibold uppercase">Risk Factors Detected:</p>
                      <ul className="list-disc list-inside text-xs text-red-300 space-y-1">
                        {currentResult.fraud_flags.map((flag: string, i: number) => <li key={i}>{flag}</li>)}
                      </ul>
                    </div>
                  ) : (
                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2">
                      <span className="text-emerald-400">✅</span>
                      <p className="text-xs text-emerald-400">All mathematical integrity & vendor checks passed.</p>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#080d18] p-6 shadow-xl">
                  <h3 className="text-sm text-gray-400 uppercase tracking-wider font-semibold mb-4">Action Required</h3>
                  
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    {getStatusBadge(currentResult.status)}
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">PO Match Status</p>
                    {currentResult.matched_po ? (
                      <span className="text-emerald-400 text-xs font-medium flex items-center gap-1">🔗 Matched to PO #{currentResult.matched_po}</span>
                    ) : (
                      <span className="text-gray-400 text-xs font-medium flex items-center gap-1">⚠️ No Associated PO</span>
                    )}
                  </div>

                  {currentResult.status === 'pending_approval' && (
                    <div className="flex gap-2 mt-6">
                      <button 
                        onClick={() => handleStatusUpdate(currentResult.id, "approved")}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-2 text-sm font-semibold transition-colors">
                        Approve
                      </button>
                      <button 
                         onClick={() => handleStatusUpdate(currentResult.id, "rejected")}
                         className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded-xl py-2 text-sm font-semibold transition-colors border border-white/10">
                        Reject
                      </button>
                    </div>
                  )}

                  <button 
                    onClick={() => setCurrentResult(null)}
                    className="w-full mt-4 text-xs text-gray-400 hover:text-white underline underline-offset-4"
                  >
                    Process Another Document
                  </button>
                </div>
              </div>

              {/* Right Column: Invoice Details */}
              <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#080d18] p-6 shadow-xl">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">{currentResult.vendor_name}</h2>
                    <p className="text-gray-400 text-sm">Issued: {currentResult.date_issued || 'Unknown Date'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                    <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                      ${Number(currentResult.total_amount).toLocaleString()}
                    </p>
                  </div>
                </div>

                <h3 className="text-sm border-b border-white/10 pb-2 mb-4 font-semibold text-gray-300">Line Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 bg-white/5">
                      <tr>
                        <th className="px-4 py-2 rounded-tl-lg">Description</th>
                        <th className="px-4 py-2 text-right rounded-tr-lg">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentResult.line_items.map((item: any, idx: number) => (
                        <tr key={idx} className="border-b border-white/5">
                          <td className="px-4 py-3 text-gray-300">{item.description}</td>
                          <td className="px-4 py-3 text-right font-medium">${Number(item.amount).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {currentResult.additional_notes && (
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <h3 className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2 flex items-center gap-2">
                       <span className="text-indigo-400">📝</span> 
                       Additional Notes Extracted
                    </h3>
                    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap bg-white/5 p-4 rounded-xl border border-white/5">
                      {currentResult.additional_notes}
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      )}

      {activeTab === "invoices" && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 animate-in fade-in duration-500">
          <h3 className="text-lg font-semibold mb-6">Invoice Inbox</h3>
          {invoices.length === 0 ? (
            <p className="text-sm text-gray-400">No invoices processed yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-xs text-gray-500 bg-white/5 uppercase border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3">Vendor</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3 text-center">Fraud Score</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr 
                      key={inv.id} 
                      onClick={() => {
                        // Open this invoice in the detail view
                        setCurrentResult({
                          id: inv.id,
                          vendor_name: inv.vendor_name,
                          date_issued: inv.date_issued,
                          total_amount: inv.total_amount,
                          tax_amount: inv.tax_amount,
                          fraud_score: inv.fraud_confidence_score,
                          fraud_flags: inv.fraud_flags || [],
                          status: inv.status,
                          matched_po: inv.matched_po ? inv.matched_po : null,
                          line_items: inv.line_items || [],
                          additional_notes: inv.additional_notes,
                          gl_code: inv.gl_code
                        });
                        setActiveTab("upload"); // Switch to detail view
                      }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-4 font-medium">{inv.vendor_name}</td>
                      <td className="px-4 py-4 text-gray-400">{inv.date_issued}</td>
                      <td className="px-4 py-4">${Number(inv.total_amount).toLocaleString()}</td>
                      <td className="px-4 py-4 text-center">
                        <span className={`font-bold ${getFraudColor(inv.fraud_confidence_score)}`}>{inv.fraud_confidence_score}%</span>
                      </td>
                      <td className="px-4 py-4">{getStatusBadge(inv.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "pos" && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 animate-in fade-in duration-500">
          <h3 className="text-lg font-semibold mb-6">Purchase Orders</h3>
          {pos.length === 0 ? (
            <p className="text-sm text-gray-400">No Purchase Orders available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pos.map(p => (
                <div key={p.id} className="bg-[#080d18] border border-white/5 rounded-xl p-5 shadow-lg">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-gray-400 text-xs font-medium">#{p.po_number}</p>
                    <span className="text-[10px] uppercase font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded">{p.status}</span>
                  </div>
                  <h4 className="font-bold text-lg">{p.vendor_name}</h4>
                  <p className="text-xl font-medium text-emerald-400 mt-2">${Number(p.expected_amount).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
