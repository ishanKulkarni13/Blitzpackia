# Backpack Blitz: HTML MVP to Next.js + Prisma Migration Plan

## 1. Goal and scope

Move the existing [HTML MVP](D:/projects/Backpack-Blitz/mvp/Backpack%20Blitz%20IEEE%20Day%20VIT%20Pune%202.html) into the existing Next.js app under [next/](D:/projects/Backpack-Blitz/next/) without changing the player-facing game rules, layout, or interaction model.

Add:

- Prisma with Neon PostgreSQL as the persistent data store.
- A repeatable seed script for the existing branch/department list.
- Server-backed leaderboard entries so all players see the same data.
- An unlinked `/admin` route with a basic password gate and an all-at-once data view/editor.
- Basic, pragmatic authentication only; no user accounts, OAuth, WebSockets, anti-cheat system, or frontend trust/security model.

Do not add an Admin link to the home page. The route will exist at `/admin` and will be entered manually.

## 2. Existing behavior to preserve

The home page should retain the current:

- Dark, responsive “Backpack Blitz” visual design and mobile layout.
- Ready screen with optional player name, required department/branch, difficulty, and round-time controls.
- Optional phone-number entry for recognizing a returning player without exposing the number publicly.
- Easy, normal, and hard presets:
  - Easy: 5 items, 10 kg capacity, 50-second default round.
  - Normal: 6 items, 15 kg capacity, 45-second default round.
  - Hard: 8 items, 20 kg capacity, 40-second default round.
- Optional round-time overrides of 20, 30, 45, 60, and 90 seconds.
- Random loot generation, click/tap selection, drag-and-drop selection, capacity validation, timer, lock action, greedy-bot comparison, dynamic-programming optimal solution, score formula, end-of-round explanation, and “Next player” flow.
- Department standings based on the sum of each department’s best three scores.
- Player leaderboard showing the top 15 entries, with department filtering.
- Keyboard behavior (Enter/Space where currently supported), responsive behavior, focus states, reduced-motion behavior, and feedback sounds where supported by the browser.

The only intentional persistence change is replacing the browser-only `localStorage` board with database reads/writes. Player preference values such as difficulty/time may remain local browser preferences.

## 3. Project and dependency setup

1. Use the existing Next.js App Router project rather than creating a second app.
2. Add Prisma and the Neon-compatible PostgreSQL driver/configuration:
   - `prisma`
   - `@prisma/client`
   - the project’s chosen Neon adapter/runtime integration, if required by the installed Prisma version.
3. Add scripts in [next/package.json](D:/projects/Backpack-Blitz/next/package.json):
   - `db:generate`
   - `db:migrate`
   - `db:seed`
   - optionally `db:studio` for local inspection.
4. Add environment documentation for:
   - `DATABASE_URL` (Neon pooled/runtime connection string).
   - `DIRECT_URL` if Prisma migrations require a direct Neon connection.
   - `ADMIN_PASSWORD` for the basic admin gate.
   - `ADMIN_SESSION_SECRET` for signing the short-lived admin cookie.
5. Add `.env.example`; never commit actual Neon credentials or the production password.

## 4. Prisma data model

Create a Prisma schema with the following core models:

### Branch

- `id`
- `code` (unique; values such as `CE`, `IT`, `CSE-AI`)
- `name` (display name from the current department list)
- `createdAt`
- `updatedAt`
- relation to leaderboard entries

Use `Branch` as the database name while preserving the current UI wording where appropriate. The existing MVP’s `DEPTS` array is the source of truth for the initial seed data.

### ScoreEntry

- `id`
- `playerName` (normalized and capped to the existing 14-character UI limit)
- `phoneNumber` (optional, normalized before storage, never included in public leaderboard responses)
- `score` (bounded to the existing score range)
- `mode` (`easy`, `normal`, or `hard`)
- optional `branchId`/branch relation to support an unassigned admin value if needed
- `createdAt`

Use a normalized phone value for matching repeat players. The optional phone value should be nullable; multiple entries with no phone number are allowed. Add a unique constraint/index for non-null phone numbers so one phone number maps to one persistent player score record. Add indexes for leaderboard access (`score`, `createdAt`, and branch) and use a stable tie-break order such as score descending then creation time ascending/descending consistently.

If the product needs to retain a history of attempts later, split identity from attempts into separate `Player` and `ScoreAttempt` models. For this MVP, keep the simpler one-record-per-phone behavior: a phone-number player has one current best score, while entries without a phone number continue to create independent anonymous score records.

The database should not store the generated loot or client gameplay state because the requested scope does not require replay verification or anti-cheat enforcement.

## 5. Seed data and migrations

1. Create the initial Prisma migration for the branch and score-entry schema.
2. Create an idempotent `prisma/seed.ts` that upserts every branch/department from the current MVP list:
   - `DESH`
   - `CE`
   - `CE-SE`
   - `IT`
   - `CSE-AI`
   - `CSE-AIML`
   - `CSE-DS`
   - `CSE-IoT`
   - `AI&DS`
   - `E&TC`
   - `I&CE`
   - `MECH`
   - `CIVIL`
3. Configure Prisma’s seed command and verify the seed can be run repeatedly without duplicates.
4. Keep branch codes stable because score entries and admin filters will reference them.

## 6. Next.js application structure

Refactor the starter page into focused components/modules rather than copying the entire HTML document into one component:

- `app/page.tsx`: home route and game shell.
- Client game component(s): timer, loot state, drag/drop, scoring, overlays, browser preferences, and sound effects.
- Shared constants/types: branch list shape, difficulty configuration, loot types, leaderboard types.
- Server-side database client singleton under a server-only library module.
- Server actions or route handlers for:
  - fetching public leaderboard data and branch options,
  - submitting a completed score,
  - admin authentication,
  - admin list/update/delete operations.

Keep all secrets and Prisma calls server-only. The client may submit the calculated score as requested; do not introduce server-side replay validation or an anti-cheat mechanism.

## 7. Public leaderboard flow

1. Load seeded branches and the initial leaderboard on the server or through a route handler.
2. Render the existing leaderboard tabs:
   - Departments: aggregate each branch’s best three scores.
   - Players: top 15 scores, with branch filter.
3. After a player locks the bag:
   - calculate the score using the existing formula,
   - if no phone number was supplied, submit one independent `ScoreEntry` as before,
   - if a phone number was supplied and no matching record exists, create the player’s first `ScoreEntry`,
   - if a matching phone-number record exists, update that record only when the new score is higher; leave the existing record unchanged when the new score is equal or lower,
   - refresh/revalidate the leaderboard,
   - show the same result overlay and rank/branch summary.
4. Handle database/network failures explicitly with an inline error state or notification; do not silently pretend a score was saved.
5. Preserve the current local-only preferences for difficulty/time and the generated fallback player numbering behavior, but do not use local storage as the shared leaderboard.

Phone-number handling:

- The field is optional and should be labeled clearly, for example “Phone number (optional, for retrying later)”.
- Normalize before matching/storage by trimming whitespace and separators and applying one documented format (prefer E.164 when country-code input is supported).
- Validate a reasonable phone format and show an explicit inline error for invalid input; do not silently discard it.
- Do not send the phone number to public leaderboard queries, client leaderboard objects, rendered HTML, or public rank/department responses.
- The player may see that their best score was retained or improved, but the phone number itself should not be echoed back unnecessarily.
- The database update must be atomic/transactional so two retries using the same phone number cannot create duplicate current-score records.

## 8. Admin route and basic auth

Create an unlinked `app/admin/page.tsx` route:

1. Initial page shows only a password field and unlock action.
2. Validate the password on the server against `ADMIN_PASSWORD`.
3. On success, issue a signed, HTTP-only, short-lived cookie using `ADMIN_SESSION_SECRET`.
4. On failure, show a generic “wrong password” message; do not reveal configuration details.
5. Once authenticated, load all score entries at once, as requested, with branch names and mode/timestamps.
6. Provide the existing practical admin operations:
   - search by player name,
   - filter by branch,
   - view the optional phone number (admin only),
   - search/filter by phone number when needed,
   - edit player name, phone number, branch, and score,
   - save,
   - two-step delete confirmation.
7. Revalidate public leaderboard data after saves/deletes.
8. Keep the admin page unlinked from the home page. A direct `/admin` URL is the only intended entry point.

This is deliberately basic operational protection, not a full identity/authentication system. Add secure cookie flags and server-side authorization checks for every admin mutation even though the threat model is intentionally limited. Treat phone numbers as private personal data: restrict them to authenticated admin queries/actions and do not include them in logs or error messages.

## 9. Styling and accessibility

Port the current MVP CSS into the Next.js styling approach with the same custom properties, panel/grid layout, responsive breakpoints, focus outlines, and reduced-motion media query. Avoid changing colors, labels, spacing, or copy unless required by the framework.

Preserve semantic buttons, labels, keyboard focus behavior, drag/drop where available, and a click/tap alternative for touch devices.

## 10. Validation plan

Run the smallest relevant checks after implementation:

1. `npm run lint`
2. `npm run build`
3. Prisma client generation and migration/seed against a configured Neon or local PostgreSQL database.
4. Manual smoke test of:
   - all three modes and timer overrides,
   - optional phone-number entry and invalid-phone validation,
   - first score for a phone number,
   - higher retry replacing the previous score,
   - equal/lower retry leaving the previous score unchanged,
   - multiple no-phone attempts remaining independent,
   - phone number absent from public leaderboard responses and UI,
   - selecting/removing loot by click and drag/drop,
   - capacity rejection,
   - timeout/manual lock and score overlay,
   - public leaderboard updates and branch standings,
   - direct `/admin` access, wrong password, successful unlock, bulk load, edit, delete, and post-change leaderboard refresh.
5. Verify responsive behavior at desktop and mobile widths.

## 11. Implementation order

1. Install/configure Prisma and environment variables.
2. Add schema, migration, branch seed script, and database client.
3. Port the game UI and client-side game logic while keeping behavior equivalent.
4. Add public branch/leaderboard reads and score submission.
5. Add the `/admin` route, cookie gate, bulk list, edit, and delete actions.
6. Port final styling and accessibility details.
7. Run lint/build/database seed checks and complete the manual smoke test.

## 12. Explicit non-goals

- No user registration, accounts, OAuth, email, or role-management system.
- No WebSockets or live push updates; refresh/revalidation after actions is sufficient.
- No frontend anti-cheat, replay verification, score proof, or authoritative server simulation.
- No link to `/admin` on the home page.
- No unrelated redesign or gameplay balancing changes.