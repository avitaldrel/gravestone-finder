# Flag Finder - Improvement Ideas

Brainstormed 2026-04-12 after v1 completion. Ranked by impact vs effort.

---

## Quick Wins (low effort, high value)

### 1. Result Count Badge
Show "3 results" above search results so visitors know how many matches at a glance.

### 2. Auto-Focus Search Bar
Auto-focus the search input on page load so visitors can start typing immediately without tapping the field.

### 3. Shareable Search Links
Put the search query in the URL (`?q=Smith`) so families can text a direct link to each other at the event.

### 4. Custom Favicon
Replace the default Next.js favicon with a flag or memorial-themed icon.

---

## Medium Effort, High Value

### 5. Offline Support (PWA)
Add a service worker so the app works without cell signal at the event field. **Critical if the venue has spotty reception.** Cache the flag data on first load, serve search results offline.

### 6. QR Code for Event Entrance
Generate a QR code that links to the search page. Print it on a sign at the field entrance so visitors don't need to type a URL on their phone.

### 7. Dark Mode Toggle
The CSS variables are already set up for dark mode — just needs a toggle button in the header. Good for evening events.

### 8. Loading Skeletons
Replace the "Loading..." text on the directory page with animated skeleton cards for a more polished feel.

---

## Larger Features (v2 territory)

### 9. Multi-Event Support
Event selector so one app instance can serve multiple Field of Flags events (different years, locations).

### 10. Veteran Details
Optional notes/branch/rank fields per flag. The CSV parser would need new columns. Could show "SGT John Smith - US Army" instead of just "John Smith".

### 11. Admin Auth
Protect the `/admin` import page so only organizers can upload/replace data. Currently anyone who knows the URL can import.

### 12. Search Analytics
Track which names are searched most to understand visitor patterns and engagement.

---

## Open Questions

- **Hosting plan**: Is the event commercial (sponsors, donations)? Determines Vercel Hobby (free) vs Pro ($20/mo).
- **Supabase**: Has the project been created and the SQL migration run?
- **Background opacity**: Current overlay is ~88-92% white. Adjust?
- **Cell reception at venue**: If spotty, PWA offline support (#5) is a must-have before launch.
