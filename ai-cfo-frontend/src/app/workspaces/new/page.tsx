'use client';

import { useState } from 'react';
import { useAuth, useOrganization, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { getAuthHeaders } from '@/lib/api';
import { useWorkspace } from '@/context/WorkspaceContext';
import { toast } from 'sonner';
import {
  ArrowLeft, Building2, Globe, Shield, Eye, EyeOff,
  CheckSquare, Square, RefreshCw
} from 'lucide-react';

const REGIONS = [
  { id: 'asia-pacific',   label: 'Asia Pacific',    sub: 'Singapore · Sydney · Mumbai', flag: '🌏' },
  { id: 'europe',         label: 'Europe',           sub: 'Frankfurt · London · Paris',  flag: '🇪🇺' },
  { id: 'north-america',  label: 'North America',    sub: 'Virginia · Oregon · Ohio',    flag: '🌎' },
];

const ENTITY_TYPES = ['Corporate', 'Subsidiary', 'LLC', 'Branch', 'Division', 'Personal'];
const CURRENCIES   = ['USD', 'EUR', 'GBP', 'INR', 'SGD', 'AED', 'JPY'];

function generateSecureKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  return Array.from({ length: 24 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function NewWorkspacePage() {
  const { orgId, userId } = useAuth();
  const { organization } = useOrganization();
  const { user } = useUser();
  const router = useRouter();
  const { setActiveWorkspaceId, setActiveWorkspace } = useWorkspace();

  const [name, setName] = useState('');
  const [entityType, setEntityType] = useState('Corporate');
  const [currency, setCurrency] = useState('USD');
  const [region, setRegion] = useState('asia-pacific');
  const [description, setDescription] = useState('');
  const [secureKey, setSecureKey] = useState(generateSecureKey());
  const [showKey, setShowKey] = useState(false);
  const [enableDataApi, setEnableDataApi] = useState(true);
  const [enableRls, setEnableRls] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const effectiveOrgId = orgId || userId || '';
  const selectedRegionObj = REGIONS.find(r => r.id === region);

  const handleCreate = async () => {
    if (!name.trim()) { toast.error('Workspace name is required'); return; }
    if (!effectiveOrgId) { toast.error('Not authenticated'); return; }

    setIsCreating(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspaces/`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_id: effectiveOrgId,
          name: name.trim(),
          entity_type: entityType,
          currency,
          region: selectedRegionObj?.label || region,
          description: description.trim(),
          secure_key: secureKey,
          status: 'active',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`Workspace "${data.name}" created successfully!`);
        setActiveWorkspaceId(String(data.id));
        setActiveWorkspace({
          id: String(data.id),
          name: data.name,
          status: data.status,
          currency: data.currency,
          region: data.region,
        });
        router.push('/dashboard');
      } else {
        const err = await res.json();
        toast.error(err?.detail || 'Failed to create workspace');
      }
    } catch {
      toast.error('Network error — check your connection');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] text-white">
      {/* Top Bar */}
      <header className="h-12 flex items-center gap-3 px-6 border-b border-[#1e2637] bg-[#0c0f17]">
        <button
          onClick={() => router.push('/workspaces')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft size={15} />
          Back to Workspaces
        </button>
        <div className="ml-auto text-sm font-semibold text-white">New Workspace</div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Create a new workspace</h1>
          <p className="text-sm text-slate-500 mt-2">
            Your workspace will have its own isolated financial ledger and AI engine.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-[#1e2637] bg-[#0c0f17] overflow-hidden">
          <div className="p-6 space-y-6">

            {/* Organization */}
            <div className="flex items-start gap-4">
              <label className="w-40 text-sm font-medium text-slate-400 pt-2 flex-shrink-0">Organization</label>
              <div className="flex-1">
                <div className="flex items-center gap-2 px-3 py-2 bg-[#1e2637] border border-[#2a3441] rounded-lg">
                  <Building2 size={14} className="text-slate-500" />
                  <span className="text-sm font-medium text-white">
                    {organization?.name || user?.fullName || 'Personal'}
                  </span>
                  <span className="ml-auto text-[10px] text-slate-500 border border-[#2a3441] px-1.5 py-0.5 rounded">
                    {organization ? 'ORGANIZATION' : 'PERSONAL'}
                  </span>
                </div>
              </div>
            </div>

            {/* Workspace Name */}
            <div className="flex items-start gap-4">
              <label className="w-40 text-sm font-medium text-slate-400 pt-2 flex-shrink-0">
                Workspace Name
              </label>
              <div className="flex-1">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. India Operations"
                  className="w-full bg-[#1e2637] border border-[#2a3441] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60 transition-colors"
                />
              </div>
            </div>

            {/* Entity Type + Currency */}
            <div className="flex items-start gap-4">
              <label className="w-40 text-sm font-medium text-slate-400 pt-2 flex-shrink-0">Entity & Currency</label>
              <div className="flex-1 flex gap-3">
                <select
                  value={entityType}
                  onChange={e => setEntityType(e.target.value)}
                  className="flex-1 bg-[#1e2637] border border-[#2a3441] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/60 transition-colors"
                >
                  {ENTITY_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="w-28 bg-[#1e2637] border border-[#2a3441] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/60 transition-colors"
                >
                  {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Secure Key */}
            <div className="flex items-start gap-4">
              <label className="w-40 text-sm font-medium text-slate-400 pt-2 flex-shrink-0">
                Secure Key
              </label>
              <div className="flex-1 space-y-1.5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={secureKey}
                      onChange={e => setSecureKey(e.target.value)}
                      className="w-full bg-[#1e2637] border border-[#2a3441] rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500/60 transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSecureKey(generateSecureKey())}
                    className="p-2 bg-[#1e2637] border border-[#2a3441] rounded-lg text-slate-400 hover:text-white transition-colors"
                    title="Generate new key"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
                <p className="text-[11px] text-slate-600">
                  This key is hashed and stored securely. Used for workspace-level RLS isolation.
                </p>
              </div>
            </div>

            {/* Region */}
            <div className="flex items-start gap-4">
              <label className="w-40 text-sm font-medium text-slate-400 pt-2 flex-shrink-0">
                <span className="flex items-center gap-1.5"><Globe size={13} /> Region</span>
              </label>
              <div className="flex-1 grid grid-cols-1 gap-2">
                {REGIONS.map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRegion(r.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all ${
                      region === r.id
                        ? 'border-blue-500/50 bg-blue-500/10 text-white'
                        : 'border-[#2a3441] bg-[#1e2637] text-slate-400 hover:border-[#3a4451] hover:text-white'
                    }`}
                  >
                    <span className="text-xl">{r.flag}</span>
                    <div>
                      <p className="text-sm font-medium">{r.label}</p>
                      <p className="text-[10px] opacity-60">{r.sub}</p>
                    </div>
                    {region === r.id && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-blue-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="flex items-start gap-4">
              <label className="w-40 text-sm font-medium text-slate-400 pt-2 flex-shrink-0">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Optional: describe this workspace's purpose..."
                rows={2}
                className="flex-1 bg-[#1e2637] border border-[#2a3441] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60 transition-colors resize-none"
              />
            </div>

            {/* Security Toggles */}
            <div className="flex items-start gap-4">
              <label className="w-40 text-sm font-medium text-slate-400 pt-2 flex-shrink-0">
                <Shield size={13} className="inline mr-1" />Security
              </label>
              <div className="flex-1 space-y-3">
                <div
                  className="flex items-start gap-3 cursor-pointer"
                  onClick={() => setEnableDataApi(v => !v)}
                >
                  {enableDataApi ? (
                    <CheckSquare size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Square size={16} className="text-slate-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">Enable Data API</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Autogenerate a RESTful API for this workspace's financial schema.
                    </p>
                  </div>
                </div>
                <div
                  className="flex items-start gap-3 cursor-pointer"
                  onClick={() => setEnableRls(v => !v)}
                >
                  {enableRls ? (
                    <CheckSquare size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Square size={16} className="text-slate-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">Enable automatic RLS</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Row Level Security — enforces per-user data isolation on all workspace tables.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-[#080b11] border-t border-[#1e2637] flex items-center justify-between">
            <button
              onClick={() => router.push('/workspaces')}
              className="px-4 py-2 text-slate-400 hover:text-white text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={isCreating || !name.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-emerald-900/30"
            >
              {isCreating ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Creating…
                </>
              ) : (
                'Create new workspace →'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
