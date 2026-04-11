"use client";

import { useState, useRef } from "react";
import { uploadFile, type UploadResponse } from "@/lib/api";

interface FileUploadProps {
    botId: string;
    onUploadComplete?: (result: UploadResponse) => void;
}

export default function FileUpload({ botId, onUploadComplete }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<UploadResponse | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) await processFile(files[0]);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) await processFile(files[0]);
    };

    const processFile = async (file: File) => {
        setIsUploading(true);
        setResult(null);

        try {
            const response = await uploadFile(botId, file);
            setResult(response);
            if (response.status === "completed") {
                // Auto-trigger pipeline in the background
                (async () => {
                   try {
                       const { getAuthHeaders } = await import("@/lib/api");
                       const headers = await getAuthHeaders();
                       const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ai-cfo-api-ehckcffwdxbug5eg.centralindia-01.azurewebsites.net/api";
                       const period = new Date().toISOString().slice(0, 7);
                       // 1. Run Analytics (KPIs & Anomalies)
                       await fetch(`${API_URL}/analytics/run/`, {
                           method: "POST", headers: { "Content-Type": "application/json", ...headers },
                           body: JSON.stringify({ bot_id: botId, period })
                       });
                       // 2. Run Forecast
                       await fetch(`${API_URL}/forecast/run/`, {
                           method: "POST", headers: { "Content-Type": "application/json", ...headers },
                           body: JSON.stringify({ bot_id: botId, months: 6 })
                       });
                       // 3. Sync RAG
                       await fetch(`${API_URL}/chat/${botId}/sync/`, {
                           method: "POST", headers: { "Content-Type": "application/json", ...headers }
                       });
                   } catch (e) {
                       console.error("Auto-pipeline failed", e);
                   }
                })();
            }
            if (onUploadComplete) onUploadComplete(response);
        } catch {
            setResult({ status: "failed", error: "Upload failed. Check your connection." });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Drop Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${isDragging
                        ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10"
                        : "border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]"
                    }`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    accept=".csv,.xlsx,.xls,.json,.tsv"
                    className="hidden"
                />

                <div className="flex flex-col items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-blue-400">
                            <path fillRule="evenodd" d="M11.47 2.47a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1-1.06 1.06l-3.22-3.22V16.5a.75.75 0 0 1-1.5 0V4.81L8.03 8.03a.75.75 0 0 1-1.06-1.06l4.5-4.5Z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M4.5 12.75a.75.75 0 0 1 .75.75v4.5a1.5 1.5 0 0 0 1.5 1.5h10.5a1.5 1.5 0 0 0 1.5-1.5v-4.5a.75.75 0 0 1 1.5 0v4.5a3 3 0 0 1-3 3H6.75a3 3 0 0 1-3-3v-4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white">
                            {isUploading ? "Uploading & Processing..." : "Drop your financial data here"}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                            CSV, Excel, JSON, TSV — any format, any structure
                        </p>
                    </div>
                </div>

                {/* Upload progress */}
                {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/60 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
                            <span className="text-sm text-blue-300">AI is analyzing your file...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Result */}
            {result && (
                <div
                    className={`rounded-xl border p-4 text-sm ${result.status === "completed"
                            ? "border-emerald-500/20 bg-emerald-500/5"
                            : "border-red-500/20 bg-red-500/5"
                        }`}
                >
                    {result.status === "completed" ? (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                                <span className="font-medium text-emerald-300">
                                    {result.filename} — {result.row_count} rows processed
                                </span>
                            </div>
                            {result.ai_summary && (
                                <p className="ml-4 text-xs text-gray-400 leading-relaxed">
                                    {result.ai_summary}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-red-300">
                            <div className="h-2 w-2 rounded-full bg-red-400" />
                            <span>{result.error}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
