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
            <header className="flex items-center justify-between px-8 py-8 shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                        Financial Overview
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                        Real-time KPIs and historical trends for your organization.
                    </p>
                </div>
                <div className="hidden md:flex items-center gap-2 rounded-full border border-[#1e2637] bg-[#1e2637]/30 px-4 py-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-xs text-slate-300 font-medium tracking-wide lowercase">Live Data Feed</span>
                </div>
            </header>
            
            <div className="p-6 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto w-full">
                {/* 1. The KPI Cards */}
                <MetricsGrid botId={BOT_ID} />
                
                {/* 2. Advanced AI Charting (Sprint 3 Enhancement) */}
                <div className="rounded-2xl border border-[#1e2637] bg-[#121622] p-8 shadow-xl">
                    <h3 className="text-lg font-bold mb-8 flex items-center gap-3 text-white">
                        <span className="h-8 w-1 bg-amber-500 rounded-full"></span>
                        Revenue vs Expenses Trend
                    </h3>
                    <FinancialChart botId={BOT_ID} />
                </div>
            </div>
        </div>
    );
}
