"use client";

import { FlaskConical, X } from "lucide-react";
import { useDemo } from "@/contexts/demo-context";

export function DemoBanner() {
  const { isDemoActive, deactivateDemo, demoFlags } = useDemo();

  if (!isDemoActive) return null;

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between gap-3 bg-amber-100 px-4 py-2 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200">
      <div className="flex items-center gap-2 text-sm font-medium">
        <FlaskConical className="h-4 w-4" />
        <span>
          Demo Mode — {demoFlags.length} sample flags loaded
        </span>
      </div>
      <button
        onClick={deactivateDemo}
        className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors hover:bg-amber-200 dark:hover:bg-amber-800/40"
      >
        <X className="h-3.5 w-3.5" />
        Exit Demo
      </button>
    </div>
  );
}
