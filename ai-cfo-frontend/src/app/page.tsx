import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#060a14] text-white">
      {/* ═══════════════════════════════════════════ */}
      {/* HEADER / NAVBAR */}
      {/* ═══════════════════════════════════════════ */}
      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#060a14]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold shadow-lg shadow-blue-500/20">
              ₹
            </div>
            <span className="text-lg font-bold tracking-tight">AI CFO</span>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-gray-400 md:flex">
            <a href="#features" className="transition-colors hover:text-white">Features</a>
            <a href="#solutions" className="transition-colors hover:text-white">Solutions</a>
            <a href="#workflow" className="transition-colors hover:text-white">How It Works</a>
            <a href="#about" className="transition-colors hover:text-white">About</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-gray-300 transition-all hover:border-white/25 hover:text-white"
            >
              Log In
            </Link>
            <Link
              href="/dashboard"
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
            Your{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              AI-Powered
            </span>
            <br />
            Chief Financial Officer
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-400">
            Transform your financial operations with intelligent analytics, predictive forecasting,
            real-time anomaly detection, and conversational insights — all in one enterprise platform.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard"
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
                icon: "📊",
                title: "Descriptive Analytics",
                desc: "Automated KPI calculation — revenue, expenses, profit margins, burn rate, and runway. Updated in real-time as new data flows in.",
                gradient: "from-blue-500/10 to-cyan-500/10",
              },
              {
                icon: "🔮",
                title: "Predictive Forecasting",
                desc: "Prophet-powered revenue projections with confidence intervals. See where your finances are headed months in advance.",
                gradient: "from-purple-500/10 to-pink-500/10",
              },
              {
                icon: "🚨",
                title: "Anomaly Detection",
                desc: "Isolation Forest ML detects unusual transactions in real-time. Severity levels from Low to Critical with automatic alerting.",
                gradient: "from-red-500/10 to-orange-500/10",
              },
              {
                icon: "💡",
                title: "Prescriptive Recommendations",
                desc: "AI-generated, prioritized action items based on your KPIs. From cost optimization to growth opportunities.",
                gradient: "from-amber-500/10 to-yellow-500/10",
              },
              {
                icon: "💬",
                title: "Conversational CFO",
                desc: "Chat with your AI CFO using natural language. Powered by Gemini 2.5 with RAG context from your actual financial data.",
                gradient: "from-emerald-500/10 to-green-500/10",
              },
              {
                icon: "🧪",
                title: "What-If Simulation",
                desc: "Test hypothetical scenarios before making decisions. See projected impact on KPIs with risk-level assessment.",
                gradient: "from-indigo-500/10 to-blue-500/10",
              },
            ].map((f, i) => (
              <div
                key={i}
                className={`group rounded-2xl border border-white/5 bg-gradient-to-br ${f.gradient} p-6 transition-all hover:border-white/10 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1`}
              >
                <div className="text-3xl">{f.icon}</div>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">{f.desc}</p>
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
                title: "Startups & SMBs",
                desc: "Track burn rate, calculate runway, and get survival-critical recommendations before cash runs out.",
                bullets: ["Runway forecasting", "Expense optimization", "Growth metrics"],
                tag: "Most Popular",
              },
              {
                title: "Enterprise Finance Teams",
                desc: "Multi-department budget analysis, cross-organizational anomaly detection, and board-ready insights.",
                bullets: ["Department-level analytics", "Multi-tenancy", "Compliance alerts"],
                tag: "Enterprise",
              },
              {
                title: "Financial Consultants",
                desc: "Manage multiple client portfolios from a single dashboard. Each client gets isolated data and custom reports.",
                bullets: ["Client isolation", "White-label ready", "Bulk analytics"],
                tag: "Professional",
              },
              {
                title: "CFOs & C-Suite",
                desc: "Ask questions in plain English, get data-backed answers instantly. No more waiting for reports.",
                bullets: ["Natural language Q&A", "Scenario planning", "Risk alerts"],
                tag: "Executive",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition-all hover:border-white/10"
              >
                <div className="mb-4 inline-flex rounded-full border border-blue-500/20 bg-blue-500/5 px-3 py-1 text-xs font-medium text-blue-400">
                  {s.tag}
                </div>
                <h3 className="text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-gray-400">{s.desc}</p>
                <ul className="mt-4 space-y-2">
                  {s.bullets.map((b, bi) => (
                    <li key={bi} className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
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
                title: "Upload Your Data",
                desc: "Drag and drop any financial file — CSV, Excel, JSON. Our AI auto-detects the schema and generates an intelligent summary.",
                color: "blue",
              },
              {
                step: "02",
                title: "Run the Intelligence Pipeline",
                desc: "One click triggers KPI computation, Prophet forecasting, anomaly detection, and prescriptive recommendation generation.",
                color: "purple",
              },
              {
                step: "03",
                title: "Chat with Your AI CFO",
                desc: "Ask questions in natural language. The AI retrieves your actual financial data via RAG and provides data-backed answers.",
                color: "emerald",
              },
              {
                step: "04",
                title: "Simulate & Decide",
                desc: "Test what-if scenarios before committing. See projected impacts on revenue, margins, and runway with risk assessment.",
                color: "amber",
              },
            ].map((s, i) => (
              <div key={i} className="relative flex gap-8 pb-12">
                {/* Connector line */}
                {i < 3 && (
                  <div className="absolute left-6 top-14 h-full w-px bg-gradient-to-b from-white/10 to-transparent" />
                )}
                {/* Step number */}
                <div className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-${s.color}-500/10 text-sm font-bold text-${s.color}-400`}>
                  {s.step}
                </div>
                {/* Content */}
                <div className="pt-1">
                  <h3 className="text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-400 max-w-lg">{s.desc}</p>
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
              { icon: "🧠", name: "Gemini 2.5", desc: "Google's latest LLM for conversational AI" },
              { icon: "📈", name: "Prophet", desc: "Facebook's forecasting engine for time series" },
              { icon: "🔍", name: "Isolation Forest", desc: "ML-based anomaly detection algorithm" },
              { icon: "⚡", name: "Upstash Vector", desc: "Serverless RAG for real-time context retrieval" },
              { icon: "🛡️", name: "Supabase", desc: "PostgreSQL with Row Level Security" },
              { icon: "🔐", name: "Clerk Auth", desc: "Enterprise B2B authentication" },
              { icon: "☁️", name: "Azure Cloud", desc: "Microsoft cloud infrastructure" },
              { icon: "🔄", name: "n8n Automation", desc: "Workflow automation for alerts" },
            ].map((t, i) => (
              <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-5 text-center transition-all hover:border-white/10">
                <div className="text-2xl">{t.icon}</div>
                <h4 className="mt-2 text-sm font-semibold">{t.name}</h4>
                <p className="mt-1 text-xs text-gray-500">{t.desc}</p>
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
          <p className="mt-6 text-gray-400 leading-relaxed">
            AI CFO is an enterprise-grade financial intelligence platform that combines the power of
            machine learning, predictive analytics, and conversational AI to provide real-time financial
            insights. Built for startups, SMBs, and enterprises, it transforms raw financial data into
            actionable business intelligence — making every organization smarter with their money.
          </p>
          <p className="mt-4 text-gray-500 leading-relaxed">
            Our platform leverages Google&apos;s Gemini 2.5 AI for natural language understanding,
            Meta&apos;s Prophet for accurate forecasting, and scikit-learn&apos;s Isolation Forest for
            anomaly detection. All powered by secure cloud infrastructure on Microsoft Azure.
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
          <h2 className="text-3xl font-bold">Ready to Transform Your Finances?</h2>
          <p className="mt-4 text-gray-400">
            Join organizations already using AI CFO to make smarter financial decisions.
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
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-bold">
                  ₹
                </div>
                <span className="text-sm font-bold">AI CFO</span>
              </div>
              <p className="mt-3 text-xs text-gray-600 leading-relaxed">
                Enterprise AI-powered financial intelligence platform.
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

          <div className="mt-12 border-t border-white/5 pt-6 text-center text-xs text-gray-700">
            © {new Date().getFullYear()} AI CFO. All rights reserved. Built with ❤️ in India.
          </div>
        </div>
      </footer>
    </div>
  );
}
