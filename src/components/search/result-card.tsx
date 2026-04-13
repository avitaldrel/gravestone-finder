"use client";

import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Flag } from "@/lib/types/flag";

interface ResultCardProps {
  flag: Flag;
}

export function ResultCard({ flag }: ResultCardProps) {
  return (
    <Card size="sm">
      <CardContent>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{flag.name}</h3>
            <p className="text-sm text-muted-foreground">
              Row {flag.row_label}, Position {flag.position}
            </p>
          </div>
          <MapPin className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}
