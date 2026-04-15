import Link from "next/link";
import { ArrowRight, BarChart3, TrendingUp, AlertTriangle, MessageSquare, FlaskConical, Database } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features — CFOlytics",
  description: "Everything CFOlytics does: AI chat, anomaly detection, forecasting, simulation, budgets, and reports — all connected to your actual financial data.",
};

const FEATURES = [
  { icon: <MessageSquare className="h-5 w-5 text-blue-400" />, title: "AI Chat CFO", href: "/features/ai-chat", desc: "Ask anything about your finances in plain English. Get answers grounded in your actual numbers, with a confidence score on every response." },
  { icon: <AlertTriangle className="h-5 w-5 text-red-400" />, title: "Anomaly Detection", href: "/features/anomaly-detection", desc: "ML scans every transaction against your spending history. Flags duplicates, unusual amounts, vendor changes, and timing issues automatically." },
  { icon: <TrendingUp className="h-5 w-5 text-purple-400" />, title: "Predictive Forecasting", href: "/features/forecasting", desc: "Revenue and expense projections built from your own patterns — not industry benchmarks. Six months of forward visibility." },
  { icon: <FlaskConical className="h-5 w-5 text-indigo-400" />, title: "What-If Simulation", href: "/features/simulation", desc: "Run 1,000 Monte Carlo simulations for any scenario. Get probability ranges — not optimistic single-point estimates." },
  { icon: <Database className="h-5 w-5 text-amber-400" />, title: "Budget Builder", href: "/features/budget", desc: "AI generates a complete category-level budget from your history. Set instructions, review, adjust, publish — under 10 minutes." },
  { icon: <BarChart3 className="h-5 w-5 text-emerald-400" />, title: "Financial Reports", href: "/features", desc: "One-click P&L, Cash Flow, and Balance Sheet with AI narrative summaries ready to drop into your board pack." },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#0c0f17] text-white pt-24">
      <div className="mx-auto max-w-7xl px-6 py-20">

        {/* Section label */}
        <div className="flex items-center gap-4 mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">What CFOlytics does</p>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {/* Headline split */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
            Five modules. One connected financial system.
          </h1>
          <div className="flex flex-col justify-end">
            <p className="text-lg text-slate-400 leading-relaxed">
              Every feature shares the same underlying data — so insights from your anomaly detection
              feed directly into your forecasts, and your AI chat can reason across all of it at once.
            </p>
            <Link href="/sign-up" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white text-[#0c0f17] px-7 py-3.5 text-sm font-bold self-start transition-all hover:bg-slate-100 shadow-xl shadow-white/10">
              Get started free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Feature grid — border-separated, consistent */}
        <div className="grid lg:grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden mb-24">
          {FEATURES.map((f) => (
            <Link key={f.href} href={f.href}
              className="block bg-[#0f172a] p-8 hover:bg-[#111827] transition-all group">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/[0.03] group-hover:border-white/15 transition-colors">
                {f.icon}
              </div>
              <h2 className="text-base font-semibold text-white mb-2">{f.title}</h2>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              <div className="mt-5 flex items-center gap-1.5 text-xs text-slate-600 group-hover:text-blue-400 transition-colors">
                Deep dive <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA strip */}
        <div className="border-t border-white/5 pt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-white font-semibold mb-1">Everything is connected from day one.</p>
            <p className="text-sm text-slate-500">No integrations to configure between modules. One pipeline, shared intelligence.</p>
          </div>
          <Link href="/sign-up" className="flex-shrink-0 flex items-center gap-2 rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-slate-300 hover:text-white hover:border-white/25 transition-all">
            Start free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
