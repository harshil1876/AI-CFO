"use client";

import { useUser, useOrganization } from "@clerk/nextjs";
import MetricsGrid from "@/components/MetricsGrid";
import FinancialChart from "@/components/FinancialChart";
import { Target, Users, MessageSquare, TrendingUp, TrendingDown, Minus, Clock } from "lucide-react";

// ─── Target KPI Radial Widget ───────────────────────────────────────────────
function TargetKpiWidget() {
  const percent = 43; // Hardcoded until real goal-tracking API is ready
  const radius = 36;
  const circ = 2 * Math.PI * radius;
  const dash = (percent / 100) * circ;

  return (
    <div className="rounded-xl border border-[#1e2637] bg-[#121622] p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">On Target KPI</h3>
        <div className="bg-blue-500/10 rounded-lg p-1.5">
          <Target size={14} className="text-blue-400" />
        </div>
      </div>
      <div className="flex items-center gap-5">
        <div className="relative flex-shrink-0">
          <svg width="96" height="96" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r={radius} fill="none" stroke="#1e2637" strokeWidth="8" />
            <circle
              cx="48" cy="48" r={radius} fill="none"
              stroke="#3b82f6" strokeWidth="8"
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeLinecap="round"
              transform="rotate(-90 48 48)"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-white">{percent}%</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Q2 Revenue Goal</p>
          <p className="text-xs text-slate-500 mt-0.5">$215k of $500k target</p>
          <button className="mt-3 px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-medium rounded-md border border-blue-500/20 transition-colors">
            Drill Down →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Team Status Widget ─────────────────────────────────────────────────────
function TeamStatusWidget() {
  const members = [
    { name: "Harshil P.", role: "CFO", status: "online" },
    { name: "Priya S.", role: "Analyst", status: "away" },
    { name: "Rohan M.", role: "Controller", status: "offline" },
  ];
  const statusColor: Record<string, string> = {
    online: "bg-emerald-500",
    away: "bg-amber-500",
    offline: "bg-slate-600",
  };
  return (
    <div className="rounded-xl border border-[#1e2637] bg-[#121622] p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Team Status</h3>
        <div className="bg-emerald-500/10 rounded-lg p-1.5">
          <Users size={14} className="text-emerald-400" />
        </div>
      </div>
      <div className="space-y-2.5">
        {members.map((m) => (
          <div key={m.name} className="flex items-center gap-3">
            <div className="relative">
              <div className="h-7 w-7 rounded-full bg-[#1e2637] flex items-center justify-center text-xs font-semibold text-white">
                {m.name[0]}
              </div>
              <span className={`absolute bottom-0 right-0 h-2 w-2 rounded-full border border-[#121622] ${statusColor[m.status]}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{m.name}</p>
              <p className="text-[10px] text-slate-500">{m.role}</p>
            </div>
            <span className={`text-[10px] font-medium capitalize ${m.status === "online" ? "text-emerald-400" : m.status === "away" ? "text-amber-400" : "text-slate-600"}`}>
              {m.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Quick Activity Feed ─────────────────────────────────────────────────────
function ActivityFeed() {
  const events = [
    { icon: TrendingUp, text: "Revenue forecast updated by AI", time: "2m ago", color: "text-emerald-400" },
    { icon: Target, text: "Q2 budget variance flagged", time: "18m ago", color: "text-amber-400" },
    { icon: TrendingDown, text: "Anomaly detected in OPEX", time: "1h ago", color: "text-red-400" },
    { icon: Clock, text: "Audit log exported by admin", time: "3h ago", color: "text-blue-400" },
  ];
  return (
    <div className="rounded-xl border border-[#1e2637] bg-[#121622] p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Recent Activity</h3>
        <div className="bg-purple-500/10 rounded-lg p-1.5">
          <Clock size={14} className="text-purple-400" />
        </div>
      </div>
      <div className="space-y-3">
        {events.map((e, i) => {
          const Icon = e.icon;
          return (
            <div key={i} className="flex items-start gap-2.5">
              <div className="mt-0.5 flex-shrink-0">
                <Icon size={13} className={e.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-300 leading-snug">{e.text}</p>
              </div>
              <span className="text-[10px] text-slate-600 flex-shrink-0">{e.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardOverviewPage() {
  const { user } = useUser();
  const { organization } = useOrganization();
  const BOT_ID = organization?.id || user?.id;

  if (!BOT_ID) return null;

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2637] flex-shrink-0">
        <div>
          <h2 className="text-base font-semibold text-white">Financial Overview</h2>
          <p className="text-xs text-slate-500 mt-0.5">Real-time KPIs and trends for {organization?.name || "your workspace"}</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-emerald-400 font-medium">Live</span>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
        {/* KPI Cards */}
        <MetricsGrid botId={BOT_ID} />

        {/* Second Row: Chart + Sidebar Widgets */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Revenue Chart — takes 2/3 */}
          <div className="xl:col-span-2 rounded-xl border border-[#1e2637] bg-[#121622] p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-5 flex items-center gap-2">
              <span className="h-4 w-0.5 bg-amber-500 rounded-full" />
              Revenue vs Expenses Trend
            </h3>
            <FinancialChart botId={BOT_ID} />
          </div>

          {/* Right column widgets */}
          <div className="flex flex-col gap-4">
            <TargetKpiWidget />
            <TeamStatusWidget />
          </div>
        </div>

        {/* Third Row: Activity Feed */}
        <ActivityFeed />
      </div>
    </div>
  );
}
