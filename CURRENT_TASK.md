
## Task 12 — Optional dev-only seed data (interactive testing)

**Goal**  
Provide optional dummy data for local, interactive development without affecting
core application behavior or tests.

This feature exists **only to improve developer experience** and is not part of
the required API behavior.

---

**Files**
- `src/app.ts`
- optional: `src/seed/**`

---

**Rules**
- Seeding MUST be optional and disabled by default.
- Seeding MUST be enabled only via environment flag:
  - `SEED_DATA=true`
- When the flag is not set, the application MUST start with an empty in-memory DB.
- Seed 3–6 reservations total.
- All seeded reservations must:
  - be in the future relative to the injected `Clock`
  - use valid room IDs only
  - have no overlaps within the same room
- Seeding MUST use the **ReservationService**, not direct repository writes.
- Seeding MUST happen during app composition (`app.ts`), not inside services.
- Seeding MUST be idempotent (must not duplicate data on restart or hot reload).

---

**Tests**
- When `SEED_DATA` is not set:
  - no reservations are seeded
- When `SEED_DATA=true`:
  - seeded reservations are in the future
  - seeded reservations do not overlap per room
  - all seeded room IDs are valid

---

**Do NOT**
- Add HTTP endpoints for seeding
- Seed unconditionally
- Hardcode absolute timestamps
- Seed inside repositories or services

---

**Done when**
- `npm test` passes
- Application starts with empty data by default
- Application can be started with seeded data using
 SEED_DATA=true npm run dev

