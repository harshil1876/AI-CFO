'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useAuth } from '@clerk/nextjs';
import { getAuthHeaders } from '@/lib/api';
import { Save, AlertTriangle, Briefcase, ChevronRight, Target, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { CustomDialog, DialogButton } from '@/components/CustomDialog';
import { useRouter } from 'next/navigation';

export default function WorkspaceSettingsPage() {
  const { activeWorkspaceId, setActiveWorkspaceId } = useWorkspace();
  const { orgId, userId } = useAuth();
  const router = useRouter();
  
  const [workspace, setWorkspace] = useState<any>(null);
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('');
  const [entityType, setEntityType] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Goals & Targets
  const [goals, setGoals] = useState<any[]>([]);
  const [newGoalName, setNewGoalName] = useState('Annual Revenue Target');
  const [newGoalValue, setNewGoalValue] = useState('');
  const [isSavingGoal, setIsSavingGoal] = useState(false);

  useEffect(() => {
    if (!activeWorkspaceId) return;

    const fetchWorkspace = async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspaces/${activeWorkspaceId}/`, { headers });
        if (res.ok) {
          const data = await res.json();
          setWorkspace(data);
          setName(data.name);
          setCurrency(data.currency);
          setEntityType(data.entity_type);
        }
      } catch (err) {
        toast.error('Failed to load workspace settings');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchGoals = async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/goals/?workspace_id=${activeWorkspaceId}`, { headers });
        if (res.ok) {
          const data = await res.json();
          setGoals(data);
        }
      } catch (err) {}
    };

    fetchWorkspace();
    fetchGoals();
  }, [activeWorkspaceId]);

  const handleSaveGoal = async () => {
    if (!newGoalValue || isNaN(Number(newGoalValue))) {
      toast.error('Please enter a valid target value');
      return;
    }
    setIsSavingGoal(true);
    try {
      const headers = await getAuthHeaders();
      const botId = orgId || userId || '';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/goals/`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspace_id: activeWorkspaceId,
          bot_id: botId,
          goal_name: newGoalName,
          target_value: Number(newGoalValue),
          period: 'Annual',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setGoals(prev => [...prev, data]);
        setNewGoalValue('');
        toast.success('Goal target saved!');
      } else {
        toast.error('Failed to save goal');
      }
    } catch (err) {
      toast.error('Error saving goal');
    } finally {
      setIsSavingGoal(false);
    }
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspaces/${activeWorkspaceId}/`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, currency, entity_type: entityType }),
      });

      if (res.ok) {
        toast.success("Workspace updated successfully");
      } else {
        toast.error("Failed to update workspace");
      }
    } catch (err) {
      toast.error("Error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspaces/${activeWorkspaceId}/`, {
        method: 'DELETE',
        headers,
      });

      if (res.ok) {
        toast.success("Workspace deleted");
        setActiveWorkspaceId(null);
        router.push('/workspaces');
      } else {
        toast.error("Failed to delete workspace");
      }
    } catch (err) {
      toast.error("Error occurred");
    }
  };

  if (isLoading) return null;

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
              <span>Settings</span> <ChevronRight size={10} /> <span>Workspace</span>
            </div>
            <h2 className="text-base font-semibold text-white">General Profile</h2>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-4xl space-y-6">
        
        {/* Basic Settings */}
        <div className="border border-[#1e2637] bg-[#121622] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1e2637] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Workspace Details</h3>
          </div>
          <div className="p-6 space-y-5">
            <div className="space-y-1.5 max-w-sm">
              <label className="text-xs font-medium text-slate-400">Workspace Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#1e2637] border border-[#2a3441] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 max-w-sm">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Entity Type</label>
                <select
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value)}
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
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
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
          <div className="px-6 py-4 border-t border-[#1e2637] bg-[#161b28] flex justify-end">
            <button
              onClick={handleUpdate}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Save size={16} />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Goals & Targets */}
        <div className="border border-[#1e2637] bg-[#121622] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1e2637] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-blue-400" />
              <h3 className="text-sm font-semibold text-white">Goals & Targets</h3>
            </div>
            <p className="text-xs text-slate-500">Drives the KPI Radial on the dashboard</p>
          </div>
          <div className="p-6 space-y-4">
            {/* Existing Goals */}
            {goals.length > 0 && (
              <div className="space-y-2 mb-4">
                {goals.map((g: any) => (
                  <div key={g.id} className="flex items-center justify-between bg-[#1e2637] rounded-lg px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-white">{g.goal_name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{g.period} · {g.workspace_id}</p>
                    </div>
                    <span className="text-sm font-bold text-blue-400">${Number(g.target_value).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}

            {/* New Goal Form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Goal Name</label>
                <input
                  type="text"
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  className="w-full bg-[#1e2637] border border-[#2a3441] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Annual Revenue Target"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Target Value ($)</label>
                <input
                  type="number"
                  value={newGoalValue}
                  onChange={(e) => setNewGoalValue(e.target.value)}
                  className="w-full bg-[#1e2637] border border-[#2a3441] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. 500000"
                />
              </div>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-[#1e2637] bg-[#161b28] flex justify-end">
            <button
              onClick={handleSaveGoal}
              disabled={isSavingGoal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
            >
              <Plus size={16} />
              {isSavingGoal ? 'Saving...' : 'Set Target'}
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="border border-red-900/30 bg-[#121622] rounded-xl overflow-hidden relative">
          <div className="px-6 py-4 border-b border-red-900/30 flex items-center gap-2 text-red-400">
            <AlertTriangle size={18} />
            <h3 className="text-sm font-semibold">Danger Zone</h3>
          </div>
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-medium text-white">Delete Workspace</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-lg">
                  Permanently delete this workspace and all of its associated ledgers, transactions, and reports. This action cannot be undone.
                </p>
              </div>
              <button
                onClick={() => setIsDeleteDialogOpen(true)}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-sm font-medium transition-colors"
              >
                Delete Workspace
              </button>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <CustomDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          title="Delete Workspace?"
          description={`Are you completely sure you want to delete "${workspace?.name}"? All financial data inside will be permanently lost.`}
          footer={
            <>
              <DialogButton variant="ghost" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</DialogButton>
              <button 
                onClick={handleDelete} 
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors ring-1 ring-red-500/50"
              >
                Yes, delete it
              </button>
            </>
          }
        >{null}</CustomDialog>
      </div>
    </div>
  );
}
