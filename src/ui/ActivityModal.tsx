import { useMemo, useState } from 'react';
import type { Activity } from '../curriculum/activities';
import { sqlEngine, type QueryOutcome } from '../engine/sqlEngine';
import './activity.css';

export function ActivityModal({
  activity,
  onResolved,
}: {
  activity: Activity;
  onResolved: (correct: boolean) => void;
}) {
  return (
    <div className="am-backdrop">
      <div className="am-card">
        {activity.examTag && <div className="am-tag">{activity.examTag}</div>}
        {activity.kind === 'concept' && <ConceptView activity={activity} onResolved={onResolved} />}
        {activity.kind === 'predict' && <PredictView activity={activity} onResolved={onResolved} />}
        {activity.kind === 'arrange' && <ArrangeView activity={activity} onResolved={onResolved} />}
        {activity.kind === 'find-error' && <FindErrorView activity={activity} onResolved={onResolved} />}
        {activity.kind === 'complete' && <CompleteView activity={activity} onResolved={onResolved} />}
        {activity.kind === 'write' && <WriteView activity={activity} onResolved={onResolved} />}
      </div>
    </div>
  );
}

function ConceptView({ activity, onResolved }: { activity: Extract<Activity, { kind: 'concept' }>; onResolved: (c: boolean) => void }) {
  return (
    <div>
      <h3 className="am-title">📖 {activity.title}</h3>
      {activity.body.map((p, i) => (
        <p className="am-body" key={i} dangerouslySetInnerHTML={{ __html: p.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>') }} />
      ))}
      {activity.table && (
        <table className="am-table">
          <thead>
            <tr>{activity.table.columns.map((c) => <th key={c}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {activity.table.rows.map((row, i) => (
              <tr key={i}>{row.map((v, j) => <td key={j}>{v}</td>)}</tr>
            ))}
          </tbody>
        </table>
      )}
      <button className="am-btn am-primary" onClick={() => onResolved(true)}>Got it →</button>
    </div>
  );
}

function PredictView({ activity, onResolved }: { activity: Extract<Activity, { kind: 'predict' }>; onResolved: (c: boolean) => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const correct = picked === activity.correctIndex;
  return (
    <div>
      <h3 className="am-title">🔮 Predict</h3>
      {activity.context && <p className="am-context">{activity.context}</p>}
      <p className="am-body">{activity.prompt}</p>
      <div className="am-options">
        {activity.options.map((opt, i) => (
          <button
            key={i}
            className={`am-option${picked === i ? (checked ? (correct ? ' am-correct' : ' am-wrong') : ' am-selected') : ''}`}
            onClick={() => { if (!checked) setPicked(i); }}
            disabled={checked}
          >
            {opt}
          </button>
        ))}
      </div>
      {!checked ? (
        <button className="am-btn am-primary" disabled={picked === null} onClick={() => setChecked(true)}>Check answer</button>
      ) : (
        <ResultBar correct={correct} explanation={activity.explanation} onContinue={() => (correct ? onResolved(true) : (setChecked(false), setPicked(null)))} retry={!correct} />
      )}
    </div>
  );
}

function ArrangeView({ activity, onResolved }: { activity: Extract<Activity, { kind: 'arrange' }>; onResolved: (c: boolean) => void }) {
  const [pool, setPool] = useState<number[]>(() => activity.tokens.map((_, i) => i));
  const [chosen, setChosen] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const correct = useMemo(() => chosen.join(',') === activity.correctOrder.join(','), [chosen, activity.correctOrder]);

  const add = (idx: number) => {
    setPool((p) => p.filter((x) => x !== idx));
    setChosen((c) => [...c, idx]);
  };
  const remove = (pos: number) => {
    const idx = chosen[pos];
    setChosen((c) => c.filter((_, i) => i !== pos));
    setPool((p) => [...p, idx]);
  };
  const reset = () => {
    setPool(activity.tokens.map((_, i) => i));
    setChosen([]);
    setChecked(false);
  };

  return (
    <div>
      <h3 className="am-title">🧩 Arrange</h3>
      <p className="am-body">{activity.prompt}</p>
      <div className="am-answer-strip">
        {chosen.length === 0 && <span className="am-hint-text">Tap the pieces below, in order.</span>}
        {chosen.map((idx, pos) => (
          <button key={pos} className="am-token am-token-chosen" onClick={() => !checked && remove(pos)}>
            {activity.tokens[idx]}
          </button>
        ))}
      </div>
      <div className="am-token-pool">
        {pool.map((idx) => (
          <button key={idx} className="am-token" onClick={() => add(idx)} disabled={checked}>
            {activity.tokens[idx]}
          </button>
        ))}
      </div>
      {!checked ? (
        <button className="am-btn am-primary" disabled={pool.length > 0} onClick={() => setChecked(true)}>Check answer</button>
      ) : (
        <ResultBar correct={correct} explanation={activity.explanation} onContinue={() => (correct ? onResolved(true) : reset())} retry={!correct} />
      )}
    </div>
  );
}

function FindErrorView({ activity, onResolved }: { activity: Extract<Activity, { kind: 'find-error' }>; onResolved: (c: boolean) => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const correct = picked === activity.errorIndex;
  return (
    <div>
      <h3 className="am-title">🐞 Find the Error</h3>
      <p className="am-body">{activity.prompt}</p>
      <div className="am-options">
        {activity.snippet.map((line, i) => (
          <button
            key={i}
            className={`am-option am-mono${picked === i ? (checked ? (correct ? ' am-correct' : ' am-wrong') : ' am-selected') : ''}`}
            onClick={() => { if (!checked) setPicked(i); }}
            disabled={checked}
          >
            {line}
          </button>
        ))}
      </div>
      {!checked ? (
        <button className="am-btn am-primary" disabled={picked === null} onClick={() => setChecked(true)}>Check answer</button>
      ) : (
        <ResultBar correct={correct} explanation={activity.explanation} onContinue={() => (correct ? onResolved(true) : (setChecked(false), setPicked(null)))} retry={!correct} />
      )}
    </div>
  );
}

function CompleteView({ activity, onResolved }: { activity: Extract<Activity, { kind: 'complete' }>; onResolved: (c: boolean) => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const correct = picked === activity.correctIndex;
  const [before, after] = activity.template.split('____');
  return (
    <div>
      <h3 className="am-title">✏️ Complete the Statement</h3>
      <p className="am-body">{activity.prompt}</p>
      <p className="am-mono am-fill-line">
        {before}
        <span className="am-blank">{picked !== null ? activity.options[picked] : '____'}</span>
        {after}
      </p>
      <div className="am-options">
        {activity.options.map((opt, i) => (
          <button
            key={i}
            className={`am-option${picked === i ? (checked ? (correct ? ' am-correct' : ' am-wrong') : ' am-selected') : ''}`}
            onClick={() => { if (!checked) setPicked(i); }}
            disabled={checked}
          >
            {opt}
          </button>
        ))}
      </div>
      {!checked ? (
        <button className="am-btn am-primary" disabled={picked === null} onClick={() => setChecked(true)}>Check answer</button>
      ) : (
        <ResultBar correct={correct} explanation={activity.explanation} onContinue={() => (correct ? onResolved(true) : (setChecked(false), setPicked(null)))} retry={!correct} />
      )}
    </div>
  );
}

function WriteView({ activity, onResolved }: { activity: Extract<Activity, { kind: 'write' }>; onResolved: (c: boolean) => void }) {
  const [sql, setSql] = useState(activity.starter);
  const [outcome, setOutcome] = useState<QueryOutcome | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    await sqlEngine.init();
    const { outcome: o, correct: c } = sqlEngine.checkAgainstExpected(sql, activity.expectedSql);
    setOutcome(o);
    setCorrect(c);
    setRunning(false);
  };

  return (
    <div>
      <h3 className="am-title">💻 Write &amp; Run</h3>
      <p className="am-body">{activity.prompt}</p>
      <textarea
        className="am-sql-input"
        value={sql}
        onChange={(e) => setSql(e.target.value)}
        spellCheck={false}
        rows={3}
      />
      <div className="am-row">
        <button className="am-btn am-primary" onClick={run} disabled={running}>
          {running ? 'Running…' : '▶ Run Query'}
        </button>
        <button className="am-btn am-ghost" onClick={() => setShowHint((s) => !s)}>💡 Hint</button>
      </div>
      {showHint && <p className="am-hint-text">{activity.hint}</p>}
      {outcome && !outcome.ok && <p className="am-error-text">⚠ {outcome.error}</p>}
      {outcome?.ok && outcome.result && (
        <table className="am-table am-result-table">
          <thead>
            <tr>{outcome.result.columns.map((c) => <th key={c}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {outcome.result.rows.map((row, i) => (
              <tr key={i}>{row.map((v, j) => <td key={j}>{String(v)}</td>)}</tr>
            ))}
            {outcome.result.rows.length === 0 && (
              <tr><td colSpan={outcome.result.columns.length || 1} className="am-hint-text">No rows returned.</td></tr>
            )}
          </tbody>
        </table>
      )}
      {correct !== null && (
        <ResultBar correct={correct} explanation={correct ? 'Correct — that\'s exactly the result the mission needed.' : 'Not quite the result expected yet — check your column/table names and try again.'} onContinue={() => (correct ? onResolved(true) : setCorrect(null))} retry={!correct} />
      )}
    </div>
  );
}

function ResultBar({ correct, explanation, onContinue, retry }: { correct: boolean; explanation: string; onContinue: () => void; retry: boolean }) {
  return (
    <div className={`am-result ${correct ? 'am-result-good' : 'am-result-bad'}`}>
      <p className="am-result-headline">{correct ? '✅ Correct!' : '❌ Not quite.'}</p>
      <p className="am-body">{explanation}</p>
      <button className="am-btn am-primary" onClick={onContinue}>{correct ? 'Continue →' : retry ? 'Try again' : 'Continue'}</button>
    </div>
  );
}
