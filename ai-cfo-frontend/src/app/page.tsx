import Link from "next/link";
import { 
  BarChart3, TrendingUp, AlertTriangle, Lightbulb, 
  MessageSquare, FlaskConical, Shield, Zap, Search, 
  ArrowRight, CheckCircle2, Globe, BrainCircuit,
  Lock, Cpu, Database, Workflow
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0c0f17] text-white">
      {/* ═══════════════════════════════════════════ */}
      {/* HEADER / NAVBAR */}
      {/* ═══════════════════════════════════════════ */}
      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#0c0f17]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <img 
              src="/Logo.png" 
              alt="CFOlytics Logo" 
              className="h-10 w-10 object-contain"
            />
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white leading-none">CFOlytics</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-medium">AI CFO Platform</span>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-gray-400 md:flex">
            <a href="#features" className="transition-colors hover:text-white">Features</a>
            <a href="#solutions" className="transition-colors hover:text-white">Solutions</a>
            <a href="#workflow" className="transition-colors hover:text-white">How It Works</a>
            <a href="#about" className="transition-colors hover:text-white">About</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-gray-300 transition-all hover:border-white/25 hover:text-white"
            >
              Log In
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/40"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════ */}
      {/* HERO SECTION */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-20">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-purple-600/10 blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-4 py-1.5 text-xs text-blue-400">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
            Powered by Gemini 2.5 AI
          </div>

          <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            Strategic{" "}
            <span className="bg-gradient-to-r from-slate-200 via-white to-slate-400 bg-clip-text text-transparent">
              Financial Intelligence
            </span>
            <br />
            for the Modern Enterprise
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-400">
            Transform your financial operations with intelligent analytics, predictive forecasting,
            real-time anomaly detection, and conversational insights — all in one enterprise platform.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/sign-up"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:scale-[1.02]"
            >
              Start Free Trial
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
              </svg>
            </Link>
            <a
              href="#workflow"
              className="flex items-center gap-2 rounded-xl border border-white/10 px-8 py-3.5 text-sm font-medium text-gray-300 transition-all hover:border-white/25 hover:text-white"
            >
              See How It Works
            </a>
          </div>

          {/* Trust badges */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-xs text-gray-600">
            <span className="flex items-center gap-2">🔒 Bank-Level Security</span>
            <span className="flex items-center gap-2">⚡ Real-Time Analytics</span>
            <span className="flex items-center gap-2">🤖 Gemini 2.5 AI</span>
            <span className="flex items-center gap-2">☁️ Azure Cloud</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* FEATURES SECTION */}
      {/* ═══════════════════════════════════════════ */}
      <section id="features" className="relative px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-blue-400">Features</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              Everything a CFO Needs,{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Powered by AI
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-500">
              Our intelligence engine combines machine learning, predictive analytics, and conversational AI to deliver enterprise-grade financial insights.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <BarChart3 className="text-blue-400" size={24} />,
                title: "Descriptive Analytics",
                desc: "Automated KPI calculation — revenue, expenses, profit margins, burn rate, and runway. Updated in real-time as new data flows in.",
                gradient: "from-blue-500/5 to-cyan-500/5",
              },
              {
                icon: <TrendingUp className="text-purple-400" size={24} />,
                title: "Predictive Forecasting",
                desc: "Prophet-powered revenue projections with confidence intervals. See where your finances are headed months in advance.",
                gradient: "from-purple-500/5 to-pink-500/5",
              },
              {
                icon: <AlertTriangle className="text-red-400" size={24} />,
                title: "Anomaly Detection",
                desc: "Isolation Forest ML detects unusual transactions in real-time. Severity levels from Low to Critical with automatic alerting.",
                gradient: "from-red-500/5 to-orange-500/5",
              },
              {
                icon: <Lightbulb className="text-amber-400" size={24} />,
                title: "Strategic Recommendations",
                desc: "AI-generated, prioritized action items based on your KPIs. From cost optimization to growth opportunities.",
                gradient: "from-amber-500/5 to-yellow-500/5",
              },
              {
                icon: <MessageSquare className="text-emerald-400" size={24} />,
                title: "Conversational CFO",
                desc: "Chat with your AI CFO using natural language. Powered by Gemini with RAG context from your actual financial data.",
                gradient: "from-emerald-500/5 to-green-500/5",
              },
              {
                icon: <FlaskConical className="text-indigo-400" size={24} />,
                title: "What-If Simulation",
                desc: "Test hypothetical scenarios before making decisions. See projected impact on KPIs with risk-level assessment.",
                gradient: "from-indigo-500/5 to-blue-500/5",
              },
            ].map((f, i) => (
              <div
                key={i}
                className={`group rounded-2xl border border-white/5 bg-[#121622]/50 p-8 transition-all hover:border-blue-500/20 hover:bg-[#121622] hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1`}
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold text-white">{f.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* SOLUTIONS / USE CASES */}
      {/* ═══════════════════════════════════════════ */}
      <section id="solutions" className="relative px-6 py-24 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-purple-400">Solutions</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              Built for Every{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Financial Challenge
              </span>
            </h2>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2">
            {[
              {
                title: "Startups & Scaleups",
                desc: "Track burn rate, calculate runway, and get survival-critical recommendations before cash runs out.",
                bullets: ["Runway forecasting", "Burn rate optimization", "Growth & Unit Economics"],
                tag: "Bestseller",
              },
              {
                title: "Enterprise Finance",
                desc: "Multi-department budget analysis, cross-organizational anomaly detection, and boardroom-ready insights.",
                bullets: ["Consolidated Reporting", "RBAC & Multi-tenancy", "Audit-ready Trails"],
                tag: "Enterprise",
              },
              {
                title: "Strategic Consultants",
                desc: "Manage multiple client portfolios from a single command center with isolated data and custom reports.",
                bullets: ["Client Workspace Isolation", "White-label reports", "Portfolio-wide analytics"],
                tag: "Partners",
              },
              {
                title: "C-Suite & Executives",
                desc: "Get data-backed answers instantly through natural language queries. No manual reporting overhead.",
                bullets: ["Boardroom Intelligence", "Scenario Planning", "Real-time Risk Alerts"],
                tag: "Executive",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-white/5 bg-[#121622]/40 p-8 transition-all hover:border-blue-500/20"
              >
                <div className="mb-4 inline-flex rounded-full border border-blue-500/20 bg-blue-500/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-400">
                  {s.tag}
                </div>
                <h3 className="text-xl font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{s.desc}</p>
                <ul className="mt-6 space-y-3">
                  {s.bullets.map((b, bi) => (
                    <li key={bi} className="flex items-center gap-3 text-sm text-slate-300">
                      <CheckCircle2 size={14} className="text-blue-500" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* HOW IT WORKS / WORKFLOW */}
      {/* ═══════════════════════════════════════════ */}
      <section id="workflow" className="relative px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-emerald-400">How It Works</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              From Raw Data to{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                Actionable Intelligence
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-gray-500">
              Four simple steps to transform your financial operations.
            </p>
          </div>

          <div className="mt-16 space-y-0">
            {[
              {
                step: "01",
                title: "Ingest & Map",
                desc: "Seamlessly connect your data sources or upload any financial document. Our AI maps the schema instantly.",
                icon: <Database className="text-blue-400" size={20} />,
              },
              {
                step: "02",
                title: "Analyze & Predict",
                desc: "CFOlytics processes historical data to detect anomalies and project future performance.",
                icon: <BrainCircuit className="text-purple-400" size={20} />,
              },
              {
                step: "03",
                title: "Interact & Query",
                desc: "Ask deep strategic questions using the Conversational Intelligence engine powered by Gemini.",
                icon: <MessageSquare className="text-emerald-400" size={20} />,
              },
              {
                step: "04",
                title: "Simulate & Execute",
                desc: "Run high-fidelity simulations for 'What-If' scenarios and move from insights to execution.",
                icon: <Zap className="text-amber-400" size={20} />,
              },
            ].map((s, i) => (
              <div key={i} className="relative flex gap-8 pb-12">
                {/* Connector line */}
                {i < 3 && (
                  <div className="absolute left-6 top-14 h-full w-px bg-gradient-to-b from-blue-500/20 to-transparent" />
                )}
                {/* Step container */}
                <div className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#121622] shadow-xl`}>
                  {s.icon}
                </div>
                {/* Content */}
                <div className="pt-1">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{s.step}</span>
                    <h3 className="text-lg font-semibold text-white">{s.title}</h3>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400 max-w-lg">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* PRODUCT HIGHLIGHTS */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative px-6 py-24 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-amber-400">Product</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              Enterprise-Grade{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Technology Stack
              </span>
            </h2>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-4">
            {[
              { icon: <Cpu className="text-blue-400" size={24} />, name: "Gemini AI", desc: "Enterprise-grade multimodal intelligence" },
              { icon: <TrendingUp className="text-purple-400" size={24} />, name: "Forecasting", desc: "Prophet-powered financial modeling" },
              { icon: <Search className="text-red-400" size={24} />, name: "Analytic Engine", desc: "ML-based anomaly and trend detection" },
              { icon: <Database className="text-emerald-400" size={24} />, name: "Secure Storage", desc: "Encrypted, high-performance RAG vector DB" },
              { icon: <Shield className="text-amber-400" size={24} />, name: "Bank-Grade security", desc: "Advanced RBAC and Row Level Security" },
              { icon: <Lock className="text-indigo-400" size={24} />, name: "B2B Auth", desc: "Secure enterprise identity management" },
              { icon: <Globe className="text-cyan-400" size={24} />, name: "Cloud Ready", desc: "Azure-powered scale and reliability" },
              { icon: <Workflow className="text-orange-400" size={24} />, name: "Automations", desc: "Intelligent financial workflow triggers" },
            ].map((t, i) => (
              <div key={i} className="group rounded-xl border border-white/5 bg-[#121622]/50 p-6 text-center transition-all hover:border-blue-500/20 hover:bg-[#121622]">
                <div className="mb-3 flex justify-center group-hover:scale-110 transition-transform">{t.icon}</div>
                <h4 className="text-sm font-bold text-white">{t.name}</h4>
                <p className="mt-1 text-[11px] text-slate-500 leading-tight">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* ABOUT SECTION */}
      {/* ═══════════════════════════════════════════ */}
      <section id="about" className="relative px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-blue-400">About</p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">
            Redefining{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Financial Intelligence
            </span>
          </h2>
          <p className="mt-6 text-slate-400 leading-relaxed">
            CFOlytics is an enterprise-grade financial intelligence platform that combines the power of
            machine learning, predictive analytics, and conversational AI to provide real-time strategic
            insights. Built for the modern enterprise, it transforms raw financial data into
            actionable boardroom intelligence — empowering organizations to lead with precision.
          </p>
          <p className="mt-4 text-slate-500 leading-relaxed text-sm">
            Our platform leverages advanced Gemini AI for natural language understanding,
            integrated forecasting models, and intelligent anomaly detection, all served on
            secure cloud infrastructure.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-8">
            {[
              { value: "99.9%", label: "Uptime SLA" },
              { value: "<2s", label: "Response Time" },
              { value: "256-bit", label: "Encryption" },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {s.value}
                </div>
                <p className="mt-1 text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* CTA SECTION */}
      {/* ═══════════════════════════════════════════ */}
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-2xl rounded-3xl border border-white/5 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-blue-600/10 p-12 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to Transform Your Enterprise?</h2>
          <p className="mt-4 text-slate-400">
            Join the forward-thinking organizations using CFOlytics to drive strategic financial growth.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard"
              className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:scale-[1.02]"
            >
              Get Started — It&apos;s Free
            </Link>
            <a
              href="#features"
              className="rounded-xl border border-white/10 px-8 py-3.5 text-sm font-medium text-gray-300 transition-all hover:border-white/25"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* FOOTER */}
      {/* ═══════════════════════════════════════════ */}
      <footer className="border-t border-white/5 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-4">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3">
                <img src="/Logo.png" alt="Logo" className="h-8 w-8" />
                <span className="text-sm font-bold text-white">CFOlytics</span>
              </div>
              <p className="mt-3 text-xs text-slate-500 leading-relaxed">
                The next-generation AI platform for enterprise financial intelligence.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Product</h4>
              <ul className="mt-3 space-y-2 text-xs text-gray-600">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#solutions" className="hover:text-white transition-colors">Solutions</a></li>
                <li><a href="#workflow" className="hover:text-white transition-colors">How It Works</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Company</h4>
              <ul className="mt-3 space-y-2 text-xs text-gray-600">
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Connect</h4>
              <ul className="mt-3 space-y-2 text-xs text-gray-600">
                <li><a href="https://github.com/harshil1876/AI-CFO" target="_blank" className="hover:text-white transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-white/5 pt-6 text-center text-[10px] uppercase tracking-widest text-slate-700">
            © {new Date().getFullYear()} CFOlytics. All rights reserved. Precision in Intelligence.
          </div>
        </div>
      </footer>
    </div>
  );
}
