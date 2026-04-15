import Link from "next/link";
import { ArrowRight, Shield } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CFOlytics for Enterprise",
  description: "Role-based access, SOC2-ready audit trail, multi-org structure, and compliance controls for large finance teams.",
};

export default function EnterprisePage() {
  return (
    <div className="min-h-screen bg-[#0c0f17] text-white pt-24">
      <div className="mx-auto max-w-7xl px-6 py-20">

        <div className="flex items-center gap-4 mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Solutions — Enterprise</p>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
            The controls your<br />compliance team expects.
          </h1>
          <div className="flex flex-col justify-end">
            <p className="text-lg text-slate-400 leading-relaxed">
              Large finance teams have different requirements: multi-org structure, role-based access,
              audit trails, and the ability to isolate data across departments and entities. CFOlytics
              handles all of it without a 6-month implementation project.
            </p>
            <Link href="/sign-up" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white text-[#0c0f17] px-7 py-3.5 text-sm font-bold self-start transition-all hover:bg-slate-100 shadow-xl shadow-white/10">
              Request enterprise demo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Feature list */}
        <div className="grid md:grid-cols-2 gap-px bg-white/5 rounded-2xl overflow-hidden mb-16">
          {[
            { icon: <Shield className="h-4 w-4 text-amber-400" />, title: "SOC2-ready audit trail", desc: "Every action logged with timestamp, IP address, and full context — immutably. Export to CSV for compliance reviews at any time." },
            { icon: "🔐", title: "Role-based access", desc: "Admin, Analyst, Viewer — granular permissions across your organization. Members only see what they need to see." },
            { icon: "🌐", title: "Multi-currency & multi-org", desc: "Operate across global subsidiaries with live USD/INR/EUR/GBP conversion. Consolidate or isolate by entity." },
            { icon: "👥", title: "Team collaboration", desc: "Comment on anomalies, assign resolution workflows, track status changes — inside the platform, not scattered across email." },
            { icon: "📋", title: "Board-ready reports", desc: "P&L, Cash Flow, Balance Sheet auto-generated and formatted. AI narrative summaries ready to paste into your board pack." },
            { icon: "🔌", title: "Integration-ready", desc: "Connects to QuickBooks, Tally, Xero, Excel, Google Sheets, and bank feeds via open connectors." },
          ].map((f, i) => (
            <div key={i} className="bg-[#0f172a] p-6 flex gap-4 items-start">
              <div className="flex-shrink-0 text-xl mt-0.5">{typeof f.icon === "string" ? f.icon : <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/8">{f.icon}</span>}</div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-1.5">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 pt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-white font-semibold mb-1">No 6-month implementation. No consultants.</p>
            <p className="text-sm text-slate-500">Working in under a day. Data connected on your schedule.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/solutions/consultants" className="text-sm text-slate-500 hover:text-white transition-colors">For Consultants →</Link>
            <Link href="/sign-up" className="flex items-center gap-2 rounded-xl bg-white text-[#0c0f17] px-6 py-2.5 text-sm font-bold transition-all hover:bg-slate-100">
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
