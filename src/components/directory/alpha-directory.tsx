import type { Flag } from "@/lib/types/flag";

interface AlphaDirectoryProps {
  flags: Flag[];
}

/**
 * Alphabetical name-to-position directory listing.
 * Sorts flags A-Z by name (case-insensitive).
 * Each entry: "{Name} -- Row {row_label}, Position {position}"
 * Uses dotted leader pattern between name and location.
 * CSS class "alpha-directory" enables two-column print layout.
 */
export function AlphaDirectory({ flags }: AlphaDirectoryProps) {
  const sorted = [...flags].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );

  return (
    <div className="alpha-directory">
      <ul className="flex flex-col gap-1">
        {sorted.map((flag) => (
          <li
            key={flag.id}
            className="flex items-baseline gap-2 text-sm font-normal"
          >
            <span className="shrink-0">{flag.name}</span>
            <span className="min-w-0 flex-1 border-b border-dotted border-muted-foreground/40" />
            <span className="shrink-0 text-muted-foreground">
              Row {flag.row_label}, Position {flag.position}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
