"use client";

import { useUser, useOrganization } from "@clerk/nextjs";
import MetricsGrid from "@/components/MetricsGrid";
import FinancialChart from "@/components/FinancialChart";

export default function DashboardOverviewPage() {
    const { user } = useUser();
    const { organization } = useOrganization();
    
    // Auth fallbacks
    const BOT_ID = organization?.id || user?.id;

    if (!BOT_ID) return null;

    return (
        <div className="flex-1 overflow-y-auto w-full h-full flex flex-col">
            <header className="flex items-center justify-between border-b border-white/5 bg-[#080d18]/50 px-8 py-4 shrink-0">
                <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <span>📊</span> Financial Overview
                    </h2>
                    <p className="text-xs text-gray-500">
                        View real-time Key Performance Indicators and historical trends.
                    </p>
                </div>
            </header>
            
            <div className="p-6 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto w-full">
                {/* 1. The KPI Cards */}
                <MetricsGrid botId={BOT_ID} />
                
                {/* 2. Advanced AI Charting (Sprint 3 Enhancement) */}
                <div className="rounded-2xl border border-white/10 bg-[#080d18] p-6 shadow-xl">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <span className="text-emerald-400">📈</span> Revenue vs Expenses Trend
                    </h3>
                    <FinancialChart botId={BOT_ID} />
                </div>
            </div>
        </div>
    );
}
