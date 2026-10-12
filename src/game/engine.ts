/** Lógica independiente de React para poder probar las reglas del juego. */
export const GRID_SIZE = 4;
export const MAX_LEVEL = 6;
export const GAME_SECONDS = 90;

export type Position = { row: number; col: number };
export type Tile = { id: number; level: number };
export type Board = (Tile | null)[][];

let serial = 0;
const newTile = (level: number): Tile => ({ id: ++serial, level });
const startingLevel = () => (Math.random() < 0.78 ? 1 : 2);
export const formatTime = (seconds: number): string =>
  `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

export const insideBoard = ({ row, col }: Position) =>
  row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE;

export function canMerge(board: Board, from: Position, to: Position): boolean {
  if (!insideBoard(from) || !insideBoard(to)) return false;
  const a = board[from.row][from.col];
  const b = board[to.row][to.col];
  const distance = Math.abs(from.row - to.row) + Math.abs(from.col - to.col);
  return !!a && !!b && distance === 1 && a.level === b.level && a.level < MAX_LEVEL;
}

export function hasAvailablePair(board: Board): boolean {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (col + 1 < GRID_SIZE && canMerge(board, { row, col }, { row, col: col + 1 })) return true;
      if (row + 1 < GRID_SIZE && canMerge(board, { row, col }, { row: row + 1, col })) return true;
    }
  }
  return false;
}

/** Reordena las fichas sin regalar puntos y garantiza al menos una pareja. */
export function shuffleBoard(board: Board): Board {
  const levels = board.flat().map(tile => tile?.level ?? startingLevel());
  for (let attempt = 0; attempt < 25; attempt++) {
    for (let i = levels.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [levels[i], levels[j]] = [levels[j], levels[i]];
    }
    const candidate = Array.from({ length: GRID_SIZE }, (_, row) =>
      Array.from({ length: GRID_SIZE }, (_, col) => newTile(levels[row * GRID_SIZE + col]))
    );
    if (hasAvailablePair(candidate)) return candidate;
  }
  const fallback = Array.from({ length: GRID_SIZE }, (_, row) =>
    Array.from({ length: GRID_SIZE }, (_, col) => newTile(levels[row * GRID_SIZE + col]))
  );
  // Caso extremo: todas las fichas son distintas o son coronas.
  fallback[0][0] = newTile(1);
  fallback[0][1] = newTile(1);
  return fallback;
}

export function createInitialBoard(): Board {
  const board = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => newTile(startingLevel()))
  );
  return hasAvailablePair(board) ? board : shuffleBoard(board);
}

export type MergeResult = {
  board: Board;
  points: number;
  newLevel: number;
};

/** Fusiona solo vecinos iguales; el hueco se conserva para animar la reposición. */
export function merge(board: Board, from: Position, to: Position): MergeResult | null {
  if (!canMerge(board, from, to)) return null;
  const fromTile = board[from.row][from.col]!;
  const newLevel = fromTile.level + 1;
  const next = board.map(row => row.slice());
  next[from.row][from.col] = null;
  next[to.row][to.col] = newTile(newLevel);
  return { board: next, points: 10 * (2 ** (newLevel - 1)), newLevel };
}

/** Repone la ficha consumida y soluciona tableros sin movimientos disponibles. */
export function refill(board: Board, at: Position): { board: Board; shuffled: boolean } {
  const next = board.map(row => row.slice());
  if (next[at.row][at.col] === null) next[at.row][at.col] = newTile(startingLevel());
  if (!hasAvailablePair(next)) return { board: shuffleBoard(next), shuffled: true };
  return { board: next, shuffled: false };
}
