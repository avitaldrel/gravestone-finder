import type { Flag } from "@/lib/types/flag";

interface RowDirectoryProps {
  flags: Flag[];
}

/**
 * By-row grouped directory listing.
 * Groups flags by row_label, sorted alphabetically.
 * Within each group, entries sorted by position ascending.
 * Row heading: "Row {row_label}" (Heading typography)
 * Entry: "Position {position}: {Name}" (Body typography)
 * Each group wrapped in "directory-group" class for print break-inside:avoid.
 */
export function RowDirectory({ flags }: RowDirectoryProps) {
  // Group flags by row_label
  const groups = new Map<string, Flag[]>();
  for (const flag of flags) {
    const existing = groups.get(flag.row_label);
    if (existing) {
      existing.push(flag);
    } else {
      groups.set(flag.row_label, [flag]);
    }
  }

  // Sort groups by row_label alphabetically
  const sortedKeys = [...groups.keys()].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" })
  );

  return (
    <div className="flex flex-col gap-6">
      {sortedKeys.map((rowLabel) => {
        const rowFlags = groups.get(rowLabel)!;
        // Sort by position ascending within each group
        const sortedFlags = [...rowFlags].sort(
          (a, b) => a.position - b.position
        );

        return (
          <div key={rowLabel} className="directory-group">
            <h2 className="text-xl font-semibold leading-tight">
              Row {rowLabel}
            </h2>
            <ul className="mt-2 flex flex-col gap-1">
              {sortedFlags.map((flag) => (
                <li key={flag.id} className="text-sm font-normal">
                  Position {flag.position}: {flag.name}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
