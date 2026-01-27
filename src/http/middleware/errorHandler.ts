import { NextFunction, Request, Response } from "express";
import { DomainError } from "../../domain/errors";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (res.headersSent) {
    return;
  }

  if (err instanceof DomainError) {
    const status =
      err.code === "VALIDATION_ERROR"
        ? 400
        : err.code === "ROOM_NOT_FOUND" || err.code === "RESERVATION_NOT_FOUND"
        ? 404
        : err.code === "ROUTE_NOT_FOUND"
        ? 404
        : err.code === "OVERLAP"
        ? 409
        : 500;

    res.status(status).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  if (err instanceof Error) {
    console.error(err);
  }

  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal server error",
    },
  });
}
