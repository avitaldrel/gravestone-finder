"use client";

import { Flag } from "lucide-react";

export function NoData() {
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
    </div>
  );
}
