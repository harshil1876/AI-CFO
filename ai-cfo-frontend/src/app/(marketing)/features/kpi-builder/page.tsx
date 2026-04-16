import Link from "next/link";
import { ArrowRight, Target } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Custom KPI Builder — CFOlytics",
  description: "Write plain-English formulas. CFOlytics evaluates them against your live ledger and displays live KPI gauges on your dashboard.",
};

export default function KPIBuilderPage() {
  return (
    <div className="min-h-screen bg-[#0c0f17] text-white pt-24">
      <div className="mx-auto max-w-7xl px-6 py-20">

        <div className="flex items-center gap-4 mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Feature — Custom KPI Builder</p>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
            Track what<br />actually matters.
          </h1>
          <div className="flex flex-col justify-end">
            <p className="text-lg text-slate-400 leading-relaxed">
              Build any financial KPI using plain English — "Total Revenue minus Total Expenses" —
              and CFOlytics automatically evaluates it against your live ledger, displaying the
              result as a live radial gauge you can track over time.
            </p>
            <Link href="/sign-up" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white text-[#0c0f17] px-7 py-3.5 text-sm font-bold self-start transition-all hover:bg-slate-100 shadow-xl shadow-white/10">
              Build your first KPI <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Before / After Screenshots */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-8">From formula to live gauge — two screens</p>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { img: "/marketing-photos/KPI Builder/KPI-1.png", label: "Step 1: Define your KPI formula", badge: "Input", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
              { img: "/marketing-photos/KPI Builder/KPI-2.png", label: "Step 2: Live radial gauge on your dashboard", badge: "Result", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl overflow-hidden border border-[#1e2637] group hover:border-blue-500/30 transition-all shadow-xl">
                <div className="px-4 py-3 bg-[#111827] border-b border-white/5 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">{s.label}</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${s.color}`}>{s.badge}</span>
                </div>
                <img src={s.img} alt={s.label} className="w-full object-cover object-top group-hover:scale-[1.01] transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-slate-600 text-center mb-20">↑ Live product screenshots — actual CFOlytics interface</p>

        {/* Feature grid */}
        <div className="grid md:grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden mb-20">
          {[
            { title: "Plain-English Formulas", desc: "No SQL, no VLOOKUP. Write \"Net Profit Margin\" and the engine maps it to your ledger automatically using semantic NLP." },
            { title: "Live Ledger Evaluation", desc: "Every KPI pulls directly from your latest transaction data. Refresh daily, weekly, or on-demand." },
            { title: "Target Tracking", desc: "Set a target value for any KPI and watch a live radial progress gauge track your actual vs target in real time." },
          ].map((item) => (
            <div key={item.title} className="bg-[#0f172a] p-8">
              <Target className="h-5 w-5 text-blue-400 mb-4" />
              <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 pt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-white font-semibold mb-1">Every business has unique KPIs. Now you can track yours.</p>
            <p className="text-sm text-slate-500">Plain-English formula → live dashboard gauge, automatically.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/features" className="text-sm text-slate-500 hover:text-white transition-colors">← All features</Link>
            <Link href="/sign-up" className="flex items-center gap-2 rounded-xl bg-white text-[#0c0f17] px-6 py-2.5 text-sm font-bold transition-all hover:bg-slate-100">
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
