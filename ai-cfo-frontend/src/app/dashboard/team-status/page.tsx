'use client';

import React from 'react';
import { useOrganization, useUser } from '@clerk/nextjs';
import { Users, Shield, Clock, Mail, LayoutDashboard, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export default function TeamStatusPage() {
  const { user } = useUser();
  const { organization, memberships, isLoaded } = useOrganization({
    membershipList: { maxItems: 50 },
  });

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0d14] text-white">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  const members = memberships?.data || [];

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto bg-[#0a0d14]">
      {/* Compact Page Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2637] flex-shrink-0 bg-[#0c0f17]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Users className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Team Status & Directory</h2>
            <p className="text-xs text-slate-500 mt-0.5">Real-time status of all members in {organization?.name}</p>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-6xl w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m) => {
            const isMe = m.publicUserData.identifier === user?.primaryEmailAddress?.emailAddress;
            const status = isMe ? "Online" : "Away";
            const lastActive = isMe ? "Just now" : "2 hours ago";

            return (
              <div key={m.id} className="relative group border border-[#1e2637] bg-[#121622] rounded-xl p-5 hover:border-[#2a3441] transition-all">
                {/* Status Dot */}
                <span className={`absolute top-5 right-5 h-2.5 w-2.5 rounded-full ring-2 ring-[#121622] ${isMe ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500'}`} />

                <div className="flex items-center gap-4 mb-5">
                  <img 
                    src={m.publicUserData.imageUrl} 
                    alt="avatar" 
                    className="w-12 h-12 rounded-full border-2 border-[#1e2637]"
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      {m.publicUserData.firstName || m.publicUserData.identifier?.split('@')[0]}
                      {isMe && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400">You</span>}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[150px]">{m.publicUserData.identifier}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1.5"><Shield size={14}/> Role</span>
                    <span className="text-white font-medium uppercase tracking-wider text-[10px] bg-slate-800 px-2 py-1 rounded">
                      {m.role.split(':')[1] || m.role}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1.5"><Clock size={14}/> Last Active</span>
                    <span className="text-slate-300">{lastActive}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#1e2637]">
                  <span className={`text-xs font-medium ${isMe ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {status}
                  </span>
                  <button onClick={() => toast('Direct messaging coming soon!')} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
                    <Mail size={14} /> Message
                  </button>
                </div>
              </div>
            );
          })}

          {/* Empty state for invite */}
          <div className="border border-dashed border-[#1e2637] bg-[#121622]/50 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#161b28] transition-all">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mb-3">
              <Users className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-white">Invite Member</p>
            <p className="text-xs text-slate-500 mt-1">Add colleagues to {organization?.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
