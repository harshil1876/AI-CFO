import Link from "next/link";
import { ArrowRight, MessageSquare, ShieldCheck, Sparkles } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Chat CFO — CFOlytics",
  description: "Ask any financial question in plain English. Your AI CFO answers with your actual numbers and a confidence score in under 3 seconds.",
};

export default function AIChatPage() {
  return (
    <div className="min-h-screen bg-[#0c0f17] text-white pt-24">
      <div className="mx-auto max-w-7xl px-6 py-20">

        {/* Section label */}
        <div className="flex items-center gap-4 mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Feature — AI Chat CFO</p>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {/* Headline */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
            Your financial data,<br />answered out loud.
          </h1>
          <div className="flex flex-col justify-end">
            <p className="text-lg text-slate-400 leading-relaxed">
              Stop re-running pivot tables every time someone asks a question. Ask CFOlytics in plain
              English and get an answer grounded in your actual numbers — with a confidence rating — in under 3 seconds.
            </p>
            <Link href="/sign-up" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white text-[#0c0f17] px-7 py-3.5 text-sm font-bold self-start transition-all hover:bg-slate-100 shadow-xl shadow-white/10">
              Try AI Chat free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Chat demo — looks like a real product */}
        <div className="rounded-2xl border border-white/8 bg-[#0f172a] overflow-hidden mb-24">
          <div className="flex items-center gap-3 border-b border-white/5 bg-[#111827] px-6 py-4">
            <div className="h-8 w-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <MessageSquare className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Aria — Finance Analyst</p>
              <p className="text-xs text-slate-500">AI Specialist · Online</p>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {[
              { role: "user", text: "Why did our expenses jump 23% in March?" },
              {
                role: "ai",
                text: "Your March expenses rose ₹18.4L — three things drove it:\n\n1. Engineering hires: ₹7.2L for 3 new joins\n2. AWS infrastructure: ₹4.8L from the product launch scale-up\n3. Marketing campaign: ₹6.4L for the Q1 brand push\n\nThis was planned spend. Your net margin is still 18.2%, within the 15%+ target.",
                confidence: "high",
              },
              { role: "user", text: "What's our runway at this burn rate?" },
              {
                role: "ai",
                text: "Current monthly burn: ₹42.3L. Cash position: ₹4.8Cr.\n\nRunway: approximately 11.4 months.\n\nOne flag — AWS spend is 28% above benchmark for your revenue tier. Worth reviewing before next quarter.",
                confidence: "high",
              },
            ].map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[78%] rounded-2xl px-5 py-4 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white/5 border border-white/8 text-slate-200"
                }`}>
                  <p className="whitespace-pre-line">{msg.text}</p>
                  {msg.confidence && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-[10px] font-semibold text-emerald-400">
                        <ShieldCheck className="h-2.5 w-2.5" /> High confidence
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-blue-500/20 bg-blue-500/5 text-[10px] text-blue-400">
                        <Sparkles className="h-2.5 w-2.5" /> Grounded in your data
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Three things that matter */}
        <div className="grid lg:grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden mb-24">
          {[
            { title: "It uses your numbers", desc: "Responses cite your actual revenue, expenses, and categorized transactions — not industry averages or generic advice." },
            { title: "Confidence on every answer", desc: "Each response is tagged High, Medium, or Low confidence based on whether it's reading directly from your data." },
            { title: "Five specialist personas", desc: "Switch between Finance Analyst, Tax Advisor, Operations CFO, Investor Relations, and Risk Officer for different angles on the same data." },
          ].map((item) => (
            <div key={item.title} className="bg-[#0f172a] p-8">
              <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Bottom nav strip */}
        <div className="border-t border-white/5 pt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-white font-semibold mb-1">Ready to ask your first question?</p>
            <p className="text-sm text-slate-500">Upload any financial data file and ask anything within 10 minutes.</p>
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
