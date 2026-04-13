import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SearchPage } from "@/components/search/search-page";
import type { Flag } from "@/lib/types/flag";

export const metadata: Metadata = {
  title: "Field of Flags - Find a Veteran's Flag",
  description:
    "Search for a veteran's flag by name and find its location",
};

export default async function Home() {
  const supabase = await createClient();
  const { data: flags } = await supabase
    .from("flags")
    .select("id, name, row_label, position")
    .order("name");

  return (
    <main>
      <SearchPage flags={(flags as Flag[]) ?? []} />
    </main>
  );
}
