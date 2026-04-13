import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SearchPage } from "@/components/search/search-page";
import type { Flag } from "@/lib/types/flag";

export const metadata: Metadata = {
  title: "Flag Finder - Find a Veteran's Flag",
  description:
    "Search for a veteran's flag by name and find its location",
};

export const dynamic = "force-dynamic";

export default async function Home() {
  let flags: Flag[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("flags")
      .select("id, name, row_label, position, created_at")
      .order("name");

    flags = (data as Flag[]) ?? [];
  } catch {
    // Supabase not connected — flags stays empty, demo button will show
  }

  return (
    <main>
      <SearchPage flags={flags} />
    </main>
  );
}
