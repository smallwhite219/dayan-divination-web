import {
  buildHexagramResult,
  createChangeStep,
  createLineResult,
  describeLine,
  lineValueFromRemaining,
  normalizeRemainder,
  type CastQuestion,
  type ChangeStep,
  type LinePosition,
} from '../src/lib/dayan.js';

function assertEqual<T>(actual: T, expected: T, message?: string) {
  if (actual !== expected) {
    throw new Error(message ?? `Expected ${String(expected)}, got ${String(actual)}`);
  }
}

function assertDeepEqual(actual: unknown, expected: unknown, message?: string) {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  if (actualJson !== expectedJson) {
    throw new Error(message ?? `Expected ${expectedJson}, got ${actualJson}`);
  }
}

function assertThrows(fn: () => unknown, pattern: RegExp) {
  try {
    fn();
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : String(caught);
    if (pattern.test(message)) return;
    throw new Error(`Expected error matching ${pattern}, got ${message}`);
  }
  throw new Error(`Expected function to throw ${pattern}`);
}

assertEqual(normalizeRemainder(8), 4);
assertEqual(normalizeRemainder(9), 1);

assertEqual(createChangeStep(1, 1, 49, 4, 4).removedStalks, 9);
assertEqual(createChangeStep(1, 1, 49, 1, 3).removedStalks, 5);
assertEqual(createChangeStep(1, 2, 44, 1, 2).removedStalks, 4);
assertEqual(createChangeStep(1, 2, 44, 4, 3).removedStalks, 8);
assertThrows(() => createChangeStep(1, 1, 49, 1, 2), /只能移出 5 或 9/);
assertThrows(() => createChangeStep(1, 2, 44, 4, 4), /只能移出 4 或 8/);

assertEqual(lineValueFromRemaining(24), 6);
assertEqual(lineValueFromRemaining(28), 7);
assertEqual(lineValueFromRemaining(32), 8);
assertEqual(lineValueFromRemaining(36), 9);

assertDeepEqual(describeLine(6), {
  value: 6,
  yinYang: 'yin',
  label: '老陰',
  isMoving: true,
  changedYinYang: 'yang',
});
assertEqual(describeLine(7).changedYinYang, 'yang');
assertEqual(describeLine(8).changedYinYang, 'yin');
assertDeepEqual(describeLine(9), {
  value: 9,
  yinYang: 'yang',
  label: '老陽',
  isMoving: true,
  changedYinYang: 'yin',
});

function makeLine(position: LinePosition, remaining: 24 | 28 | 32 | 36) {
  const changes: ChangeStep[] = [
    createChangeStep(position, 1, 49, 1, 3),
    createChangeStep(position, 2, 44, 1, 2),
    {
      ...createChangeStep(position, 3, 40, 1, 2),
      remainingStalks: remaining,
    },
  ];
  return createLineResult(position, changes);
}

const question: CastQuestion = {
  question: '測試問題',
  note: '',
  mode: 'manual',
  createdAt: '2026-06-14T12:00:00.000Z',
};

const result = buildHexagramResult(question, [
  makeLine(6, 36),
  makeLine(1, 24),
  makeLine(3, 32),
  makeLine(2, 28),
  makeLine(5, 28),
  makeLine(4, 36),
]);

assertDeepEqual(
  result.lines.map((line) => line.position),
  [1, 2, 3, 4, 5, 6],
);
assertDeepEqual(result.movingPositions, [1, 4, 6]);
assertDeepEqual(result.originalLines, ['yin', 'yang', 'yin', 'yang', 'yang', 'yang']);
assertDeepEqual(result.changedLines, ['yang', 'yang', 'yin', 'yin', 'yang', 'yin']);

console.log('dayan tests passed');
