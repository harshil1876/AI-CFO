import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CFOlytics for Startups",
  description: "Know your runway, track burn, and get investor-ready financials — without a full finance team.",
};

export default function StartupsPage() {
  return (
    <div className="min-h-screen bg-[#0c0f17] text-white pt-24">
      <div className="mx-auto max-w-7xl px-6 py-20">

        <div className="flex items-center gap-4 mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Solutions — Startups</p>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
            Know your runway<br />before you run out.
          </h1>
          <div className="flex flex-col justify-end">
            <p className="text-lg text-slate-400 leading-relaxed">
              You don't need a 10-person finance team to have enterprise-grade financial visibility.
              CFOlytics gives seed-to-Series B startups the clarity of a full CFO office — from day one,
              without the overhead.
            </p>
            <Link href="/sign-up" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white text-[#0c0f17] px-7 py-3.5 text-sm font-bold self-start transition-all hover:bg-slate-100 shadow-xl shadow-white/10">
              Start free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Stage cards */}
        <div className="grid md:grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden mb-16">
          {[
            {
              stage: "Pre-seed / Seed",
              items: ["Burn rate tracking", "Runway calculator", "Investor-ready P&L export", "Anomaly alert on every transaction"],
            },
            {
              stage: "Series A",
              items: ["Department-level variance", "Revenue forecasting model", "Board deck financial slides", "Multi-currency support"],
            },
            {
              stage: "Series B+",
              items: ["Monte Carlo scenario planning", "AI budget drafting", "Audit trail for compliance", "Team collaboration workflows"],
            },
          ].map((s) => (
            <div key={s.stage} className="bg-[#0f172a] p-8">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">{s.stage}</p>
              <ul className="space-y-3">
                {s.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-400">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Pull quote */}
        <div className="rounded-2xl border border-white/8 bg-[#0f172a] p-8 mb-16">
          <p className="text-slate-400 leading-relaxed max-w-2xl">
            Most startup finance tools give you charts. CFOlytics tells you what they mean — "Your runway
            is 11.4 months at current burn, and your AWS spend is 28% above benchmark for your revenue tier."
            That's the difference between a dashboard and a CFO.
          </p>
        </div>

        <div className="border-t border-white/5 pt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-white font-semibold mb-1">Works from day one. Grows with you.</p>
            <p className="text-sm text-slate-500">No implementation project. Connect your data and your dashboard is live in under 10 minutes.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/solutions/enterprise" className="text-sm text-slate-500 hover:text-white transition-colors">For Enterprise →</Link>
            <Link href="/sign-up" className="flex items-center gap-2 rounded-xl bg-white text-[#0c0f17] px-6 py-2.5 text-sm font-bold transition-all hover:bg-slate-100">
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
