"use client";

import { useEffect, useRef, ReactNode } from "react";
import { X } from "lucide-react";

interface CustomDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * A reusable glassmorphic dialog that replaces all browser-native window.prompt() calls.
 * Traps focus within the dialog, supports keyboard Escape to close, and has smooth animations.
 */
export function CustomDialog({ isOpen, onClose, title, description, children, footer }: CustomDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Trap scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Dialog Panel */}
      <div
        ref={dialogRef}
        className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-200 mx-4"
      >
        <div className="rounded-xl border border-white/10 bg-[#131929] shadow-2xl shadow-black/50">
          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-white/5">
            <div>
              <h2 className="text-sm font-semibold text-white">{title}</h2>
              {description && (
                <p className="text-xs text-slate-400 mt-0.5">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="ml-4 text-slate-500 hover:text-white transition-colors p-1 rounded-md hover:bg-white/5"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-6 pb-5 pt-0 flex justify-end gap-2">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Standard button variants for dialog footers */
export function DialogButton({
  onClick,
  variant = "primary",
  children,
  disabled,
}: {
  onClick: () => void;
  variant?: "primary" | "ghost";
  children: ReactNode;
  disabled?: boolean;
}) {
  if (variant === "primary") {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-all border border-blue-400/50"
      >
        {children}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-slate-300 text-sm font-medium rounded-lg transition-all border border-white/10"
    >
      {children}
    </button>
  );
}
