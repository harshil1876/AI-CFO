'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth, useOrganization, useUser, OrganizationSwitcher } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/context/WorkspaceContext';
import { getAuthHeaders } from '@/lib/api';
import {
  Plus, Search, LayoutGrid, List, MoreVertical, RefreshCw,
  Pause, Play, Trash2, Globe, Clock, ChevronRight, Building2
} from 'lucide-react';
import { toast } from 'sonner';

interface Workspace {
  id: number;
  name: string;
  org_id: string;
  entity_type: string;
  description: string;
  currency: string;
  region: string;
  status: 'active' | 'paused' | 'closed';
  created_at: string;
  updated_at: string;
}

const STATUS_CONFIG = {
  active:  { label: 'Active',  color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  paused:  { label: 'Paused',  color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/30' },
  closed:  { label: 'Closed',  color: 'text-slate-500',   bg: 'bg-slate-500/10 border-slate-500/30' },
};

function WorkspaceCard({
  ws, onSelect, onStatusChange, viewMode
}: {
  ws: Workspace;
  onSelect: (ws: Workspace) => void;
  onStatusChange: (id: number, status: string) => void;
  viewMode: 'grid' | 'list';
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const cfg = STATUS_CONFIG[ws.status] || STATUS_CONFIG.active;
  const isGrid = viewMode === 'grid';

  if (!isGrid) {
    return (
      <tr
        className="border-b border-[#1e2637] hover:bg-white/[0.03] cursor-pointer transition-colors group"
        onClick={() => ws.status !== 'paused' && onSelect(ws)}
      >
        <td className="px-6 py-4">
          <div>
            <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">{ws.name}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{ws.org_id.slice(0, 24)}…</p>
          </div>
        </td>
        <td className="px-6 py-4">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold uppercase ${cfg.bg} ${cfg.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${ws.status === 'active' ? 'bg-emerald-400' : ws.status === 'paused' ? 'bg-amber-400' : 'bg-slate-500'}`} />
            {cfg.label}
          </span>
        </td>
        <td className="px-6 py-4 text-xs text-slate-400">{ws.entity_type}</td>
        <td className="px-6 py-4 text-xs text-slate-400">{ws.region}</td>
        <td className="px-6 py-4 text-xs text-slate-400">{ws.currency}</td>
        <td className="px-6 py-4 text-xs text-slate-500">
          {new Date(ws.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </td>
        <td className="px-6 py-4 relative" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="p-1.5 rounded hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
          >
            <MoreVertical size={14} />
          </button>
          {menuOpen && (
            <WorkspaceMenu ws={ws} onStatusChange={onStatusChange} onClose={() => setMenuOpen(false)} />
          )}
        </td>
      </tr>
    );
  }

  return (
    <div
      className={`relative rounded-xl border bg-[#121622] p-5 flex flex-col gap-3 transition-all hover:border-[#2a3441] cursor-pointer group ${
        ws.status === 'paused' ? 'border-amber-500/20 opacity-80' : 'border-[#1e2637]'
      }`}
      onClick={() => ws.status !== 'paused' && onSelect(ws)}
    >
      {/* Header row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 flex-shrink-0">
            <Building2 size={16} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors leading-tight">{ws.name}</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">{ws.region}</p>
          </div>
        </div>
        <div className="relative" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="p-1.5 rounded hover:bg-white/10 text-slate-600 hover:text-slate-300 transition-colors"
          >
            <MoreVertical size={14} />
          </button>
          {menuOpen && (
            <WorkspaceMenu ws={ws} onStatusChange={onStatusChange} onClose={() => setMenuOpen(false)} />
          )}
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold uppercase ${cfg.bg} ${cfg.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${ws.status === 'active' ? 'bg-emerald-400 animate-pulse' : ws.status === 'paused' ? 'bg-amber-400' : 'bg-slate-500'}`} />
          {cfg.label}
        </span>
        <span className="text-[10px] text-slate-600 border border-[#1e2637] px-2 py-0.5 rounded-full">{ws.currency}</span>
        <span className="text-[10px] text-slate-600 border border-[#1e2637] px-2 py-0.5 rounded-full">{ws.entity_type}</span>
      </div>

      {/* Paused notice */}
      {ws.status === 'paused' && (
        <div className="flex items-center gap-2 text-[10px] text-amber-400/80 bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-2">
          <Pause size={11} />
          Workspace is paused — click Resume to reactivate
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-1.5 text-[10px] text-slate-600 mt-auto pt-1 border-t border-[#1e2637]">
        <Clock size={10} />
        Created {new Date(ws.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </div>
    </div>
  );
}

function WorkspaceMenu({ ws, onStatusChange, onClose }: {
  ws: Workspace;
  onStatusChange: (id: number, status: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute right-0 top-8 z-50 w-44 bg-[#161b28] border border-[#2a3441] rounded-xl shadow-2xl overflow-hidden">
      {ws.status === 'active' && (
        <button
          onClick={() => { onStatusChange(ws.id, 'paused'); onClose(); }}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-amber-400 hover:bg-amber-500/10 transition-colors"
        >
          <Pause size={13} /> Pause Workspace
        </button>
      )}
      {ws.status === 'paused' && (
        <button
          onClick={() => { onStatusChange(ws.id, 'active'); onClose(); }}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-emerald-400 hover:bg-emerald-500/10 transition-colors"
        >
          <Play size={13} /> Resume Workspace
        </button>
      )}
      <div className="border-t border-[#2a3441]" />
      <button
        onClick={() => { onStatusChange(ws.id, 'closed'); onClose(); }}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
      >
        <Trash2 size={13} /> Delete Workspace
      </button>
    </div>
  );
}

export default function WorkspacesPage() {
  const { orgId, userId } = useAuth();
  const { organization } = useOrganization();
  const { user } = useUser();
  const router = useRouter();
  const { setActiveWorkspaceId, setActiveWorkspace } = useWorkspace();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'closed'>('all');

  const effectiveOrgId = orgId || userId || '';

  const fetchWorkspaces = useCallback(async () => {
    if (!effectiveOrgId) return;
    setIsLoading(true);
    try {
      const headers = await getAuthHeaders();
      let url = `${process.env.NEXT_PUBLIC_API_URL}/workspaces/?org_id=${effectiveOrgId}`;
      if (statusFilter !== 'all') url += `&status=${statusFilter}`;
      if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(data);
      }
    } catch (err) {
      toast.error('Failed to load workspaces');
    } finally {
      setIsLoading(false);
    }
  }, [effectiveOrgId, statusFilter, searchQuery]);

  useEffect(() => { fetchWorkspaces(); }, [fetchWorkspaces]);

  const handleSelect = (ws: Workspace) => {
    setActiveWorkspaceId(String(ws.id));
    setActiveWorkspace({
      id: String(ws.id),
      name: ws.name,
      status: ws.status,
      currency: ws.currency,
      region: ws.region,
    });
    router.push('/dashboard');
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspaces/${id}/status/`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const label = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
        toast.success(`Workspace ${label}`);
        fetchWorkspaces();
      } else {
        toast.error('Failed to update workspace status');
      }
    } catch {
      toast.error('Error updating status');
    }
  };

  const filtered = workspaces.filter(ws => {
    const matchesSearch = ws.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ws.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = workspaces.filter(w => w.status === 'active').length;
  const pausedCount = workspaces.filter(w => w.status === 'paused').length;

  return (
    <div className="min-h-screen bg-[#0a0d14] text-white">


      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Workspaces</h1>
            <p className="text-sm text-slate-500 mt-1">
              {organization?.name || 'Your Organization'} · {activeCount} active
              {pausedCount > 0 && `, ${pausedCount} paused`}
            </p>
          </div>
          <button
            onClick={() => router.push('/workspaces/new')}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-emerald-900/30"
          >
            <Plus size={16} />
            New Workspace
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search for a workspace..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#121622] border border-[#1e2637] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-1.5">
            {(['all', 'active', 'paused', 'closed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                  statusFilter === f
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-500 hover:text-slate-300 border border-transparent hover:border-[#1e2637]'
                }`}
              >
                {f === 'all' ? 'All Status' : f}
              </button>
            ))}
          </div>

          {/* View Mode + Refresh */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              onClick={fetchWorkspaces}
              className="p-2 rounded-lg border border-[#1e2637] text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg border transition-colors ${viewMode === 'grid' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' : 'border-[#1e2637] text-slate-500 hover:text-white hover:bg-white/5'}`}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg border transition-colors ${viewMode === 'list' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' : 'border-[#1e2637] text-slate-500 hover:text-white hover:bg-white/5'}`}
            >
              <List size={14} />
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#1e2637] flex items-center justify-center mb-4">
              <Building2 size={28} className="text-slate-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-400 mb-2">No workspaces found</h3>
            <p className="text-sm text-slate-600 mb-6">
              {searchQuery ? 'Try a different search term.' : 'Create your first workspace to get started.'}
            </p>
            <button
              onClick={() => router.push('/workspaces/new')}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus size={15} /> New Workspace
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(ws => (
              <WorkspaceCard
                key={ws.id}
                ws={ws}
                onSelect={handleSelect}
                onStatusChange={handleStatusChange}
                viewMode="grid"
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-[#1e2637] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#0c0f17] border-b border-[#1e2637]">
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">Project</th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">Status</th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">Entity</th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">Region</th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">Currency</th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">Created</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="bg-[#121622]">
                {filtered.map(ws => (
                  <WorkspaceCard
                    key={ws.id}
                    ws={ws}
                    onSelect={handleSelect}
                    onStatusChange={handleStatusChange}
                    viewMode="list"
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
