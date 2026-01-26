import { Reservation } from "../domain/reservation";

export interface ReservationRepository {
  create(reservation: Reservation): void;
  getById(id: string): Reservation | undefined;
  listByRoom(roomId: string): Reservation[];
  delete(id: string): boolean;
}
