"use client";

import { useUser, useOrganization } from "@clerk/nextjs";
import InvoiceAnalysisPanel from "@/components/InvoiceAnalysisPanel";

export default function AccountsPayablePage() {
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
                        Accounts Payable
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                        Multimodal AI document processing, Invoice extraction, and native Fraud Analysis.
                    </p>
                </div>
            </header>
            
            <div className="p-6 h-full w-full animate-in fade-in duration-500">
                <InvoiceAnalysisPanel botId={BOT_ID} />
            </div>
        </div>
    );
}
