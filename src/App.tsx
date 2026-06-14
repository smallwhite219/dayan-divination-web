import { useMemo, useState } from 'react';
import {
  buildHexagramResult,
  createAiPrompt,
  linePositionLabels,
  simulateHexagram,
  simulateLine,
  type CastMode,
  type CastQuestion,
  type HexagramResult,
  type LinePosition,
  type LineResult,
  type YinYang,
} from './lib/dayan';

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
  const [completedLines, setCompletedLines] = useState<LineResult[]>([]);
  const [copyStatus, setCopyStatus] = useState('');

  const nextLinePosition = Math.min(completedLines.length + 1, 6) as LinePosition;
  const progress = completedLines.length;
  const aiPrompt = useMemo(() => (result ? createAiPrompt(result) : ''), [result]);

  function resetCast(nextMode = mode) {
    setResult(null);
    setCompletedLines([]);
    setMode(nextMode);
    setCopyStatus('');
  }

  function runRandomCast() {
    const castQuestion = createQuestion(question, note, 'random');
    setResult(simulateHexagram(castQuestion));
    setCompletedLines([]);
    setMode('random');
    setCopyStatus('');
  }

  function castNextLine() {
    setCopyStatus('');

    if (result) {
      resetCast('manual');
      return;
    }

    const nextLine = simulateLine(nextLinePosition);
    const nextLines = [...completedLines, nextLine];
    setCompletedLines(nextLines);
    setMode('manual');

    if (nextLines.length === 6) {
      setResult(buildHexagramResult(createQuestion(question, note, 'manual'), nextLines));
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
          <p className="eyebrow">五十取一不用，三變成一爻</p>
          <h1>大衍筮法</h1>
          <p>
            系統會依大衍筮法的分二、掛一、揲四、歸奇流程記錄每一爻。你只需要專注在問題上，
            逐爻按下起卦；六爻完成後會得到本卦、動爻與之卦。
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
            逐爻起卦
          </button>
          <button className={mode === 'random' ? 'active' : ''} onClick={runRandomCast}>
            一次成卦
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
            <span>{progress}/6 爻</span>
          </div>

          {mode === 'manual' && !result ? (
            <>
              <div className="line-cast-panel">
                <div>
                  <p className="eyebrow">下一次會記錄</p>
                  <strong>{linePositionLabels[nextLinePosition]}</strong>
                  <span>系統將在內部完成三變，並自動保存該爻的 6 / 7 / 8 / 9 結果。</span>
                </div>
                <button className="primary-action large-action" onClick={castNextLine}>
                  {completedLines.length === 0 ? '開始，起初爻' : '下一爻'}
                </button>
              </div>

              <div className="manual-guidance">
                <strong>使用者不需要選餘數</strong>
                <p>
                  目前改為系統記錄：每按一次，系統模擬一次完整「三變成一爻」。
                  這樣使用者只需要按六次，由下往上完成初爻到上爻。
                </p>
              </div>

              <RecordedLines lines={completedLines} />
            </>
          ) : (
            <div className="empty-state">
              <strong>{result ? '起卦完成' : '一次成卦模式'}</strong>
              <p>{result ? '結果已生成，可往下查看本卦、動爻、之卦與匯出內容。' : '按「一次成卦」會自動完成六爻。'}</p>
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

function RecordedLines({ lines }: { lines: LineResult[] }) {
  if (lines.length === 0) {
    return (
      <div className="empty-state line-history">
        <strong>尚未記錄任何爻</strong>
        <p>按「開始，起初爻」後，系統會把每一爻依序列在這裡。</p>
      </div>
    );
  }

  return (
    <div className="record-table line-history" aria-label="已記錄爻">
      {[...lines].reverse().map((line) => (
        <div key={line.position} className={line.isMoving ? 'line-row moving' : 'line-row'}>
          <span>{linePositionLabels[line.position]}</span>
          <LineGlyph yinYang={line.yinYang} compact />
          <span>
            {line.value} {line.label}
          </span>
          <span>{line.isMoving ? '動爻' : '靜爻'}</span>
        </div>
      ))}
    </div>
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
        <p>完成六次逐爻起卦或使用一次成卦後，這裡會顯示本卦、動爻、之卦、下載與 AI 提示詞。</p>
      </section>
    );
  }

  const topDownLines = [...result.lines].reverse();

  return (
    <section className="result-panel">
      <div className="section-heading">
        <h2>起卦結果</h2>
        <span>{result.question.mode === 'manual' ? '逐爻起卦' : '一次成卦'}</span>
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
              <LineGlyph yinYang={line.yinYang} compact />
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
        <LineGlyph yinYang={line} key={`${line}-${index}`} />
      ))}
    </div>
  );
}

function LineGlyph({ yinYang, compact = false }: { yinYang: YinYang; compact?: boolean }) {
  return (
    <span className={compact ? 'line-glyph line-glyph-compact' : 'line-glyph'} aria-label={yinYang === 'yang' ? '陽爻' : '陰爻'}>
      {yinYang === 'yang' ? (
        <span className="line-segment line-segment-full" />
      ) : (
        <>
          <span className="line-segment" />
          <span className="line-gap" />
          <span className="line-segment" />
        </>
      )}
    </span>
  );
}

export default App;
