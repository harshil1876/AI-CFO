import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accounts Payable Automation — CFOlytics",
  description: "Drag in any vendor PDF. Gemini Vision extracts invoice fields, matches Purchase Orders, runs fraud checks, and routes for approval — automatically.",
};

const STEPS = [
  { img: "/marketing-photos/Accounts Payables/AP-1.png", step: "1", title: "Upload Invoice", desc: "Drop any vendor PDF or image into the secure upload zone. Gemini Vision reads it in seconds." },
  { img: "/marketing-photos/Accounts Payables/AP-2.png", step: "2", title: "AI Extraction & Fraud Check", desc: "The system extracts vendor name, amount, line items, and date — then runs integrity checks and assigns a fraud confidence score." },
  { img: "/marketing-photos/Accounts Payables/AP-3.png", step: "3", title: "PO Matching", desc: "The backend cross-references your internal Purchase Order database. Mismatches trigger an instant PO_MISMATCH fraud flag." },
  { img: "/marketing-photos/Accounts Payables/AP-4.png", step: "4", title: "Approve or Reject", desc: "Low-risk invoices are auto-approved by Autopilot. High-risk ones are routed to a human for final sign-off." },
];

export default function AccountsPayablePage() {
  return (
    <div className="min-h-screen bg-[#0c0f17] text-white pt-24">
      <div className="mx-auto max-w-7xl px-6 py-20">

        <div className="flex items-center gap-4 mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Feature — Accounts Payable Automation</p>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
            From PDF to paid.<br />In under 60 seconds.
          </h1>
          <div className="flex flex-col justify-end">
            <p className="text-lg text-slate-400 leading-relaxed">
              Stop manually keying vendor bills into spreadsheets. Drag any invoice PDF into CFOlytics,
              and the Gemini Vision AI parses, validates, and matches it against your internal Purchase
              Orders — flagging fraud and routing it for approval automatically.
            </p>
            <Link href="/sign-up" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white text-[#0c0f17] px-7 py-3.5 text-sm font-bold self-start transition-all hover:bg-slate-100 shadow-xl shadow-white/10">
              Process your first invoice <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* 4-Step Workflow Screenshots */}
        <div className="space-y-6 mb-20">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-8">The 4-step automated pipeline</p>
          {STEPS.map((s) => (
            <div key={s.step} className="grid lg:grid-cols-2 gap-8 items-center border border-[#1e2637] rounded-2xl overflow-hidden bg-[#0f172a] hover:border-violet-500/20 transition-all group">
              <div className="overflow-hidden">
                <img src={s.img} alt={s.title} className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-700" />
              </div>
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="h-8 w-8 rounded-full bg-violet-500/10 border border-violet-500/25 flex items-center justify-center text-sm font-bold text-violet-400">{s.step}</span>
                  <h3 className="text-xl font-bold text-white">{s.title}</h3>
                </div>
                <p className="text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Proof points */}
        <div className="grid md:grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden mb-20">
          {[
            { title: "OCR + AI Extraction", desc: "Gemini Vision reads any invoice — scanned, photographed, or exported. No template required, no fixed format expected." },
            { title: "2-Way PO Matching", desc: "Automatically cross-references vendor names and amounts against your internal Purchase Order database for instant variance detection." },
            { title: "Autopilot Approvals", desc: "Invoices scoring under 15% fraud risk and under your configured threshold are automatically approved — no human needed." },
          ].map((item) => (
            <div key={item.title} className="bg-[#0f172a] p-8">
              <CheckCircle2 className="h-5 w-5 text-violet-400 mb-4" />
              <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 pt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-white font-semibold mb-1">Stop manually entering every vendor bill.</p>
            <p className="text-sm text-slate-500">One upload. Full AI extraction, fraud check, and routing — instantly.</p>
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
