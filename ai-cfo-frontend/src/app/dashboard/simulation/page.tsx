"use client";

import { useUser, useOrganization } from "@clerk/nextjs";
import SimulationPanel from "@/components/SimulationPanel";
import { FlaskConical } from "lucide-react";

export default function SimulationPage() {
    const { user } = useUser();
    const { organization } = useOrganization();
    const BOT_ID = organization?.id || user?.id;
    if (!BOT_ID) return null;

    return (
        <div className="w-full h-full flex flex-col bg-[#0a0d14]">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-[#1e2637] flex-shrink-0 bg-[#0c0f17]">
                <div className="p-2 rounded-lg bg-pink-500/10 border border-pink-500/20">
                    <FlaskConical className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                    <h2 className="text-base font-semibold text-white">What-If Scenarios</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Test hypothetical financial assumptions and see how they impact your run-rate.</p>
                </div>
            </div>
            <div className="p-6 flex-1 overflow-y-auto w-full">
                <SimulationPanel botId={BOT_ID} />
            </div>
        </div>
    );
}
