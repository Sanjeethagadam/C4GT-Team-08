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

export const FormDialog = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Save Changes",
  cancelLabel = "Cancel",
  maxWidth = "sm:max-w-[500px]",
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${maxWidth} bg-white border border-[#7DA0CA]/40 rounded-xl shadow-lg p-0 gap-0 overflow-hidden`}>
        <form onSubmit={onSubmit}>
          <DialogHeader className="p-5 pb-3 border-b border-[#7DA0CA]/20 bg-[#f4f9fd]/60">
            <DialogTitle className="text-base font-bold text-[#021024]">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="text-xs text-[#5483B3] mt-0.5">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="p-5 max-h-[75vh] overflow-y-auto space-y-4">
            {children}
          </div>
          <DialogFooter className="p-4 bg-[#f4f9fd]/80 border-t border-[#7DA0CA]/20 flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="border-[#7DA0CA]/50 text-[#021024] hover:bg-slate-100 text-xs"
            >
              {cancelLabel}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-[#052659] hover:bg-[#021024] text-white text-xs font-semibold"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving...
                </span>
              ) : (
                submitLabel
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
