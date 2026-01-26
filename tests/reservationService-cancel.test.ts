import { describe, it, expect } from "vitest";
import { InMemoryReservationRepository } from "../src/repositories/inMemoryReservationRepository";
import { ReservationService } from "../src/services/reservationService";
import { Clock } from "../src/services/clock";
import { ReservationNotFoundError } from "../src/domain/errors";

class FakeClock implements Clock {
  constructor(private readonly now: number) {}
  nowMs(): number {
    return this.now;
  }
}

describe("ReservationService.cancelReservation", () => {
  const nowMs = Date.parse("2026-01-20T00:00:00Z");

  it("cancels an existing reservation", () => {
    const repo = new InMemoryReservationRepository();
    const service = new ReservationService(repo, new FakeClock(nowMs));

    const reservation = service.createReservation({
      roomId: "alpha",
      startTime: "2026-01-21T10:00:00Z",
      endTime: "2026-01-21T11:00:00Z",
    });

    expect(repo.getById(reservation.id)).toEqual(reservation);
    service.cancelReservation(reservation.id);
    expect(repo.getById(reservation.id)).toBeUndefined();
  });

  it("throws when reservation is missing", () => {
    const repo = new InMemoryReservationRepository();
    const service = new ReservationService(repo, new FakeClock(nowMs));

    expect(() => service.cancelReservation("missing")).toThrow(
      ReservationNotFoundError
    );
  });
});
