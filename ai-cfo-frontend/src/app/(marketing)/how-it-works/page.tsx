import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works — CFOlytics",
  description: "Upload your data, the AI runs the pipeline, your dashboard is live. Here is exactly what happens at each step.",
};

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#0c0f17] text-white pt-24">
      <div className="mx-auto max-w-7xl px-6 py-20">

        {/* Section label */}
        <div className="flex items-center gap-4 mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">How CFOlytics works</p>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {/* Headline */}
        <div className="grid lg:grid-cols-2 gap-12 mb-24">
          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
            From spreadsheet<br />to insight in minutes.
          </h1>
          <div className="flex flex-col justify-end">
            <p className="text-lg text-slate-400 leading-relaxed">
              There's no implementation project. No SQL skills. No data engineers. Upload your first file
              and your dashboard is live. Everything else — anomaly detection, forecasting, AI chat — follows automatically.
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="mb-24 space-y-6">
          {[
            {
              n: "1",
              title: "Connect your data",
              desc: "Upload any Excel or CSV file. Or connect QuickBooks, Tally, Xero, bank feeds, or Google Sheets. CFOlytics reads any financial format and maps columns automatically — no reformatting, no templates.",
              note: "Supported: Excel, CSV, QuickBooks, Tally, Xero, Google Sheets, bank feeds.",
            },
            {
              n: "2",
              title: "The AI pipeline runs automatically",
              desc: "The moment data lands, CFOlytics extracts your KPIs, runs the anomaly detection model across every transaction, fits a forecast from your history, and generates your P&L, Cash Flow, and Balance Sheet.",
              note: "Typically completes in under 30 seconds for a year of data.",
            },
            {
              n: "3",
              title: "Your live dashboard loads",
              desc: "Revenue, expenses, profit margin, anomaly feed, trend charts, target KPI tracker — all populated from your data. Real time. No refresh needed as new transactions come in.",
              note: "Switch between USD, INR, EUR, or GBP with live exchange rates.",
            },
            {
              n: "4",
              title: "Ask questions, share reports, take action",
              desc: "Chat with your AI CFO in plain English. Export board-ready PDF reports. Resolve flagged anomalies with your team. Run what-if simulations. Draft next quarter's budget. All from the same connected system.",
              note: "AI responses cite specific numbers from your data, not generic advice.",
            },
          ].map((step) => (
            <div key={step.n} className="grid md:grid-cols-[auto_1fr] gap-6 items-start border-b border-white/5 pb-8 last:border-0 last:pb-0">
              <div className="flex-shrink-0 w-10 h-10 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center text-sm font-bold text-slate-500">
                {step.n}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">{step.title}</h2>
                <p className="text-slate-400 leading-relaxed mb-3">{step.desc}</p>
                <p className="text-xs text-slate-600">{step.note}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Speed stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-20">
          {[
            { value: "< 10 min", label: "To connect your first data source and see a live dashboard" },
            { value: "< 30 sec", label: "For the AI pipeline to process a full year of transactions" },
            { value: "< 3 sec",  label: "For an AI financial answer grounded in your actual data" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/8 bg-[#0f172a] p-7">
              <p className="text-3xl font-bold text-white mb-2">{s.value}</p>
              <p className="text-sm text-slate-500 leading-relaxed">{s.label}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="border-t border-white/5 pt-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-white font-semibold text-lg mb-2">Ready to try it with your own data?</p>
              <p className="text-slate-500 text-sm leading-relaxed">
                Upload any Excel or CSV file — even a test file — and see your first dashboard live in under 10 minutes.
                No card required.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 lg:justify-end">
              <Link href="/sign-up" className="flex items-center gap-2 rounded-xl bg-white text-[#0c0f17] px-7 py-3.5 text-sm font-bold transition-all hover:bg-slate-100 shadow-xl shadow-white/10">
                Get started — free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/features" className="flex items-center gap-2 rounded-xl border border-white/10 px-7 py-3.5 text-sm font-medium text-slate-300 hover:text-white hover:border-white/25 transition-all">
                See all features
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
