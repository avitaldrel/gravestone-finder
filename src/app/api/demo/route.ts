import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEMO_FLAGS } from "@/lib/demo-data";

/**
 * POST /api/demo
 *
 * Seed the database with demo flag data.
 * Replaces any existing data.
 */
export async function POST() {
  try {
    const supabase = await createClient();

    // Clear existing data
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

    // Insert demo flags
    const { data, error: insertError } = await supabase
      .from("flags")
      .insert(DEMO_FLAGS)
      .select();

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ count: data?.length ?? 0 });
  } catch {
    return NextResponse.json(
      { error: "Failed to seed demo data" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/demo
 *
 * Clear all demo/flag data from the database.
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
      { error: "Failed to clear data" },
      { status: 500 },
    );
  }
}
