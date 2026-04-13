"use client";

import { Flag, FlaskConical } from "lucide-react";
import { useDemo } from "@/contexts/demo-context";

export function NoData() {
  const { activateDemo } = useDemo();

  return (
    <div className="text-center">
      <Flag className="mx-auto h-10 w-10 text-muted-foreground" />
      <h2 className="mt-4 text-2xl font-semibold leading-tight">
        Event setup in progress
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Flag data hasn&apos;t been imported yet. Check back soon — the event
        organizer is getting things ready.
      </p>
      <button
        onClick={activateDemo}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <FlaskConical className="h-4 w-4" />
        Try Demo
      </button>
    </div>
  );
}
