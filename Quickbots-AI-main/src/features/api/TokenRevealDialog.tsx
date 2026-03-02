"use client";

import { AlertTriangleIcon, Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type TokenRevealProps = {
  token: string;
  open: boolean;
  onClose: () => void;
};

export function TokenRevealDialog({ token, open, onClose }: TokenRevealProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(token);
    toast.info("API token copied to clipboard");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-popover border border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            API Key Created
          </DialogTitle>
          <DialogDescription className="text-sm text-yellow-700 dark:text-yellow-200 items-center justify-between flex gap-3">
            <AlertTriangleIcon className="h-8 w-8" />
            <span>
              This is your only chance to copy the API key. Store it securely —
              <u>you won&apos;t see it again</u>.
            </span>
            <AlertTriangleIcon className="h-8 w-8" />
          </DialogDescription>
        </DialogHeader>

        <div
          className={
            "mt-4 flex rounded-md bg-muted gap-3 p-3 font-mono text-sm text-muted-foreground relative break-all border"
          }
        >
          {token}
          <Button
            variant="ghost"
            className=" h-6 w-6 p-0"
            onClick={handleCopy}
            title="Copy"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="default" onClick={onClose}>
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
