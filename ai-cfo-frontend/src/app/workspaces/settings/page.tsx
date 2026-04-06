'use client';

import React, { useState, useEffect } from 'react';
import { OrganizationProfile, useOrganization, useUser, useAuth } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import {
  Building2, ChevronRight, Shield, CreditCard,
  AlertTriangle, Globe, Briefcase, CheckSquare, Square,
  ChevronDown, ChevronUp
} from 'lucide-react';

const INDUSTRIES = [
  'SaaS / Software', 'Retail & E-Commerce', 'Manufacturing', 'Healthcare',
  'Financial Services', 'Real Estate', 'Logistics', 'Education',
  'Hospitality', 'Professional Services', 'Non-Profit', 'Other',
];

const TIMEZONES = [
  'Asia/Kolkata', 'UTC', 'America/New_York', 'America/Los_Angeles',
  'Europe/London', 'Europe/Berlin', 'Asia/Singapore', 'Asia/Dubai', 'Asia/Tokyo',
];

const DEFAULT_ROLES = ['org:admin', 'org:member'];

// ── Collapsible Section ─────────────────────────────────────────────
function Section({ title, icon: Icon, iconColor = 'text-indigo-400', iconBg = 'bg-indigo-500/10 border-indigo-500/20', children }: any) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-[#1e2637] bg-[#121622] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-4 border-b border-[#1e2637] hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-md border ${iconBg}`}>
            <Icon size={15} className={iconColor} />
          </div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
        </div>
        {open ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
      </button>
      {open && <div className="p-6">{children}</div>}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-slate-600">{hint}</p>}
    </div>
  );
}

function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: () => void; label: string; hint?: string }) {
  return (
    <div className="flex items-start gap-3 cursor-pointer" onClick={onChange}>
      {checked
        ? <CheckSquare size={16} className="text-indigo-400 mt-0.5 flex-shrink-0" />
        : <Square size={16} className="text-slate-500 mt-0.5 flex-shrink-0" />}
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {hint && <p className="text-xs text-slate-500 mt-0.5">{hint}</p>}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────
export default function OrganizationSettingsPage() {
  const { organization } = useOrganization();
  const { user } = useUser();
  const { orgId } = useAuth();

  const prefKey = `org_prefs_${orgId}`;

  // CFO Platform Preferences (stored in localStorage)
  const [industry, setIndustry]         = useState('SaaS / Software');
  const [timezone, setTimezone]         = useState('Asia/Kolkata');
  const [defaultRole, setDefaultRole]   = useState('org:member');
  const [sessionTimeout, setSessionTimeout] = useState(60);
  const [enforceSSO, setEnforceSSO]     = useState(false);
  const [twoFactorRequired, setTwoFactor] = useState(false);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  // Billing info (static MVP display)
  const plan         = 'Free';
  const workspaceMax = 10;
  const workspacesUsed = 1; // Replace with real count when billing is implemented

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(prefKey) || '{}');
      if (saved.industry) setIndustry(saved.industry);
      if (saved.timezone) setTimezone(saved.timezone);
      if (saved.defaultRole) setDefaultRole(saved.defaultRole);
      if (saved.sessionTimeout) setSessionTimeout(saved.sessionTimeout);
      if (saved.enforceSSO !== undefined) setEnforceSSO(saved.enforceSSO);
      if (saved.twoFactorRequired !== undefined) setTwoFactor(saved.twoFactorRequired);
    } catch {}
  }, [prefKey]);

  const savePrefs = () => {
    setIsSavingPrefs(true);
    const prefs = { industry, timezone, defaultRole, sessionTimeout, enforceSSO, twoFactorRequired };
    localStorage.setItem(prefKey, JSON.stringify(prefs));
    setTimeout(() => {
      setIsSavingPrefs(false);
      // toast success without importing toast here to keep this component clean
      const el = document.getElementById('org-save-toast');
      if (el) { el.style.opacity = '1'; setTimeout(() => { el.style.opacity = '0'; }, 2500); }
    }, 400);
  };

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
              <span>Settings</span><ChevronRight size={10} /><span>Organization</span>
            </div>
            <h2 className="text-base font-semibold text-white">
              {organization?.name || 'Organization Settings'}
            </h2>
          </div>
        </div>
        <div className="text-xs text-slate-500">
          {organization?.membersCount ?? 1} member{organization?.membersCount !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="p-6 max-w-4xl space-y-6">

        {/* ── 1. Clerk Organization Profile (name, logo, members, invitations) ── */}
        <div className="border border-[#1e2637] bg-[#121622] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1e2637] flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-indigo-500/10 border border-indigo-500/20">
              <Building2 size={15} className="text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Profile & Members</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Manage org name, logo, roles, and invitations via Clerk</p>
            </div>
          </div>
          <div className="p-4">
            <OrganizationProfile
              routing="hash"
              appearance={{
                baseTheme: dark,
                elements: {
                  rootBox: 'w-full shadow-none rounded-xl bg-[#121622] border-0',
                  card: 'w-full max-w-none shadow-none bg-[#121622]',
                  navbar: 'border-r border-[#1e2637]',
                  navbarButton: 'text-slate-400 hover:text-white hover:bg-[#1e2637]',
                  headerTitle: 'text-white text-lg font-bold',
                  headerSubtitle: 'text-slate-400 text-sm',
                  profileSectionTitleText: 'text-white font-semibold text-base border-b border-[#1e2637] pb-2 mb-4',
                  tableHead: 'text-slate-500 border-b border-[#1e2637]',
                  tableRow: 'border-b border-[#1e2637] hover:bg-[#161b28]',
                  userPreviewSecondaryIdentifier: 'text-slate-500',
                  badge: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5',
                  primaryButton: 'bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm',
                  secondaryButton: 'bg-[#1e2637] hover:bg-[#2a3441] text-slate-200 border border-[#2a3441] rounded-lg',
                  formFieldLabel: 'text-slate-400 font-medium text-xs uppercase tracking-wider',
                  formFieldInput: 'bg-[#0c0f17] border border-[#2a3441] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500',
                },
              }}
            />
          </div>
        </div>

        {/* ── 2. General CFO Preferences ── */}
        <Section title="General" icon={Globe}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Industry Type" hint="Used to customize AI recommendations and benchmarks.">
              <select value={industry} onChange={e => setIndustry(e.target.value)}
                className="w-full bg-[#1e2637] border border-[#2a3441] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
                {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
              </select>
            </Field>
            <Field label="Default Timezone" hint="All timestamps in reports will use this timezone.">
              <select value={timezone} onChange={e => setTimezone(e.target.value)}
                className="w-full bg-[#1e2637] border border-[#2a3441] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
                {TIMEZONES.map(tz => <option key={tz}>{tz}</option>)}
              </select>
            </Field>
          </div>
        </Section>

        {/* ── 3. Security ── */}
        <Section title="Security" icon={Shield} iconColor="text-emerald-400" iconBg="bg-emerald-500/10 border-emerald-500/20">
          <div className="space-y-5">
            <Field label="Default Role for New Members" hint="Role assigned when someone accepts an invitation.">
              <div className="flex gap-3">
                {DEFAULT_ROLES.map(r => (
                  <button key={r} onClick={() => setDefaultRole(r)}
                    className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                      defaultRole === r
                        ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-[#1e2637] border-[#2a3441] text-slate-400 hover:text-white'
                    }`}>
                    {r === 'org:admin' ? 'Admin' : 'Member'}
                  </button>
                ))}
              </div>
            </Field>
            <Field label={`Session Timeout: ${sessionTimeout} minutes`} hint="Users are automatically logged out after this period of inactivity.">
              <div className="flex items-center gap-4 max-w-md">
                <input type="range" min={15} max={480} step={15}
                  value={sessionTimeout} onChange={e => setSessionTimeout(Number(e.target.value))}
                  className="flex-1 accent-emerald-500" />
                <span className="text-sm font-bold text-white w-16 text-right">{sessionTimeout}m</span>
              </div>
            </Field>
            <div className="space-y-3">
              <Toggle checked={twoFactorRequired} onChange={() => setTwoFactor(v => !v)}
                label="Require 2FA for all members"
                hint="Members must configure two-factor authentication to access the platform." />
              <Toggle checked={enforceSSO} onChange={() => setEnforceSSO(v => !v)}
                label="Enforce SSO Login"
                hint="Restrict sign-in to your organization's Single Sign-On provider." />
            </div>
          </div>
        </Section>

        {/* ── 4. Billing & Plan ── */}
        <Section title="Billing & Plan" icon={CreditCard} iconColor="text-amber-400" iconBg="bg-amber-500/10 border-amber-500/20">
          <div className="space-y-4">
            {/* Plan Badge */}
            <div className="flex items-center justify-between bg-[#1e2637] rounded-xl px-5 py-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Current Plan</p>
                <p className="text-2xl font-bold text-white mt-1">{plan}</p>
                <p className="text-xs text-slate-400 mt-1">Includes up to {workspaceMax} workspaces</p>
              </div>
              <button className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors">
                Upgrade to Pro →
              </button>
            </div>

            {/* Usage stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Workspaces', value: `${workspacesUsed} / ${workspaceMax}`, percent: (workspacesUsed / workspaceMax) * 100 },
                { label: 'Members', value: `${organization?.membersCount ?? 1} / 5`, percent: ((organization?.membersCount ?? 1) / 5) * 100 },
                { label: 'AI Queries / mo', value: '4 / 500', percent: 0.8 },
              ].map(stat => (
                <div key={stat.label} className="bg-[#1e2637] rounded-xl p-4">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-base font-bold text-white mt-1">{stat.value}</p>
                  <div className="mt-2 h-1 bg-[#2a3441] rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${Math.min(stat.percent, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Save Toast ── */}
        <div className="flex justify-end">
          <button
            onClick={savePrefs} disabled={isSavingPrefs}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {isSavingPrefs ? 'Saving…' : 'Save Organization Preferences'}
          </button>
        </div>
        <div id="org-save-toast" style={{ opacity: 0, transition: 'opacity 0.3s' }}
          className="fixed bottom-6 right-6 bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-lg pointer-events-none">
          ✓ Organization preferences saved
        </div>

        {/* ── 5. Danger Zone ── */}
        <div className="border border-red-900/30 bg-[#121622] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-red-900/30 flex items-center gap-2 text-red-400">
            <AlertTriangle size={16} />
            <h3 className="text-sm font-semibold">Danger Zone</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-sm font-medium text-white">Transfer Ownership</h4>
                <p className="text-xs text-slate-500 mt-1">Transfer ownership of this organization to another admin member.</p>
              </div>
              <button className="flex-shrink-0 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 rounded-lg text-sm font-medium transition-colors">
                Transfer
              </button>
            </div>
            <div className="border-t border-[#1e2637]" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-sm font-medium text-white">Archive Organization</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-lg">
                  Freeze the entire organization. All workspaces and data are retained but access is suspended. This action is reversible by a super-admin.
                </p>
              </div>
              <button className="flex-shrink-0 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-sm font-medium transition-colors">
                Archive Org
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
