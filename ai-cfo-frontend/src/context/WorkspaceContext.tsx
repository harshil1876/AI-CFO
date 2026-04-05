'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

type WorkspaceContextType = {
  activeWorkspaceId: string | null;
  setActiveWorkspaceId: (id: string | null) => void;
  isWorkspaceLoaded: boolean;
};

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<string | null>(null);
  const [isWorkspaceLoaded, setIsWorkspaceLoaded] = useState(false);

  // Remember the last workspace the user accessed on mount
  useEffect(() => {
    const saved = localStorage.getItem('last_workspace_id');
    if (saved) {
      setActiveWorkspaceIdState(saved);
    }
    setIsWorkspaceLoaded(true);
  }, []);

  const setActiveWorkspaceId = (id: string | null) => {
    setActiveWorkspaceIdState(id);
    if (id) {
      localStorage.setItem('last_workspace_id', id);
    } else {
      localStorage.removeItem('last_workspace_id');
    }
  };

  return (
    <WorkspaceContext.Provider value={{ activeWorkspaceId, setActiveWorkspaceId, isWorkspaceLoaded }}>
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
