import { ReactNode, useState } from 'react';

export interface DrillItem {
  q: ReactNode;
  answer: string | string[];
  norm?: 'bin' | 'upper' | 'num';
  explain?: ReactNode;
  placeholder?: string;
}

function norm(s: string, n: DrillItem['norm'] = 'upper') {
  let x = s.trim().replace(/[\s_]/g, '');
  if (n === 'num') x = x.replace(/^\+/, '').replace(/^(-?)0+(\d)/, '$1$2');
  return x.toUpperCase();
}

/** Sonsuz alıştırma: rastgele soru üretir, anında kontrol eder. */
export function Drill({ title, make }: { title: ReactNode; make: () => DrillItem }) {
  const [item, setItem] = useState<DrillItem>(make);
  const [text, setText] = useState('');
  const [state, setStateL] = useState<null | boolean>(null);
  const [score, setScore] = useState({ ok: 0, all: 0, streak: 0 });
  const answers = Array.isArray(item.answer) ? item.answer : [item.answer];

  const check = () => {
    const ok = answers.some((a) => norm(a, item.norm) === norm(text, item.norm));
    setStateL(ok);
    setScore((s) => ({ ok: s.ok + (ok ? 1 : 0), all: s.all + 1, streak: ok ? s.streak + 1 : 0 }));
  };
  const nextQ = () => {
    setItem(make());
    setText('');
    setStateL(null);
  };
  return (
    <div className="drill">
      <div className="drill-head">
        <span>🎲 {title}</span>
        <span className="spacer" />
        <span className="muted small">
          {score.ok}/{score.all} doğru {score.streak >= 3 && <>· 🔥 {score.streak} seri</>}
        </span>
      </div>
      <div className="drill-q">{item.q}</div>
      <div className="q-input-row">
        <input
          className="q-input"
          value={text}
          placeholder={item.placeholder ?? 'cevap'}
          onChange={(e) => {
            setText(e.target.value);
            if (state === false) setStateL(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') state === true ? nextQ() : text.trim() && check();
          }}
          spellCheck={false}
          autoCapitalize="off"
        />
        {state === true ? (
          <button className="btn" onClick={nextQ}>Yeni soru →</button>
        ) : (
          <button className="btn" disabled={!text.trim() || state !== null} onClick={check}>Kontrol</button>
        )}
      </div>
      {state !== null && (
        <div className={`drill-fb ${state ? 'ok' : 'bad'}`}>
          {state ? '✅ Doğru!' : <>❌ Doğru cevap: <code>{answers[0]}</code></>}
          {item.explain && <div className="drill-exp">{item.explain}</div>}
          {!state && (
            <button className="btn btn-ghost small" onClick={nextQ}>Yeni soru →</button>
          )}
        </div>
      )}
    </div>
  );
}
