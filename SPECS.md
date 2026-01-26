# Meeting Room Reservation API — SPEC

## Overview
Build a small REST API for meeting room reservations.

Must support:
- Create a reservation (reserve a room for a time period)
- Cancel a reservation (remove a reservation)
- View reservations (list reservations for a specific room)

## Technology constraints
- Node.js + Express
- TypeScript
- In-memory database only (no external DB)
- Proper error handling
- Seed a few default reservations as dummy data

## Rooms
Rooms are predefined (no room CRUD endpoints). The service recognizes exactly these room IDs:

1. alpha
2. beta
3. gamma
4. delta
5. epsilon
6. zeta
7. eta
8. theta
9. iota
10. kappa

Any other `roomId` is invalid → 404.

## Time handling

### Accepted format
- API accepts and returns timestamps as ISO 8601 strings (e.g. `2026-01-21T10:00:00Z` or `2026-01-21T12:00:00+02:00`).
- Service parses timestamps to epoch milliseconds internally.
- Validation is performed against the server clock (in UTC via epoch ms).

### Interval semantics
Reservations use **half-open** intervals: **[start, end)**.
- `startTime` is inclusive
- `endTime` is exclusive
This allows back-to-back bookings:
- 10:00–11:00 and 11:00–12:00 do **not** overlap.

### Business rules
- Start must be strictly before end (`startTime < endTime`).
- Reservations cannot be set in the past: `startTime >= now`.
- Reservations cannot overlap in the same room.

**Overlap definition**  
A new reservation conflicts with an existing reservation if:
`newStart < existingEnd && newEnd > existingStart`

## Data model

### Reservation entity (internal)
- `id: string` (uuid)
- `roomId: string`
- `startMs: number`
- `endMs: number`
- `reservedBy: string`
- `createdAtMs: number`

### Reservation DTO (API)
Response object fields:
- `id: string`
- `roomId: string`
- `startTime: string` (ISO 8601)
- `endTime: string` (ISO 8601)
- `reservedBy: string`
- `createdAt: string` (ISO 8601)

## API Endpoints

### Create reservation
`POST /rooms/:roomId/reservations`

Body:
```json
{
  "startTime": "2026-01-21T10:00:00Z",
  "endTime": "2026-01-21T11:00:00Z",
  "reservedBy": "optional string"
}
```

Success:

- 201 Created
- Response body: Reservation DTO

Errors:

- 400 Bad Request for invalid input:
    - missing fields
    - timestamps not parseable
    - startTime >= endTime
- 404 Not Found if roomId is not one of the predefined rooms
- 409 Conflict if overlaps an existing reservation in the same room
- 500 Internal Server Error for unexpected errors

### List reservations for a room

GET /rooms/:roomId/reservations?from=...&to=...

Query params (optional):

- from (ISO 8601): include reservations that end after from
- to (ISO 8601): include reservations that start before to

Filtering logic:

- If from provided: keep reservations where res.endMs > fromMs
- If to provided: keep reservations where res.startMs < toMs

Success:

- 200 OK
- Response body:

```json
{
  "roomId": "alpha",
  "reservations": [ /* Reservation DTO array */ ]
}
```

Sorting:
- Reservations sorted ascending by startTime.

Errors:
- 400 Bad Request if from/to cannot be parsed
- 404 Not Found if roomId invalid

### Cancel reservation

DELETE /reservations/:id

Success:

- 204 No Content

Errors:

- 404 Not Found if reservation id does not exist

### Health (optional but implemented)

GET /health

200 OK

```json
{ "status": "ok" }
```

### Error response format

All non-2xx responses (except 204) must return JSON:

```json
{
  "error": {
    "code": "STRING_CODE",
    "message": "Human readable message",
    "details": { "optional": "structured context" }
  }
}
```

### Error codes

- VALIDATION_ERROR (400)
- ROOM_NOT_FOUND (404)
- RESERVATION_NOT_FOUND (404)
- OVERLAP (409)
- INTERNAL_ERROR (500)

### Seeding dummy data

On startup, seed 3–6 reservations across multiple rooms.

All seeded reservations must be in the future relative to the service clock (now).

Use offsets from now (e.g. +1h to +2h, +3h to +4h) so it is always valid.

### Non-goals

- No authentication/authorization
- No persistence across restarts
- No user management
- No room creation/editing/deletion endpoints
