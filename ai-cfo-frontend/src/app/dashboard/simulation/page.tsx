"use client";

import { useUser, useOrganization } from "@clerk/nextjs";
import SimulationPanel from "@/components/SimulationPanel";

export default function SimulationPage() {
    const { user } = useUser();
    const { organization } = useOrganization();
    const BOT_ID = organization?.id || user?.id;

    if (!BOT_ID) return null;

    return (
        <div className="flex-1 overflow-y-auto w-full h-full flex flex-col">
            <header className="flex items-center justify-between border-b border-white/5 bg-[#080d18]/50 px-8 py-4 shrink-0">
                <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <span>🧪</span> What-If Scenarios
                    </h2>
                    <p className="text-xs text-gray-500">
                        Test hypothetical financial assumptions and see how they impact your run-rate.
                    </p>
                </div>
            </header>
            
            <div className="p-6 h-full w-full animate-in fade-in duration-500">
                <SimulationPanel botId={BOT_ID} />
            </div>
        </div>
    );
}
