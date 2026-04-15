import MarketingHeader from "@/components/MarketingHeader";
import Link from "next/link";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0c0f17] text-white">
      <MarketingHeader />
      <main>{children}</main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 px-6 py-12 mt-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 md:grid-cols-4 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <img src="/Logo.png" alt="CFOlytics" className="h-7 w-7 object-contain" />
                <span className="text-sm font-bold text-white">CFOlytics</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                AI-native financial intelligence for modern teams.
              </p>
            </div>

            {/* Features */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-4">Product</h4>
              <ul className="space-y-2.5 text-xs text-slate-500">
                {[
                  ["Features", "/features"],
                  ["AI Chat", "/features/ai-chat"],
                  ["Anomaly Detection", "/features/anomaly-detection"],
                  ["Forecasting", "/features/forecasting"],
                  ["How It Works", "/how-it-works"],
                ].map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Solutions */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-4">Solutions</h4>
              <ul className="space-y-2.5 text-xs text-slate-500">
                {[
                  ["For Startups", "/solutions/startups"],
                  ["For Enterprise", "/solutions/enterprise"],
                  ["For Consultants", "/solutions/consultants"],
                  ["For Executives", "/solutions/executives"],
                ].map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Account */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-4">Account</h4>
              <ul className="space-y-2.5 text-xs text-slate-500">
                <li><Link href="/sign-in" className="hover:text-white transition-colors">Log In</Link></li>
                <li><Link href="/sign-up" className="hover:text-white transition-colors">Get Started Free</Link></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/5 pt-6">
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
