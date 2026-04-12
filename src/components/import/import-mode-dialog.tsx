"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ImportModeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingCount: number;
  onReplace: () => void;
  onMerge: () => void;
  onKeep: () => void;
}

/**
 * ImportModeDialog (D-13)
 *
 * When the organizer imports a file and data already exists,
 * this dialog asks them to choose: Replace All, Merge, or Keep Existing Data.
 */
export function ImportModeDialog({
  open,
  onOpenChange,
  existingCount,
  onReplace,
  onMerge,
  onKeep,
}: ImportModeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Existing Data Found</DialogTitle>
          <DialogDescription>
            There are already {existingCount} flags in the system. How would you
            like to handle this import?
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Button
              variant="destructive"
              size="lg"
              className="w-full"
              onClick={onReplace}
            >
              Replace All Data
            </Button>
            <p className="text-sm text-muted-foreground">
              Remove all existing flags and import only the new file data.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <Button
              variant="default"
              size="lg"
              className="w-full"
              onClick={onMerge}
            >
              Merge with Existing
            </Button>
            <p className="text-sm text-muted-foreground">
              Add new flags and update existing ones that share the same row and
              position.
            </p>
          </div>

          <div className="flex justify-center pt-2">
            <Button variant="outline" onClick={onKeep}>
              Keep Existing Data
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
