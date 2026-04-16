import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CFOlytics for Consultants",
  description: "Deliver full financial reviews for any client in under 5 minutes. P&L, anomalies, forecasts, AI narrative — all from one upload.",
};

export default function ConsultantsPage() {
  return (
    <div className="min-h-screen bg-[#0c0f17] text-white pt-24">
      <div className="mx-auto max-w-7xl px-6 py-20">

        <div className="flex items-center gap-4 mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Solutions — Consultants</p>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
            Do in 5 minutes what<br />used to take 8 hours.
          </h1>
          <div className="flex flex-col justify-end">
            <p className="text-lg text-slate-400 leading-relaxed">
              Upload a client's Excel, run the pipeline, and deliver a complete financial review —
              P&L, anomaly report, 6-month forecast, AI narrative summary — before your coffee gets cold.
              CFOlytics is the analysis engine your firm never had.
            </p>
            <Link href="/sign-up" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white text-[#0c0f17] px-7 py-3.5 text-sm font-bold self-start transition-all hover:bg-slate-100 shadow-xl shadow-white/10">
              Start free trial <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Workflow steps */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">A typical client review</p>
            <div className="flex-1 h-px bg-white/5" />
          </div>
          <div className="space-y-4">
            {[
              { n: "1", title: "Upload client data", desc: "Drop in the client's Excel or CSV. CFOlytics maps the columns automatically — no reformatting." },
              { n: "2", title: "Pipeline runs in seconds", desc: "Anomaly detection, KPI extraction, forecast model, and financial statement generation all happen automatically." },
              { n: "3", title: "Review the output", desc: "Check flagged anomalies, browse the P&L and Cash Flow, review the 6-month forecast. Add your own notes." },
              { n: "4", title: "Export and present", desc: "One-click PDF report with AI narrative summary ready to send. Your brand, your analysis — 10x faster." },
            ].map((step) => (
              <div key={step.n} className="flex gap-5 items-start border-b border-white/5 pb-5 last:border-0 last:pb-0">
                <div className="flex-shrink-0 w-7 h-7 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center text-xs font-bold text-slate-500">
                  {step.n}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Use cases */}
        <div className="grid md:grid-cols-2 gap-px bg-white/5 rounded-2xl overflow-hidden mb-16">
          {[
            { title: "Monthly reviews", desc: "Deliver board-ready P&L, Cash Flow, and Balance Sheet with AI narrative for every client — as a standard deliverable." },
            { title: "Anomaly investigations", desc: "Plug in a client's data and surface the top anomalies with risk scores. Show your value in the first meeting." },
            { title: "Scenario planning", desc: "Run Monte Carlo simulations for strategic decisions — headcount expansion, cost programs, acquisition scenarios." },
            { title: "Budget reviews", desc: "Compare actuals vs budget with automated variance analysis. Draft the next period budget in seconds." },
          ].map((item) => (
            <div key={item.title} className="bg-[#0f172a] p-6">
              <h3 className="text-sm font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Client workspace screenshots */}
        <div className="mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-8">Multi-client workspace isolation — live interface</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { img: "/marketing-photos/Workspaces/W-1.png", label: "Client Workspace Selector" },
              { img: "/marketing-photos/Workspaces/W-2.png", label: "Workspace Data Isolation" },
              { img: "/marketing-photos/Upload Data/UD-1.png", label: "Rapid Client Data Ingestion" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl overflow-hidden border border-[#1e2637] group hover:border-indigo-500/30 transition-all shadow-lg">
                <div className="px-4 py-2.5 bg-[#111827] border-b border-white/5">
                  <span className="text-xs font-medium text-slate-400">{s.label}</span>
                </div>
                <img src={s.img} alt={s.label} className="w-full object-cover object-top group-hover:scale-[1.01] transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/5 pt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-white font-semibold mb-1">Each client gets a separate workspace.</p>
            <p className="text-sm text-slate-500">Data is fully isolated. Nothing bleeds between engagements.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/solutions/executives" className="text-sm text-slate-500 hover:text-white transition-colors">For C-Suite →</Link>
            <Link href="/sign-up" className="flex items-center gap-2 rounded-xl bg-white text-[#0c0f17] px-6 py-2.5 text-sm font-bold transition-all hover:bg-slate-100">
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
