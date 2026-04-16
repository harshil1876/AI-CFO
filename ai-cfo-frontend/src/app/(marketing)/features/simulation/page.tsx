import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "What-If Simulation — CFOlytics",
  description: "Test any financial decision with 1,000-run Monte Carlo simulation before committing. Probability ranges, not guesswork.",
};

export default function SimulationPage() {
  return (
    <div className="min-h-screen bg-[#0c0f17] text-white pt-24">
      <div className="mx-auto max-w-7xl px-6 py-20">

        {/* Section label */}
        <div className="flex items-center gap-4 mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Feature — What-If Simulation</p>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {/* Headline */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
            Test the decision.<br />Before you make it.
          </h1>
          <div className="flex flex-col justify-end">
            <p className="text-lg text-slate-400 leading-relaxed">
              What if we hire 8 more engineers? What if revenue drops 15% in Q3? Instead of answering with a
              gut feeling, CFOlytics runs 1,000 algorithmic futures from your data and shows you the realistic
              probability range — best case, expected, and worst case.
            </p>
            <Link href="/sign-up" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white text-[#0c0f17] px-7 py-3.5 text-sm font-bold self-start transition-all hover:bg-slate-100 shadow-xl shadow-white/10">
              Run a simulation free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Real product screenshots — side by side */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {[
            { img: "/marketing-photos/Scenarios/SC-1.png", label: "Scenario Configuration Panel" },
            { img: "/marketing-photos/Scenarios/SC-2.png", label: "Monte Carlo Results Output" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl overflow-hidden border border-[#1e2637] shadow-xl group hover:border-indigo-500/30 transition-all">
              <div className="px-4 py-2.5 bg-[#111827] border-b border-white/5">
                <span className="text-xs font-medium text-slate-400">{s.label}</span>
              </div>
              <img src={s.img} alt={s.label} className="w-full object-cover object-top group-hover:scale-[1.01] transition-transform duration-500" />
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-600 text-center mb-12">↑ Live product screenshots — actual CFOlytics interface</p>

        {/* Monte Carlo output mockup */}
        <div className="rounded-2xl border border-white/8 bg-[#0f172a] p-6 mb-16">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-6">Monte Carlo result — +20% revenue scenario</p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Best case (10th pct.)", value: "₹8.2Cr", color: "text-emerald-400", bar: "bg-emerald-500/50" },
              { label: "Expected (50th pct.)", value: "₹6.1Cr", color: "text-blue-400",    bar: "bg-blue-500/50"    },
              { label: "Worst case (90th pct.)", value: "₹3.8Cr", color: "text-red-400",   bar: "bg-red-500/50"     },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-white/8 bg-white/[0.02] p-5 text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-2">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-3">Probability distribution (1,000 runs)</p>
            {[15, 35, 60, 80, 90, 80, 60, 35, 15, 8].map((h, i) => (
              <div key={i} className="h-1.5 bg-white/5 rounded overflow-hidden">
                <div className="h-full rounded bg-blue-500/30" style={{ width: `${h * 1}%`, marginLeft: `${i * 4}%` }} />
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-600 mt-4">Based on 12-month cash flow variance. 1,000 Monte Carlo iterations.</p>
        </div>

        {/* Scenario types */}
        <div className="mb-24">
          <div className="flex items-center gap-4 mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Three scenario types</p>
            <div className="flex-1 h-px bg-white/5" />
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden">
            {[
              { title: "Revenue scenario", desc: "Adjust revenue by ±% and see the cascading impact on margin, runway, and profitability in real time." },
              { title: "Expense scenario", desc: "Model cost cuts or increased spend across all categories and see the net effect on your bottom line." },
              { title: "Department scenario", desc: "Isolate one department (Engineering, Marketing, etc.) and model targeted budget changes independently." },
            ].map((item) => (
              <div key={item.title} className="bg-[#0f172a] p-8">
                <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom strip */}
        <div className="border-t border-white/5 pt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-white font-semibold mb-1">Make your next board presentation with data, not confidence.</p>
            <p className="text-sm text-slate-500">Every strategic decision, backed by probabilistic simulation.</p>
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
