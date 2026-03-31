"use client";

import { useState } from "react";
import { useUser, useOrganization } from "@clerk/nextjs";
import { runAnalytics, runForecast, syncRAG, sendAlerts } from "@/lib/api";

export default function PipelinePage() {
    const { user } = useUser();
    const { organization } = useOrganization();
    const BOT_ID = organization?.id || user?.id;

    const [analyticsStatus, setAnalyticsStatus] = useState<string>("");
    const [isRunning, setIsRunning] = useState(false);

    if (!BOT_ID) return null;

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

    return (
        <div className="flex-1 overflow-y-auto w-full h-full flex flex-col">
            <header className="px-8 py-8 shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                        Intelligence Pipeline
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                        Run calculation, forecasting, prescriptive analytics, RAG sync, and send alerts.
                    </p>
                </div>
            </header>
            
            <div className="p-6 h-full w-full animate-in fade-in duration-500">
                <div className="mx-auto max-w-2xl space-y-6 mt-10">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center shadow-xl">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10">
                            <span className="text-3xl">⚡</span>
                        </div>

                        <h3 className="text-xl font-bold">Run Financial Intelligence Pipeline</h3>
                        <p className="mt-2 text-sm text-gray-400 max-w-sm mx-auto">
                            Rebuild your AI's Knowledge Graph. This will parse all newly uploaded items, update Forecasts, run Anomaly checks, and send Alert Emails.
                        </p>

                        <button
                            onClick={handleRunPipeline}
                            disabled={isRunning}
                            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50"
                        >
                            {isRunning ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Synchronizing...
                                </>
                            ) : (
                                "▶ Run Full Pipeline"
                            )}
                        </button>
                    </div>

                    {analyticsStatus && (
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-100/80 leading-relaxed font-mono">
                            {analyticsStatus}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
