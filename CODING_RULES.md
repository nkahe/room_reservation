

### `CODING_RULES.md`

# Coding Rules & Best Practices

## General
- TypeScript **strict** mode enabled.
- No `any` (unless unavoidable in a tiny boundary area; prefer `unknown` + narrowing).
- Keep functions small and testable.
- Prefer immutable data where practical.

## Architecture
Use layered design:

- **domain/**: pure types + error classes (no Express imports)
- **services/**: business rules (no Express imports)
- **repositories/**: persistence interface + in-memory implementation
- **http/**: Express routes, DTO validation, error mapping
- **app composition**: wire dependencies in one place

Business logic must not depend on Express.

## Time handling
- Do **not** call `Date.now()` directly inside services.
- Implement a `Clock` interface:
  - `nowMs(): number`
- Inject a real clock in production and a fake clock in tests.

## Validation
- Validate inputs at the HTTP boundary (DTO schema).
- Validate business rules in the service layer.
- Parsing:
  - Only accept ISO 8601 strings and reject non-parseable values.
  - Store as epoch ms internally.

## Error handling
- Use typed errors (custom classes) in domain/services.
- A single Express error middleware maps errors → HTTP status + JSON error format.
- Never leak raw stack traces in responses.
- Log unexpected errors server-side (basic `console.error` is fine).

Recommended HTTP status usage:
- 400 Bad Request — malformed/invalid client input (missing fields, parse errors, start>=end)
- 404 Not Found — unknown room or reservation
- 409 Conflict — overlap conflict
- 500 Internal Server Error — unexpected failures

## Repository rules (in-memory)
- Repository is the single source of truth for stored reservations.
- Keep data structures simple and deterministic:
  - `Map<roomId, Reservation[]>` (sorted by startMs)
  - `Map<id, Reservation>` for fast delete
- Ensure create/delete operations keep the structures consistent.

## Testing
- Use **Vitest**.
- Unit tests focus on service logic (fast, deterministic).
- Minimal E2E tests (supertest) for routes.
- Tests must not depend on real time. Use fake clock.
- Every implemented task must include tests.

## Code style
- Clear names (`createReservation`, `listReservationsForRoom`).
- Avoid cleverness: clarity > micro-optimizations.
- Return DTOs from controllers; never return internal model directly.
- Keep route handlers thin: parse → call service → map to response.

## What NOT to do
- No global mutable singletons that make tests flaky.
- No “catch-all” 200 responses for failures.
