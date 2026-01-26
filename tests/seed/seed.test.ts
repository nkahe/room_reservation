import { describe, it, expect } from "vitest";
import { Server } from "http";
import request from "supertest";
import { createApp } from "../../src/app";
import { ROOMS, isValidRoomId } from "../../src/config/rooms";

async function withServer<T>(handler: (server: Server) => Promise<T>) {
  const app = createApp();
  const server = app.listen(0, "127.0.0.1");
  try {
    return await handler(server);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

async function listAllReservations(server: Server) {
  const all = [];
  for (const roomId of ROOMS) {
    const response = await request(server).get(`/rooms/${roomId}/reservations`);
    all.push(...response.body.reservations);
  }
  return all as Array<{ roomId: string; startTime: string; endTime: string }>;
}

describe("seed data", () => {
  const originalSeed = process.env.SEED_DATA;

  it("does not seed when SEED_DATA is not set", async () => {
    delete process.env.SEED_DATA;

    await withServer(async (server) => {
      const reservations = await listAllReservations(server);
      expect(reservations).toHaveLength(0);
    });

    if (originalSeed === undefined) {
      delete process.env.SEED_DATA;
    } else {
      process.env.SEED_DATA = originalSeed;
    }
  });

  it("seeds future, non-overlapping reservations with valid rooms when enabled", async () => {
    process.env.SEED_DATA = "true";
    const testNow = Date.now();

    await withServer(async (server) => {
      const reservations = await listAllReservations(server);

      expect(reservations.length).toBeGreaterThanOrEqual(3);
      expect(reservations.length).toBeLessThanOrEqual(6);

      for (const reservation of reservations) {
        expect(isValidRoomId(reservation.roomId)).toBe(true);
        const startMs = Date.parse(reservation.startTime);
        expect(startMs).toBeGreaterThanOrEqual(testNow);
      }

      for (const roomId of ROOMS) {
        const response = await request(server).get(
          `/rooms/${roomId}/reservations`
        );
        const list = response.body.reservations as Array<{
          startTime: string;
          endTime: string;
        }>;
        const sorted = list
          .map((item) => ({
            startMs: Date.parse(item.startTime),
            endMs: Date.parse(item.endTime),
          }))
          .sort((a, b) => a.startMs - b.startMs);

        for (let i = 0; i < sorted.length - 1; i += 1) {
          const current = sorted[i];
          const next = sorted[i + 1];
          const overlaps = current.startMs < next.endMs && current.endMs > next.startMs;
          expect(overlaps).toBe(false);
        }
      }
    });

    if (originalSeed === undefined) {
      delete process.env.SEED_DATA;
    } else {
      process.env.SEED_DATA = originalSeed;
    }
  });
});
