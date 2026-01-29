import { randomUUID } from "crypto";
import { isValidRoomId } from "../config/rooms";
import { Reservation } from "../domain/reservation";
import {
  OverlapError,
  RoomNotFoundError,
  ReservationNotFoundError,
  ValidationError,
} from "../domain/errors";
import { ReservationRepository } from "../repositories/reservationRepository";
import { Clock } from "./clock";

export interface CreateReservationInput {
  roomId: string;
  startTime: string;
  endTime: string;
  reservedBy: string;
}

export interface ListReservationsFilters {
  from?: string;
  to?: string;
}

const ISO_8601_REGEX =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/;

function parseIsoToMs(value: string, field: string): number {
  if (!ISO_8601_REGEX.test(value)) {
    throw new ValidationError(`${field} must be a valid ISO 8601 timestamp`, {
      field,
    });
  }

  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    throw new ValidationError(`${field} must be a valid ISO 8601 timestamp`, {
      field,
    });
  }
  return parsed;
}

export class ReservationService {
  constructor(
    private readonly repository: ReservationRepository,
    private readonly clock: Clock
  ) {}

  createReservation(input: CreateReservationInput): Reservation {
    if (!isValidRoomId(input.roomId)) {
      throw new RoomNotFoundError("room not found", { roomId: input.roomId });
    }

    if (typeof input.reservedBy !== "string") {
      throw new ValidationError("reservedBy is required", { field: "reservedBy" });
    }

    const startMs = parseIsoToMs(input.startTime, "startTime");
    const endMs = parseIsoToMs(input.endTime, "endTime");

    if (startMs >= endMs) {
      throw new ValidationError("startTime must be before endTime");
    }

    const nowMs = this.clock.nowMs();
    if (startMs < nowMs) {
      throw new ValidationError("startTime must be in the future");
    }

    const existingReservations = this.repository.listByRoom(input.roomId);
    const hasOverlap = existingReservations.some(
      (reservation) =>
        startMs < reservation.endMs && endMs > reservation.startMs
    );
    if (hasOverlap) {
      throw new OverlapError("reservation overlaps existing reservation");
    }

    const reservation: Reservation = {
      id: randomUUID(),
      roomId: input.roomId,
      startMs,
      endMs,
      reservedBy: input.reservedBy,
      createdAtMs: nowMs,
    };

    this.repository.create(reservation);
    return reservation;
  }

  listReservationsForRoom(
    roomId: string,
    filters: ListReservationsFilters = {}
  ): Reservation[] {
    if (!isValidRoomId(roomId)) {
      throw new RoomNotFoundError("room not found", { roomId });
    }

    const fromMs =
      filters.from !== undefined ? parseIsoToMs(filters.from, "from") : undefined;
    const toMs =
      filters.to !== undefined ? parseIsoToMs(filters.to, "to") : undefined;
    if (fromMs !== undefined && toMs !== undefined && fromMs >= toMs) {
      throw new ValidationError("from must be before to");
    }

    const reservations = this.repository.listByRoom(roomId);
    const filtered = reservations.filter((reservation) => {
      if (fromMs !== undefined && reservation.endMs <= fromMs) {
        return false;
      }
      if (toMs !== undefined && reservation.startMs >= toMs) {
        return false;
      }
      return true;
    });

    return filtered.slice().sort((a, b) => a.startMs - b.startMs);
  }

  cancelReservation(id: string): void {
    const deleted = this.repository.delete(id);
    if (!deleted) {
      throw new ReservationNotFoundError("reservation not found", { id });
    }
  }
}
