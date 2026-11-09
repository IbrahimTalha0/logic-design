import { useMemo, useState } from 'react';
import { GateIcon, GateType } from '../components/Gate';
import {
  ParseError, bits, countLiterals, minimalPOS, minimalSOP, parse, pi, productOfMaxtermsString, sigma, sortedVars,
  sumOfMintermsString, truthTable,
} from '../lib/boolean';
import { En } from '../components/ui';

const GATE_INFO: Record<GateType, { fn: (v: number[]) => number; expr: string; tr: string }> = {
  AND: { fn: (v) => (v.every(Boolean) ? 1 : 0), expr: 'F = xy', tr: 'Tüm girişler 1 ise çıkış 1' },
  OR: { fn: (v) => (v.some(Boolean) ? 1 : 0), expr: 'F = x + y', tr: 'En az bir giriş 1 ise çıkış 1' },
  NOT: { fn: (v) => (v[0] ? 0 : 1), expr: "F = x'", tr: 'Girişin tersi' },
  BUF: { fn: (v) => v[0], expr: 'F = x', tr: 'Giriş aynen geçer (sinyali güçlendirir)' },
  NAND: { fn: (v) => (v.every(Boolean) ? 0 : 1), expr: "F = (xy)'", tr: "AND'in tersi: tüm girişler 1 ise 0" },
  NOR: { fn: (v) => (v.some(Boolean) ? 0 : 1), expr: "F = (x + y)'", tr: "OR'un tersi: tüm girişler 0 ise 1" },
  XOR: { fn: (v) => v.reduce((a, b) => a ^ b, 0), expr: "F = xy' + x'y = x ⊕ y", tr: 'Girişler farklıysa 1 (tek sayıda 1 varsa 1)' },
  XNOR: { fn: (v) => (v.reduce((a, b) => a ^ b, 0) ? 0 : 1), expr: "F = xy + x'y' = (x ⊕ y)'", tr: 'Girişler aynıysa 1 (eşitlik / equivalence)' },
};

export function GatePlayground({ only }: { only?: GateType[] }) {
  const list = only ?? (['AND', 'OR', 'NOT', 'BUF', 'NAND', 'NOR', 'XOR', 'XNOR'] as GateType[]);
  const [g, setG] = useState<GateType>(list[0]);
  const [nIn, setNIn] = useState(2);
  const single = g === 'NOT' || g === 'BUF';
  const n = single ? 1 : nIn;
  const [vals, setVals] = useState([0, 0, 0]);
  const v = vals.slice(0, n);
  const info = GATE_INFO[g];
  const out = info.fn(v);
  const names = ['x', 'y', 'z'];
  return (
    <div className="lab">
      <div className="lab-title">🎛️ Kapı Oyun Alanı</div>
      <div className="seg wrap">
        {list.map((t) => (
          <button key={t} className={t === g ? 'active' : ''} onClick={() => setG(t)}>
            {t}
          </button>
        ))}
      </div>
      {!single && (
        <div className="seg small-seg">
          {[2, 3].map((k) => (
            <button key={k} className={k === nIn ? 'active' : ''} onClick={() => setNIn(k)}>
              {k} giriş
            </button>
          ))}
        </div>
      )}
      <div className="gate-stage">
        <div className="gate-inputs">
          {v.map((x, i) => (
            <button key={i} className={`toggle ${x ? 'on' : ''}`} onClick={() => setVals(vals.map((y, j) => (j === i ? 1 - y : y)))}>
              {names[i]} = {x}
            </button>
          ))}
        </div>
        <GateIcon type={g} inputs={n} width={240} labels={names.slice(0, n)} out="F" values={v} outValue={out} />
        <div className={`out-led ${out ? 'on' : ''}`}>F = {out}</div>
      </div>
      <div className="gate-desc">
        <span className="mono">{info.expr}</span> — {info.tr}
      </div>
      <table className="tbl compact tt">
        <thead>
          <tr>
            {names.slice(0, n).map((x) => (
              <th key={x}>{x}</th>
            ))}
            <th>F</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 1 << n }, (_, m) => {
            const row = bits(m, n).split('').map(Number);
            const cur = row.every((b, i) => b === v[i]);
            return (
              <tr key={m} className={cur ? 'hl' : ''} onClick={() => setVals([...row, 0, 0].slice(0, 3))} style={{ cursor: 'pointer' }}>
                {row.map((b, i) => (
                  <td key={i}>{b}</td>
                ))}
                <td>
                  <b>{info.fn(row)}</b>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="muted small">İpucu: tablodaki bir satıra tıklayınca girişler o değerlere ayarlanır.</div>
    </div>
  );
}

// ------------------------------------------------------------------
/** Zamanlama diyagramı: x ve y'nin dalga biçimini tıklayarak değiştir */
export function TimingDiagram() {
  const [x, setX] = useState([0, 1, 1, 0, 0]);
  const [y, setY] = useState([0, 0, 1, 1, 0]);
  const W = 70, H = 26, L = 70;
  const rows: { name: string; vals: number[]; edit?: (i: number) => void }[] = [
    { name: 'x', vals: x, edit: (i) => setX(x.map((v, j) => (j === i ? 1 - v : v))) },
    { name: 'y', vals: y, edit: (i) => setY(y.map((v, j) => (j === i ? 1 - v : v))) },
    { name: 'AND: x·y', vals: x.map((v, i) => v & y[i]) },
    { name: 'OR: x+y', vals: x.map((v, i) => v | y[i]) },
    { name: "NOT: x'", vals: x.map((v) => 1 - v) },
  ];
  const wave = (vals: number[]) => {
    let d = '';
    vals.forEach((v, i) => {
      const yy = v ? 4 : H - 4;
      if (i === 0) d += `M${L},${yy}`;
      else d += ` L${L + i * W},${yy}`;
      d += ` L${L + (i + 1) * W},${yy}`;
    });
    return d;
  };
  return (
    <div className="lab">
      <div className="lab-title">📈 Zamanlama Diyagramı <En>timing diagram</En></div>
      <div className="muted small">x ve y satırlarındaki kutulara tıklayarak giriş sinyalini değiştir; çıkışlar anında güncellenir.</div>
      <svg viewBox={`0 0 ${L + 5 * W + 10} ${rows.length * (H + 18) + 10}`} className="timing" role="img" aria-label="zamanlama diyagramı">
        {rows.map((r, ri) => (
          <g key={r.name} transform={`translate(0, ${ri * (H + 18) + 6})`}>
            <text x={0} y={H / 2 + 4} className="svg-label small">
              {r.name}
            </text>
            {r.vals.map((v, i) => (
              <g key={i}>
                <rect
                  x={L + i * W}
                  y={0}
                  width={W}
                  height={H}
                  className={r.edit ? 'tcell edit' : 'tcell'}
                  onClick={() => r.edit?.(i)}
                />
                <text x={L + i * W + W / 2} y={H + 13} textAnchor="middle" className="svg-tiny">
                  {v}
                </text>
              </g>
            ))}
            <path d={wave(r.vals)} className={ri < 2 ? 'wave in' : 'wave out'} fill="none" />
          </g>
        ))}
      </svg>
    </div>
  );
}

// ------------------------------------------------------------------
export function TruthTableLab({ initial = "xy' + x'z" }: { initial?: string }) {
  const [src, setSrc] = useState(initial);
  const r = useMemo(() => {
    try {
      const ast = parse(src);
      const vars = sortedVars(ast);
      if (vars.length > 5) return { err: 'En fazla 5 değişken kullanın.' };
      const tt = truthTable(ast, vars);
      const ones = tt.flatMap((v, i) => (v ? [i] : []));
      const zeros = tt.flatMap((v, i) => (v ? [] : [i]));
      return { vars, tt, ones, zeros, lits: countLiterals(ast) };
    } catch (e) {
      return { err: e instanceof ParseError ? e.message : String(e) };
    }
  }, [src]);
  return (
    <div className="lab">
      <div className="lab-title">🧮 Doğruluk Tablosu ve Kanonik Form Üretici</div>
      <label className="block">
        Boole ifadesi (F =)
        <input className="q-input mono" value={src} onChange={(e) => setSrc(e.target.value)} spellCheck={false} />
      </label>
      <div className="hint-line">
        Yazım: <code>x'</code> tümleyen, <code>xy</code> VE, <code>x + y</code> VEYA, <code>x ^ y</code> XOR, parantez serbest.
      </div>
      {'err' in r ? (
        <div className="lab-err">{r.err}</div>
      ) : (
        <div className="tt-layout">
          <table className="tbl compact tt">
            <thead>
              <tr>
                <th className="muted">m</th>
                {r.vars!.map((v) => (
                  <th key={v}>{v}</th>
                ))}
                <th>F</th>
              </tr>
            </thead>
            <tbody>
              {r.tt!.map((f, m) => (
                <tr key={m} className={f ? 'hl' : ''}>
                  <td className="muted">{m}</td>
                  {bits(m, r.vars!.length)
                    .split('')
                    .map((b, i) => (
                      <td key={i}>{b}</td>
                    ))}
                  <td>
                    <b>{f}</b>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="tt-forms">
            <div className="form-row">
              <span className="form-k">Literal sayısı</span>
              <span className="mono">{r.lits}</span>
            </div>
            <div className="form-row">
              <span className="form-k">Sum of minterms</span>
              <span className="mono">F({r.vars!.join(', ')}) = {sigma(r.ones!)}</span>
            </div>
            <div className="form-row">
              <span className="form-k">Product of maxterms</span>
              <span className="mono">F = {pi(r.zeros!)}</span>
            </div>
            <div className="form-row">
              <span className="form-k">Complement F'</span>
              <span className="mono">F' = {sigma(r.zeros!)}</span>
            </div>
            <div className="form-row col">
              <span className="form-k">Canonical SOP (açık hali)</span>
              <span className="mono wrap">{sumOfMintermsString(r.vars!, r.ones!) || '0'}</span>
            </div>
            <div className="form-row col">
              <span className="form-k">Canonical POS (açık hali)</span>
              <span className="mono wrap">{productOfMaxtermsString(r.vars!, r.zeros!)}</span>
            </div>
            {r.vars!.length <= 4 && (
              <>
                <div className="form-row col">
                  <span className="form-k">En sade SOP (K-map sonucu)</span>
                  <span className="mono">{minimalSOP(r.vars!, r.ones!).expr}</span>
                </div>
                <div className="form-row col">
                  <span className="form-k">En sade POS</span>
                  <span className="mono">{minimalPOS(r.vars!, r.ones!).expr}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
export function EquivalenceChecker({ a: a0 = "(x + y)'", b: b0 = "x'y'" }: { a?: string; b?: string }) {
  const [a, setA] = useState(a0);
  const [b, setB] = useState(b0);
  const r = useMemo(() => {
    try {
      const A = parse(a), B = parse(b);
      const vars = [...new Set([...sortedVars(A), ...sortedVars(B)])].sort();
      if (vars.length > 5) return { err: 'En fazla 5 değişken.' };
      const ta = truthTable(A, vars), tb = truthTable(B, vars);
      return { vars, ta, tb, same: ta.every((v, i) => v === tb[i]) };
    } catch (e) {
      return { err: (e as Error).message };
    }
  }, [a, b]);
  return (
    <div className="lab">
      <div className="lab-title">⚖️ Eşdeğerlik Kontrolü (iki ifade aynı mı?)</div>
      <div className="lab-controls">
        <label className="grow">
          İfade 1 <input className="q-input mono" value={a} onChange={(e) => setA(e.target.value)} spellCheck={false} />
        </label>
        <label className="grow">
          İfade 2 <input className="q-input mono" value={b} onChange={(e) => setB(e.target.value)} spellCheck={false} />
        </label>
      </div>
      {'err' in r ? (
        <div className="lab-err">{r.err}</div>
      ) : (
        <>
          <div className={r.same ? 'ok-line big' : 'lab-err big'}>{r.same ? '✓ Eşdeğer — tüm satırlar aynı' : '✗ Eşdeğer değil — farklı satırlar kırmızı'}</div>
          <table className="tbl compact tt">
            <thead>
              <tr>
                {r.vars!.map((v) => (
                  <th key={v}>{v}</th>
                ))}
                <th>İfade 1</th>
                <th>İfade 2</th>
              </tr>
            </thead>
            <tbody>
              {r.ta!.map((va, m) => (
                <tr key={m} className={va !== r.tb![m] ? 'bad' : ''}>
                  {bits(m, r.vars!.length)
                    .split('')
                    .map((bb, i) => (
                      <td key={i}>{bb}</td>
                    ))}
                  <td>{va}</td>
                  <td>{r.tb![m]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
export function ParityLab() {
  const [msg, setMsg] = useState([1, 0, 1]);
  const [flip, setFlip] = useState<number | null>(null);
  const P = msg[0] ^ msg[1] ^ msg[2];
  const sent = [...msg, P];
  const recv = sent.map((b, i) => (i === flip ? 1 - b : b));
  const C = recv.reduce((a, b) => a ^ b, 0);
  const names = ['x', 'y', 'z', 'P'];
  return (
    <div className="lab">
      <div className="lab-title">📡 Çift Parite Üreteci ve Denetleyicisi</div>
      <div className="parity-flow">
        <div className="pf-box">
          <div className="pf-h">Gönderici</div>
          <div className="bit-row">
            {msg.map((b, i) => (
              <button key={i} className={`bit ${b ? 'on' : ''}`} onClick={() => setMsg(msg.map((x, j) => (j === i ? 1 - x : x)))}>
                {b}
                <span className="bit-w">{names[i]}</span>
              </button>
            ))}
          </div>
          <div className="mono small">P = x ⊕ y ⊕ z = {P}</div>
        </div>
        <div className="pf-arrow">→ kanal →</div>
        <div className="pf-box">
          <div className="pf-h">İletim (bir bit boz)</div>
          <div className="bit-row">
            {sent.map((_, i) => (
              <button key={i} className={`bit ${recv[i] ? 'on' : ''} ${flip === i ? 'err' : ''}`} onClick={() => setFlip(flip === i ? null : i)}>
                {recv[i]}
                <span className="bit-w">{names[i]}</span>
              </button>
            ))}
          </div>
          <div className="muted small">Bir bite tıklayınca iletimde bozulur.</div>
        </div>
        <div className="pf-arrow">→</div>
        <div className="pf-box">
          <div className="pf-h">Alıcı (checker)</div>
          <div className="mono small">C = x ⊕ y ⊕ z ⊕ P = {C}</div>
          <div className={`out-led ${C ? 'err' : 'on'}`}>{C ? 'HATA VAR! (C = 1)' : 'Hata yok (C = 0)'}</div>
        </div>
      </div>
      <div className="muted small">
        Çift parite: gönderilen 4 bitte 1'lerin sayısı her zaman çifttir. Alıcı tek sayıda 1 görürse hata vardır. (İki bit birden bozulursa yakalanamaz!)
      </div>
    </div>
  );
}
