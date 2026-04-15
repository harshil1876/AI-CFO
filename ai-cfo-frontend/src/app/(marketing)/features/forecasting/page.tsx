import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Predictive Forecasting — CFOlytics",
  description: "Revenue and expense projections built from your own historical data — not industry benchmarks. Six months of forward visibility.",
};

export default function ForecastingPage() {
  return (
    <div className="min-h-screen bg-[#0c0f17] text-white pt-24">
      <div className="mx-auto max-w-7xl px-6 py-20">

        {/* Section label */}
        <div className="flex items-center gap-4 mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Feature — Predictive Forecasting</p>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {/* Headline */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
            Six months ahead.<br />Built on your own data.
          </h1>
          <div className="flex flex-col justify-end">
            <p className="text-lg text-slate-400 leading-relaxed">
              Most forecasting tools use industry benchmarks as a baseline. CFOlytics builds its model
              entirely from your own transaction history — so the projections reflect your actual seasonal
              patterns, growth trajectory, and cost structure.
            </p>
            <Link href="/sign-up" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white text-[#0c0f17] px-7 py-3.5 text-sm font-bold self-start transition-all hover:bg-slate-100 shadow-xl shadow-white/10">
              Get your first forecast <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Forecast bar mockup */}
        <div className="rounded-2xl border border-white/8 bg-[#0f172a] p-6 mb-16">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-6">Revenue forecast — next 6 months</p>
          <div className="space-y-3">
            {[
              { month: "May", actual: null, forecast: 48, pct: 48 },
              { month: "Jun", actual: null, forecast: 52, pct: 52 },
              { month: "Jul", actual: null, forecast: 57, pct: 57 },
              { month: "Aug", actual: null, forecast: 61, pct: 61 },
              { month: "Sep", actual: null, forecast: 66, pct: 66 },
              { month: "Oct", actual: null, forecast: 72, pct: 72 },
            ].map((row) => (
              <div key={row.month} className="flex items-center gap-4">
                <span className="text-xs text-slate-500 w-8 flex-shrink-0">{row.month}</span>
                <div className="flex-1 h-6 bg-white/5 rounded overflow-hidden relative">
                  <div className="h-full rounded bg-blue-500/30 border border-blue-500/20 flex items-center" style={{ width: `${row.pct}%` }}>
                    <span className="text-[10px] text-blue-300 pl-3 font-medium">₹{row.forecast}L</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-600 mt-4">Projected based on 12-month trailing average with seasonality adjustment.</p>
        </div>

        {/* What gets forecasted */}
        <div className="mb-24">
          <div className="flex items-center gap-4 mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">What gets forecasted</p>
            <div className="flex-1 h-px bg-white/5" />
          </div>
          <div className="grid md:grid-cols-2 gap-px bg-white/5 rounded-2xl overflow-hidden">
            {[
              { title: "Revenue trajectory", desc: "Monthly projection using your growth trend and seasonal adjustment, out to 6 months." },
              { title: "Expense patterns", desc: "Category-level spend forecast with anomaly guards — unusual spikes are flagged in the projection." },
              { title: "Cash flow position", desc: "Rolling 12-month estimate of your cash position based on inflows and outflows." },
              { title: "Profit margin trend", desc: "Forward-looking margin analysis with risk flags when margin compression is likely." },
            ].map((item) => (
              <div key={item.title} className="bg-[#0f172a] p-6">
                <h3 className="text-sm font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Accuracy note */}
        <div className="rounded-2xl border border-white/8 bg-[#0f172a] p-8 mb-16">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-4">How accuracy works</p>
          <p className="text-slate-400 leading-relaxed max-w-2xl">
            Accuracy is calibrated against your own history using 90-day rolling backtests. The model
            shows you its confidence interval, not just a single line — so you can see the realistic
            range of outcomes, not just the optimistic one.
          </p>
        </div>

        {/* Bottom strip */}
        <div className="border-t border-white/5 pt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-white font-semibold mb-1">Stop being surprised by your own numbers.</p>
            <p className="text-sm text-slate-500">Build your first 6-month forecast in under 10 minutes after connecting your data.</p>
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
