'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useAuth } from '@clerk/nextjs';
import { getAuthHeaders } from '@/lib/api';
import {
  Save, AlertTriangle, Briefcase, ChevronRight, Target, Plus,
  Brain, Bell, Globe, CheckSquare, Square, Link2, Trash2, Pause, Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { CustomDialog, DialogButton } from '@/components/CustomDialog';
import { useRouter } from 'next/navigation';

const AI_PERSONAS = ['CFO', 'Financial Analyst', 'Risk Auditor', 'Tax Advisor', 'Investor'];
const CURRENCIES  = ['USD', 'EUR', 'GBP', 'INR', 'SGD', 'AED', 'JPY'];
const ENTITY_TYPES = ['Corporate', 'Subsidiary', 'LLC', 'Branch', 'Division', 'Personal'];
const TIMEZONES   = ['Asia/Kolkata', 'UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Singapore', 'Asia/Dubai'];

const SETTINGS_TABS = [
  { id: 'general', label: 'General', icon: Briefcase },
  { id: 'connectors', label: 'Data Connectors', icon: Link2 },
  { id: 'ai', label: 'AI Preferences', icon: Brain },
  { id: 'goals', label: 'Goals & Targets', icon: Target },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, danger: true },
];

// ── Section Wrapper ───────────────────────────────────────────
function Section({ title, subtitle, icon: Icon, iconColor = 'text-blue-400', iconBg = 'bg-blue-500/10 border-blue-500/20', children, footer }: any) {
  return (
    <div className="border border-[#1e2637] bg-[#121622] rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-[#1e2637] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className={`p-1.5 rounded-md border ${iconBg}`}>
              <Icon size={15} className={iconColor} />
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </div>
      <div className="p-6 space-y-5">{children}</div>
      {footer && (
        <div className="px-6 py-4 border-t border-[#1e2637] bg-[#161b28] flex justify-end">
          {footer}
        </div>
      )}
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
        ? <CheckSquare size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
        : <Square size={16} className="text-slate-500 mt-0.5 flex-shrink-0" />}
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {hint && <p className="text-xs text-slate-500 mt-0.5">{hint}</p>}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function WorkspaceSettingsPage() {
  const { activeWorkspaceId, activeWorkspace, setActiveWorkspaceId, setActiveWorkspace } = useWorkspace();
  const { orgId, userId } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab]         = useState('general');
  const [workspace, setWorkspace]         = useState<any>(null);
  const [name, setName]                   = useState('');
  const [currency, setCurrency]           = useState('USD');
  const [entityType, setEntityType]       = useState('Corporate');
  const [description, setDescription]     = useState('');
  const [timezone, setTimezone]           = useState('Asia/Kolkata');
  const [region, setRegion]               = useState('');
  const [isLoading, setIsLoading]         = useState(true);
  const [isSaving, setIsSaving]           = useState(false);

  // Goals
  const [goals, setGoals]               = useState<any[]>([]);
  const [newGoalName, setNewGoalName]   = useState('Annual Revenue Target');
  const [newGoalValue, setNewGoalValue] = useState('');
  const [newGoalPeriod, setNewGoalPeriod] = useState('Annual');
  const [isSavingGoal, setIsSavingGoal] = useState(false);

  // AI Preferences (stored in localStorage per workspace)
  const [aiPersona, setAiPersona]             = useState('CFO');
  const [maxHistory, setMaxHistory]           = useState(50);
  const [proactiveScanner, setProactiveScanner] = useState(true);

  // Notifications (stored in localStorage per workspace)
  const [anomalyThreshold, setAnomalyThreshold] = useState(10);
  const [budgetVariance, setBudgetVariance]     = useState(15);
  const [notifyEmail, setNotifyEmail]           = useState(true);
  const [notifyDashboard, setNotifyDashboard]   = useState(true);

  // Danger Zone
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPauseDialogOpen, setIsPauseDialogOpen]   = useState(false);

  const prefKey = `ws_prefs_${activeWorkspaceId}`;

  useEffect(() => {
    if (!activeWorkspaceId) return;

    // Load AI / notification prefs from localStorage
    try {
      const saved = JSON.parse(localStorage.getItem(prefKey) || '{}');
      if (saved.aiPersona) setAiPersona(saved.aiPersona);
      if (saved.maxHistory) setMaxHistory(saved.maxHistory);
      if (saved.proactiveScanner !== undefined) setProactiveScanner(saved.proactiveScanner);
      if (saved.anomalyThreshold) setAnomalyThreshold(saved.anomalyThreshold);
      if (saved.budgetVariance) setBudgetVariance(saved.budgetVariance);
      if (saved.notifyEmail !== undefined) setNotifyEmail(saved.notifyEmail);
      if (saved.notifyDashboard !== undefined) setNotifyDashboard(saved.notifyDashboard);
      if (saved.timezone) setTimezone(saved.timezone);
    } catch {}

    const fetchWorkspace = async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspaces/${activeWorkspaceId}/`, { headers });
        if (res.ok) {
          const data = await res.json();
          setWorkspace(data);
          setName(data.name || '');
          setCurrency(data.currency || 'USD');
          setEntityType(data.entity_type || 'Corporate');
          setDescription(data.description || '');
          setRegion(data.region || '');
        }
      } catch { toast.error('Failed to load workspace settings'); }
      finally { setIsLoading(false); }
    };

    const fetchGoals = async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/goals/?workspace_id=${activeWorkspaceId}`, { headers });
        if (res.ok) setGoals(await res.json());
      } catch {}
    };

    fetchWorkspace();
    fetchGoals();
  }, [activeWorkspaceId]);

  const saveLocalPrefs = () => {
    const prefs = { aiPersona, maxHistory, proactiveScanner, anomalyThreshold, budgetVariance, notifyEmail, notifyDashboard, timezone };
    localStorage.setItem(prefKey, JSON.stringify(prefs));
    toast.success('Preferences saved');
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspaces/${activeWorkspaceId}/`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, currency, entity_type: entityType, description }),
      });
      if (res.ok) {
        const updated = await res.json();
        // Sync name change back into WorkspaceContext
        if (activeWorkspace) {
          setActiveWorkspace({ ...activeWorkspace, name: updated.name, currency: updated.currency });
        }
        toast.success('Workspace updated');
      } else { toast.error('Failed to update workspace'); }
    } catch { toast.error('Error occurred'); }
    finally { setIsSaving(false); }
  };

  const handleSaveGoal = async () => {
    if (!newGoalValue || isNaN(Number(newGoalValue))) { toast.error('Enter a valid target value'); return; }
    setIsSavingGoal(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/goals/`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspace_id: activeWorkspaceId,
          bot_id: orgId || userId || '',
          goal_name: newGoalName,
          target_value: Number(newGoalValue),
          period: newGoalPeriod,
        }),
      });
      if (res.ok) {
        const newGoal = await res.json();
        setGoals(prev => [...prev, newGoal]);
        setNewGoalValue('');
        toast.success('Goal target saved — KPI radial will update on dashboard');
      } else { toast.error('Failed to save goal'); }
    } catch { toast.error('Error saving goal'); }
    finally { setIsSavingGoal(false); }
  };

  const handlePause = async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspaces/${activeWorkspaceId}/status/`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: workspace?.status === 'paused' ? 'active' : 'paused' }),
      });
      if (res.ok) {
        const newStatus = workspace?.status === 'paused' ? 'active' : 'paused';
        setWorkspace((w: any) => ({ ...w, status: newStatus }));
        if (activeWorkspace) setActiveWorkspace({ ...activeWorkspace, status: newStatus as any });
        toast.success(`Workspace ${newStatus === 'paused' ? 'paused' : 'resumed'}`);
        setIsPauseDialogOpen(false);
      }
    } catch { toast.error('Error updating status'); }
  };

  const handleDelete = async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspaces/${activeWorkspaceId}/`, {
        method: 'DELETE', headers,
      });
      if (res.ok) {
        toast.success('Workspace closed');
        setActiveWorkspaceId(null);
        router.push('/workspaces');
      } else { toast.error('Failed to close workspace'); }
    } catch { toast.error('Error occurred'); }
  };

  if (isLoading) return (
    <div className="w-full h-full flex items-center justify-center bg-[#0a0d14]">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0d14] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2637] flex-shrink-0 bg-[#0c0f17]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Briefcase className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
              <span>Settings</span><ChevronRight size={10} /><span>Workspace</span>
            </div>
            <h2 className="text-base font-semibold text-white">{workspace?.name || 'Workspace Settings'}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {workspace?.status === 'paused' && (
            <span className="flex items-center gap-1.5 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full font-semibold uppercase">
              <Pause size={10} /> Paused
            </span>
          )}
          {workspace?.status === 'active' && (
            <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-semibold uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row px-4 md:px-6 py-6 md:py-8 max-w-[1200px] w-full gap-6 md:gap-10">
        {/* Left Sidebar Menu */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-1 print:hidden">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3 px-3">Configure</div>
          {SETTINGS_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer outline-none ${
                activeTab === tab.id
                  ? (tab.danger ? 'bg-red-500/10 text-red-500' : 'bg-[#1e2637] text-white shadow-sm border border-slate-700/50')
                  : (tab.danger ? 'text-red-400/80 hover:text-red-400 hover:bg-white/5' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5')
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Content Area */}
        <div className="flex-1 max-w-4xl min-w-0">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">

        {/* ── 1. General ── */}
        {activeTab === 'general' && (
        <Section
          title="General"
          subtitle={`${workspace?.region || 'Asia-Pacific'} · ${workspace?.entity_type}`}
          icon={Briefcase}
          footer={
            <button
              onClick={handleUpdate} disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
            >
              <Save size={15} />{isSaving ? 'Saving…' : 'Save Changes'}
            </button>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Workspace Name">
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                className="w-full bg-[#1e2637] border border-[#2a3441] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
            </Field>
            <Field label="Region" hint="Set during creation — change via migration.">
              <input value={region} disabled
                className="w-full bg-[#0c0f17] border border-[#1e2637] rounded-lg px-3 py-2 text-sm text-slate-500 cursor-not-allowed" />
            </Field>
            <Field label="Entity Type">
              <select value={entityType} onChange={e => setEntityType(e.target.value)}
                className="w-full bg-[#1e2637] border border-[#2a3441] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                {ENTITY_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Base Currency">
              <select value={currency} onChange={e => setCurrency(e.target.value)}
                className="w-full bg-[#1e2637] border border-[#2a3441] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Description">
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              rows={2} placeholder="Describe this workspace's purpose…"
              className="w-full bg-[#1e2637] border border-[#2a3441] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none" />
          </Field>
          <Field label="Timezone Override">
            <select value={timezone} onChange={e => setTimezone(e.target.value)}
              className="w-full max-w-xs bg-[#1e2637] border border-[#2a3441] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
              {TIMEZONES.map(tz => <option key={tz}>{tz}</option>)}
            </select>
          </Field>
        </Section>
        )}

        {/* ── 2. Data Connectors ── */}
        {activeTab === 'connectors' && (
        <Section title="Data Connectors" subtitle="Active connections for this workspace" icon={Link2} iconColor="text-purple-400" iconBg="bg-purple-500/10 border-purple-500/20">
          <div className="text-sm text-slate-400 bg-[#1e2637] rounded-lg px-4 py-3 flex items-center justify-between">
            <span>Manage data connectors on the <strong className="text-white">Connectors</strong> page.</span>
            <button onClick={() => router.push('/dashboard/connectors')}
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium">
              Go to Connectors <ChevronRight size={12} />
            </button>
          </div>
        </Section>
        )}

        {/* ── 3. AI Preferences ── */}
        {activeTab === 'ai' && (
        <Section
          title="AI Preferences"
          subtitle="Customize the AI engine for this workspace"
          icon={Brain}
          iconColor="text-violet-400"
          iconBg="bg-violet-500/10 border-violet-500/20"
          footer={
            <button onClick={saveLocalPrefs}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors">
              <Save size={15} /> Save AI Preferences
            </button>
          }
        >
          <Field label="Default AI Persona" hint="The personality the AI CFO Chat adopts for this workspace.">
            <div className="flex flex-wrap gap-2">
              {AI_PERSONAS.map(p => (
                <button key={p} onClick={() => setAiPersona(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    aiPersona === p
                      ? 'bg-violet-600/20 border-violet-500/40 text-violet-300'
                      : 'bg-[#1e2637] border-[#2a3441] text-slate-400 hover:text-white'
                  }`}>
                  {p}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Max Chat History" hint={`AI will reference the last ${maxHistory} messages for context.`}>
            <div className="flex items-center gap-4 max-w-xs">
              <input type="range" min={10} max={200} step={10}
                value={maxHistory} onChange={e => setMaxHistory(Number(e.target.value))}
                className="flex-1 accent-violet-500" />
              <span className="text-sm font-bold text-white w-12 text-right">{maxHistory}</span>
            </div>
          </Field>
          <div className="space-y-3 pt-1">
            <Toggle checked={proactiveScanner} onChange={() => setProactiveScanner(v => !v)}
              label="Enable Proactive Scanner"
              hint="AI automatically scans for anomalies and sends daily briefings." />
          </div>
        </Section>
        )}

        {/* ── 4. Goals & Targets ── */}
        {activeTab === 'goals' && (
        <Section
          title="Goals & Targets"
          subtitle="Sets the target for the KPI Radial on the dashboard"
          icon={Target}
          iconColor="text-blue-400"
          iconBg="bg-blue-500/10 border-blue-500/20"
          footer={
            <button onClick={handleSaveGoal} disabled={isSavingGoal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60">
              <Plus size={15} />{isSavingGoal ? 'Saving…' : 'Add Target'}
            </button>
          }
        >
          {goals.length > 0 && (
            <div className="space-y-2 mb-2">
              {goals.map((g: any) => (
                <div key={g.id} className="flex items-center justify-between bg-[#1e2637] rounded-lg px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">{g.goal_name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{g.period}</p>
                  </div>
                  <span className="text-sm font-bold text-blue-400">${Number(g.target_value).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <Field label="Goal Name">
                <input type="text" value={newGoalName} onChange={e => setNewGoalName(e.target.value)}
                  className="w-full bg-[#1e2637] border border-[#2a3441] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Annual Revenue Target" />
              </Field>
            </div>
            <Field label="Target Value">
              <input type="number" value={newGoalValue} onChange={e => setNewGoalValue(e.target.value)}
                className="w-full bg-[#1e2637] border border-[#2a3441] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g. 500000" />
            </Field>
          </div>
          <Field label="Period">
            <div className="flex gap-2 flex-wrap">
              {['Annual', 'Q1', 'Q2', 'Q3', 'Q4', 'Monthly'].map(p => (
                <button key={p} onClick={() => setNewGoalPeriod(p)}
                  className={`px-3 py-1 rounded-lg text-xs border transition-colors ${
                    newGoalPeriod === p ? 'bg-blue-600/20 border-blue-500/40 text-blue-300' : 'bg-[#1e2637] border-[#2a3441] text-slate-400 hover:text-white'
                  }`}>
                  {p}
                </button>
              ))}
            </div>
          </Field>
        </Section>
        )}

        {/* ── 5. Notifications ── */}
        {activeTab === 'notifications' && (
        <Section
          title="Notifications"
          subtitle="Configure alert thresholds for this workspace"
          icon={Bell}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10 border-amber-500/20"
          footer={
            <button onClick={saveLocalPrefs}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-colors">
              <Save size={15} /> Save Notification Preferences
            </button>
          }
        >
          <Field label={`Anomaly Alert Threshold: ${anomalyThreshold}%`} hint="Alert triggers when a transaction deviates by more than this % from normal.">
            <div className="flex items-center gap-4 max-w-md">
              <input type="range" min={1} max={50}
                value={anomalyThreshold} onChange={e => setAnomalyThreshold(Number(e.target.value))}
                className="flex-1 accent-amber-500" />
              <span className="text-sm font-bold text-white w-12 text-right">{anomalyThreshold}%</span>
            </div>
          </Field>
          <Field label={`Budget Variance Alert: ${budgetVariance}%`} hint="Alert triggers when actual spend differs from budget by more than this %.">
            <div className="flex items-center gap-4 max-w-md">
              <input type="range" min={1} max={50}
                value={budgetVariance} onChange={e => setBudgetVariance(Number(e.target.value))}
                className="flex-1 accent-amber-500" />
              <span className="text-sm font-bold text-white w-12 text-right">{budgetVariance}%</span>
            </div>
          </Field>
          <div className="space-y-3 pt-1">
            <Toggle checked={notifyEmail} onChange={() => setNotifyEmail(v => !v)}
              label="Email Notifications" hint="Receive alert emails when thresholds are crossed." />
            <Toggle checked={notifyDashboard} onChange={() => setNotifyDashboard(v => !v)}
              label="In-App Notification Center" hint="Show alerts in the dashboard notification bell." />
          </div>
        </Section>
        )}

        {/* ── 6. Danger Zone ── */}
        {activeTab === 'danger' && (
        <div className="border border-red-900/30 bg-[#121622] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-red-900/30 flex items-center gap-2 text-red-400">
            <AlertTriangle size={16} />
            <h3 className="text-sm font-semibold">Danger Zone</h3>
          </div>
          <div className="p-6 space-y-4">
            {/* Pause / Resume */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-sm font-medium text-white">
                  {workspace?.status === 'paused' ? 'Resume Workspace' : 'Pause Workspace'}
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-lg">
                  {workspace?.status === 'paused'
                    ? 'Reactivate this workspace to allow data entry and AI processing.'
                    : 'Freeze this workspace temporarily. Data is retained but new entries are blocked.'}
                </p>
              </div>
              <button
                onClick={() => setIsPauseDialogOpen(true)}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 rounded-lg text-sm font-medium transition-colors"
              >
                <Pause size={14} />{workspace?.status === 'paused' ? 'Resume' : 'Pause'}
              </button>
            </div>
            <div className="border-t border-[#1e2637]" />
            {/* Delete */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-sm font-medium text-white">Delete Workspace</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-lg">
                  Permanently archive this workspace. All data is retained but access is frozen and the workspace is hidden from the list.
                </p>
              </div>
              <button
                onClick={() => setIsDeleteDialogOpen(true)}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-sm font-medium transition-colors"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
        )}

          </div>
        </div>
      </div>

      {/* Pause Confirmation */}
      <CustomDialog
        isOpen={isPauseDialogOpen}
        onClose={() => setIsPauseDialogOpen(false)}
        title={workspace?.status === 'paused' ? 'Resume Workspace?' : 'Pause Workspace?'}
        description={workspace?.status === 'paused'
          ? `Reactivate "${workspace?.name}" and allow full data-entry access.`
          : `Pausing "${workspace?.name}" will block all new data entries. You can resume at any time.`}
        footer={
          <>
            <DialogButton variant="ghost" onClick={() => setIsPauseDialogOpen(false)}>Cancel</DialogButton>
            <button onClick={handlePause}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-colors">
              {workspace?.status === 'paused' ? 'Resume' : 'Pause Workspace'}
            </button>
          </>
        }
      >{null}</CustomDialog>

      {/* Delete Confirmation */}
      <CustomDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete Workspace?"
        description={`Archive "${workspace?.name}" permanently. The workspace will be hidden and all data frozen.`}
        footer={
          <>
            <DialogButton variant="ghost" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</DialogButton>
            <button onClick={handleDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors">
              Yes, delete it
            </button>
          </>
        }
      >{null}</CustomDialog>
    </div>
  );
}
