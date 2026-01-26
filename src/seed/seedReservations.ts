import { ROOMS } from "../config/rooms";
import { Clock } from "../services/clock";
import { ReservationService } from "../services/reservationService";

export function seedReservations(
  reservationService: ReservationService,
  clock: Clock
): void {
  const hasExisting = ROOMS.some(
    (roomId) => reservationService.listReservationsForRoom(roomId).length > 0
  );
  if (hasExisting) {
    return;
  }

  const nowMs = clock.nowMs();
  const firstSeedRoomId = ROOMS[5];
  const seeds = [
    {
      roomId: firstSeedRoomId,
      startTime: new Date(nowMs + 60 * 60 * 1000).toISOString(),
      endTime: new Date(nowMs + 2 * 60 * 60 * 1000).toISOString(),
      reservedBy: "seed",
    },
    {
      roomId: firstSeedRoomId,
      startTime: new Date(nowMs + 2 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(nowMs + 3 * 60 * 60 * 1000).toISOString(),
      reservedBy: "seed",
    },
    {
      roomId: firstSeedRoomId,
      startTime: new Date(nowMs + 3 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(nowMs + 4 * 60 * 60 * 1000).toISOString(),
      reservedBy: "seed",
    },
  ];

  for (const seed of seeds) {
    reservationService.createReservation(seed);
  }
}
