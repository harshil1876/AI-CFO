import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CFOlytics for C-Suite",
  description: "Live KPI dashboards, AI answers to any financial question, and board-ready reports — without waiting for your analyst team.",
};

export default function ExecutivesPage() {
  return (
    <div className="min-h-screen bg-[#0c0f17] text-white pt-24">
      <div className="mx-auto max-w-7xl px-6 py-20">

        <div className="flex items-center gap-4 mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Solutions — C-Suite</p>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
            Stop waiting 3 days<br />for analyst reports.
          </h1>
          <div className="flex flex-col justify-end">
            <p className="text-lg text-slate-400 leading-relaxed">
              CFOs and finance leaders shouldn't need to schedule report runs to answer a board question.
              CFOlytics gives you live KPI visibility, AI-generated narrative summaries, and full financial
              statements whenever you need them — on your schedule, not your analyst's.
            </p>
            <Link href="/sign-up" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white text-[#0c0f17] px-7 py-3.5 text-sm font-bold self-start transition-all hover:bg-slate-100 shadow-xl shadow-white/10">
              See the dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* What executives actually need */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">What you get</p>
            <div className="flex-1 h-px bg-white/5" />
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden">
            {[
              { title: "Live KPI dashboard", desc: "Revenue, expenses, profit margin, and anomaly count — displayed in real time. No refresh, no wait, no BCC to an analyst." },
              { title: "Ask anything, instantly", desc: "Type a question in plain English and get an answer from your actual financial data in under 3 seconds. With a confidence rating." },
              { title: "Goal tracking", desc: "Set a revenue target and watch a live progress gauge update as new data flows in. Shared with the team in one link." },
              { title: "One-click board reports", desc: "P&L, Cash Flow, Balance Sheet — formatted and ready to export. AI narrative summary included. No formatting time needed." },
              { title: "Anomaly alerts", desc: "Critical financial issues surface automatically. Your team gets notified, can comment, assign, and resolve without a separate tool." },
              { title: "Immutable audit trail", desc: "Every action by every team member is logged. SOC2-ready export for compliance reviews. Always on, automatically." },
            ].map((item) => (
              <div key={item.title} className="bg-[#0f172a] p-6">
                <h3 className="text-sm font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pull stat */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { value: "< 3 sec", label: "Per AI financial answer" },
            { value: "1 click", label: "To generate any report" },
            { value: "Live", label: "KPI dashboard, always" },
            { value: "Zero", label: "Analyst scheduling required" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/8 bg-[#0f172a] p-6">
              <p className="text-2xl font-bold text-white mb-1">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 pt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-white font-semibold mb-1">Your data is waiting to tell you something.</p>
            <p className="text-sm text-slate-500">Connect your data source and have your first live dashboard up in under 10 minutes.</p>
          </div>
          <Link href="/sign-up" className="flex items-center gap-2 rounded-xl bg-white text-[#0c0f17] px-6 py-2.5 text-sm font-bold transition-all hover:bg-slate-100">
            Get started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
