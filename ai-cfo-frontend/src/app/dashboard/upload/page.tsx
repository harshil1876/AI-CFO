"use client";

import { useUser, useOrganization } from "@clerk/nextjs";
import { useState, useEffect, useCallback, Fragment } from "react";
import FileUpload from "@/components/FileUpload";
import { type UploadResponse, getUploadedFiles, type UploadedFileRecord } from "@/lib/api";
import {
    CheckCircle, XCircle, Clock, Loader2,
    FileText, RefreshCw, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
    completed:  { icon: <CheckCircle className="h-4 w-4" />,  color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    failed:     { icon: <XCircle className="h-4 w-4" />,      color: "text-red-400",     bg: "bg-red-500/10 border-red-500/20" },
    processing: { icon: <Loader2 className="h-4 w-4 animate-spin" />, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
    pending:    { icon: <Clock className="h-4 w-4" />,         color: "text-slate-400",   bg: "bg-slate-500/10 border-slate-500/20" },
};

const FILE_TYPE_ICON: Record<string, string> = {
    csv:  "📊",
    xlsx: "📗",
    xls:  "📗",
    json: "📋",
    pdf:  "📄",
};

const formatBytes = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const relTime = (iso: string) => {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

export default function UploadPage() {
    const { user } = useUser();
    const { organization } = useOrganization();
    const BOT_ID = organization?.id || user?.id;

    const [recentUpload, setRecentUpload] = useState<UploadResponse | null>(null);
    const [files, setFiles] = useState<UploadedFileRecord[]>([]);
    const [isLoadingFiles, setIsLoadingFiles] = useState(true);
    const [showSummary, setShowSummary] = useState<number | null>(null);

    if (!BOT_ID) return null;

    const loadFiles = useCallback(async () => {
        setIsLoadingFiles(true);
        const data = await getUploadedFiles(BOT_ID);
        setFiles(Array.isArray(data) ? data : []);
        setIsLoadingFiles(false);
    }, [BOT_ID]);

    useEffect(() => { loadFiles(); }, [loadFiles]);

    const handleUploadComplete = async (result: UploadResponse) => {
        setRecentUpload(result);
        if (result.status === "completed") {
            toast.success("File uploaded successfully. AI is analyzing your data in the background.", { duration: 5000 });
        } else if (result.status === "failed") {
            toast.error(`Upload failed: ${result.error}`);
        }
        await loadFiles();
    };

    const completedCount = files.filter(f => f.status === "completed").length;
    const failedCount    = files.filter(f => f.status === "failed").length;
    const totalRows      = files.reduce((sum, f) => sum + (f.row_count || 0), 0);

    return (
        <div className="flex-1 overflow-y-auto w-full h-full flex flex-col">
            <header className="flex items-center justify-between px-6 py-4 shrink-0 border-b border-[#1e2637]">
                <div>
                    <h2 className="text-base font-semibold text-white">Data Ingestion</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Securely upload CSV, Excel, or JSON for real-time AI processing.</p>
                </div>
                <div className="hidden md:flex items-center gap-4">
                    <div className="text-center">
                        <p className="text-lg font-bold text-white">{completedCount}</p>
                        <p className="text-[10px] text-slate-500">Processed</p>
                    </div>
                    <div className="h-6 w-px bg-[#1e2637]" />
                    <div className="text-center">
                        <p className="text-lg font-bold text-amber-400">{totalRows.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-500">Total Rows</p>
                    </div>
                    {failedCount > 0 && (
                        <>
                            <div className="h-6 w-px bg-[#1e2637]" />
                            <div className="text-center">
                                <p className="text-lg font-bold text-red-400">{failedCount}</p>
                                <p className="text-[10px] text-slate-500">Failed</p>
                            </div>
                        </>
                    )}
                </div>
            </header>

            <div className="p-6 space-y-8 max-w-4xl mx-auto w-full animate-in fade-in duration-500">
                {/* Upload Widget */}
                <FileUpload botId={BOT_ID} onUploadComplete={handleUploadComplete} />

                {/* Latest upload success banner */}
                {recentUpload && recentUpload.status === "completed" && (
                    <div className="flex items-start gap-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                        <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-emerald-300 font-semibold text-sm">
                                &ldquo;{recentUpload.filename}&rdquo; processed successfully
                            </p>
                            <p className="text-slate-400 text-xs mt-1">
                                {recentUpload.row_count?.toLocaleString("en-IN")} rows ingested &middot; Go to{" "}
                                <a href="/dashboard/pipeline" className="text-amber-400 hover:underline">Intelligence Pipeline</a>{" "}
                                to run analytics on this data.
                            </p>
                            {recentUpload.ai_summary && (
                                <p className="text-slate-500 text-xs mt-2 italic border-t border-white/5 pt-2">
                                    🤖 AI Summary: {recentUpload.ai_summary}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* File History */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white">Upload History</h3>
                        <button
                            onClick={loadFiles}
                            className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all"
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoadingFiles ? "animate-spin" : ""}`} />
                        </button>
                    </div>

                    {isLoadingFiles ? (
                        <div className="flex justify-center items-center h-32 text-slate-400">
                            <Loader2 className="h-6 w-6 animate-spin text-amber-500 mr-2" /> Loading history...
                        </div>
                    ) : files.length === 0 ? (
                        <div className="text-center py-16 rounded-xl border border-dashed border-white/10">
                            <FileText className="h-12 w-12 text-slate-700 mx-auto mb-3" />
                            <p className="text-slate-500">No files uploaded yet. Upload your first dataset above.</p>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-white/5 overflow-hidden bg-[#0f172a]">
                            <table className="w-full text-sm">
                                <thead className="text-xs uppercase text-slate-500 bg-black/30 border-b border-white/5">
                                    <tr>
                                        <th className="px-5 py-3 text-left">File</th>
                                        <th className="px-5 py-3 text-center">Status</th>
                                        <th className="px-5 py-3 text-right">Rows</th>
                                        <th className="px-5 py-3 text-right">Uploaded</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {files.map((file) => {
                                        const ext = file.original_filename.split(".").pop()?.toLowerCase() || "";
                                        const cfg = STATUS_CONFIG[file.status] || STATUS_CONFIG.pending;
                                        const isExpanded = showSummary === file.id;
                                        return (
                                            <Fragment key={file.id}>
                                                <tr
                                                    className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                                                    onClick={() => setShowSummary(isExpanded ? null : file.id)}
                                                >
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-lg">{FILE_TYPE_ICON[ext] || "📁"}</span>
                                                            <div>
                                                                <p className="text-slate-200 font-medium text-sm truncate max-w-xs">
                                                                    {file.original_filename}
                                                                </p>
                                                                <p className="text-slate-600 text-xs uppercase">{ext}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3 text-center">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${cfg.color} ${cfg.bg}`}>
                                                            {cfg.icon} {file.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3 text-right text-slate-300 font-mono text-xs">
                                                        {file.row_count != null ? file.row_count.toLocaleString("en-IN") : "—"}
                                                    </td>
                                                    <td className="px-5 py-3 text-right text-slate-500 text-xs">
                                                        {relTime(file.uploaded_at)}
                                                    </td>
                                                </tr>
                                                {/* Expandable AI Summary */}
                                                {isExpanded && (file.ai_summary || file.error_message) && (
                                                    <tr key={`${file.id}-detail`} className="bg-black/20">
                                                        <td colSpan={4} className="px-6 py-4">
                                                            {file.ai_summary && (
                                                                <p className="text-slate-400 text-xs leading-relaxed">
                                                                    <span className="text-amber-400 font-semibold mr-2">🤖 AI Summary:</span>
                                                                    {file.ai_summary}
                                                                </p>
                                                            )}
                                                            {file.error_message && (
                                                                <p className="text-red-400 text-xs mt-2 flex items-center gap-1.5">
                                                                    <AlertTriangle className="h-3 w-3" /> {file.error_message}
                                                                </p>
                                                            )}
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
