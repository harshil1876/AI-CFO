"use client";

import { useState, useEffect } from "react";
import { useUser, useOrganization } from "@clerk/nextjs";
import MetricsGrid from "@/components/MetricsGrid";
import FinancialChart from "@/components/FinancialChart";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Target, Users, MessageSquare, TrendingUp, TrendingDown, Minus, Clock, FileText } from "lucide-react";
import { getAuthHeaders } from "@/lib/api";

import { useRouter } from 'next/navigation';

// ─── Target KPI Radial Widget ───────────────────────────────────────────────
function TargetKpiWidget({ botId }: { botId: string }) {
  const { activeWorkspaceId } = useWorkspace();
  const [goal, setGoal] = useState<any>(null);
  const [actualRev, setActualRev] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (!botId) return;

    const fetchKPIs = async () => {
      try {
        const headers = await getAuthHeaders();
        // 1. Fetch Goal
        const goalRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/goals/?workspace_id=${activeWorkspaceId || ''}&bot_id=${botId}`, { headers });
        let targetGoal = { goal_name: "Target Revenue", target_value: 0 }; 
        if (goalRes.ok) {
          const goalsList = await goalRes.json();
          if (goalsList.length > 0) targetGoal = goalsList[0];
        }
        setGoal(targetGoal);

        // 2. Fetch Actual Revenue
        const kpiRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/kpis/?bot_id=${botId}`, { headers });
        if (kpiRes.ok) {
          const kpis = await kpiRes.json();
          const revs = kpis.filter((k: any) => k.metric_name === "Revenue");
          if (revs.length > 0) {
            // Take the latest revenue entry or sum them (simplifying to latest)
            setActualRev(revs[0].value);
          } else {
            setActualRev(0);
          }
        }
      } catch (err) {}
    };

    fetchKPIs();
  }, [botId, activeWorkspaceId]);

  const rawPercent = goal && goal.target_value > 0 ? (actualRev / goal.target_value) * 100 : 0;
  const percent = Math.min(Math.round(rawPercent), 100);
  const radius = 36;
  const circ = 2 * Math.PI * radius;
  const dash = (percent / 100) * circ;

  if (!goal) return null;

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
          <p className="text-sm font-semibold text-white">{goal.goal_name}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            ${(actualRev / 1000).toFixed(1)}k of ${(goal.target_value / 1000).toFixed(1)}k
          </p>
          <button 
            onClick={() => router.push('/dashboard/reports')}
            className="mt-3 px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-medium rounded-md border border-blue-500/20 transition-colors cursor-pointer"
          >
            Drill Down →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Team Status Widget ─────────────────────────────────────────────────────
function TeamStatusWidget() {
  const { user } = useUser();
  const { memberships } = useOrganization({
    memberships: true
  });

  const members = memberships?.data?.map(m => {
    const pubUser = m.publicUserData;
    return {
      name: pubUser?.firstName || pubUser?.identifier || "Unknown",
      role: m.role.split(':')[1] || m.role, // e.g. "org:admin" -> "admin"
      status: (pubUser?.identifier === user?.primaryEmailAddress?.emailAddress) ? "online" : "away"
    };
  }) || [];

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
        {members.slice(0, 3).map((m: any) => (
          <div key={m.name} className="flex items-center gap-3">
            <div className="relative">
              <div className="h-7 w-7 rounded-full bg-[#1e2637] flex items-center justify-center text-xs font-semibold text-white uppercase">
                {m.name?.[0] || '?'}
              </div>
              <span className={`absolute bottom-0 right-0 h-2 w-2 rounded-full border border-[#121622] ${statusColor[m.status]}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{m.name}</p>
              <p className="text-[10px] text-slate-500 uppercase">{m.role}</p>
            </div>
            <span className={`text-[10px] font-medium capitalize ${m.status === "online" ? "text-emerald-400" : m.status === "away" ? "text-amber-400" : "text-slate-600"}`}>
              {m.status}
            </span>
          </div>
        ))}
        {members.length === 0 && <p className="text-xs text-slate-500">No team members</p>}
      </div>
    </div>
  );
}

// ─── Quick Activity Feed ─────────────────────────────────────────────────────
function ActivityFeed({ botId }: { botId: string }) {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/audit/?bot_id=${botId}&limit=4`, { 
          headers: { ...headers, "X-Org-Role": "org:admin" } 
        });
        if (res.ok) {
          const data = await res.json();
          setEvents(data.slice(0, 4));
        }
      } catch (err) {}
    };
    fetchAudit();
  }, [botId]);

  return (
    <div className="rounded-xl border border-[#1e2637] bg-[#121622] p-5 flex flex-col gap-3 w-full">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Recent Activity</h3>
        <div className="bg-purple-500/10 rounded-lg p-1.5">
          <Clock size={14} className="text-purple-400" />
        </div>
      </div>
      <div className="space-y-3">
        {events.length === 0 ? (
          <p className="text-xs text-slate-500">No recent activity.</p>
        ) : (
          events.map((e, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="mt-0.5 flex-shrink-0">
                <FileText size={13} className="text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-300 leading-snug">
                  {e.user_email} performed <span className="font-semibold text-blue-400">{e.action}</span>
                </p>
              </div>
              <span className="text-[10px] text-slate-600 flex-shrink-0">
                {new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
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
            <TargetKpiWidget botId={BOT_ID} />
            <TeamStatusWidget />
          </div>
        </div>

        {/* Third Row: Activity Feed */}
        <ActivityFeed botId={BOT_ID} />
      </div>
    </div>
  );
}
