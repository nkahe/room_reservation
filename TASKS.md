
# Implementation Tasks (Feature-by-Feature, Test-Gated)

## Global rules
- Implement tasks **strictly in order**.
- Implement **one task at a time**.
- Any task may add or modify files under `tests/**`.
- Business logic belongs in **services**, not HTTP routes.
- Do NOT implement future tasks or combine multiple tasks.
- Do NOT add “nice-to-have” features unless explicitly required by the task.
- Do not proceed to the next task until **all tests pass**.

---

## Task 1 — Project scaffold & tooling (no business logic)
**Goal**
Set up the project foundation only: tooling, structure, and a smoke test.

**Deliverables**
- `package.json` with scripts:
  - `dev`
  - `build`
  - `start`
  - `test`
- `tsconfig.json` with strict settings
- Base folder structure under `src/` and `tests/`
- Minimal Express bootstrap (`app.ts`, `server.ts`)
- A trivial smoke test

**Allowed files**
- `package.json`
- `tsconfig.json`
- `src/app.ts`
- `src/server.ts`
- `tests/smoke.test.ts`

**Do NOT**
- Implement domain models
- Implement services or repositories
- Implement business logic

**Done when**
- `npm test` passes
- `npm run build` succeeds

---

## Task 2 — Domain model, errors, and clock abstraction
**Goal**
Define core domain types, error classes, and time abstraction.

**Files**
- `src/domain/reservation.ts`
- `src/domain/errors.ts`
- `src/services/clock.ts`

**Unit tests**
- Error classes can be instantiated and type-checked
- Clock abstraction can be mocked in tests

**Do NOT**
- Implement persistence
- Implement business rules
- Implement HTTP routes

**Done when**
- `npm test` passes

---

## Task 3 — Rooms configuration
**Goal**
Introduce the fixed list of allowed rooms and validation helpers.

**Files**
- `src/config/rooms.ts`

**Unit tests**
- Valid room IDs return true
- Invalid room IDs return false

**Do NOT**
- Add room CRUD
- Hardcode room logic elsewhere

**Done when**
- `npm test` passes

---

## Task 4 — In-memory reservation repository
**Goal**
Define a repository interface and an in-memory implementation.

**Files**
- `src/repositories/reservationRepository.ts`
- `src/repositories/inMemoryReservationRepository.ts`

**Unit tests**
- Create then getById works
- listByRoom returns sorted by start time
- delete removes from all internal indexes
- delete returns false when id does not exist

**Do NOT**
- Implement business rules
- Perform overlap checks here

**Done when**
- `npm test` passes

---

## Task 5 — ReservationService: create reservation
**Goal**
Implement reservation creation with all business rules enforced.

**Files**
- `src/services/reservationService.ts`

**Business rules**
- Room must exist
- Timestamps must be parseable
- `startTime < endTime` (strict)
- `startTime >= now` (using injected Clock)
- No overlap in the same room

**Overlap rule (from SPEC)**

newStart < existingEnd && newEnd > existingStart

**Unit tests**
- Creates valid reservation
- Rejects invalid room
- Rejects non-parseable timestamps
- Rejects `start >= end`
- Rejects past start
- Rejects overlapping reservation
- Allows back-to-back reservations ([start, end))

**Do NOT**
- Implement HTTP routes
- Seed data
- Add logging or metrics

**Done when**
- `npm test` passes

---

## Task 6 — ReservationService: list reservations with filters
**Goal**
Implement listing of reservations for a room with optional filters.

**Files**
- `src/services/reservationService.ts`

**Rules**
- Room must exist
- Results sorted by start time ascending
- Optional filters:
  - `from`: keep reservations where `endMs > fromMs`
  - `to`: keep reservations where `startMs < toMs`
- Filtering logic must live in the service layer

**Unit tests**
- Returns all reservations sorted
- Applies `from` filter
- Applies `to` filter
- Rejects invalid `from` / `to` values

**Do NOT**
- Implement HTTP routes

**Done when**
- `npm test` passes

---

## Task 7 — ReservationService: cancel reservation
**Goal**
Implement cancellation of a reservation by id.

**Files**
- `src/services/reservationService.ts`

**Rules**
- Deleting an existing reservation succeeds
- Deleting a non-existent reservation throws not-found error

**Unit tests**
- Cancel existing reservation
- Cancel missing reservation

**Do NOT**
- Implement HTTP routes

**Done when**
- `npm test` passes

---

## Task 8 — HTTP layer skeleton
**Goal**
Create Express app composition and basic routing.

**Files**
- `src/app.ts`
- `src/http/routes/health.ts`
- `src/http/middleware/errorHandler.ts`

**E2E tests**
- `GET /health` returns 200 and `{ "status": "ok" }`

**Do NOT**
- Implement reservation endpoints

**Done when**
- `npm test` passes

---

## Task 9 — HTTP: create reservation endpoint
**Goal**
Expose reservation creation via HTTP.

**Endpoint**
`POST /rooms/:roomId/reservations`

**Files**
- `src/http/routes/reservations.ts`
- `src/http/middleware/validate.ts`
- `src/http/dto/reservationDto.ts`
- `src/app.ts`
- `src/http/middleware/errorHandler.ts`

**E2E tests**
- Successful create returns 201 and reservation DTO
- Invalid input returns 400 with error format
- Unknown room returns 404
- Overlap returns 409

**Do NOT**
- Implement list or delete endpoints

**Done when**
- `npm test` passes

---

## Task 10 — HTTP: list reservations endpoint
**Goal**
Expose reservation listing via HTTP.

**Endpoint**
`GET /rooms/:roomId/reservations?from&to`

**Files**
- src/http/routes/reservations.ts
- src/http/middleware/validate.ts

**E2E tests**
- Returns sorted reservations
- Applies from/to filters
- Invalid from/to returns 400

**Do NOT**
- Implement delete endpoint

**Done when**
- `npm test` passes

---

## Task 11 — HTTP: cancel reservation endpoint
**Goal**
Expose reservation cancellation via HTTP.

**Endpoint**
`DELETE /reservations/:id`

**Files**
- src/http/routes/reservations.ts
- src/http/middleware/validate.ts
- src/http/middleware/errorHandler.ts

**E2E tests**
- Deleting existing reservation returns 204
- Deleting missing reservation returns 404

**Done when**
- `npm test` passes

---

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
