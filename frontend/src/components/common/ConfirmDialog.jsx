import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  isConfirming = false,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] bg-white border border-[#7DA0CA]/40 rounded-xl shadow-lg p-6">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-base font-bold text-[#021024]">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-xs text-[#5483B3] leading-relaxed">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter className="mt-5 flex gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isConfirming}
            className="border-[#7DA0CA]/50 text-[#021024] hover:bg-slate-100 text-xs"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isConfirming}
            className={
              variant === "destructive"
                ? ""
                : "bg-[#052659] hover:bg-[#021024] text-white text-xs font-semibold"
            }
          >
            {isConfirming ? (
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Processing...
              </span>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
