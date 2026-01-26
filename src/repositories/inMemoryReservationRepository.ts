import { Reservation } from "../domain/reservation";
import { ReservationRepository } from "./reservationRepository";

export class InMemoryReservationRepository implements ReservationRepository {
  private readonly byId = new Map<string, Reservation>();
  private readonly byRoom = new Map<string, Reservation[]>();

  create(reservation: Reservation): void {
    this.byId.set(reservation.id, reservation);

    const existing = this.byRoom.get(reservation.roomId) ?? [];
    const next = [...existing, reservation].sort(
      (a, b) => a.startMs - b.startMs
    );
    this.byRoom.set(reservation.roomId, next);
  }

  getById(id: string): Reservation | undefined {
    return this.byId.get(id);
  }

  listByRoom(roomId: string): Reservation[] {
    const list = this.byRoom.get(roomId);
    return list ? list.slice() : [];
  }

  delete(id: string): boolean {
    const existing = this.byId.get(id);
    if (!existing) {
      return false;
    }

    this.byId.delete(id);
    const list = this.byRoom.get(existing.roomId);
    if (!list) {
      return true;
    }

    const next = list.filter((reservation) => reservation.id !== id);
    if (next.length === 0) {
      this.byRoom.delete(existing.roomId);
    } else {
      this.byRoom.set(existing.roomId, next);
    }

    return true;
  }
}
