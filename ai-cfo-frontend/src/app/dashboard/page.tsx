"use client";

import { useState } from "react";
import { useUser, useOrganization, UserButton, SignOutButton } from "@clerk/nextjs";
import ChatInterface from "@/components/ChatInterface";
import FileUpload from "@/components/FileUpload";
import SimulationPanel from "@/components/SimulationPanel";
import {
    runAnalytics,
    runForecast,
    syncRAG,
    sendAlerts,
    type UploadResponse,
} from "@/lib/api";

type Tab = "chat" | "upload" | "analytics" | "simulation";

export default function Dashboard() {
    const { user, isLoaded: isUserLoaded } = useUser();
    const { organization } = useOrganization();

    // Use Clerk organization ID if available, otherwise user ID
    const BOT_ID = organization?.id || user?.id || "guest";

    const [activeTab, setActiveTab] = useState<Tab>("chat");
    const [analyticsStatus, setAnalyticsStatus] = useState<string>("");
    const [isRunning, setIsRunning] = useState(false);

    const handleRunPipeline = async () => {
        setIsRunning(true);
        setAnalyticsStatus("Running analytics pipeline...");

        try {
            const period = new Date().toISOString().slice(0, 7);

            setAnalyticsStatus("Step 1/4: Calculating KPIs & detecting anomalies...");
            const analyticsResult = await runAnalytics(BOT_ID, period);

            setAnalyticsStatus("Step 2/4: Running revenue forecast...");
            await runForecast(BOT_ID, 6);

            setAnalyticsStatus("Step 3/4: Syncing to AI knowledge base...");
            await syncRAG(BOT_ID);

            setAnalyticsStatus("Step 4/4: Checking for critical alerts...");
            const alertResult = await sendAlerts(BOT_ID);

            setAnalyticsStatus(
                `✅ Pipeline complete! ${analyticsResult.anomalies_found || 0} anomalies, ` +
                `${analyticsResult.recommendations?.length || 0} recommendations, ` +
                `${alertResult.alerts_sent || 0} alert(s) sent.`
            );
        } catch {
            setAnalyticsStatus("❌ Pipeline failed. Check Django backend server.");
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
        { id: "chat" as Tab, label: "AI CFO Chat", icon: "💬" },
        { id: "upload" as Tab, label: "Upload Data", icon: "📤" },
        { id: "analytics" as Tab, label: "Run Pipeline", icon: "⚡" },
        { id: "simulation" as Tab, label: "What-If", icon: "🧪" },
    ];

    // Show loading while Clerk loads
    if (!isUserLoaded) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#060a14] text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    <p className="text-sm text-gray-500">Loading your workspace...</p>
                </div>
            </div>
        );
    }

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
                            <span className="text-base">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </nav>

                {/* User Profile & Status Footer */}
                <div className="border-t border-white/5 p-4 space-y-3">
                    {/* User Info */}
                    <div className="flex items-center gap-3 rounded-xl bg-white/[0.02] border border-white/5 p-3">
                        <UserButton
                            appearance={{
                                elements: {
                                    avatarBox: "h-8 w-8",
                                },
                            }}
                        />
                        <div className="flex-1 min-w-0">
                            <p className="truncate text-xs font-medium text-gray-300">
                                {user?.firstName || user?.emailAddresses[0]?.emailAddress || "User"}
                            </p>
                            <p className="truncate text-[10px] text-gray-600">
                                {organization?.name || "Personal Account"}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3">
                        <p className="text-[10px] uppercase tracking-wider text-gray-600">Organization</p>
                        <p className="mt-1 truncate text-xs font-mono text-gray-400">
                            {organization?.name || "Personal"}
                        </p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-white/5 p-3">
                        <p className="text-[10px] uppercase tracking-wider text-gray-600">Model</p>
                        <p className="mt-1 text-xs text-blue-400">Gemini 2.5 Flash</p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex flex-1 flex-col overflow-hidden">
                {/* Top bar */}
                <header className="flex items-center justify-between border-b border-white/5 bg-[#080d18]/50 px-8 py-4">
                    <div>
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <span>{tabs.find((t) => t.id === activeTab)?.icon}</span>
                            {tabs.find((t) => t.id === activeTab)?.label}
                        </h2>
                        <p className="text-xs text-gray-500">
                            {activeTab === "chat" && "Ask your AI CFO anything about your finances"}
                            {activeTab === "upload" && "Upload CSV, Excel, JSON — any financial data"}
                            {activeTab === "analytics" && "Run the full intelligence pipeline (KPIs → Forecast → Anomalies → RAG → Alerts)"}
                            {activeTab === "simulation" && "Test hypothetical financial scenarios"}
                        </p>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6">
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
                                    <span className="text-3xl">⚡</span>
                                </div>

                                <h3 className="text-lg font-semibold">Intelligence Pipeline</h3>
                                <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                                    Runs the full AI CFO pipeline: KPI calculation → Prophet forecasting →
                                    Anomaly detection → Prescriptive recommendations → RAG sync → Alert notifications.
                                </p>

                                <button
                                    onClick={handleRunPipeline}
                                    disabled={isRunning}
                                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50"
                                >
                                    {isRunning ? (
                                        <>
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            Running...
                                        </>
                                    ) : (
                                        "▶ Run Full Pipeline"
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

                    {activeTab === "simulation" && (
                        <SimulationPanel botId={BOT_ID} />
                    )}
                </div>
            </main>
        </div>
    );
}
