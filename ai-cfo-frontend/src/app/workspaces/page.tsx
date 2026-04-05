'use client';

import React, { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Plus, Briefcase, ChevronRight, Loader2, KeyRound } from 'lucide-react';
import { CustomDialog } from '@/components/CustomDialog';
import { getAuthHeaders } from '@/lib/api';
import { toast } from 'sonner';

type Workspace = {
  id: number;
  name: string;
  entity_type: string;
  currency: string;
  is_active: boolean;
  created_at: string;
};

export default function WorkspacesGatewayPage() {
  const { user, isLoaded } = useUser();
  const { orgId } = useAuth();
  const router = useRouter();
  const { activeWorkspaceId, setActiveWorkspaceId } = useWorkspace();
  
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [newName, setNewName] = useState('');
  const [newCurrency, setNewCurrency] = useState('USD');
  const [newType, setNewType] = useState('Corporate');

  // We use user.id if orgId isn't available (for personal accounts)
  const currentOrgId = orgId || user?.id;

  useEffect(() => {
    if (!isLoaded) return;
    
    if (activeWorkspaceId && currentOrgId) {
      // Remembered workspace exists, auto-forward to dashboard
      router.push('/dashboard');
      return;
    }

    if (currentOrgId) {
      fetchWorkspaces();
    }
  }, [isLoaded, currentOrgId, activeWorkspaceId, router]);

  const fetchWorkspaces = async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`http://localhost:8000/api/workspaces/?org_id=${currentOrgId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(data);
      }
    } catch (err) {
      toast.error('Failed to load workspaces');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWorkspace = async () => {
    if (!newName.trim()) {
      toast.error('Workspace name is required');
      return;
    }

    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`http://localhost:8000/api/workspaces/`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_id: currentOrgId,
          name: newName,
          entity_type: newType,
          currency: newCurrency,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success('Workspace created successfully');
        setIsDialogOpen(false);
        setNewName('');
        // Automatically enter the new workspace
        handleWorkspaceSelect(data.id.toString());
      }
    } catch (err) {
      toast.error('Failed to create workspace');
    }
  };

  const handleWorkspaceSelect = (id: string) => {
    setActiveWorkspaceId(id);
    router.push('/dashboard');
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0d14]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0d14] flex flex-col items-center justify-center p-6">
      
      {/* Supabase-style Header for Gateway */}
      <div className="w-full max-w-4xl mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-1 ring-blue-500/50">
            {user?.firstName?.charAt(0) || 'O'}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">Select Workspace</h1>
            <p className="text-sm text-slate-400">Choose a ledger to continue, or create a new one.</p>
          </div>
        </div>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors ring-1 ring-blue-500/50"
        >
          <Plus className="w-4 h-4" />
          New Workspace
        </button>
      </div>

      {workspaces.length === 0 ? (
        <div className="w-full max-w-4xl border border-dashed border-[#1e2637] rounded-xl flex flex-col items-center justify-center p-16 bg-[#121622]/50">
          <Briefcase className="w-12 h-12 text-slate-500 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Workspaces Found</h3>
          <p className="text-sm text-slate-400 mb-6 text-center max-w-md">
            Workspaces isolate your data into distinct ledgers. You can create multiple workspaces under a single Organization.
          </p>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Create Your First Workspace
          </button>
        </div>
      ) : (
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              onClick={() => handleWorkspaceSelect(ws.id.toString())}
              className="group cursor-pointer border border-[#1e2637] bg-[#121622] rounded-xl p-5 hover:border-blue-500/50 hover:bg-[#161b28] transition-all flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <Briefcase className="w-5 h-5 text-blue-400" />
                </div>
                {ws.is_active ? (
                  <span className="px-2 py-1 text-[10px] font-medium bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">Active</span>
                ) : (
                  <span className="px-2 py-1 text-[10px] font-medium bg-slate-500/10 text-slate-400 rounded border border-slate-500/20">Paused</span>
                )}
              </div>
              <h3 className="text-base font-medium text-white group-hover:text-blue-400 transition-colors">{ws.name}</h3>
              <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                <span>{ws.entity_type}</span>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span>Base: {ws.currency}</span>
              </div>
              <div className="mt-auto pt-6 flex justify-end">
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Workspace Dialog */}
      <CustomDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Create Workspace"
        description="A workspace defines a completely isolated ledger and data environment."
        footer={
          <>
            <button
              onClick={() => setIsDialogOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateWorkspace}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors ring-1 ring-blue-500/50"
            >
              Create Workspace
            </button>
          </>
        }
      >
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">Workspace Name *</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Acme Corp (US)"
              className="w-full bg-[#1e2637] border border-[#2a3441] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Entity Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full bg-[#1e2637] border border-[#2a3441] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option>Corporate</option>
                <option>Subsidiary</option>
                <option>LLC</option>
                <option>Branch</option>
                <option>Personal</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Base Currency</label>
              <select
                value={newCurrency}
                onChange={(e) => setNewCurrency(e.target.value)}
                className="w-full bg-[#1e2637] border border-[#2a3441] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
                <option>INR</option>
                <option>SGD</option>
              </select>
            </div>
          </div>
        </div>
      </CustomDialog>
    </div>
  );
}
