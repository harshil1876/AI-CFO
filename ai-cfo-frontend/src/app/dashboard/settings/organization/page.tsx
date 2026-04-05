'use client';

import React from 'react';
import { OrganizationProfile } from '@clerk/nextjs';
import { Building2, ChevronRight } from 'lucide-react';
import { dark } from '@clerk/themes';

export default function OrganizationSettingsPage() {
  return (
    <div className="w-full h-full flex flex-col bg-[#0a0d14] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2637] flex-shrink-0 bg-[#0c0f17]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <Building2 className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
              <span>Settings</span> <ChevronRight size={10} /> <span>Organization</span>
            </div>
            <h2 className="text-base font-semibold text-white">Organization Profile</h2>
          </div>
        </div>
      </div>

      <div className="p-6 w-full max-w-6xl mx-auto flex justify-center">
        {/* Clerk handles all the heavy lifting for roles, invitations, renaming */}
        <div className="w-full">
          <OrganizationProfile
            routing="hash"
            appearance={{
              baseTheme: dark,
              elements: {
                rootBox: "w-full shadow-2xl rounded-2xl bg-[#121622] border border-[#1e2637]",
                card: "w-full max-w-none shadow-none bg-[#121622]",
                navbar: "border-r border-[#1e2637]",
                navbarButton: "text-slate-400 hover:text-white hover:bg-[#1e2637]",
                headerTitle: "text-white text-xl font-bold tracking-tight",
                headerSubtitle: "text-slate-400 text-sm",
                profileSectionTitleText: "text-white font-semibold text-lg border-b border-[#1e2637] pb-2 mb-4",
                tableHead: "text-slate-500 border-b border-[#1e2637]",
                tableRow: "border-b border-[#1e2637] hover:bg-[#161b28]",
                userPreviewSecondaryIdentifier: "text-slate-500",
                badge: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5",
                primaryButton: "bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm transition-all",
                secondaryButton: "bg-[#1e2637] hover:bg-[#2a3441] text-slate-200 border border-[#2a3441] rounded-lg",
                formFieldLabel: "text-slate-400 font-medium text-xs uppercase tracking-wider",
                formFieldInput: "bg-[#0c0f17] border border-[#2a3441] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500",
                scrollBox: "scrollbar-hide",
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
