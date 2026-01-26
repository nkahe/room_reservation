import { describe, it, expect } from "vitest";
import { InMemoryReservationRepository } from "../src/repositories/inMemoryReservationRepository";
import { Reservation } from "../src/domain/reservation";

function buildReservation(
  overrides: Partial<Reservation> & Pick<Reservation, "id" | "roomId" | "startMs" | "endMs">
): Reservation {
  return {
    id: overrides.id,
    roomId: overrides.roomId,
    startMs: overrides.startMs,
    endMs: overrides.endMs,
    createdAtMs: overrides.createdAtMs ?? 0,
    reservedBy: overrides.reservedBy,
  };
}

describe("InMemoryReservationRepository", () => {
  it("create then getById works", () => {
    const repo = new InMemoryReservationRepository();
    const reservation = buildReservation({
      id: "r1",
      roomId: "alpha",
      startMs: 100,
      endMs: 200,
    });

    repo.create(reservation);

    expect(repo.getById("r1")).toEqual(reservation);
  });

  it("listByRoom returns sorted reservations", () => {
    const repo = new InMemoryReservationRepository();
    const r1 = buildReservation({
      id: "r1",
      roomId: "alpha",
      startMs: 300,
      endMs: 400,
    });
    const r2 = buildReservation({
      id: "r2",
      roomId: "alpha",
      startMs: 100,
      endMs: 200,
    });
    const r3 = buildReservation({
      id: "r3",
      roomId: "alpha",
      startMs: 200,
      endMs: 300,
    });

    repo.create(r1);
    repo.create(r2);
    repo.create(r3);

    const list = repo.listByRoom("alpha");
    expect(list.map((reservation) => reservation.id)).toEqual(["r2", "r3", "r1"]);
  });

  it("delete removes from both indexes", () => {
    const repo = new InMemoryReservationRepository();
    const r1 = buildReservation({
      id: "r1",
      roomId: "alpha",
      startMs: 100,
      endMs: 200,
    });
    const r2 = buildReservation({
      id: "r2",
      roomId: "alpha",
      startMs: 200,
      endMs: 300,
    });

    repo.create(r1);
    repo.create(r2);

    expect(repo.delete("r1")).toBe(true);
    expect(repo.getById("r1")).toBeUndefined();
    expect(repo.listByRoom("alpha").map((reservation) => reservation.id)).toEqual(["r2"]);
  });

  it("delete returns false when missing", () => {
    const repo = new InMemoryReservationRepository();

    expect(repo.delete("missing")).toBe(false);
  });
});
