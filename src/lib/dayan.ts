export type CastMode = 'manual' | 'random';
export type YinYang = 'yin' | 'yang';
export type LineValue = 6 | 7 | 8 | 9;
export type LinePosition = 1 | 2 | 3 | 4 | 5 | 6;
export type ChangeIndex = 1 | 2 | 3;

export interface CastQuestion {
  question: string;
  note: string;
  mode: CastMode;
  createdAt: string;
}

export interface ChangeStep {
  linePosition: LinePosition;
  changeIndex: ChangeIndex;
  startingStalks: number;
  hangingStalk: 1;
  leftRemainder: number;
  rightRemainder: number;
  removedStalks: number;
  remainingStalks: number;
}

export interface LineResult {
  position: LinePosition;
  changes: ChangeStep[];
  remainingStalks: 24 | 28 | 32 | 36;
  value: LineValue;
  yinYang: YinYang;
  label: '老陰' | '少陽' | '少陰' | '老陽';
  isMoving: boolean;
  changedYinYang: YinYang;
}

export interface HexagramResult {
  question: CastQuestion;
  lines: LineResult[];
  originalLines: YinYang[];
  changedLines: YinYang[];
  movingPositions: LinePosition[];
  summary: string;
}

export const linePositionLabels: Record<LinePosition, string> = {
  1: '初爻',
  2: '二爻',
  3: '三爻',
  4: '四爻',
  5: '五爻',
  6: '上爻',
};

export function normalizeRemainder(count: number): number {
  const remainder = count % 4;
  return remainder === 0 ? 4 : remainder;
}

export function allowedRemovedStalks(changeIndex: ChangeIndex): number[] {
  return changeIndex === 1 ? [5, 9] : [4, 8];
}

export function createChangeStep(
  linePosition: LinePosition,
  changeIndex: ChangeIndex,
  startingStalks: number,
  leftRemainder: number,
  rightRemainder: number,
): ChangeStep {
  if (!Number.isInteger(leftRemainder) || leftRemainder < 1 || leftRemainder > 4) {
    throw new Error('左餘必須是 1 到 4。');
  }

  if (!Number.isInteger(rightRemainder) || rightRemainder < 1 || rightRemainder > 4) {
    throw new Error('右餘必須是 1 到 4。');
  }

  const removedStalks = 1 + leftRemainder + rightRemainder;
  const legal = allowedRemovedStalks(changeIndex);
  if (!legal.includes(removedStalks)) {
    throw new Error(`第 ${changeIndex} 變只能移出 ${legal.join(' 或 ')} 策。`);
  }

  return {
    linePosition,
    changeIndex,
    startingStalks,
    hangingStalk: 1,
    leftRemainder,
    rightRemainder,
    removedStalks,
    remainingStalks: startingStalks - removedStalks,
  };
}

export function lineValueFromRemaining(remainingStalks: number): LineResult['value'] {
  if (![24, 28, 32, 36].includes(remainingStalks)) {
    throw new Error('三變後剩餘策數必須是 24、28、32 或 36。');
  }

  return (remainingStalks / 4) as LineValue;
}

export function describeLine(value: LineValue): Omit<LineResult, 'position' | 'changes' | 'remainingStalks'> {
  switch (value) {
    case 6:
      return { value, yinYang: 'yin', label: '老陰', isMoving: true, changedYinYang: 'yang' };
    case 7:
      return { value, yinYang: 'yang', label: '少陽', isMoving: false, changedYinYang: 'yang' };
    case 8:
      return { value, yinYang: 'yin', label: '少陰', isMoving: false, changedYinYang: 'yin' };
    case 9:
      return { value, yinYang: 'yang', label: '老陽', isMoving: true, changedYinYang: 'yin' };
  }
}

export function createLineResult(position: LinePosition, changes: ChangeStep[]): LineResult {
  if (changes.length !== 3) {
    throw new Error('每一爻必須剛好三變。');
  }

  const remainingStalks = changes[2].remainingStalks;
  const value = lineValueFromRemaining(remainingStalks);
  return {
    position,
    changes,
    remainingStalks: remainingStalks as LineResult['remainingStalks'],
    ...describeLine(value),
  };
}

export function buildHexagramResult(question: CastQuestion, lines: LineResult[]): HexagramResult {
  if (lines.length !== 6) {
    throw new Error('完整卦必須有六爻。');
  }

  const sorted = [...lines].sort((a, b) => a.position - b.position);
  const originalLines = sorted.map((line) => line.yinYang);
  const changedLines = sorted.map((line) => line.changedYinYang);
  const movingPositions = sorted.filter((line) => line.isMoving).map((line) => line.position);
  const summary = createExportText(question, sorted, originalLines, changedLines, movingPositions);

  return {
    question,
    lines: sorted,
    originalLines,
    changedLines,
    movingPositions,
    summary,
  };
}

export function simulateChange(
  linePosition: LinePosition,
  changeIndex: ChangeIndex,
  startingStalks: number,
  random: () => number = Math.random,
): ChangeStep {
  const leftCount = 1 + Math.floor(random() * (startingStalks - 2));
  const rightCount = startingStalks - leftCount;
  const leftRemainder = normalizeRemainder(leftCount);
  const rightRemainder = normalizeRemainder(rightCount - 1);
  return createChangeStep(linePosition, changeIndex, startingStalks, leftRemainder, rightRemainder);
}

export function simulateLine(position: LinePosition, random: () => number = Math.random): LineResult {
  const changes: ChangeStep[] = [];
  let current = 49;

  for (const changeIndex of [1, 2, 3] as ChangeIndex[]) {
    const step = simulateChange(position, changeIndex, current, random);
    changes.push(step);
    current = step.remainingStalks;
  }

  return createLineResult(position, changes);
}

export function simulateHexagram(question: CastQuestion, random: () => number = Math.random): HexagramResult {
  const lines = ([1, 2, 3, 4, 5, 6] as LinePosition[]).map((position) => simulateLine(position, random));
  return buildHexagramResult(question, lines);
}

export function renderLine(yinYang: YinYang): string {
  return yinYang === 'yang' ? '━━━━━━' : '━━  ━━';
}

export function lineToText(line: LineResult): string {
  const moving = line.isMoving ? '動' : '靜';
  return `${linePositionLabels[line.position]}：${line.value} ${line.label} ${renderLine(line.yinYang)} ${moving}`;
}

export function createAiPrompt(result: HexagramResult): string {
  const moving =
    result.movingPositions.length > 0
      ? result.movingPositions.map((position) => linePositionLabels[position]).join('、')
      : '無動爻';

  return [
    '請以易經「大衍筮法」結果作為反思工具，協助我解讀以下卦象。',
    '',
    `問題：${result.question.question || '未填寫'}`,
    result.question.note ? `背景：${result.question.note}` : '',
    `起卦模式：${result.question.mode === 'manual' ? '手動記錄' : '隨機模擬'}`,
    `時間：${new Date(result.question.createdAt).toLocaleString('zh-TW')}`,
    '',
    '本卦六爻由下往上：',
    ...result.lines.map(lineToText),
    '',
    `動爻：${moving}`,
    '之卦由下往上：',
    ...result.changedLines.map((line, index) => `${linePositionLabels[(index + 1) as LinePosition]}：${renderLine(line)}`),
    '',
    '請依序說明：1. 本卦反映的局勢；2. 動爻代表的變化焦點；3. 之卦可能的發展；4. 回到現實條件的可行建議。',
    '請避免把卦象當成絕對預言，也不要取代醫療、法律、財務或安全判斷。',
  ]
    .filter(Boolean)
    .join('\n');
}

export function createExportText(
  question: CastQuestion,
  lines: LineResult[],
  originalLines: YinYang[],
  changedLines: YinYang[],
  movingPositions: LinePosition[],
): string {
  const moving =
    movingPositions.length > 0
      ? movingPositions.map((position) => linePositionLabels[position]).join('、')
      : '無動爻';

  return [
    '大衍筮法起卦結果',
    `時間：${new Date(question.createdAt).toLocaleString('zh-TW')}`,
    `模式：${question.mode === 'manual' ? '手動記錄' : '隨機模擬'}`,
    `問題：${question.question || '未填寫'}`,
    question.note ? `背景：${question.note}` : '',
    '',
    '本卦六爻由下往上：',
    ...lines.map(lineToText),
    '',
    `動爻：${moving}`,
    '',
    '本卦線象由下往上：',
    ...originalLines.map((line, index) => `${linePositionLabels[(index + 1) as LinePosition]}：${renderLine(line)}`),
    '',
    '之卦線象由下往上：',
    ...changedLines.map((line, index) => `${linePositionLabels[(index + 1) as LinePosition]}：${renderLine(line)}`),
  ]
    .filter(Boolean)
    .join('\n');
}
