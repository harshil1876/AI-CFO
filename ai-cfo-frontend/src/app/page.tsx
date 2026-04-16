import Link from "next/link";
import MarketingHeader from "@/components/MarketingHeader";
import {
  BarChart3, TrendingUp, AlertTriangle, MessageSquare,
  FlaskConical, Shield, ArrowRight, CheckCircle2,
  Database, Zap, Lock
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0c0f17] text-white">
      <MarketingHeader />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center px-6 pt-24 pb-16 overflow-hidden">
        {/* Subtle background — two off-center orbs, not centered soup */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/3 -left-20 h-[500px] w-[500px] rounded-full bg-blue-700/10 blur-[160px]" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-indigo-700/8 blur-[140px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — the pitch */}
            <div>
              <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-blue-500/20 bg-blue-500/5 px-4 py-1.5 text-xs text-blue-400 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                Powered by Gemini 2.5 Pro
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
                Your finance team's <br />
                <span className="text-slate-400">missing member.</span>
              </h1>

              <p className="mt-6 text-lg text-slate-400 leading-relaxed max-w-lg">
                CFOlytics connects to your financial data and answers the questions your analysts
                spend days on — in seconds. Anomaly detection, forecasting, reports, and
                conversational AI in one place.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/sign-up"
                  className="flex items-center gap-2 rounded-xl bg-white text-[#0c0f17] px-7 py-3.5 text-sm font-bold transition-all hover:bg-slate-100 shadow-xl shadow-white/10">
                  Start for free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/how-it-works"
                  className="flex items-center gap-2 rounded-xl border border-white/10 px-7 py-3.5 text-sm font-medium text-slate-300 transition-all hover:border-white/25 hover:text-white">
                  See how it works
                </Link>
              </div>

              {/* Social proof — real-feeling, not marketing-speak */}
              <div className="mt-12 flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Lock className="h-3.5 w-3.5 text-slate-600" />
                  No credit card required
                </div>
                <div className="h-4 w-px bg-white/10" />
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <CheckCircle2 className="h-3.5 w-3.5 text-slate-600" />
                  Works with any Excel / CSV
                </div>
                <div className="h-4 w-px bg-white/10" />
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Zap className="h-3.5 w-3.5 text-slate-600" />
                  Live in under 10 minutes
                </div>
              </div>
            </div>

            {/* Right — a product illustration: flagship screenshot */}
            <div className="relative hidden lg:block perspective-1000">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/10 to-transparent rounded-3xl" />
              <div className="relative transform rotate-y-[-5deg] rotate-x-[5deg] transition-transform hover:scale-[1.02] duration-700">
                <img 
                  src="/marketing-photos/Overview/OVER-1.png" 
                  alt="CFOlytics Main Dashboard Overview" 
                  className="rounded-xl border border-[#1e2637] shadow-2xl shadow-blue-500/20 w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT IT DOES (editorial, not grid-cards) ─────────────────────── */}
      <section id="features" className="px-6 py-24 border-t border-white/5">
        <div className="mx-auto max-w-7xl">
          {/* Section label */}
          <div className="flex items-center gap-4 mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">What CFOlytics does</p>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* Feature 1 — full width intro */}
          <div className="mb-20 grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold leading-tight text-white">
                Stops anomalies before your accountant finds them weeks later.
              </h2>
            </div>
            <div>
              <p className="text-slate-400 leading-relaxed">
                CFOlytics runs every transaction through an ML model trained on your spending patterns.
                Duplicate payments, unusual vendor amounts, timing deviations — it flags them with a
                risk score and routes them directly to your team for resolution. No more month-end surprises.
              </p>
              <Link href="/features/anomaly-detection"
                className="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                See anomaly detection <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Feature list — Real App Screenshots */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                img: "/marketing-photos/AI CFO Chat/AI-CFO-CHAT-1.png",
                title: "Ask anything in plain English",
                desc: "\"Why did expenses jump in March?\" — your AI CFO answers with specific numbers, not generic advice, in under 3 seconds.",
                link: "/features/ai-chat",
              },
              {
                img: "/marketing-photos/Budgeting/B-1.png",
                title: "Budgets that write themselves",
                desc: "Set your growth %, give instructions, and get a complete category-level budget draft with AI rationale per line.",
                link: "/features/budget",
              },
              {
                img: "/marketing-photos/Anomaly Hub/AH-1.png",
                title: "Spot anomalies instantly",
                desc: "Every transaction runs through 7 machine learning layers. Vendor duplicates and timeline variance are caught before accountants see them.",
                link: "/features/anomaly-detection",
              },
              {
                img: "/marketing-photos/Finance Report/FR-1.png",
                title: "Reports in one click",
                desc: "P&L, Cash Flow, Balance Sheet — auto-generated from your data. With AI narrative summaries ready to paste into your board pack.",
                link: "/marketing-photos/Finance Report/FR-1.pdf",
                isPdfLink: true
              },
              {
                img: "/marketing-photos/Audit Trails/AT-1.png",
                title: "Every action logged, immutably",
                desc: "SOC2-ready audit trail. Who did what, when, from where. Exportable CSV for compliance reviews.",
                link: "/solutions/enterprise",
              },
              {
                img: "/marketing-photos/Accounts Payables/AP-1.png",
                title: "Automated Payables (OCR)",
                desc: "Drag in vendor PDFs. Vision AI extracts invoices, matches Purchase Orders, and runs fraud checks entirely on Autopilot.",
                link: "/features/accounts-payable",
              },
            ].map((f, i) => (
              <a key={i} href={f.link} target={f.isPdfLink ? "_blank" : "_self"}
                className="block bg-[#0f172a] hover:bg-[#111827] transition-all group rounded-2xl overflow-hidden border border-white/5 hover:border-white/20 shadow-lg">
                <div className="h-44 w-full bg-[#0a0d14] border-b border-white/5 overflow-hidden group-hover:scale-105 transition-transform duration-700">
                  <img src={f.img} alt={f.title} className="w-full h-full object-cover object-top opacity-90 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-6">
                  <h3 className="text-base font-bold text-white mb-2 leading-snug">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-slate-600 group-hover:text-blue-400 transition-colors">
                    {f.isPdfLink ? "Download PDF Sample" : "Explore Feature"} <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO IT'S FOR ──────────────────────────────────────────────────── */}
      <section id="solutions" className="px-6 py-24 border-t border-white/5">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-4 mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Who it's for</p>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                tag: "Startups",
                headline: "Know your runway before you run out.",
                desc: "Burn rate, cash position, and investor-ready financials — without a full finance team. CFOlytics works for a team of 3 the same as a team of 300.",
                bullets: ["Runway calculator", "Burn rate monitoring", "Investor-ready P&L"],
                href: "/solutions/startups",
                accent: "border-blue-500/20",
              },
              {
                tag: "Enterprise",
                headline: "Compliance, controls, and scale.",
                desc: "Role-based access, multi-org structure, SOC2-ready audit trail, and department-level variance analysis for complex organizations.",
                bullets: ["RBAC & multi-tenancy", "Audit trail exports", "Consolidated reporting"],
                href: "/solutions/enterprise",
                accent: "border-slate-500/20",
              },
              {
                tag: "Consultants",
                headline: "Do 10x the analysis in the same time.",
                desc: "Upload a client's Excel, run the pipeline, and deliver a full financial review — P&L, anomalies, forecasts, narrative summary — in under 5 minutes.",
                bullets: ["Client workspace isolation", "One-click board reports", "AI narrative summaries"],
                href: "/solutions/consultants",
                accent: "border-indigo-500/20",
              },
              {
                tag: "Executives",
                headline: "Stop waiting 3 days for analyst reports.",
                desc: "Ask your AI CFO anything. Set KPI targets and watch a live gauge track progress. Get board-ready reports with a single click.",
                bullets: ["Live KPI dashboard", "Natural language queries", "Real-time anomaly alerts"],
                href: "/solutions/executives",
                accent: "border-emerald-500/20",
              },
            ].map((s) => (
              <Link key={s.tag} href={s.href}
                className={`group block rounded-2xl border ${s.accent} bg-[#0f172a] p-8 hover:bg-[#111827] transition-all`}>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{s.tag}</span>
                <h3 className="mt-3 text-xl font-bold text-white leading-tight">{s.headline}</h3>
                <p className="mt-3 text-sm text-slate-400 leading-relaxed">{s.desc}</p>
                <ul className="mt-5 space-y-2">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2.5 text-xs text-slate-500">
                      <span className="h-1 w-1 rounded-full bg-slate-500 flex-shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-slate-600 group-hover:text-white transition-colors">
                  Learn more <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="workflow" className="px-6 py-24 border-t border-white/5">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-4 mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">How it works</p>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
              From your spreadsheet to AI insights — in minutes, not months.
            </h2>
            <p className="text-slate-400 leading-relaxed">
              There's no 6-month implementation, no SQL skills required, no data engineers needed. 
              Upload your data and your dashboard is live. Everything else follows automatically.
            </p>
          </div>

          <div className="space-y-6">
            {[
              { n: "1", title: "Connect your data", desc: "Upload Excel or CSV. Or connect QuickBooks, Tally, bank feeds. CFOlytics reads any financial format and maps it automatically." },
              { n: "2", title: "AI runs the pipeline", desc: "The intelligence engine extracts KPIs, detects anomalies, fits your forecast model, and generates financial statements. Happens automatically, every time." },
              { n: "3", title: "Explore your live dashboard", desc: "Revenue, expenses, profit, anomaly feed, trend charts — all in real time. Target KPI tracking with a live progress gauge." },
              { n: "4", title: "Ask questions, share reports, take action", desc: "Chat with your AI CFO. Export PDF reports. Resolve anomalies with your team. Simulate scenarios. Everything flows from the same data." },
            ].map((step) => (
              <div key={step.n}
                className="flex gap-6 items-start border-b border-white/5 pb-6 last:border-0 last:pb-0">
                <div className="flex-shrink-0 w-8 h-8 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center text-xs font-bold text-slate-500">
                  {step.n}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ─────────────────────────────────────────────────────────── */}
      <section id="about" className="px-6 py-24 border-t border-white/5">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-6">About CFOlytics</p>
              <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight mb-6">
                Built because finance teams deserve better tools.
              </h2>
              <p className="text-slate-400 leading-relaxed mb-4">
                Most finance software is built for accountants who know how to use it. CFOlytics is built
                for the people running the business — founders, executives, operators — who need answers
                fast without learning new software.
              </p>
              <p className="text-slate-500 text-sm leading-relaxed">
                It runs on Azure, uses Gemini AI for natural language understanding, and connects your
                raw financial data to intelligent answers in a way that previously required a team of
                analysts, data scientists, and finance software experts.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "< 10 min", label: "Average setup time" },
                { value: "< 3 sec", label: "Per AI response" },
                { value: "1,000×", label: "Monte Carlo runs" },
                { value: "6 types", label: "Anomaly risk categories" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/8 bg-[#0f172a] p-6">
                  <p className="text-2xl font-bold text-white mb-1">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="px-6 py-24 border-t border-white/5">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
            Your data is waiting to tell you something.
          </h2>
          <p className="text-slate-400 mb-10 text-lg">
            Upload a file, connect your data source, and ask your first question. It takes under 10 minutes.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/sign-up"
              className="flex items-center gap-2 rounded-xl bg-white text-[#0c0f17] px-8 py-4 text-sm font-bold transition-all hover:bg-slate-100 shadow-xl shadow-white/10">
              Get started — it's free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/how-it-works"
              className="flex items-center gap-2 rounded-xl border border-white/10 px-8 py-4 text-sm font-medium text-slate-300 transition-all hover:border-white/20 hover:text-white">
              How it works
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <img src="/Logo.png" alt="Logo" className="h-7 w-7" />
                <span className="text-sm font-bold text-white">CFOlytics</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                AI-native financial intelligence for modern teams.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-3">Product</h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-3">Solutions</h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li><Link href="/solutions/startups" className="hover:text-white transition-colors">Startups</Link></li>
                <li><Link href="/solutions/enterprise" className="hover:text-white transition-colors">Enterprise</Link></li>
                <li><Link href="/solutions/consultants" className="hover:text-white transition-colors">Consultants</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-3">Connect</h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li><Link href="/sign-in" className="hover:text-white transition-colors">Log In</Link></li>
                <li><Link href="/sign-up" className="hover:text-white transition-colors">Sign Up</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[10px] text-slate-700">© {new Date().getFullYear()} CFOlytics. All rights reserved.</p>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All systems operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
