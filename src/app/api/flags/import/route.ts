import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { FlagInsert } from "@/lib/types/flag";

/**
 * POST /api/flags/import
 *
 * Import flag data into Supabase. Supports two modes:
 * - "replace": Delete all existing flags, then insert new ones
 * - "merge": Upsert flags by row_label+position composite key
 *
 * Request body: { flags: FlagInsert[], mode: "replace" | "merge" }
 * Response: { count: number } on success, { error: string } on failure
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { flags, mode } = body as {
      flags: FlagInsert[];
      mode: string;
    };

    // Validate request body shape (T-01-08: Tampering mitigation)
    if (!Array.isArray(flags)) {
      return NextResponse.json(
        { error: "Invalid request: flags must be an array" },
        { status: 400 },
      );
    }

    if (mode !== "replace" && mode !== "merge") {
      return NextResponse.json(
        { error: 'Invalid request: mode must be "replace" or "merge"' },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    if (mode === "replace") {
      // Delete all existing flags first
      // CRITICAL: Supabase requires a filter on delete. Use .gte("id", 0) to match all rows.
      const { error: deleteError } = await supabase
        .from("flags")
        .delete()
        .gte("id", 0);

      if (deleteError) {
        return NextResponse.json(
          { error: "Failed to clear existing data" },
          { status: 500 },
        );
      }

      // Handle empty flags array
      if (flags.length === 0) {
        return NextResponse.json({ count: 0 });
      }

      // Insert new flags
      const { data, error: insertError } = await supabase
        .from("flags")
        .insert(flags)
        .select();

      if (insertError) {
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 },
        );
      }

      return NextResponse.json({ count: data?.length ?? 0 });
    }

    // mode === "merge"
    if (flags.length === 0) {
      return NextResponse.json({ count: 0 });
    }

    const { data, error: upsertError } = await supabase
      .from("flags")
      .upsert(flags, { onConflict: "row_label,position" })
      .select();

    if (upsertError) {
      return NextResponse.json(
        { error: upsertError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ count: data?.length ?? 0 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}

/**
 * GET /api/flags/import
 *
 * Fetch all flags, sorted by name.
 * Used by the admin page to check if data exists (D-13 dialog trigger)
 * and to display the imported data table.
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("flags")
      .select("*")
      .order("name");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch flags" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/flags/import
 *
 * Delete all flags from the database.
 */
export async function DELETE() {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("flags").delete().gte("id", 0);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete flags" },
      { status: 500 },
    );
  }
}
