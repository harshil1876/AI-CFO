import Link from "next/link";
import { Sparkles, Bell, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — CFOlytics",
  description: "Transparent pricing for CFOlytics is coming soon. Join the waitlist to be notified when plans are live.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0c0f17] text-white pt-24 flex flex-col">
      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="max-w-2xl w-full">

          {/* Label */}
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-6">Pricing</p>

          {/* Headline */}
          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
            Pricing is being finalised.
          </h1>

          {/* Honest description */}
          <p className="text-lg text-slate-400 leading-relaxed mb-4">
            We are currently defining our pricing tiers to make sure they work for startups,
            growing teams, and enterprise organisations equally well — without surprise costs.
          </p>
          <p className="text-slate-500 text-sm leading-relaxed mb-12">
            CFOlytics is free to use right now. When paid plans launch, you will get advance
            notice and early-access rates if you sign up today.
          </p>

          {/* CTA block */}
          <div className="flex flex-wrap gap-4">
            <Link href="/sign-up"
              className="flex items-center gap-2 rounded-xl bg-white text-[#0c0f17] px-7 py-3.5 text-sm font-bold transition-all hover:bg-slate-100 shadow-xl shadow-white/10">
              Start free — pricing TBD <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/features"
              className="flex items-center gap-2 rounded-xl border border-white/10 px-7 py-3.5 text-sm font-medium text-slate-300 transition-all hover:border-white/25 hover:text-white">
              Explore features
            </Link>
          </div>

          {/* Divider */}
          <div className="mt-16 border-t border-white/5 pt-12">
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-widest font-semibold">What you get for free today</p>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                "Full access to the AI dashboard and all 5 analytics modules",
                "Unlimited AI financial chat with confidence scoring",
                "Anomaly detection, budget builder, and scenario simulation",
                "PDF / Excel report exports and audit trail",
                "Multi-currency support with live exchange rates",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-slate-400">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
