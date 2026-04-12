export interface Flag {
  id: number;
  name: string;
  row_label: string;
  position: number;
  created_at: string;
}

export type FlagInsert = Omit<Flag, "id" | "created_at">;
