"use client";

import { useUser, useOrganization } from "@clerk/nextjs";
import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import { type UploadResponse } from "@/lib/api";

export default function UploadPage() {
    const { user } = useUser();
    const { organization } = useOrganization();
    
    const BOT_ID = organization?.id || user?.id;

    const [uploadStatus, setUploadStatus] = useState<string>("");

    if (!BOT_ID) return null;

    const handleUploadComplete = (result: UploadResponse) => {
        if (result.status === "completed") {
            setUploadStatus(
                `File "${result.filename}" processed (${result.row_count} rows). Go to 'Run Pipeline' to generate insights.`
            );
        }
    };

    return (
        <div className="flex-1 overflow-y-auto w-full h-full flex flex-col">
            <header className="px-8 py-8 shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                        Data Ingestion
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                        Securely upload CSV, Excel, or structured JSON data for real-time AI processing.
                    </p>
                </div>
            </header>
            
            <div className="p-6 h-full w-full animate-in fade-in duration-500">
                <div className="mx-auto max-w-2xl space-y-6 mt-10">
                    <FileUpload botId={BOT_ID} onUploadComplete={handleUploadComplete} />
                    {uploadStatus && (
                        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-gray-300">
                            {uploadStatus}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
