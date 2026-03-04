"use client";

import { useState } from "react";
import ChatInterface from "@/components/ChatInterface";
import FileUpload from "@/components/FileUpload";
import {
    runAnalytics,
    runForecast,
    syncRAG,
    type UploadResponse,
} from "@/lib/api";

// Temporary hardcoded bot_id — will come from Clerk auth later
const BOT_ID = "demo-company-001";

type Tab = "chat" | "upload" | "analytics";

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState<Tab>("chat");
    const [analyticsStatus, setAnalyticsStatus] = useState<string>("");
    const [isRunning, setIsRunning] = useState(false);

    const handleRunPipeline = async () => {
        setIsRunning(true);
        setAnalyticsStatus("Running analytics pipeline...");

        try {
            // Step 1: Calculate KPIs
            setAnalyticsStatus("Step 1/3: Calculating KPIs & detecting anomalies...");
            const period = new Date().toISOString().slice(0, 7); // e.g., "2026-03"
            const analyticsResult = await runAnalytics(BOT_ID, period);

            // Step 2: Run forecast
            setAnalyticsStatus("Step 2/3: Running revenue forecast...");
            await runForecast(BOT_ID, 6);

            // Step 3: Sync to RAG
            setAnalyticsStatus("Step 3/3: Syncing to AI knowledge base...");
            await syncRAG(BOT_ID);

            setAnalyticsStatus(
                `✅ Pipeline complete! ${analyticsResult.anomalies_found} anomalies found, ${analyticsResult.recommendations?.length || 0} recommendations generated.`
            );
        } catch (err) {
            setAnalyticsStatus("❌ Pipeline failed. Check Django server logs.");
        } finally {
            setIsRunning(false);
        }
    };

    const handleUploadComplete = (result: UploadResponse) => {
        if (result.status === "completed") {
            setAnalyticsStatus(
                `File "${result.filename}" processed (${result.row_count} rows). Run the analytics pipeline to generate insights.`
            );
        }
    };

    const tabs = [
        {
            id: "chat" as Tab,
            label: "AI CFO Chat",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97Z" clipRule="evenodd" />
                </svg>
            ),
        },
        {
            id: "upload" as Tab,
            label: "Upload Data",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path fillRule="evenodd" d="M11.47 2.47a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1-1.06 1.06l-3.22-3.22V16.5a.75.75 0 0 1-1.5 0V4.81L8.03 8.03a.75.75 0 0 1-1.06-1.06l4.5-4.5Z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M4.5 12.75a.75.75 0 0 1 .75.75v4.5a1.5 1.5 0 0 0 1.5 1.5h10.5a1.5 1.5 0 0 0 1.5-1.5v-4.5a.75.75 0 0 1 1.5 0v4.5a3 3 0 0 1-3 3H6.75a3 3 0 0 1-3-3v-4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                </svg>
            ),
        },
        {
            id: "analytics" as Tab,
            label: "Run Pipeline",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 0 1 8.25-8.25.75.75 0 0 1 .75.75v6.75H18a.75.75 0 0 1 .75.75 8.25 8.25 0 0 1-16.5 0Z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M12.75 3a.75.75 0 0 1 .75-.75 8.25 8.25 0 0 1 8.25 8.25.75.75 0 0 1-.75.75h-7.5a.75.75 0 0 1-.75-.75V3Z" clipRule="evenodd" />
                </svg>
            ),
        },
    ];

    return (
        <div className="flex h-screen bg-[#060a14] text-white">
            {/* Sidebar */}
            <aside className="flex w-64 flex-col border-r border-white/5 bg-[#080d18]">
                {/* Logo */}
                <div className="flex items-center gap-3 border-b border-white/5 px-6 py-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold shadow-lg shadow-blue-500/20">
                        ₹
                    </div>
                    <div>
                        <h1 className="text-sm font-bold tracking-tight">AI CFO</h1>
                        <p className="text-[10px] text-gray-500">Enterprise Intelligence</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-all ${activeTab === tab.id
                                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5"
                                    : "text-gray-400 hover:bg-white/5 hover:text-gray-300"
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </nav>

                {/* Status */}
                <div className="border-t border-white/5 p-4">
                    <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3">
                        <p className="text-[10px] uppercase tracking-wider text-gray-600">Bot ID</p>
                        <p className="mt-1 truncate text-xs font-mono text-gray-400">{BOT_ID}</p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex flex-1 flex-col overflow-hidden">
                {/* Top bar */}
                <header className="flex items-center justify-between border-b border-white/5 bg-[#080d18]/50 px-8 py-4">
                    <div>
                        <h2 className="text-lg font-semibold">
                            {tabs.find((t) => t.id === activeTab)?.label}
                        </h2>
                        <p className="text-xs text-gray-500">
                            {activeTab === "chat" && "Ask your AI CFO anything about your finances"}
                            {activeTab === "upload" && "Upload CSV, Excel, JSON — any financial data"}
                            {activeTab === "analytics" && "Run the full intelligence pipeline"}
                        </p>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden p-6">
                    {activeTab === "chat" && (
                        <div className="h-full">
                            <ChatInterface botId={BOT_ID} />
                        </div>
                    )}

                    {activeTab === "upload" && (
                        <div className="mx-auto max-w-2xl space-y-6">
                            <FileUpload botId={BOT_ID} onUploadComplete={handleUploadComplete} />

                            {analyticsStatus && (
                                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-gray-300">
                                    {analyticsStatus}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "analytics" && (
                        <div className="mx-auto max-w-2xl space-y-6">
                            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 text-blue-400">
                                        <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z" clipRule="evenodd" />
                                    </svg>
                                </div>

                                <h3 className="text-lg font-semibold">Intelligence Pipeline</h3>
                                <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                                    This runs KPI calculation, Prophet forecasting, Isolation Forest anomaly detection,
                                    prescriptive recommendations, and syncs everything to the AI knowledge base.
                                </p>

                                <button
                                    onClick={handleRunPipeline}
                                    disabled={isRunning}
                                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isRunning ? (
                                        <>
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            Running...
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                                                <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                                            </svg>
                                            Run Full Pipeline
                                        </>
                                    )}
                                </button>
                            </div>

                            {analyticsStatus && (
                                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-gray-300 leading-relaxed">
                                    {analyticsStatus}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
