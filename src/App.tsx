import { useEffect, useMemo, useState } from 'react';
import {
  allowedRemovedStalks,
  buildHexagramResult,
  createAiPrompt,
  createChangeStep,
  createLineResult,
  linePositionLabels,
  renderLine,
  simulateHexagram,
  type CastMode,
  type CastQuestion,
  type ChangeIndex,
  type ChangeStep,
  type HexagramResult,
  type LinePosition,
  type YinYang,
} from './lib/dayan';

const linePositions = [1, 2, 3, 4, 5, 6] as LinePosition[];
const remainderChoices = [1, 2, 3, 4];

function validRightRemainders(changeIndex: ChangeIndex, leftRemainder: number) {
  return allowedRemovedStalks(changeIndex)
    .map((removed) => removed - 1 - leftRemainder)
    .filter((remainder) => remainder >= 1 && remainder <= 4);
}

function createQuestion(question: string, note: string, mode: CastMode): CastQuestion {
  return {
    question: question.trim(),
    note: note.trim(),
    mode,
    createdAt: new Date().toISOString(),
  };
}

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function App() {
  const [question, setQuestion] = useState('');
  const [note, setNote] = useState('');
  const [mode, setMode] = useState<CastMode>('manual');
  const [result, setResult] = useState<HexagramResult | null>(null);
  const [completedLines, setCompletedLines] = useState<ReturnType<typeof createLineResult>[]>([]);
  const [currentChanges, setCurrentChanges] = useState<ChangeStep[]>([]);
  const [leftRemainder, setLeftRemainder] = useState(1);
  const [rightRemainder, setRightRemainder] = useState(3);
  const [error, setError] = useState('');
  const [copyStatus, setCopyStatus] = useState('');

  const activeLinePosition = (completedLines.length + 1) as LinePosition;
  const activeChangeIndex = (currentChanges.length + 1) as ChangeIndex;
  const startingStalks = currentChanges.length === 0 ? 49 : currentChanges[currentChanges.length - 1].remainingStalks;
  const progress = completedLines.length * 3 + currentChanges.length;

  const aiPrompt = useMemo(() => (result ? createAiPrompt(result) : ''), [result]);
  const rightRemainderOptions = useMemo(
    () => validRightRemainders(activeChangeIndex, leftRemainder),
    [activeChangeIndex, leftRemainder],
  );

  useEffect(() => {
    if (!rightRemainderOptions.includes(rightRemainder)) {
      setRightRemainder(rightRemainderOptions[0] ?? 1);
    }
  }, [rightRemainder, rightRemainderOptions]);

  function resetCast(nextMode = mode) {
    setResult(null);
    setCompletedLines([]);
    setCurrentChanges([]);
    setMode(nextMode);
    setError('');
    setCopyStatus('');
    setLeftRemainder(1);
    setRightRemainder(nextMode === 'manual' ? 3 : 1);
  }

  function runRandomCast() {
    const castQuestion = createQuestion(question, note, 'random');
    setResult(simulateHexagram(castQuestion));
    setCompletedLines([]);
    setCurrentChanges([]);
    setMode('random');
    setError('');
    setCopyStatus('');
  }

  function submitManualChange() {
    setError('');
    setCopyStatus('');

    try {
      const step = createChangeStep(
        activeLinePosition,
        activeChangeIndex,
        startingStalks,
        leftRemainder,
        rightRemainder,
      );
      const nextChanges = [...currentChanges, step];

      if (nextChanges.length < 3) {
        setCurrentChanges(nextChanges);
        setRightRemainder(1);
        return;
      }

      const nextLine = createLineResult(activeLinePosition, nextChanges);
      const nextLines = [...completedLines, nextLine];
      setCompletedLines(nextLines);
      setCurrentChanges([]);
      setLeftRemainder(1);
      setRightRemainder(3);

      if (nextLines.length === 6) {
        setResult(buildHexagramResult(createQuestion(question, note, 'manual'), nextLines));
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '輸入不合法，請重新檢查。');
    }
  }

  async function copyPrompt() {
    if (!aiPrompt) return;
    await navigator.clipboard.writeText(aiPrompt);
    setCopyStatus('已複製 AI 提示詞。');
  }

  function downloadText() {
    if (!result) return;
    downloadFile('dayan-divination-result.txt', result.summary, 'text/plain;charset=utf-8');
  }

  function downloadJson() {
    if (!result) return;
    downloadFile('dayan-divination-result.json', JSON.stringify(result, null, 2), 'application/json;charset=utf-8');
  }

  function printResultCard() {
    document.getElementById('result-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => window.print(), 250);
  }

  return (
    <main className="app-shell">
      <section className="tool-panel">
        <div className="title-block">
          <p className="eyebrow">五十取一不用，十八變成卦</p>
          <h1>大衍筮法</h1>
          <p>
            依「三變成一爻、六爻成一卦」記錄起卦流程。此工具用於整理問題與反思，不取代醫療、
            法律、財務或安全判斷。
          </p>
        </div>

        <div className="question-grid">
          <label>
            <span>所問之事</span>
            <input
              id="cast-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="例：若我 6/28 回台，對整體行程是否較合適？"
            />
          </label>
          <label>
            <span>背景備註</span>
            <textarea
              id="cast-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="可填現實條件：時間、費用、健康、交通、選項限制。"
            />
          </label>
        </div>

        <div className="mode-row" role="group" aria-label="起卦模式">
          <button className={mode === 'manual' ? 'active' : ''} onClick={() => resetCast('manual')}>
            手動導引記錄
          </button>
          <button className={mode === 'random' ? 'active' : ''} onClick={runRandomCast}>
            隨機模擬一卦
          </button>
          <button className="ghost" onClick={() => resetCast(mode)}>
            重新開始
          </button>
        </div>
      </section>

      <section className="workspace">
        <div className="manual-card">
          <div className="section-heading">
            <h2>起卦工作區</h2>
            <span>{progress}/18 變</span>
          </div>

          {mode === 'manual' && !result ? (
            <>
              <div className="step-summary">
                <div>
                  <strong>{linePositionLabels[activeLinePosition]}</strong>
                  <span>第 {activeChangeIndex} 變</span>
                </div>
                <div>
                  <strong>{startingStalks}</strong>
                  <span>起始策數</span>
                </div>
                <div>
                  <strong>{activeChangeIndex === 1 ? '5 或 9' : '4 或 8'}</strong>
                  <span>本變合法移出</span>
                </div>
              </div>

              <div className="manual-guidance">
                <strong>這裡不是任意選答案</strong>
                <p>
                  請先實際分成左右兩堆，從右堆掛出 1 策，再把左堆與剩下的右堆各自每 4 策一組數完。
                  下方只是把你「數到的餘數」記錄進系統；整除時請記 4，不記 0。
                </p>
              </div>

              <div className="remainder-grid">
                <label>
                  <span>記錄左堆數到的餘數</span>
                  <select value={leftRemainder} onChange={(event) => setLeftRemainder(Number(event.target.value))}>
                    {remainderChoices.map((choice) => (
                      <option key={choice} value={choice}>
                        {choice}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>記錄右堆數到的餘數</span>
                  <select value={rightRemainder} onChange={(event) => setRightRemainder(Number(event.target.value))}>
                    {rightRemainderOptions.map((choice) => (
                      <option key={choice} value={choice}>
                        {choice}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="computed-total">
                  <span>本次移出：掛一 + 左餘 + 右餘</span>
                  <strong>{1 + leftRemainder + rightRemainder}</strong>
                </div>
              </div>
              <p className="input-note">
                右堆餘數已依目前第 {activeChangeIndex} 變的合法結果過濾，所以只會出現能形成{' '}
                {activeChangeIndex === 1 ? '5 或 9' : '4 或 8'} 策移出的選項。
              </p>

              {error ? <p className="error-message">{error}</p> : null}

              <button className="primary-action" onClick={submitManualChange}>
                記錄這次實際數到的結果
              </button>

              <div className="record-table" aria-label="已記錄變化">
                {[...completedLines.flatMap((line) => line.changes), ...currentChanges].map((step, index) => (
                  <div key={`${step.linePosition}-${step.changeIndex}-${index}`} className="record-row">
                    <span>
                      {linePositionLabels[step.linePosition]} / 第 {step.changeIndex} 變
                    </span>
                    <span>左 {step.leftRemainder}</span>
                    <span>右 {step.rightRemainder}</span>
                    <span>移出 {step.removedStalks}</span>
                    <span>餘 {step.remainingStalks}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <strong>{result ? '起卦完成' : '隨機模擬模式'}</strong>
              <p>{result ? '結果已生成，可往下查看本卦、動爻、之卦與匯出內容。' : '按「隨機模擬一卦」會自動完成 18 變。'}</p>
            </div>
          )}
        </div>

        <ResultPanel
          result={result}
          aiPrompt={aiPrompt}
          copyStatus={copyStatus}
          onCopyPrompt={copyPrompt}
          onDownloadText={downloadText}
          onDownloadJson={downloadJson}
          onPrint={printResultCard}
        />
      </section>
    </main>
  );
}

interface ResultPanelProps {
  result: HexagramResult | null;
  aiPrompt: string;
  copyStatus: string;
  onCopyPrompt: () => void;
  onDownloadText: () => void;
  onDownloadJson: () => void;
  onPrint: () => void;
}

function ResultPanel({
  result,
  aiPrompt,
  copyStatus,
  onCopyPrompt,
  onDownloadText,
  onDownloadJson,
  onPrint,
}: ResultPanelProps) {
  if (!result) {
    return (
      <section className="result-panel empty-result">
        <h2>結果區</h2>
        <p>完成手動 18 變或使用隨機模擬後，這裡會顯示本卦、動爻、之卦、下載與 AI 提示詞。</p>
      </section>
    );
  }

  const topDownLines = [...result.lines].reverse();

  return (
    <section className="result-panel">
      <div className="section-heading">
        <h2>起卦結果</h2>
        <span>{result.question.mode === 'manual' ? '手動記錄' : '隨機模擬'}</span>
      </div>

      <article className="result-card" id="result-card">
        <div className="result-card-header">
          <div>
            <p className="eyebrow">大衍筮法結果卡</p>
            <h3>{result.question.question || '未填寫問題'}</h3>
          </div>
          <span>{new Date(result.question.createdAt).toLocaleString('zh-TW')}</span>
        </div>

        {result.question.note ? <p className="result-note">{result.question.note}</p> : null}

        <div className="hexagram-grid">
          <div>
            <h4>本卦</h4>
            <HexagramLines lines={topDownLines.map((line) => line.yinYang)} />
          </div>
          <div>
            <h4>之卦</h4>
            <HexagramLines lines={[...result.changedLines].reverse()} />
          </div>
        </div>

        <div className="line-table">
          {topDownLines.map((line) => (
            <div className={line.isMoving ? 'line-row moving' : 'line-row'} key={line.position}>
              <span>{linePositionLabels[line.position]}</span>
              <span className="line-mark">{renderLine(line.yinYang)}</span>
              <span>
                {line.value} {line.label}
              </span>
              <span>{line.isMoving ? '動爻' : '靜爻'}</span>
            </div>
          ))}
        </div>

        <div className="interpretation-order">
          <strong>判讀順序</strong>
          <p>先看問題是否清楚，再看本卦、動爻、之卦，最後回到現實條件與可行行動。</p>
        </div>
      </article>

      <div className="export-actions">
        <button onClick={onDownloadText}>下載文字</button>
        <button onClick={onDownloadJson}>下載 JSON</button>
        <button onClick={onPrint}>列印 / 截圖卡</button>
      </div>

      <label className="prompt-box">
        <span>AI 搜尋 / 解卦提示詞</span>
        <textarea readOnly value={aiPrompt} />
      </label>
      <div className="export-actions">
        <button className="primary-action" onClick={onCopyPrompt}>
          複製 AI 提示詞
        </button>
        {copyStatus ? <span className="copy-status">{copyStatus}</span> : null}
      </div>
    </section>
  );
}

function HexagramLines({ lines }: { lines: YinYang[] }) {
  return (
    <div className="hexagram-lines">
      {lines.map((line, index) => (
        <span className={line === 'yang' ? 'yang-line' : 'yin-line'} key={`${line}-${index}`}>
          {renderLine(line)}
        </span>
      ))}
    </div>
  );
}

export default App;
