import { Router } from "express";
import {
  CreateReservationInput,
  ReservationService,
} from "../../services/reservationService";
import { toReservationDto } from "../dto/reservationDto";
import {
  validateCreateReservationBody,
  validateListReservationsQuery,
} from "../middleware/validate";
import { ValidationError } from "../../domain/errors";

export function createReservationsRouter(
  reservationService: ReservationService
): Router {
  const router = Router();

  router.post(
    "/rooms/:roomId/reservations",
    validateCreateReservationBody,
    (req, res, next) => {
      try {
        const roomId = req.params.roomId;
        if (!roomId) {
          throw new ValidationError("roomId is required", { field: "roomId" });
        }

        const input: CreateReservationInput = {
          roomId,
          startTime: req.body.startTime,
          endTime: req.body.endTime,
        };
        if (req.body.reservedBy !== undefined) {
          input.reservedBy = req.body.reservedBy;
        }

        const reservation = reservationService.createReservation(input);

        res.status(201).json(toReservationDto(reservation));
      } catch (err) {
        next(err);
      }
    }
  );

  router.get(
    "/rooms/:roomId/reservations",
    validateListReservationsQuery,
    (req, res, next) => {
      try {
        const roomId = req.params.roomId;
        if (!roomId) {
          throw new ValidationError("roomId is required", { field: "roomId" });
        }

        const fromValue =
          typeof req.query.from === "string" ? req.query.from : undefined;
        const toValue =
          typeof req.query.to === "string" ? req.query.to : undefined;

        const reservations = reservationService.listReservationsForRoom(
          roomId,
          {
            from: fromValue,
            to: toValue,
          }
        );

        res.json({
          roomId,
          reservations: reservations.map(toReservationDto),
        });
      } catch (err) {
        next(err);
      }
    }
  );

  router.delete("/reservations/:id", (req, res, next) => {
    try {
      reservationService.cancelReservation(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  return router;
}
