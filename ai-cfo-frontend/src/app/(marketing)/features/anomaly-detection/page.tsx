import Link from "next/link";
import { ArrowRight, AlertTriangle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anomaly Detection — CFOlytics",
  description: "AI scans every transaction against your spending history and flags issues before your accountant finds them at month-end.",
};

const RISK_TYPES = [
  { type: "Duplicate", color: "text-rose-400 bg-rose-500/10 border-rose-500/20", desc: "Same invoice paid twice, or identical amounts to the same payee within a tight window." },
  { type: "High Value", color: "text-red-400 bg-red-500/10 border-red-500/20", desc: "Transaction size is a statistical outlier vs your normal spend for that category." },
  { type: "Vendor Change", color: "text-orange-400 bg-orange-500/10 border-orange-500/20", desc: "New or modified vendor account details detected mid-period." },
  { type: "Unusual Amount", color: "text-amber-400 bg-amber-500/10 border-amber-500/20", desc: "Amount falls outside the expected range based on your historical baseline." },
  { type: "Timing Anomaly", color: "text-sky-400 bg-sky-500/10 border-sky-500/20", desc: "Payment is significantly earlier or later than your typical schedule for this vendor." },
  { type: "Pattern Deviation", color: "text-purple-400 bg-purple-500/10 border-purple-500/20", desc: "Subtle behavioral shift that doesn't fit a single category — caught by ML model." },
];

export default function AnomalyDetectionPage() {
  return (
    <div className="min-h-screen bg-[#0c0f17] text-white pt-24">
      <div className="mx-auto max-w-7xl px-6 py-20">

        {/* Section label */}
        <div className="flex items-center gap-4 mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Feature — Anomaly Detection</p>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {/* Headline */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
            Catch it in minutes.<br />Not weeks.
          </h1>
          <div className="flex flex-col justify-end">
            <p className="text-lg text-slate-400 leading-relaxed">
              Most financial mistakes get caught during month-end reconciliation — days after the damage
              is done. CFOlytics checks every transaction as it's ingested, flags issues with a
              risk score, and routes them to your team immediately.
            </p>
            <Link href="/sign-up" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white text-[#0c0f17] px-7 py-3.5 text-sm font-bold self-start transition-all hover:bg-slate-100 shadow-xl shadow-white/10">
              Start detecting <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Real product screenshot */}
        <div className="rounded-2xl overflow-hidden border border-[#1e2637] shadow-2xl shadow-red-500/10 mb-8">
          <div className="px-5 py-3 border-b border-white/5 bg-[#111827] flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
            <p className="text-[10px] text-slate-500 ml-3 uppercase tracking-wider font-semibold">CFOlytics — Anomaly Resolution Hub</p>
          </div>
          <img src="/marketing-photos/Anomaly Hub/AH-1.png" alt="Anomaly Detection Hub" className="w-full object-cover object-top" />
        </div>
        <p className="text-xs text-slate-600 text-center mb-12">↑ Live product screenshot — actual CFOlytics interface</p>

        {/* Anomaly card mockup */}
        <div className="rounded-2xl border border-white/8 bg-[#0f172a] mb-16 overflow-hidden">
          <div className="px-6 py-3 border-b border-white/5 bg-[#111827]">
            <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Example: detected anomaly</p>
          </div>
          <div className="px-6 py-5">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-bold uppercase text-red-400 bg-red-500/10 border-red-500/30">Critical</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold text-red-400 bg-red-500/10 border-red-500/20">
                <AlertTriangle className="h-3 w-3" /> Open
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold text-rose-400 bg-rose-500/10 border-rose-500/20">Duplicate</span>
              <span className="text-slate-400 text-xs">Vendor Payment</span>
              <span className="text-white font-semibold text-sm ml-auto">₹2,84,000</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Duplicate payment detected to vendor ACC-2291. Invoice INV-8834 was paid twice within 48 hours.
            </p>
            <div className="mt-3 flex items-center gap-2.5 max-w-xs">
              <span className="text-[10px] text-slate-500 whitespace-nowrap">Risk score</span>
              <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-red-500" style={{ width: "92%" }} />
              </div>
              <span className="text-[10px] font-bold text-red-400">92</span>
            </div>
          </div>
        </div>

        {/* Risk types — 2-col list, not emoji cards */}
        <div className="mb-24">
          <div className="flex items-center gap-4 mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Six risk categories, automatically classified</p>
            <div className="flex-1 h-px bg-white/5" />
          </div>
          <div className="grid md:grid-cols-2 gap-px bg-white/5 rounded-2xl overflow-hidden">
            {RISK_TYPES.map((r) => (
              <div key={r.type} className="bg-[#0f172a] p-6">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-bold mb-3 ${r.color}`}>
                  {r.type}
                </span>
                <p className="text-sm text-slate-500 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom strip */}
        <div className="border-t border-white/5 pt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-white font-semibold mb-1">Your team gets an alert. Not a spreadsheet.</p>
            <p className="text-sm text-slate-500">Comment, assign, change status, resolve — all inside CFOlytics.</p>
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
