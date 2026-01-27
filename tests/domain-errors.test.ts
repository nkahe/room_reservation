import { describe, it, expect } from "vitest";
import {
  DomainError,
  ValidationError,
  RoomNotFoundError,
  ReservationNotFoundError,
  RouteNotFoundError,
  OverlapError,
} from "../src/domain/errors";

describe("domain errors", () => {
  it("validation error can be caught by instance checks", () => {
    try {
      throw new ValidationError("invalid input");
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      expect(err).toBeInstanceOf(DomainError);
      expect(err).toBeInstanceOf(Error);
    }
  });

  it("room not found error can be caught by instance checks", () => {
    try {
      throw new RoomNotFoundError("room missing");
    } catch (err) {
      expect(err).toBeInstanceOf(RoomNotFoundError);
      expect(err).toBeInstanceOf(DomainError);
    }
  });

  it("reservation not found error can be caught by instance checks", () => {
    try {
      throw new ReservationNotFoundError("reservation missing");
    } catch (err) {
      expect(err).toBeInstanceOf(ReservationNotFoundError);
      expect(err).toBeInstanceOf(DomainError);
    }
  });

  it("route not found error can be caught by instance checks", () => {
    try {
      throw new RouteNotFoundError("route missing");
    } catch (err) {
      expect(err).toBeInstanceOf(RouteNotFoundError);
      expect(err).toBeInstanceOf(DomainError);
    }
  });

  it("overlap error can be caught by instance checks", () => {
    try {
      throw new OverlapError("overlap");
    } catch (err) {
      expect(err).toBeInstanceOf(OverlapError);
      expect(err).toBeInstanceOf(DomainError);
    }
  });
});
