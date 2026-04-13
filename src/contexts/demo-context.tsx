"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { DEMO_FLAGS } from "@/lib/demo-data";
import type { Flag } from "@/lib/types/flag";

const STORAGE_KEY = "gravestone-finder-demo";

interface DemoContextValue {
  isDemoActive: boolean;
  demoFlags: Flag[];
  activateDemo: () => void;
  deactivateDemo: () => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

/** Convert FlagInsert[] to Flag[] with synthetic IDs */
function toDemoFlags(): Flag[] {
  return DEMO_FLAGS.map((f, i) => ({
    ...f,
    id: i + 1,
    created_at: new Date().toISOString(),
  }));
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [demoFlags, setDemoFlags] = useState<Flag[]>([]);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") {
      setIsDemoActive(true);
      setDemoFlags(toDemoFlags());
    }
  }, []);

  const activateDemo = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsDemoActive(true);
    setDemoFlags(toDemoFlags());
  }, []);

  const deactivateDemo = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setIsDemoActive(false);
    setDemoFlags([]);
  }, []);

  return (
    <DemoContext.Provider
      value={{ isDemoActive, demoFlags, activateDemo, deactivateDemo }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo(): DemoContextValue {
  const ctx = useContext(DemoContext);
  if (!ctx) {
    throw new Error("useDemo must be used within a DemoProvider");
  }
  return ctx;
}
