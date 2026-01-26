import { describe, it, expect } from "vitest";
import { InMemoryReservationRepository } from "../src/repositories/inMemoryReservationRepository";
import { ReservationService } from "../src/services/reservationService";
import { Clock } from "../src/services/clock";
import { ValidationError } from "../src/domain/errors";

class FakeClock implements Clock {
  constructor(private readonly now: number) {}
  nowMs(): number {
    return this.now;
  }
}

describe("ReservationService.listReservationsForRoom", () => {
  const nowMs = Date.parse("2026-01-20T00:00:00Z");

  it("returns all reservations sorted", () => {
    const repo = new InMemoryReservationRepository();
    const service = new ReservationService(repo, new FakeClock(nowMs));

    service.createReservation({
      roomId: "alpha",
      startTime: "2026-01-21T11:00:00Z",
      endTime: "2026-01-21T12:00:00Z",
    });
    service.createReservation({
      roomId: "alpha",
      startTime: "2026-01-21T09:00:00Z",
      endTime: "2026-01-21T10:00:00Z",
    });
    service.createReservation({
      roomId: "alpha",
      startTime: "2026-01-21T10:00:00Z",
      endTime: "2026-01-21T11:00:00Z",
    });

    const list = service.listReservationsForRoom("alpha");
    expect(list.map((reservation) => reservation.startMs)).toEqual([
      Date.parse("2026-01-21T09:00:00Z"),
      Date.parse("2026-01-21T10:00:00Z"),
      Date.parse("2026-01-21T11:00:00Z"),
    ]);
  });

  it("applies from filter", () => {
    const repo = new InMemoryReservationRepository();
    const service = new ReservationService(repo, new FakeClock(nowMs));

    service.createReservation({
      roomId: "alpha",
      startTime: "2026-01-21T09:00:00Z",
      endTime: "2026-01-21T10:00:00Z",
    });
    service.createReservation({
      roomId: "alpha",
      startTime: "2026-01-21T10:00:00Z",
      endTime: "2026-01-21T11:00:00Z",
    });

    const list = service.listReservationsForRoom("alpha", {
      from: "2026-01-21T10:00:00Z",
    });

    expect(list.map((reservation) => reservation.startMs)).toEqual([
      Date.parse("2026-01-21T10:00:00Z"),
    ]);
  });

  it("applies to filter", () => {
    const repo = new InMemoryReservationRepository();
    const service = new ReservationService(repo, new FakeClock(nowMs));

    service.createReservation({
      roomId: "alpha",
      startTime: "2026-01-21T09:00:00Z",
      endTime: "2026-01-21T10:00:00Z",
    });
    service.createReservation({
      roomId: "alpha",
      startTime: "2026-01-21T10:00:00Z",
      endTime: "2026-01-21T11:00:00Z",
    });

    const list = service.listReservationsForRoom("alpha", {
      to: "2026-01-21T10:00:00Z",
    });

    expect(list.map((reservation) => reservation.startMs)).toEqual([
      Date.parse("2026-01-21T09:00:00Z"),
    ]);
  });

  it("rejects invalid from/to values", () => {
    const repo = new InMemoryReservationRepository();
    const service = new ReservationService(repo, new FakeClock(nowMs));

    expect(() =>
      service.listReservationsForRoom("alpha", { from: "not-a-date" })
    ).toThrow(ValidationError);

    expect(() =>
      service.listReservationsForRoom("alpha", { to: "not-a-date" })
    ).toThrow(ValidationError);
  });
});
