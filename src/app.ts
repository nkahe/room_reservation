import express from "express";
import { healthRouter } from "./http/routes/health";
import { errorHandler } from "./http/middleware/errorHandler";
import { createReservationsRouter } from "./http/routes/reservations";
import { InMemoryReservationRepository } from "./repositories/inMemoryReservationRepository";
import { ReservationService } from "./services/reservationService";
import { SystemClock } from "./services/clock";
import { seedReservations } from "./seed/seedReservations";

export function createApp() {
  const app = express();
  app.use(express.json());

  const repository = new InMemoryReservationRepository();
  const clock = new SystemClock();
  const reservationService = new ReservationService(repository, clock);
  if (process.env.SEED_DATA === "true") {
    seedReservations(reservationService, clock);
  }

  app.use(healthRouter);
  app.use(createReservationsRouter(reservationService));
  app.use(errorHandler);

  return app;
}
