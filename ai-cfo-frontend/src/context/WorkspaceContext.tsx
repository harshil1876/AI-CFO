'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface WorkspaceMeta {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'closed';
  currency: string;
  region: string;
}

type WorkspaceContextType = {
  activeWorkspaceId: string | null;
  activeWorkspace: WorkspaceMeta | null;
  setActiveWorkspaceId: (id: string | null) => void;
  setActiveWorkspace: (ws: WorkspaceMeta | null) => void;
  isWorkspaceLoaded: boolean;
};

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<string | null>(null);
  const [activeWorkspace, setActiveWorkspaceState] = useState<WorkspaceMeta | null>(null);
  const [isWorkspaceLoaded, setIsWorkspaceLoaded] = useState(false);

  useEffect(() => {
    const savedId = localStorage.getItem('last_workspace_id');
    const savedMeta = localStorage.getItem('last_workspace_meta');
    if (savedId) {
      setActiveWorkspaceIdState(savedId);
    }
    if (savedMeta) {
      try { setActiveWorkspaceState(JSON.parse(savedMeta)); } catch {}
    }
    setIsWorkspaceLoaded(true);
  }, []);

  const setActiveWorkspaceId = (id: string | null) => {
    setActiveWorkspaceIdState(id);
    if (id) {
      localStorage.setItem('last_workspace_id', id);
    } else {
      localStorage.removeItem('last_workspace_id');
      localStorage.removeItem('last_workspace_meta');
      setActiveWorkspaceState(null);
    }
  };

  const setActiveWorkspace = (ws: WorkspaceMeta | null) => {
    setActiveWorkspaceState(ws);
    if (ws) {
      localStorage.setItem('last_workspace_meta', JSON.stringify(ws));
    } else {
      localStorage.removeItem('last_workspace_meta');
    }
  };

  return (
    <WorkspaceContext.Provider value={{
      activeWorkspaceId,
      activeWorkspace,
      setActiveWorkspaceId,
      setActiveWorkspace,
      isWorkspaceLoaded,
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
