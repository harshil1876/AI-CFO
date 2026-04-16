"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X, Sparkles, ArrowRight, Zap } from "lucide-react";

// ─── Nav Structure ─────────────────────────────────────────────────────────────
const NAV = [
  {
    label: "Features",
    href: "/features",
    dropdown: [
      { label: "Features Overview",       href: "/features",                   desc: "Everything CFOlytics does",             icon: "⚡" },
      { label: "AI Chat CFO",             href: "/features/ai-chat",            desc: "Conversational CFO powered by Gemini", icon: "💬" },
      { label: "Anomaly Detection",       href: "/features/anomaly-detection",   desc: "Real-time AI-powered risk alerts",     icon: "🔍" },
      { label: "Predictive Forecasting",  href: "/features/forecasting",         desc: "Revenue & expense models",            icon: "📈" },
      { label: "What-If Simulation",      href: "/features/simulation",          desc: "Monte Carlo scenario planning",       icon: "🧪" },
      { label: "Budget Builder",          href: "/features/budget",              desc: "AI-drafted budgets & variance",       icon: "🎯" },
      { label: "Accounts Payable",        href: "/features/accounts-payable",    desc: "OCR invoices, PO matching, fraud",    icon: "🧾" },
      { label: "KPI Builder",             href: "/features/kpi-builder",         desc: "Custom KPI formulas & live gauges",   icon: "📊" },
      { label: "Connectors",              href: "/features/connectors",          desc: "QuickBooks, Tally, Excel & more",     icon: "🔌" },
      { label: "AI Intelligence Engine",  href: "/features/intelligence",        desc: "Auto-extract insights from any file", icon: "🧠" },
    ],
  },
  {
    label: "Solutions",
    href: "/solutions/startups",
    dropdown: [
      { label: "For Startups",          href: "/solutions/startups",           desc: "Finance ops at startup speed",        icon: "🚀" },
      { label: "For Enterprise",        href: "/solutions/enterprise",         desc: "Scale-grade compliance & controls",   icon: "🏢" },
      { label: "For Consultants",       href: "/solutions/consultants",        desc: "Insights for your clients",           icon: "💼" },
      { label: "For C-Suite",           href: "/solutions/executives",         desc: "Board-ready dashboards, in seconds",  icon: "👔" },
    ],
  },
  {
    label: "Resources",
    href: "/resources",
    dropdown: [
      { label: "Product Screenshots",   href: "/resources",                    desc: "All 20 modules, live screenshots",    icon: "🖼️" },
      { label: "Sample Report (PDF)",   href: "/marketing-photos/Finance Report/FR-1.pdf", desc: "Download AI-generated report",   icon: "📄" },
      { label: "How It Works",         href: "/how-it-works",                  desc: "The full platform walkthrough",       icon: "🗺️" },
      { label: "All Features",         href: "/features",                      desc: "Complete feature gallery",            icon: "📋" },
    ],
  },
  { label: "Pricing",   href: "/pricing" },
];



// ─── Dropdown Menu ─────────────────────────────────────────────────────────────
function DropdownMenu({ items }: { items: NonNullable<typeof NAV[0]["dropdown"]> }) {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50 w-72">
      <div className="rounded-2xl border border-white/10 bg-[#0f1623]/95 backdrop-blur-xl shadow-2xl shadow-black/50 p-2 overflow-hidden">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-start gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all group"
          >
            <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
            <div>
              <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">{item.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Mobile Nav Accordion ──────────────────────────────────────────────────────
function MobileNav({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0c0f17]/98 backdrop-blur-xl flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <img src="/Logo.png" alt="CFOlytics" className="h-8 w-8 object-contain" />
          <span className="text-lg font-bold text-white">CFOlytics</span>
        </div>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
        {NAV.map((item) => (
          <div key={item.label}>
            {item.dropdown ? (
              <div>
                <button
                  onClick={() => setExpandedGroup(expandedGroup === item.label ? null : item.label)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all font-medium"
                >
                  {item.label}
                  <ChevronDown className={`h-4 w-4 transition-transform ${expandedGroup === item.label ? "rotate-180" : ""}`} />
                </button>
                {expandedGroup === item.label && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-white/10 pl-4">
                    {item.dropdown.map((sub) => (
                      <Link key={sub.href} href={sub.href} onClick={onClose}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm">
                        <span>{sub.icon}</span>
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link href={item.href} onClick={onClose}
                className="block px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all font-medium">
                {item.label}
              </Link>
            )}
          </div>
        ))}
      </div>
      <div className="border-t border-white/5 p-4 flex flex-col gap-3">
        <Link href="/sign-in" onClick={onClose}
          className="text-center py-3 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:border-white/25 transition-all font-medium">
          Log In
        </Link>
        <Link href="/sign-up" onClick={onClose}
          className="text-center py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all">
          Get Started Free
        </Link>
      </div>
    </div>
  );
}

// ─── Header Component ──────────────────────────────────────────────────────────
export default function MarketingHeader() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const closeTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close dropdown when route changes
  useEffect(() => {
    setActiveDropdown(null);
    setMobileOpen(false);
  }, [pathname]);

  const handleMouseEnter = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveDropdown(label);
  };
  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setActiveDropdown(null), 150);
  };

  return (
    <>
      <header className={`fixed top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-white/5 bg-[#0c0f17]/95 backdrop-blur-xl shadow-2xl shadow-black/30"
          : "bg-transparent"
      }`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/Logo.png" alt="CFOlytics Logo" className="h-9 w-9 object-contain group-hover:scale-105 transition-transform" />
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white leading-none">CFOlytics</span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-medium">AI CFO Platform</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.dropdown && handleMouseEnter(item.label)}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    pathname?.startsWith(item.href) && item.href !== "/"
                      ? "text-white bg-white/8"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.label}
                  {item.dropdown && (
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${activeDropdown === item.label ? "rotate-180" : ""}`} />
                  )}
                </Link>

                {item.dropdown && activeDropdown === item.label && (
                  <DropdownMenu items={item.dropdown} />
                )}
              </div>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/sign-in"
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-gray-300 transition-all hover:border-white/25 hover:text-white">
              Log In
            </Link>
            <Link href="/sign-up"
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/40 hover:scale-105">
              <Sparkles className="h-3.5 w-3.5" />
              Get Started Free
            </Link>
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileNav isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
