import type { IFuseOptions } from "fuse.js";
import type { Flag } from "@/lib/types/flag";

export const FUSE_OPTIONS: IFuseOptions<Flag> = {
  keys: ["name"],
  threshold: 0.4,
  ignoreLocation: true,
  includeScore: true,
  minMatchCharLength: 2,
  shouldSort: true,
};
