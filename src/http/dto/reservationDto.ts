import { Reservation } from "../../domain/reservation";

export interface ReservationDto {
  id: string;
  roomId: string;
  startTime: string;
  endTime: string;
  reservedBy: string;
  createdAt: string;
}

export function toReservationDto(reservation: Reservation): ReservationDto {
  return {
    id: reservation.id,
    roomId: reservation.roomId,
    startTime: new Date(reservation.startMs).toISOString(),
    endTime: new Date(reservation.endMs).toISOString(),
    reservedBy: reservation.reservedBy,
    createdAt: new Date(reservation.createdAtMs).toISOString(),
  };
}
