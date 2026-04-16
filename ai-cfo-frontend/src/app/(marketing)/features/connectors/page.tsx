import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Connectors — CFOlytics",
  description: "Connect QuickBooks, Tally, Xero, Excel, Google Sheets, and bank feeds. Or just upload a CSV. CFOlytics reads every financial format.",
};

export default function ConnectorsPage() {
  return (
    <div className="min-h-screen bg-[#0c0f17] text-white pt-24">
      <div className="mx-auto max-w-7xl px-6 py-20">

        <div className="flex items-center gap-4 mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Feature — Data Connectors</p>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
            Your data,<br />wherever it lives.
          </h1>
          <div className="flex flex-col justify-end">
            <p className="text-lg text-slate-400 leading-relaxed">
              CFOlytics connects to your existing financial stack in minutes. Pre-built integrations for
              the tools your team already uses — or just drag in an Excel or CSV if that's where your data
              lives today. No data engineers needed.
            </p>
            <Link href="/sign-up" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white text-[#0c0f17] px-7 py-3.5 text-sm font-bold self-start transition-all hover:bg-slate-100 shadow-xl shadow-white/10">
              Connect your data <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Screenshots */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {[
            { img: "/marketing-photos/Connectors/C-1.png", label: "Connector Integration Hub — All available sources" },
            { img: "/marketing-photos/Connectors/C-2.png", label: "Active Connection Status Dashboard" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl overflow-hidden border border-[#1e2637] group hover:border-emerald-500/30 transition-all shadow-xl">
              <div className="px-4 py-2.5 bg-[#111827] border-b border-white/5">
                <span className="text-xs font-medium text-slate-400">{s.label}</span>
              </div>
              <img src={s.img} alt={s.label} className="w-full object-cover object-top group-hover:scale-[1.01] transition-transform duration-500" />
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-600 text-center mb-20">↑ Live product screenshots — actual CFOlytics interface</p>

        {/* Connector list */}
        <div className="mb-20">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-8">Supported integrations</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden">
            {[
              { name: "Excel / CSV Upload", desc: "Drag any .xlsx or .csv — the system auto-detects schema and maps columns." },
              { name: "QuickBooks Online", desc: "Connect via OAuth 2.0. Transactions, invoices, and P&L sync automatically." },
              { name: "Tally ERP", desc: "Import directly from your Tally company XML or via the API bridge." },
              { name: "Google Sheets", desc: "Link any Sheet with financial data and CFOlytics reads it live." },
              { name: "Bank Feeds (OFX)", desc: "Import your bank statement exports for live cash flow tracking." },
              { name: "Custom API", desc: "Enterprise REST API for direct integration with any internal ERP or database." },
            ].map((c) => (
              <div key={c.name} className="bg-[#0f172a] p-6">
                <Zap className="h-4 w-4 text-emerald-400 mb-3" />
                <h3 className="text-sm font-semibold text-white mb-1.5">{c.name}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/5 pt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-white font-semibold mb-1">Connected in minutes. Not months.</p>
            <p className="text-sm text-slate-500">Your data format works. No reformatting. No consultants.</p>
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
