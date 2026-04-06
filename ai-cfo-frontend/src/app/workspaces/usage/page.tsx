"use client";

import { Activity, Database, Server, Cpu } from "lucide-react";

export default function UsagePage() {
  const metrics = [
    { label: "Database Space", value: "2.4 GB", limit: "8 GB", percent: 30, icon: Database, color: "bg-blue-500" },
    { label: "Monthly Compute", value: "124 hrs", limit: "500 hrs", percent: 25, icon: Server, color: "bg-emerald-500" },
    { label: "AI Tokens", value: "1.2M", limit: "2M", percent: 60, icon: Cpu, color: "bg-purple-500" },
  ];

  return (
    <div className="w-full h-full flex flex-col p-8 bg-[#0a0d14] overflow-y-auto text-white">
      <div className="max-w-4xl w-full mx-auto">
        <h1 className="text-2xl font-bold mb-2">Organization Usage</h1>
        <p className="text-slate-400 mb-8 max-w-2xl text-sm">
          Track your resource consumption across all workspaces within the organization for the current billing cycle.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {metrics.map((m) => (
            <div key={m.label} className="p-5 border border-[#1e2637] bg-[#0c0f17] rounded-xl flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                  <m.icon size={18} className="text-slate-300" />
                </div>
                <span className="font-semibold">{m.label}</span>
              </div>
              <div className="flex items-end justify-between font-mono">
                <span className="text-2xl font-bold">{m.value}</span>
                <span className="text-sm text-slate-500">/ {m.limit}</span>
              </div>
              <div className="h-1.5 w-full bg-[#1e2637] rounded-full overflow-hidden">
                <div className={`h-full ${m.color}`} style={{ width: `${m.percent}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border border-[#2a3448] bg-[#121622] rounded-xl flex items-center justify-between">
          <div>
            <h3 className="font-bold flex items-center gap-2 mb-1">
              <Activity size={18} className="text-emerald-400" /> System Status
            </h3>
            <p className="text-sm text-slate-400">All systems are operational. No limits reached.</p>
          </div>
          <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-md transition-colors border border-white/10">
            View Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
