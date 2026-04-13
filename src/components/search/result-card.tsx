"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { Flag } from "@/lib/types/flag";

interface ResultCardProps {
  flag: Flag;
}

export function ResultCard({ flag }: ResultCardProps) {
  return (
    <Card size="sm">
      <CardContent>
        <h3 className="font-semibold">{flag.name}</h3>
        <p className="text-sm text-muted-foreground">
          Row {flag.row_label}, Position {flag.position}
        </p>
      </CardContent>
    </Card>
  );
}
