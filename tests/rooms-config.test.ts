import { describe, it, expect } from "vitest";
import { isValidRoomId, ROOMS } from "../src/config/rooms";

describe("rooms config", () => {
  it("valid room IDs return true", () => {
    for (const roomId of ROOMS) {
      expect(isValidRoomId(roomId)).toBe(true);
    }
  });

  it("invalid room IDs return false", () => {
    const invalidIds = ["", "alpha ", "omega", "ALPHA"];
    for (const roomId of invalidIds) {
      expect(isValidRoomId(roomId)).toBe(false);
    }
  });
});
