import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";

describe("GET /health", () => {
  it("returns 200 with status ok", async () => {
    const app = createApp();
    const server = app.listen(0, "127.0.0.1");
    try {
      const response = await request(server).get("/health");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: "ok" });
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});
