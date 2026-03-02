"use client";

import { createContext, useContext, useState } from "react";

interface PreviewModalContextType {
  isPreviewOpen: boolean;
  setIsPreviewOpen: (open: boolean) => void;
  isAiSheetOpen: boolean;
  setIsAiSheetOpen: (open: boolean) => void;
}

const PreviewModalContext = createContext<PreviewModalContextType | null>(null);

export function PreviewModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAiSheetOpen, setIsAiSheetOpen] = useState(false);

  return (
    <PreviewModalContext.Provider
      value={{
        isPreviewOpen,
        setIsPreviewOpen,
        isAiSheetOpen,
        setIsAiSheetOpen,
      }}
    >
      {children}
    </PreviewModalContext.Provider>
  );
}

export function usePreviewModal() {
  const context = useContext(PreviewModalContext);
  if (!context) {
    // Return default values if context is not available (for graceful degradation)
    return {
      isPreviewOpen: false,
      setIsPreviewOpen: () => {},
      isAiSheetOpen: false,
      setIsAiSheetOpen: () => {},
    };
  }
  return context;
}
