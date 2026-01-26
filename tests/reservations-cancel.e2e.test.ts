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

describe("DELETE /reservations/:id", () => {
  it("returns 204 when deleting an existing reservation", async () => {
    await withServer(async (server) => {
      const createResponse = await request(server)
        .post("/rooms/alpha/reservations")
        .send({
          startTime: "2026-02-05T10:00:00Z",
          endTime: "2026-02-05T11:00:00Z",
          reservedBy: "Alice",
        });

      const reservationId = createResponse.body.id as string;

      const response = await request(server).delete(
        `/reservations/${reservationId}`
      );

      expect(response.status).toBe(204);
      expect(response.text).toBe("");
    });
  });

  it("returns 404 when reservation is missing", async () => {
    await withServer(async (server) => {
      const response = await request(server).delete("/reservations/missing-id");

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        error: { code: "RESERVATION_NOT_FOUND" },
      });
    });
  });
});
