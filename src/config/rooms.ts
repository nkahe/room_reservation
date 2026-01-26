export const ROOMS = [
  "alpha",
  "beta",
  "gamma",
  "delta",
  "epsilon",
  "zeta",
  "eta",
  "theta",
  "iota",
  "kappa",
] as const;

const ROOM_SET = new Set<string>(ROOMS);

export function isValidRoomId(roomId: string): boolean {
  return ROOM_SET.has(roomId);
}
