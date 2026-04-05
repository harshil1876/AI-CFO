"use client";

import { useUser, useOrganization } from "@clerk/nextjs";
import InvoiceAnalysisPanel from "@/components/InvoiceAnalysisPanel";
import { Receipt } from "lucide-react";

export default function AccountsPayablePage() {
    const { user } = useUser();
    const { organization } = useOrganization();
    
    const BOT_ID = organization?.id || user?.id;
    if (!BOT_ID) return null;

    return (
        <div className="w-full h-full flex flex-col bg-[#0a0d14]">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-[#1e2637] flex-shrink-0 bg-[#0c0f17]">
                <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                    <Receipt className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                    <h2 className="text-base font-semibold text-white">Accounts Payable</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Multimodal AI document processing, Invoice extraction & Fraud Analysis.</p>
                </div>
            </div>
            <div className="p-6 flex-1 overflow-y-auto w-full">
                <InvoiceAnalysisPanel botId={BOT_ID} />
            </div>
        </div>
    );
}
