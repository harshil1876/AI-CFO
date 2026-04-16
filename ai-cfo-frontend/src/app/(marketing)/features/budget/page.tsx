import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Budget Builder — CFOlytics",
  description: "AI generates a complete category-level budget from your financial history. Review, adjust, approve — in under 10 minutes.",
};

const BUDGET_SAMPLE = [
  { category: "Engineering",         amount: "₹18,40,000", rationale: "12-month average + 15% growth + 2 planned hires in Q2" },
  { category: "Marketing",           amount: "₹9,20,000",  rationale: "Increased per your instruction: expand brand in Q1" },
  { category: "Travel & Expenses",   amount: "₹2,30,000",  rationale: "Reduced 20% per your instruction: cut travel costs" },
  { category: "Cloud Infrastructure",amount: "₹4,60,000",  rationale: "18% YoY increase modelled from your AWS trend" },
  { category: "Legal & Compliance",  amount: "₹1,15,000",  rationale: "Flat vs last year — no planned events flagged" },
];

export default function BudgetPage() {
  return (
    <div className="min-h-screen bg-[#0c0f17] text-white pt-24">
      <div className="mx-auto max-w-7xl px-6 py-20">

        {/* Section label */}
        <div className="flex items-center gap-4 mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Feature — Budget Builder</p>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {/* Headline */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
            Your budget,<br />written in 10 seconds.
          </h1>
          <div className="flex flex-col justify-end">
            <p className="text-lg text-slate-400 leading-relaxed">
              Set your growth target, give the AI any special instructions ("cut travel 20%",
              "account for 3 new hires"), pick a period — and get a complete category-level budget
              with a rationale for every line item. In roughly the time it takes to open Excel.
            </p>
            <Link href="/sign-up" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white text-[#0c0f17] px-7 py-3.5 text-sm font-bold self-start transition-all hover:bg-slate-100 shadow-xl shadow-white/10">
              Build my first budget <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Real product screenshots — 5-step workflow */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-6">The full budgeting workflow — 5 screens</p>
          <div className="grid grid-cols-1 gap-4">
            {[
              { img: "/marketing-photos/Budgeting/B-1.png", step: "1", label: "Budget Overview Dashboard" },
              { img: "/marketing-photos/Budgeting/B-2.png", step: "2", label: "Line-item Budget Builder" },
              { img: "/marketing-photos/Budgeting/B-3.png", step: "3", label: "Variance Analysis View" },
              { img: "/marketing-photos/Budgeting/B-4.png", step: "4", label: "Monte Carlo Simulation" },
              { img: "/marketing-photos/Budgeting/B-5.png", step: "5", label: "Approved & Locked Budget" },
            ].map((s) => (
              <div key={s.step} className="rounded-xl overflow-hidden border border-[#1e2637] group hover:border-amber-500/30 transition-all shadow-lg">
                <div className="px-4 py-2.5 bg-[#111827] border-b border-white/5 flex items-center gap-3">
                  <span className="h-6 w-6 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[10px] font-bold text-amber-400">{s.step}</span>
                  <span className="text-xs font-medium text-slate-400">{s.label}</span>
                </div>
                <img src={s.img} alt={s.label} className="w-full object-cover object-top group-hover:scale-[1.01] transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-slate-600 text-center mb-16">↑ Live product screenshots — actual CFOlytics interface</p>

        {/* AI Budget table mockup */}
        <div className="rounded-2xl border border-white/8 bg-[#0f172a] overflow-hidden mb-16">
          <div className="px-6 py-3 border-b border-white/5 bg-[#111827] flex items-center justify-between">
            <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">AI-generated budget draft — Q2 2026</p>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-semibold">Draft</span>
          </div>
          <div className="divide-y divide-white/5">
            <div className="grid grid-cols-3 px-6 py-3 text-[10px] uppercase tracking-widest text-slate-600">
              <span>Category</span>
              <span className="text-right">Allocated</span>
              <span className="pl-4">AI Rationale</span>
            </div>
            {BUDGET_SAMPLE.map((row) => (
              <div key={row.category} className="grid grid-cols-3 px-6 py-4 items-start hover:bg-white/[0.02] transition-colors gap-4">
                <span className="text-sm font-medium text-white">{row.category}</span>
                <span className="text-sm font-bold text-amber-400 text-right">{row.amount}</span>
                <span className="text-xs text-slate-500 leading-relaxed pl-4">{row.rationale}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Four budget modes */}
        <div className="mb-24">
          <div className="flex items-center gap-4 mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Four ways to build</p>
            <div className="flex-1 h-px bg-white/5" />
          </div>
          <div className="grid md:grid-cols-2 gap-px bg-white/5 rounded-2xl overflow-hidden">
            {[
              { title: "AI Draft",          desc: "Give the AI your growth % and any custom instructions. It writes the full budget from your history and explains each line." },
              { title: "Variance Analysis", desc: "Automatically compares budget vs actuals across all categories. Red/green indicators and % variance for each line item." },
              { title: "Monte Carlo",       desc: "Run 1,000 simulations across your expense categories to build a probabilistic 12-month expense tunnel, not a single line." },
              { title: "Excel Import",      desc: "Already have a budget in Excel? Upload with column mapping for direct import — no reformatting required." },
            ].map((item) => (
              <div key={item.title} className="bg-[#0f172a] p-6">
                <h3 className="text-sm font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom strip */}
        <div className="border-t border-white/5 pt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-white font-semibold mb-1">Stop spending 3 days on budget prep.</p>
            <p className="text-sm text-slate-500">Generate, review, adjust, and approve a complete budget in under 15 minutes.</p>
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
