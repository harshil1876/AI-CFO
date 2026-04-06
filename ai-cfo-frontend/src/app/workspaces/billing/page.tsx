"use client";

import { CreditCard, ArrowUpRight, Zap } from "lucide-react";

export default function BillingPage() {
  return (
    <div className="w-full h-full flex flex-col p-8 bg-[#0a0d14] overflow-y-auto text-white">
      <div className="max-w-4xl w-full mx-auto">
        <h1 className="text-2xl font-bold mb-2">Billing & Plan</h1>
        <p className="text-slate-400 mb-8 max-w-2xl text-sm">
          Manage your organization's subscription, payment methods, and billing history.
        </p>

        <div className="p-6 border border-[#1e2637] bg-[#0c0f17] rounded-xl flex items-start justify-between mb-6">
          <div className="flex gap-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl h-fit">
              <Zap size={24} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Pro Plan</h2>
              <p className="text-slate-400 text-sm mt-1 mb-4">You are currently on the Pro plan, billed monthly.</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">$99</span>
                <span className="text-slate-500 text-sm">/ month</span>
              </div>
            </div>
          </div>
          <button className="px-4 py-2 bg-white text-black text-xs font-semibold rounded-md hover:bg-slate-200 transition-colors">
            Manage Plan
          </button>
        </div>

        <div className="p-6 border border-[#1e2637] bg-[#0c0f17] rounded-xl">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <CreditCard size={16} className="text-slate-400" /> Payment Methods
          </h3>
          <div className="flex items-center justify-between p-4 border border-[#2a3448] bg-[#121622] rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-6 bg-slate-100 rounded flex items-center justify-center text-[10px] font-bold text-blue-800 italic">
                VISA
              </div>
              <span className="text-sm font-medium">•••• •••• •••• 4242</span>
            </div>
            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">Default</span>
          </div>
          <button className="mt-4 text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
            + Add Payment Method
          </button>
        </div>
      </div>
    </div>
  );
}
