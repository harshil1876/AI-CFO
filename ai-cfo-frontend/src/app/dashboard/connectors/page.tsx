"use client";

import { useUser, useOrganization } from "@clerk/nextjs";
import ConnectorsPanel from "@/components/ConnectorsPanel";
import { Link2 } from "lucide-react";

export default function ConnectorsPage() {
    const { user } = useUser();
    const { organization } = useOrganization();
    const BOT_ID = organization?.id || user?.id;
    if (!BOT_ID) return null;

    return (
        <div className="w-full h-full flex flex-col bg-[#0a0d14]">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-[#1e2637] flex-shrink-0 bg-[#0c0f17]">
                <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                    <Link2 className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                    <h2 className="text-base font-semibold text-white">Integrations & Connectors</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Connect accounting software (Tally, Razorpay) to auto-import financial data.</p>
                </div>
            </div>
            <div className="p-6 flex-1 overflow-y-auto w-full">
                <ConnectorsPanel botId={BOT_ID} />
            </div>
        </div>
    );
}
