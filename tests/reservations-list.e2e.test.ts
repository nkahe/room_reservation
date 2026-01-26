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

describe("GET /rooms/:roomId/reservations", () => {
  it("returns reservations sorted by start time", async () => {
    await withServer(async (server) => {
      await request(server).post("/rooms/alpha/reservations").send({
        startTime: "2026-02-03T11:00:00Z",
        endTime: "2026-02-03T12:00:00Z",
        reservedBy: "Alice",
      });
      await request(server).post("/rooms/alpha/reservations").send({
        startTime: "2026-02-03T09:00:00Z",
        endTime: "2026-02-03T10:00:00Z",
        reservedBy: "Alice",
      });
      await request(server).post("/rooms/alpha/reservations").send({
        startTime: "2026-02-03T10:00:00Z",
        endTime: "2026-02-03T11:00:00Z",
        reservedBy: "Alice",
      });

      const response = await request(server).get(
        "/rooms/alpha/reservations"
      );

      expect(response.status).toBe(200);
      expect(response.body.roomId).toBe("alpha");
      expect(response.body.reservations.map((r: { startTime: string }) => r.startTime)).toEqual([
        "2026-02-03T09:00:00.000Z",
        "2026-02-03T10:00:00.000Z",
        "2026-02-03T11:00:00.000Z",
      ]);
    });
  });

  it("applies from/to filters", async () => {
    await withServer(async (server) => {
      await request(server).post("/rooms/alpha/reservations").send({
        startTime: "2026-02-03T09:00:00Z",
        endTime: "2026-02-03T10:00:00Z",
        reservedBy: "Alice",
      });
      await request(server).post("/rooms/alpha/reservations").send({
        startTime: "2026-02-03T10:00:00Z",
        endTime: "2026-02-03T11:00:00Z",
        reservedBy: "Alice",
      });
      await request(server).post("/rooms/alpha/reservations").send({
        startTime: "2026-02-03T11:00:00Z",
        endTime: "2026-02-03T12:00:00Z",
        reservedBy: "Alice",
      });

      const response = await request(server).get(
        "/rooms/alpha/reservations?from=2026-02-03T10:00:00Z&to=2026-02-03T12:00:00Z"
      );

      expect(response.status).toBe(200);
      expect(response.body.reservations.map((r: { startTime: string }) => r.startTime)).toEqual([
        "2026-02-03T10:00:00.000Z",
        "2026-02-03T11:00:00.000Z",
      ]);
    });
  });

  it("returns 400 for invalid from/to values", async () => {
    await withServer(async (server) => {
      const response = await request(server).get(
        "/rooms/alpha/reservations?from=not-a-date"
      );

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: { code: "VALIDATION_ERROR" },
      });
    });
  });
});
