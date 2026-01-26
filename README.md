# Meeting Room Reservation API

A small REST API for reserving meeting rooms.

## Technologies

- TypeScript (strict)
- Node.js
- Express
- Vitest
- Supertest

## Assumptions
Since the assignment leaves room for interpretation, these assumptions are used:

- Rooms are predefined (no room CRUD):  
  `alpha, beta, gamma, delta, epsilon, zeta, eta, theta, iota, kappa`
- Timestamps are ISO 8601 strings in requests/responses.
- Validation is done against server time (epoch ms).
- Reservation interval semantics are **[start, end)** (end is exclusive), allowing back-to-back bookings.
- No authentication/authorization.
- Seeded dummy reservations are always in the future (relative to server start time).

## Architecture

Layered design keeps HTTP concerns separate from business logic and persistence:

- `domain/`: pure types + error classes (no Express imports)
- `services/`: business rules and orchestration (no Express imports)
- `repositories/`: persistence interface + in-memory implementation
- `http/`: Express routes, DTO validation, and error mapping
- App composition wires dependencies in one place

Key rules:
- Business logic does not depend on Express.
- HTTP layer validates request DTOs; services enforce business rules.
- Time is abstracted via a `Clock` interface to keep services testable.

## API

### Error format

All errors return JSON:
```json
{
  "error": {
    "code": "STRING_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

Types:
- `error.code`: string
- `error.message`: string
- `error.details`: object (may be empty)

### Endpoints

#### Create reservation

`POST /rooms/:roomId/reservations`

Path params:
- `roomId`: string (required)

Body:
```json
{   
  "startTime": "2026-01-21T10:00:00Z",
  "endTime": "2026-01-21T11:00:00Z",
  "reservedBy": "Ada"
}
```

Body types:
- `startTime`: string (required, ISO 8601)
- `endTime`: string (required, ISO 8601)
- `reservedBy`: string (required)

Success:
-   201 Created
-   returns the created reservation

Response body (Reservation DTO):
```json
{
  "id": "string",
  "roomId": "string",
  "startTime": "2026-01-21T10:00:00.000Z",
  "endTime": "2026-01-21T11:00:00.000Z",
  "reservedBy": "string",
  "createdAt": "2026-01-20T12:34:56.000Z"
}
```

Response types:
- `id`: string
- `roomId`: string
- `startTime`: string (ISO 8601)
- `endTime`: string (ISO 8601)
- `reservedBy`: string
- `createdAt`: string (ISO 8601)
    
Errors:
-   400 invalid input (missing fields, invalid timestamps, start>=end)
-   404 unknown room
-   409 overlap conflict
    

#### List reservations for a room

`GET /rooms/:roomId/reservations?from=...&to=...`

Path params:
- `roomId`: string (required)

Query params:
- `from`: string (optional, ISO 8601)
- `to`: string (optional, ISO 8601)

-   Results are sorted by `startTime` ascending.
-   Optional filters:
    -   `from`: include reservations where `endTime > from`
    -   `to`: include reservations where `startTime < to`

Response body:
```json
{
  "roomId": "string",
  "reservations": [ /* Reservation DTO array */ ]
}
```

Response types:
- `roomId`: string
- `reservations`: array of Reservation DTO

Errors:
- 400 invalid `from`/`to`
- 404 unknown room

#### Cancel reservation

`DELETE /reservations/:id`

Path params:
- `id`: string (required)

-   204 No Content on success
-   404 if id not found

#### Health

`GET /health`

-   200 `{ "status": "ok" }`
    

## Getting started

### Requirements

-   Node.js 18+ (or 20+)
-   npm
    

### Install

```bash
npm install
```

### Run in dev

```bash
npm run dev
```

### Optional dummy data (dev only)

Seed data is **disabled by default**. To start the server with 3–6 future
reservations for interactive testing:

```bash
SEED_DATA=true npm run dev
```

The app always starts with an empty in-memory database unless `SEED_DATA=true`
is set.

### Build & start

```bash
npm run build
npm start
```

### Run tests

```bash
npm test
```

## Example curl commands

Create:

```bash
curl -s -X POST "http://localhost:3000/rooms/alpha/reservations" \
  -H "content-type: application/json" \
  -d '{"startTime":"2026-01-21T10:00:00Z","endTime":"2026-01-21T11:00:00Z","reservedBy":"Ada"}' | jq
    ```

List:

```bash
curl -s "http://localhost:3000/rooms/alpha/reservations" | jq
```

List seeded data (when `SEED_DATA=true`):

```bash
curl -s "http://localhost:3000/rooms/zeta/reservations" | jq
```

Get a seeded reservation id (when `SEED_DATA=true`) and delete it:

```bash
RES_ID=$(curl -s "http://localhost:3000/rooms/zeta/reservations" | jq -r '.reservations[0].id')
curl -i -X DELETE "http://localhost:3000/reservations/$RES_ID"
```

Delete:

```bash
curl -i -X DELETE "http://localhost:3000/reservations/<id>"
```

## Development approach

Implementation is done feature-by-feature with tests as gates. See:

-   `SPECS.md` for requirements and API contract
-   `CODING_RULES.md` for architecture and practices
-   `TASKS.md` for step-by-step implementation plan
