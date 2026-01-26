import { RequestHandler } from "express";
import { ValidationError } from "../../domain/errors";

export interface CreateReservationBody {
  startTime: string;
  endTime: string;
  reservedBy?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export const validateCreateReservationBody: RequestHandler = (req, _res, next) => {
  try {
    if (!isRecord(req.body)) {
      throw new ValidationError("body must be an object");
    }

    const { startTime, endTime, reservedBy } = req.body;

    if (typeof startTime !== "string") {
      throw new ValidationError("startTime is required", { field: "startTime" });
    }

    if (typeof endTime !== "string") {
      throw new ValidationError("endTime is required", { field: "endTime" });
    }

    if (reservedBy !== undefined && typeof reservedBy !== "string") {
      throw new ValidationError("reservedBy must be a string", {
        field: "reservedBy",
      });
    }

    next();
  } catch (err) {
    next(err);
  }
};

export const validateListReservationsQuery: RequestHandler = (req, _res, next) => {
  try {
    const { from, to } = req.query;

    if (from !== undefined && typeof from !== "string") {
      throw new ValidationError("from must be a string", { field: "from" });
    }

    if (to !== undefined && typeof to !== "string") {
      throw new ValidationError("to must be a string", { field: "to" });
    }

    next();
  } catch (err) {
    next(err);
  }
};
