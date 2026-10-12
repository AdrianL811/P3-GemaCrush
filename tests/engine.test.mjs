import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialBoard, canMerge, hasAvailablePair, merge, refill, shuffleBoard, GRID_SIZE,
} from '../src/game/engine.ts';

const customBoard = (levels) => levels.map((row, r) => row.map((level, c) => ({
  id: r * GRID_SIZE + c + 1, level,
})));

test('Cada partida inicia con 16 fichas y al menos una fusión posible', () => {
  for (let n = 0; n < 100; n++) {
    const board = createInitialBoard();
    assert.equal(board.length, 4);
    assert.equal(board.flat().filter(Boolean).length, 16);
    assert.equal(hasAvailablePair(board), true);
  }
});

test('Solo se fusionan gemas iguales que comparten lado', () => {
  const board = customBoard([
    [1, 1, 2, 2],
    [3, 4, 1, 1],
    [2, 3, 4, 2],
    [2, 2, 3, 1],
  ]);
  assert.equal(canMerge(board, { row: 0, col: 0 }, { row: 0, col: 1 }), true);
  assert.equal(canMerge(board, { row: 0, col: 0 }, { row: 0, col: 2 }), false);
  assert.equal(canMerge(board, { row: 0, col: 1 }, { row: 1, col: 2 }), false);
  assert.equal(canMerge(board, { row: 0, col: 0 }, { row: 0, col: 0 }), false);
});

test('La fusión aumenta el nivel, deja hueco y suma puntos', () => {
  const board = customBoard([
    [2, 2, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1],
  ]);
  const result = merge(board, { row: 0, col: 0 }, { row: 0, col: 1 });
  assert.ok(result);
  assert.equal(result.newLevel, 3);
  assert.equal(result.points, 40);
  assert.equal(result.board[0][0], null);
  assert.equal(result.board[0][1].level, 3);
  // No se muta el estado previo.
  assert.equal(board[0][0].level, 2);
  const replacement = refill(result.board, { row: 0, col: 0 });
  assert.ok(replacement.board[0][0]);
});

test('No se fusionan las coronas (nivel máximo)', () => {
  const board = customBoard(Array.from({ length: 4 }, () => [6, 6, 6, 6]));
  assert.equal(merge(board, { row: 0, col: 0 }, { row: 0, col: 1 }), null);
  assert.equal(hasAvailablePair(board), false);
  assert.equal(hasAvailablePair(shuffleBoard(board)), true);
});
