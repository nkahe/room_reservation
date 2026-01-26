export interface Reservation {
  id: string;
  roomId: string;
  startMs: number;
  endMs: number;
  reservedBy: string;
  createdAtMs: number;
}
