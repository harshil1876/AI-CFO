"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { DialogDescription } from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

export function Modal({
  children,
  classname,
  open: controlledOpen,
  onOpenChange,
  closeOnOverlayClick = true,
}: {
  children: React.ReactNode;
  classname?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnOverlayClick?: boolean;
}) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(true);

  // Use controlled or uncontrolled state
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  function handleOpenChange(isOpen: boolean) {
    if (isControlled && onOpenChange) {
      onOpenChange(isOpen);
    } else {
      setInternalOpen(isOpen);
      if (!isOpen && !isControlled) {
        router.back();
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn("bg-card rounded-xl border-none shadow-none ", classname)}
        onInteractOutside={(e) => {
          if (!closeOnOverlayClick) {
            e.preventDefault();
          }
        }}
      >
        <VisuallyHidden>
          <DialogTitle>Preview Modal</DialogTitle>
          <DialogDescription>
            Preview and customize your chatbot settings.
          </DialogDescription>
        </VisuallyHidden>

        {children}
      </DialogContent>
    </Dialog>
  );
}
