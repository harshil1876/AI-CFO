"use client";

import { useUser, useOrganization } from "@clerk/nextjs";
import BudgetPanel from "@/components/BudgetPanel";

export default function BudgetPage() {
    const { user } = useUser();
    const { organization } = useOrganization();
    
    // Auth fallbacks
    const BOT_ID = organization?.id || user?.id;

    if (!BOT_ID) return null;

    return (
        <div className="flex-1 overflow-y-auto w-full h-full flex flex-col">
            <header className="px-8 py-8 shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                        Budget & Scenarios
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                        Advanced Budgeting, Variance Tracking & Monte Carlo probability forecasting.
                    </p>
                </div>
            </header>
            
            <div className="p-6 h-full w-full animate-in fade-in duration-500">
                <BudgetPanel botId={BOT_ID} />
            </div>
        </div>
    );
}
