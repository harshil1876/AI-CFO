// components/ConfirmActionDialog.tsx
"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "./ui/spinner";

interface ConfirmActionDialogProps {
  title: string;
  description: string;
  actionLabel?: string;
  triggerLabel: string;
  onConfirm: () => void;
  variant?: "default" | "destructive" | "outline";
  icon: React.ReactNode;
  disabled?: boolean;
  isDestructive?: boolean;
  confirmationText?: string; // Text that must be typed to confirm
}

export function ConfirmActionDialog({
  title,
  description,
  actionLabel = "Confirm",
  triggerLabel,
  onConfirm,
  variant = "outline",
  icon,
  disabled,
  isDestructive = false,
  confirmationText,
}: ConfirmActionDialogProps) {
  const [typedText, setTypedText] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset typed text when dialog closes
      setTypedText("");
    }
  };

  const isConfirmed = confirmationText
    ? typedText.trim() === confirmationText.trim()
    : true;

  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirm();
      setIsOpen(false);
      setTypedText("");
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild disabled={disabled}>
        <Button
          disabled={disabled}
          variant={variant}
          className="w-full sm:w-auto"
        >
          {disabled && !isDestructive ? (
            <Spinner />
          ) : (
            <>
              {icon} {triggerLabel}
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {confirmationText && (
          <div className="space-y-2 py-4">
            <Label htmlFor="confirm-input" className="text-sm font-medium">
              Type{" "}
              <span className="font-semibold text-destructive">
                {confirmationText}
              </span>{" "}
              to confirm:
            </Label>
            <Input
              id="confirm-input"
              type="text"
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              placeholder={confirmationText}
              className="w-full"
              autoFocus
            />
            {typedText && !isConfirmed && (
              <p className="text-xs text-destructive">
                The text does not match. Please type exactly: {confirmationText}
              </p>
            )}
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setTypedText("")}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className={isDestructive ? "bg-red-500 hover:bg-red-600" : ""}
            onClick={handleConfirm}
            disabled={!isConfirmed}
          >
            {actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
