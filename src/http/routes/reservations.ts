import { Router } from "express";
import { ReservationService } from "../../services/reservationService";
import { toReservationDto } from "../dto/reservationDto";
import {
  validateCreateReservationBody,
  validateListReservationsQuery,
} from "../middleware/validate";

export function createReservationsRouter(
  reservationService: ReservationService
): Router {
  const router = Router();

  router.post(
    "/rooms/:roomId/reservations",
    validateCreateReservationBody,
    (req, res, next) => {
      try {
        const reservation = reservationService.createReservation({
          roomId: req.params.roomId,
          startTime: req.body.startTime,
          endTime: req.body.endTime,
          reservedBy: req.body.reservedBy,
        });

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
        const fromValue =
          typeof req.query.from === "string" ? req.query.from : undefined;
        const toValue =
          typeof req.query.to === "string" ? req.query.to : undefined;

        const reservations = reservationService.listReservationsForRoom(
          req.params.roomId,
          {
            from: fromValue,
            to: toValue,
          }
        );

        res.json({
          roomId: req.params.roomId,
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
