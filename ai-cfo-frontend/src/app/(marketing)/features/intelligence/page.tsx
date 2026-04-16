import Link from "next/link";
import { ArrowRight, Brain } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Intelligence Engine — CFOlytics",
  description: "Upload any financial file and watch the AI Intelligence Engine automatically extract KPIs, flag anomalies, and generate narrative insights.",
};

export default function IntelligencePage() {
  return (
    <div className="min-h-screen bg-[#0c0f17] text-white pt-24">
      <div className="mx-auto max-w-7xl px-6 py-20">

        <div className="flex items-center gap-4 mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Feature — AI Intelligence Engine</p>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
            Upload once.<br />Know everything.
          </h1>
          <div className="flex flex-col justify-end">
            <p className="text-lg text-slate-400 leading-relaxed">
              The CFOlytics Intelligence Engine processes any uploaded financial file end-to-end:
              it detects the schema, extracts KPIs, detects anomalies, fits forecast models, and
              generates an AI narrative — entirely automatically, without a single click from you.
            </p>
            <Link href="/sign-up" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white text-[#0c0f17] px-7 py-3.5 text-sm font-bold self-start transition-all hover:bg-slate-100 shadow-xl shadow-white/10">
              Run the engine free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Main screenshot — Intelligence feed */}
        <div className="rounded-2xl overflow-hidden border border-[#1e2637] shadow-2xl shadow-purple-500/10 mb-6">
          <div className="px-5 py-3 border-b border-white/5 bg-[#111827] flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
            <p className="text-[10px] text-slate-500 ml-3 uppercase tracking-wider font-semibold">CFOlytics — Intelligence Feed</p>
          </div>
          <img src="/marketing-photos/Intelligence/I-1.png" alt="Intelligence Feed" className="w-full object-cover object-top" />
        </div>

        {/* Secondary screenshots — Upload + Data Query side by side */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {[
            { img: "/marketing-photos/Upload Data/UD-1.png", label: "Data Upload — Schema Auto-Detection" },
            { img: "/marketing-photos/Data Query (AI)/DQ-1.png", label: "AI Data Query — Natural Language SQL" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl overflow-hidden border border-[#1e2637] group hover:border-purple-500/30 transition-all shadow-xl">
              <div className="px-4 py-2.5 bg-[#111827] border-b border-white/5">
                <span className="text-xs font-medium text-slate-400">{s.label}</span>
              </div>
              <img src={s.img} alt={s.label} className="w-full object-cover object-top group-hover:scale-[1.01] transition-transform duration-500" />
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-600 text-center mb-20">↑ Live product screenshots — actual CFOlytics interface</p>

        {/* Pipeline steps */}
        <div className="mb-20">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-8">The automated intelligence pipeline</p>
          <div className="space-y-4">
            {[
              { n: "1", title: "Schema Detection", desc: "Pandas reads any Excel or CSV and uses Semantic NLP to classify column types (monetary, date, category, text) automatically." },
              { n: "2", title: "KPI Extraction", desc: "The engine aggregates your data into standard financial KPIs: Revenue, Total Expenses, Net Profit, Burn Rate, and any custom formula you define." },
              { n: "3", title: "Anomaly Classification", desc: "Every transaction is scored against 7 ML risk categories: Duplicate, High Value, Vendor Change, Unusual Amount, Timing, Pattern Deviation, and new Vendor." },
              { n: "4", title: "AI Narrative Generation", desc: "Gemini 2.5 generates a plain-English summary of the file's contents, your top findings, and any recommended actions." },
              { n: "5", title: "Natural Language Query", desc: "Once data is ingested, you can ask any question in plain English and the AI Data Query engine translates it into a live database lookup." },
            ].map((step) => (
              <div key={step.n} className="flex gap-6 items-start border-b border-white/5 pb-5 last:border-0 last:pb-0">
                <div className="flex-shrink-0 w-8 h-8 rounded-full border border-white/10 bg-purple-500/10 flex items-center justify-center text-xs font-bold text-purple-400">{step.n}</div>
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/5 pt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-white font-semibold mb-1">Your data tells a story. Stop waiting for an analyst to read it.</p>
            <p className="text-sm text-slate-500">Upload. The AI reads it. You get answers.</p>
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
