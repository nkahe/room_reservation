import { describe, it, expect } from "vitest";
import { InMemoryReservationRepository } from "../src/repositories/inMemoryReservationRepository";
import { ReservationService } from "../src/services/reservationService";
import { Clock } from "../src/services/clock";
import {
  OverlapError,
  RoomNotFoundError,
  ValidationError,
} from "../src/domain/errors";

class FakeClock implements Clock {
  constructor(private readonly now: number) {}
  nowMs(): number {
    return this.now;
  }
}

describe("ReservationService.createReservation", () => {
  const nowMs = Date.parse("2026-01-20T00:00:00Z");
  const startTime = "2026-01-21T10:00:00Z";
  const endTime = "2026-01-21T11:00:00Z";

  it("creates a valid reservation", () => {
    const repo = new InMemoryReservationRepository();
    const clock = new FakeClock(nowMs);
    const service = new ReservationService(repo, clock);

    const reservation = service.createReservation({
      roomId: "alpha",
      startTime,
      endTime,
      reservedBy: "henri",
    });

    expect(reservation.roomId).toBe("alpha");
    expect(reservation.startMs).toBe(Date.parse(startTime));
    expect(reservation.endMs).toBe(Date.parse(endTime));
    expect(reservation.reservedBy).toBe("henri");
    expect(reservation.createdAtMs).toBe(nowMs);
    expect(reservation.id).toBeTypeOf("string");
    expect(repo.getById(reservation.id)).toEqual(reservation);
  });

  it("rejects invalid room", () => {
    const repo = new InMemoryReservationRepository();
    const service = new ReservationService(repo, new FakeClock(nowMs));

    expect(() =>
      service.createReservation({
        roomId: "omega",
        startTime,
        endTime,
      })
    ).toThrow(RoomNotFoundError);
  });

  it("rejects non-parseable timestamps", () => {
    const repo = new InMemoryReservationRepository();
    const service = new ReservationService(repo, new FakeClock(nowMs));

    expect(() =>
      service.createReservation({
        roomId: "alpha",
        startTime: "not-a-date",
        endTime,
      })
    ).toThrow(ValidationError);
  });

  it("rejects start >= end", () => {
    const repo = new InMemoryReservationRepository();
    const service = new ReservationService(repo, new FakeClock(nowMs));

    expect(() =>
      service.createReservation({
        roomId: "alpha",
        startTime,
        endTime: startTime,
      })
    ).toThrow(ValidationError);
  });

  it("rejects past start", () => {
    const repo = new InMemoryReservationRepository();
    const service = new ReservationService(repo, new FakeClock(nowMs));

    expect(() =>
      service.createReservation({
        roomId: "alpha",
        startTime: "2026-01-19T23:00:00Z",
        endTime: "2026-01-20T01:00:00Z",
      })
    ).toThrow(ValidationError);
  });

  it("rejects overlapping reservation", () => {
    const repo = new InMemoryReservationRepository();
    const service = new ReservationService(repo, new FakeClock(nowMs));

    service.createReservation({
      roomId: "alpha",
      startTime,
      endTime,
    });

    expect(() =>
      service.createReservation({
        roomId: "alpha",
        startTime: "2026-01-21T10:30:00Z",
        endTime: "2026-01-21T11:30:00Z",
      })
    ).toThrow(OverlapError);
  });

  it("allows back-to-back reservations", () => {
    const repo = new InMemoryReservationRepository();
    const service = new ReservationService(repo, new FakeClock(nowMs));

    service.createReservation({
      roomId: "alpha",
      startTime,
      endTime,
    });

    expect(() =>
      service.createReservation({
        roomId: "alpha",
        startTime: endTime,
        endTime: "2026-01-21T12:00:00Z",
      })
    ).not.toThrow();
  });
});
