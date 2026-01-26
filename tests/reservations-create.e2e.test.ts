import { describe, it, expect } from "vitest";
import { Server } from "http";
import request from "supertest";
import { createApp } from "../src/app";

async function withServer<T>(handler: (server: Server) => Promise<T>) {
  const app = createApp();
  const server = app.listen(0, "127.0.0.1");
  try {
    return await handler(server);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

describe("POST /rooms/:roomId/reservations", () => {
  const startTime = "2026-02-01T10:00:00Z";
  const endTime = "2026-02-01T11:00:00Z";
  const startTimeIso = new Date(startTime).toISOString();
  const endTimeIso = new Date(endTime).toISOString();

  it("creates a reservation and returns 201 with DTO", async () => {
    await withServer(async (server) => {
      const response = await request(server)
        .post("/rooms/alpha/reservations")
        .send({ startTime, endTime, reservedBy: "Alice" });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        roomId: "alpha",
        startTime: startTimeIso,
        endTime: endTimeIso,
        reservedBy: "Alice",
      });
      expect(response.body.id).toBeTypeOf("string");
      expect(response.body.createdAt).toBeTypeOf("string");
    });
  });

  it("returns 400 for invalid input with error format", async () => {
    await withServer(async (server) => {
      const response = await request(server)
        .post("/rooms/alpha/reservations")
        .send({ startTime });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: { code: "VALIDATION_ERROR" },
      });
    });
  });

  it("returns 400 when reservedBy is missing", async () => {
    await withServer(async (server) => {
      const response = await request(server)
        .post("/rooms/alpha/reservations")
        .send({ startTime, endTime });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: { code: "VALIDATION_ERROR" },
      });
    });
  });

  it("returns 404 for unknown room", async () => {
    await withServer(async (server) => {
      const response = await request(server)
        .post("/rooms/omega/reservations")
        .send({ startTime, endTime, reservedBy: "Alice" });

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        error: { code: "ROOM_NOT_FOUND" },
      });
    });
  });

  it("returns 409 for overlaps", async () => {
    await withServer(async (server) => {
      await request(server)
        .post("/rooms/alpha/reservations")
        .send({ startTime, endTime, reservedBy: "Alice" });

      const response = await request(server)
        .post("/rooms/alpha/reservations")
        .send({
          startTime: "2026-02-01T10:30:00Z",
          endTime: "2026-02-01T11:30:00Z",
          reservedBy: "Alice",
        });

      expect(response.status).toBe(409);
      expect(response.body).toMatchObject({
        error: { code: "OVERLAP" },
      });
    });
  });
});
