import { ReactNode, useMemo, useRef, useState } from 'react';
import { setState, useStore } from '../lib/store';
import { countLiterals, minimalPOS, minimalSOP, parse, truthTable } from '../lib/boolean';
import { gradeModule } from '../lib/verilog';
import { CodeEditor } from './CodeEditor';

interface Base {
  id: string;
  q: ReactNode; // soru (İngilizce — sınav dili)
  tr?: ReactNode; // Türkçe çevirisi
  explain?: ReactNode; // Türkçe çözüm açıklaması
}
export type Question = Base &
  (
    | { kind: 'mc'; options: ReactNode[]; answer: number }
    | { kind: 'text'; answer: string | string[]; norm?: 'bin' | 'upper' | 'num' | 'raw' | 'list'; placeholder?: string }
    | { kind: 'expr'; vars: string[]; ones: number[]; dc?: number[]; minimal?: 'sop' | 'pos'; placeholder?: string }
    | {
        kind: 'verilog';
        starter: string;
        module: string;
        inputs: string[];
        outputs: Record<string, (e: Record<string, number>) => number>;
        care?: (e: Record<string, number>) => boolean; // false → don't-care satırı (kontrol edilmez)
        requireUdp?: boolean;
      }
  );

function normalize(s: string, norm: string = 'upper') {
  let x = s.trim();
  if (norm === 'raw') return x;
  if (norm === 'list') return [...x.matchAll(/\d+/g)].map((m) => parseInt(m[0], 10)).sort((a, b) => a - b).join(',');
  x = x.replace(/[\s_]/g, '').replace(/,/g, '');
  if (norm === 'bin') return x;
  if (norm === 'num') return x.replace(/^\+/, '').replace(/^(-?)0+(\d)/, '$1$2').toUpperCase();
  return x.toUpperCase();
}

type Status = { ok: boolean | 'partial'; msg?: ReactNode } | null;

function checkExpr(input: string, q: Extract<Question, { kind: 'expr' }>): Status {
  let tt: number[];
  let lits = 0;
  try {
    const ast = parse(input);
    tt = truthTable(ast, q.vars);
    lits = countLiterals(ast);
    const extra = [...input.matchAll(/[A-Za-z]/g)].map((m) => m[0]).filter((v) => !q.vars.includes(v));
    if (extra.length) return { ok: false, msg: `Bilinmeyen değişken: ${[...new Set(extra)].join(', ')}. Kullanılabilir: ${q.vars.join(', ')}` };
  } catch (e) {
    return { ok: false, msg: `Yazım hatası: ${(e as Error).message}` };
  }
  const dc = q.dc ?? [];
  const wrong = tt.flatMap((v, m) => (dc.includes(m) ? [] : v !== (q.ones.includes(m) ? 1 : 0) ? [m] : []));
  if (wrong.length) return { ok: false, msg: `Fonksiyon eşit değil. Yanlış çıkan mintermler: ${wrong.slice(0, 6).join(', ')}${wrong.length > 6 ? '…' : ''}` };
  if (q.minimal) {
    const best = q.minimal === 'sop' ? minimalSOP(q.vars, q.ones, dc) : minimalPOS(q.vars, q.ones, dc);
    const bestLits = countLiterals(parse(best.expr));
    if (lits > bestLits) return { ok: 'partial', msg: `Fonksiyon doğru ama en sade hali değil (${lits} literal; en az ${bestLits} literal mümkün).` };
  }
  return { ok: true };
}

function QuestionCard({ q, index, onResult }: { q: Question; index: number; onResult: (id: string, ok: boolean) => void }) {
  const showTrGlobal = useStore((s) => s.showTr);
  const [showTr, setShowTr] = useState<boolean | null>(null);
  const [status, setStatus] = useState<Status>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [text, setText] = useState(q.kind === 'verilog' ? q.starter : '');
  const order = useMemo(() => {
    if (q.kind !== 'mc') return [];
    const idx = q.options.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    return idx;
  }, [q]);
  const trVisible = showTr ?? showTrGlobal;

  const finish = (st: Status) => {
    setStatus(st);
    if (st) onResult(q.id, st.ok === true);
  };

  const check = () => {
    if (q.kind === 'text') {
      const answers = Array.isArray(q.answer) ? q.answer : [q.answer];
      const ok = answers.some((a) => normalize(a, q.norm) === normalize(text, q.norm));
      finish({ ok });
    } else if (q.kind === 'expr') {
      finish(checkExpr(text, q));
    } else if (q.kind === 'verilog') {
      const r = gradeModule(text, { module: q.module, inputs: q.inputs, outputs: q.outputs, care: q.care });
      if (r.ok && q.requireUdp && !r.sim.modules.find((m) => m.name === q.module)?.udp) {
        r.ok = false;
        r.messages.push('Bu soruda "primitive … table … endtable … endprimitive" yapısında bir UDP yazmalısınız.');
      }
      const errs = r.sim.diags.filter((d) => d.level === 'error').map((d) => `Satır ${d.line}: ${d.msg}`);
      finish({ ok: r.ok, msg: (errs.length ? errs : r.messages).map((m, i) => <div key={i}>{m}</div>) });
    }
  };

  const answered = status !== null;
  return (
    <div className={`qcard ${status ? (status.ok === true ? 'q-ok' : status.ok === 'partial' ? 'q-partial' : 'q-bad') : ''}`}>
      <div className="q-head">
        <span className="q-num">Soru {index + 1}</span>
        <span className="spacer" />
        {q.tr && (
          <button className="icon-btn" onClick={() => setShowTr(!trVisible)}>
            {trVisible ? 'TR gizle' : 'TR çeviri'}
          </button>
        )}
      </div>
      <div className="q-text">{q.q}</div>
      {q.tr && trVisible && <div className="q-tr">{q.tr}</div>}

      {q.kind === 'mc' && (
        <div className="q-options">
          {order.map((oi) => {
            const isAns = oi === q.answer;
            let cls = 'q-opt';
            if (picked !== null) {
              if (isAns) cls += ' correct';
              else if (oi === picked) cls += ' wrong';
            }
            return (
              <button
                key={oi}
                className={cls}
                disabled={picked !== null}
                onClick={() => {
                  setPicked(oi);
                  finish({ ok: oi === q.answer });
                }}
              >
                {q.options[oi]}
              </button>
            );
          })}
        </div>
      )}

      {(q.kind === 'text' || q.kind === 'expr') && (
        <div className="q-input-row">
          <input
            className="q-input"
            value={text}
            placeholder={q.placeholder ?? (q.kind === 'expr' ? "örn: x'y + yz" : 'cevabınız')}
            onChange={(e) => {
              setText(e.target.value);
              if (status && status.ok !== true) setStatus(null);
            }}
            onKeyDown={(e) => e.key === 'Enter' && text.trim() && check()}
            spellCheck={false}
            autoCapitalize="off"
          />
          <button className="btn" disabled={!text.trim()} onClick={check}>
            Kontrol et
          </button>
        </div>
      )}
      {q.kind === 'expr' && <div className="hint-line">Yazım: tümleyen için <code>'</code> (x'), VEYA için <code>+</code>, VE için yan yana yazın (xy). Parantez kullanabilirsiniz.</div>}

      {q.kind === 'verilog' && (
        <div>
          <CodeEditor value={text} onChange={(v) => { setText(v); if (status && status.ok !== true) setStatus(null); }} rows={12} />
          <div className="q-input-row">
            <button className="btn" onClick={check}>Derle ve test et</button>
            <button className="btn btn-ghost" onClick={() => { setText(q.starter); setStatus(null); }}>Başa al</button>
          </div>
        </div>
      )}

      {status && (
        <div className="q-feedback">
          <strong>{status.ok === true ? 'Doğru!' : status.ok === 'partial' ? 'Neredeyse!' : 'Yanlış'}</strong>
          {status.msg && <div className="q-msg">{status.msg}</div>}
          {q.kind === 'text' && status.ok !== true && (
            <div className="q-msg">
              Doğru cevap: <code>{Array.isArray(q.answer) ? q.answer[0] : q.answer}</code>
            </div>
          )}
          {q.kind === 'expr' && status.ok !== true && (
            <details className="q-msg">
              <summary>Bir doğru cevabı göster</summary>
              <code>{q.minimal === 'pos' ? minimalPOS(q.vars, q.ones, q.dc).expr : minimalSOP(q.vars, q.ones, q.dc).expr}</code>
            </details>
          )}
          {q.explain && answered && <div className="q-explain">{q.explain}</div>}
        </div>
      )}
    </div>
  );
}

export function Quiz({ id, questions, title = 'Pekiştirme Soruları' }: { id: string; questions: Question[]; title?: ReactNode }) {
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [round, setRound] = useState(0);
  const best = useStore((s) => s.quiz[id]);
  const done = Object.keys(results).length;
  const correct = Object.values(results).filter(Boolean).length;

  const ref = useRef<Record<string, boolean>>({});
  const onResult = (qid: string, ok: boolean) => {
    // ilk cevap kaydedilir; sonradan düzeltilirse doğruya yükseltilir (öğrenme amaçlı)
    if (qid in ref.current && (ref.current[qid] || !ok)) return;
    const next = { ...ref.current, [qid]: ok };
    ref.current = next;
    setResults(next);
    const c = Object.values(next).filter(Boolean).length;
    setState((s) => ({
      answered: { ...s.answered, [qid]: ok || !!s.answered[qid] },
      quiz: c > (s.quiz[id]?.best ?? -1) ? { ...s.quiz, [id]: { best: c, total: questions.length } } : s.quiz,
    }));
  };

  return (
    <section className="quiz">
      <div className="quiz-head">
        <h2>{title}</h2>
        <p className="muted">
          Sorular sınavdaki gibi İngilizcedir. Takıldığınızda <b>TR çeviri</b> düğmesini kullanın; ama sınavdan önce çevirisiz çözebilmeyi hedefleyin.
        </p>
      </div>
      {questions.map((q, i) => (
        <QuestionCard key={`${round}-${q.id}`} q={q} index={i} onResult={onResult} />
      ))}
      <div className="quiz-foot">
        <div>
          Skor: <b>{correct}</b> / {questions.length} {done < questions.length && <span className="muted">({questions.length - done} soru cevaplanmadı)</span>}
          {best && <span className="muted"> · En iyi: {best.best}/{best.total}</span>}
        </div>
        <button className="btn btn-ghost" onClick={() => { ref.current = {}; setResults({}); setRound((r) => r + 1); }}>
          ↻ Testi sıfırla
        </button>
      </div>
    </section>
  );
}
