type ErrorDetails = Record<string, unknown> | undefined;

export class DomainError extends Error {
  readonly code: string;
  readonly details?: ErrorDetails;

  constructor(code: string, message: string, details?: ErrorDetails) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = new.target.name;
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, details?: ErrorDetails) {
    super("VALIDATION_ERROR", message, details);
  }
}

export class RoomNotFoundError extends DomainError {
  constructor(message: string, details?: ErrorDetails) {
    super("ROOM_NOT_FOUND", message, details);
  }
}

export class ReservationNotFoundError extends DomainError {
  constructor(message: string, details?: ErrorDetails) {
    super("RESERVATION_NOT_FOUND", message, details);
  }
}

export class OverlapError extends DomainError {
  constructor(message: string, details?: ErrorDetails) {
    super("OVERLAP", message, details);
  }
}
