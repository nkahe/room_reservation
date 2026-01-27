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

describe("unknown routes", () => {
  it("returns JSON 404 with error envelope", async () => {
    await withServer(async (server) => {
      const response = await request(server).get("/not-a-route");

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        error: { code: "ROUTE_NOT_FOUND" },
      });
    });
  });
});
