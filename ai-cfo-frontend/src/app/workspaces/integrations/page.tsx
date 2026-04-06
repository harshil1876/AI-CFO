"use client";

import { Blocks, Database, MessageSquare, CreditCard, Cloud } from "lucide-react";

export default function IntegrationsPage() {
  const integrations = [
    { name: "Supabase", desc: "Sync users and row-level security policies.", icon: Database, color: "text-emerald-400", bg: "bg-emerald-500/10", connected: true },
    { name: "AWS", desc: "Connect S3 buckets for large dataset storage.", icon: Cloud, color: "text-amber-400", bg: "bg-amber-500/10", connected: false },
    { name: "Slack", desc: "Get anomaly alerts directly in Slack channels.", icon: MessageSquare, color: "text-blue-400", bg: "bg-blue-500/10", connected: false },
    { name: "Stripe", desc: "Import revenue data for ARR dashboarding.", icon: CreditCard, color: "text-purple-400", bg: "bg-purple-500/10", connected: false },
  ];

  return (
    <div className="w-full h-full flex flex-col p-8 bg-[#0a0d14] overflow-y-auto text-white">
      <div className="max-w-6xl w-full mx-auto">
        <h1 className="text-2xl font-bold mb-2">Integrations</h1>
        <p className="text-slate-400 mb-8 max-w-2xl text-sm">
          Connect CFOlytics to your existing data infrastructure and communication tools.
          Integrations applied here are available to all workspaces.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map(integ => (
            <div key={integ.name} className="p-5 border border-[#1e2637] bg-[#0c0f17] hover:border-[#2a3448] transition-colors rounded-xl flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-lg ${integ.bg}`}>
                  <integ.icon size={20} className={integ.color} />
                </div>
                {integ.connected ? (
                  <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                    Connected
                  </span>
                ) : (
                  <button className="text-xs font-semibold px-3 py-1.5 bg-white text-black hover:bg-slate-200 transition-colors rounded-md">
                    Connect
                  </button>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">{integ.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{integ.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
