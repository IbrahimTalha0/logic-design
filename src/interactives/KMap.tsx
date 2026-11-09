import { useEffect, useMemo, useState } from 'react';
import { Implicant, countLiterals, minimalPOS, minimalSOP, parse, sigma, termPOS, termSOP, truthTable } from '../lib/boolean';

const GRAY: Record<number, number[]> = { 1: [0, 1], 2: [0, 1, 3, 2] };
const COLORS = ['#e11d48', '#2563eb', '#16a34a', '#d97706', '#9333ea', '#0891b2', '#db2777', '#65a30d'];
const DEFAULT_VARS: Record<number, string[]> = { 2: ['x', 'y'], 3: ['x', 'y', 'z'], 4: ['w', 'x', 'y', 'z'] };

type Cell = 0 | 1 | 2; // 2 = X (don't care)

function layout(n: number) {
  const rv = n === 4 ? 2 : 1;
  const cv = n - rv;
  return { rv, cv, rows: GRAY[rv], cols: GRAY[cv] };
}

function cellIndex(n: number, r: number, c: number) {
  const { cv, rows, cols } = layout(n);
  return (rows[r] << cv) | cols[c];
}

function runs(pos: number[], size: number): [number, number][] {
  const s = [...new Set(pos)].sort((a, b) => a - b);
  if (s.length === size) return [[0, size - 1]];
  const out: [number, number][] = [];
  let start = s[0], prev = s[0];
  for (let i = 1; i < s.length; i++) {
    if (s[i] === prev + 1) prev = s[i];
    else {
      out.push([start, prev]);
      start = prev = s[i];
    }
  }
  out.push([start, prev]);
  return out;
}

function rectsFor(imp: Implicant, n: number) {
  const { rows, cols } = layout(n);
  const rp: number[] = [], cp: number[] = [];
  for (let r = 0; r < rows.length; r++)
    for (let c = 0; c < cols.length; c++) {
      if (imp.covers.includes(cellIndex(n, r, c))) {
        rp.push(r);
        cp.push(c);
      }
    }
  // implikantın tüm hücreleri (dc dahil) kapsanmalı
  const rr = runs(rp, rows.length), cc = runs(cp, cols.length);
  const out: { r0: number; r1: number; c0: number; c1: number; openTop: boolean; openBottom: boolean; openLeft: boolean; openRight: boolean }[] = [];
  for (const [r0, r1] of rr)
    for (const [c0, c1] of cc)
      out.push({
        r0, r1, c0, c1,
        openTop: rr.length > 1 && r0 === 0,
        openBottom: rr.length > 1 && r1 === rows.length - 1,
        openLeft: cc.length > 1 && c0 === 0,
        openRight: cc.length > 1 && c1 === cols.length - 1,
      });
  return out;
}

function parseList(s: string): number[] {
  return [...s.matchAll(/\d+/g)].map((m) => parseInt(m[0], 10));
}

export interface KMapProps {
  n?: 2 | 3 | 4;
  vars?: string[];
  ones?: number[];
  dcs?: number[];
  mode?: 'sop' | 'pos';
  allowDc?: boolean;
  lockN?: boolean;
  title?: string;
}

export function KMap({ n: n0 = 3, vars: v0, ones: o0 = [], dcs: d0 = [], mode: mode0 = 'sop', allowDc = true, lockN = false, title }: KMapProps) {
  const [n, setN] = useState<2 | 3 | 4>(n0);
  const vars = v0 && v0.length === n ? v0 : DEFAULT_VARS[n];
  const init = (nn: number, ones: number[], dcs: number[]): Cell[] =>
    Array.from({ length: 1 << nn }, (_, m) => (ones.includes(m) ? 1 : dcs.includes(m) ? 2 : 0));
  const [cells, setCells] = useState<Cell[]>(() => init(n0, o0, d0));
  const [mode, setMode] = useState<'sop' | 'pos'>(mode0);
  const [step, setStep] = useState(3);
  const [showIdx, setShowIdx] = useState(true);
  const [listOnes, setListOnes] = useState('');
  const [listDc, setListDc] = useState('');
  const [exprIn, setExprIn] = useState('');
  const [inErr, setInErr] = useState('');

  const ones = cells.flatMap((c, m) => (c === 1 ? [m] : []));
  const dcs = cells.flatMap((c, m) => (c === 2 ? [m] : []));
  const zeros = cells.flatMap((c, m) => (c === 0 ? [m] : []));
  const res = useMemo(() => (mode === 'sop' ? minimalSOP(vars, ones, dcs) : minimalPOS(vars, ones, dcs)), [mode, vars.join(), ones.join(), dcs.join()]); // eslint-disable-line

  useEffect(() => {
    setListOnes(ones.join(', '));
    setListDc(dcs.join(', '));
  }, [cells]); // eslint-disable-line

  const changeN = (k: 2 | 3 | 4) => {
    setN(k);
    setCells(init(k, [], []));
  };
  const click = (m: number) => {
    setCells(cells.map((c, i) => (i === m ? (((c + 1) % (allowDc ? 3 : 2)) as Cell) : c)));
  };
  const applyLists = () => {
    const o = parseList(listOnes).filter((m) => m < 1 << n);
    const d = parseList(listDc).filter((m) => m < 1 << n && !o.includes(m));
    setCells(init(n, o, d));
    setInErr('');
  };
  const applyExpr = () => {
    try {
      const tt = truthTable(parse(exprIn), vars);
      const extra = [...exprIn.matchAll(/[A-Za-z]/g)].map((x) => x[0]).filter((v) => !vars.includes(v));
      if (extra.length) throw new Error(`Bu haritanın değişkenleri: ${vars.join(', ')}`);
      setCells(tt.map((v) => (v ? 1 : 0)) as Cell[]);
      setInErr('');
    } catch (e) {
      setInErr((e as Error).message);
    }
  };

  const { rv, rows, cols } = layout(n);
  const rowLabel = vars.slice(0, rv).join('');
  const colLabel = vars.slice(rv).join('');
  const target = mode === 'sop' ? 1 : 0;

  const shown: { imp: Implicant; color: string; dashed: boolean; essential: boolean }[] = [];
  if (step === 1) res.primes.forEach((p, i) => shown.push({ imp: p, color: COLORS[i % COLORS.length], dashed: true, essential: false }));
  if (step === 2)
    res.primes.forEach((p, i) => {
      const ess = res.essential.includes(p);
      shown.push({ imp: p, color: ess ? COLORS[i % COLORS.length] : '#94a3b8', dashed: !ess, essential: ess });
    });
  if (step === 3) res.solution.forEach((p, i) => shown.push({ imp: p, color: COLORS[i % COLORS.length], dashed: false, essential: res.essential.includes(p) }));

  const term = (p: Implicant) => (mode === 'sop' ? termSOP(p, vars) : termPOS(p, vars));
  const CELL = 58;

  return (
    <div className="lab kmap-lab">
      <div className="lab-title">🗺️ {title ?? 'Karnaugh Haritası (K-map) Çözücü'}</div>
      <div className="lab-controls">
        {!lockN && (
          <label>
            Değişken sayısı
            <div className="seg">
              {([2, 3, 4] as const).map((k) => (
                <button key={k} className={k === n ? 'active' : ''} onClick={() => changeN(k)}>
                  {k}
                </button>
              ))}
            </div>
          </label>
        )}
        <label>
          Gruplama
          <div className="seg">
            <button className={mode === 'sop' ? 'active' : ''} onClick={() => setMode('sop')}>
              1'ler → SOP
            </button>
            <button className={mode === 'pos' ? 'active' : ''} onClick={() => setMode('pos')}>
              0'lar → POS
            </button>
          </div>
        </label>
        <label>
          <span>&nbsp;</span>
          <button className="btn btn-ghost small" onClick={() => setShowIdx(!showIdx)}>
            m numaraları: {showIdx ? 'açık' : 'kapalı'}
          </button>
        </label>
      </div>

      <div className="kmap-wrap">
        <div className="kmap" style={{ gridTemplateColumns: `${CELL}px repeat(${cols.length}, ${CELL}px)` }}>
          <div className="kmap-corner">
            <span className="kc-row">{rowLabel}</span>
            <span className="kc-col">{colLabel}</span>
          </div>
          {cols.map((c) => (
            <div key={c} className="kmap-h">
              {c.toString(2).padStart(n - rv, '0')}
            </div>
          ))}
          {rows.map((r, ri) => (
            <div key={r} style={{ display: 'contents' }}>
              <div className="kmap-h">{r.toString(2).padStart(rv, '0')}</div>
              {cols.map((_, ci) => {
                const m = cellIndex(n, ri, ci);
                const v = cells[m];
                return (
                  <button key={m} className={`kmap-cell v${v} ${v === target ? 'target' : ''}`} onClick={() => click(m)} aria-label={`m${m} = ${v === 2 ? 'X' : v}`}>
                    {showIdx && <span className="kmap-m">m{m}</span>}
                    <span className="kmap-v">{v === 2 ? 'X' : v === 1 ? '1' : mode === 'pos' ? '0' : ''}</span>
                  </button>
                );
              })}
            </div>
          ))}
          <div className="kmap-overlay" style={{ left: CELL, top: 30, width: cols.length * CELL, height: rows.length * CELL }}>
            {shown.map((s, i) =>
              rectsFor(s.imp, n).map((rc, j) => {
                const inset = 4 + (i % 4) * 3;
                return (
                  <div
                    key={`${i}-${j}`}
                    className="kgroup"
                    style={{
                      left: rc.c0 * CELL + (rc.openLeft ? -2 : inset),
                      top: rc.r0 * CELL + (rc.openTop ? -2 : inset),
                      width: (rc.c1 - rc.c0 + 1) * CELL - (rc.openLeft ? -2 : inset) - (rc.openRight ? -2 : inset),
                      height: (rc.r1 - rc.r0 + 1) * CELL - (rc.openTop ? -2 : inset) - (rc.openBottom ? -2 : inset),
                      borderColor: s.color,
                      background: s.color + '1f',
                      borderStyle: s.dashed ? 'dashed' : 'solid',
                      borderTopWidth: rc.openTop ? 0 : undefined,
                      borderBottomWidth: rc.openBottom ? 0 : undefined,
                      borderLeftWidth: rc.openLeft ? 0 : undefined,
                      borderRightWidth: rc.openRight ? 0 : undefined,
                    }}
                  />
                );
              }),
            )}
          </div>
        </div>

        <div className="kmap-side">
          <div className="seg vertical-small">
            {['Harita', 'Tüm asal implikantlar', 'Esas olanlar', 'Sonuç'].map((l, i) => (
              <button key={i} className={step === i ? 'active' : ''} onClick={() => setStep(i)}>
                {i}. {l}
              </button>
            ))}
          </div>
          <div className="step-explain small">
            {step === 0 && <>Hücrelere tıkla: 0 → 1 → {allowDc ? 'X (don\'t care) → ' : ''}0. Komşu hücreler yalnızca 1 bit farklıdır (Gray kodu sırası!).</>}
            {step === 1 && (
              <>
                <b>Prime implicant</b> (asal implikant): genişletilemeyen en büyük gruplar. {res.primes.length} tane bulundu.
              </>
            )}
            {step === 2 && (
              <>
                <b>Essential prime implicant</b>: bir {mode === 'sop' ? '1' : '0'}'i <i>yalnızca kendisi</i> kapsayan asal implikant. Bunlar çözümde mutlaka bulunur. (renkli olanlar)
              </>
            )}
            {step === 3 && (
              <>
                Esas implikantlar + kalan {mode === 'sop' ? "1'leri" : "0'ları"} en az terimle kapsayan seçim.
                {res.alternatives > 1 && <> (Eşit derecede sade <b>{res.alternatives}</b> farklı çözüm var; biri gösteriliyor.)</>}
              </>
            )}
          </div>
          {step > 0 && (
            <ul className="term-list">
              {(step === 3 ? res.solution : res.primes).map((p, i) => {
                const idx = step === 3 ? i : res.primes.indexOf(p);
                const ess = res.essential.includes(p);
                return (
                  <li key={i}>
                    <span className="chip" style={{ background: step === 2 && !ess ? '#94a3b8' : COLORS[idx % COLORS.length] }} />
                    <span className="mono">{term(p)}</span>
                    <span className="muted small">
                      {' '}
                      ← m{p.covers.join(', m')}
                      {ess && ' ★ esas'}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="kmap-result">
        <div>
          <span className="muted">F({vars.join(', ')}) = </span>
          <span className="mono">
            Σm({ones.join(', ')}){dcs.length > 0 && <> + d({dcs.join(', ')})</>}
          </span>
        </div>
        {mode === 'pos' && (
          <div className="small">
            0'ları gruplayınca önce <span className="mono">F' = {minimalSOP(vars, zeros, dcs).expr}</span> bulunur; DeMorgan ile tümleyince ↓
          </div>
        )}
        <div className="big-result">
          F = <span className="mono">{res.expr}</span>
          <span className="muted small"> ({countLiterals(parse(res.expr))} literal)</span>
        </div>
      </div>

      <details className="kmap-input">
        <summary>Fonksiyonu liste veya ifade ile gir</summary>
        <div className="lab-controls">
          <label className="grow">
            1 olan mintermler
            <input className="q-input mono" value={listOnes} onChange={(e) => setListOnes(e.target.value)} placeholder="0, 2, 5, 7" />
          </label>
          {allowDc && (
            <label className="grow">
              Don't care (d)
              <input className="q-input mono" value={listDc} onChange={(e) => setListDc(e.target.value)} placeholder="1, 3" />
            </label>
          )}
          <label>
            <span>&nbsp;</span>
            <button className="btn" onClick={applyLists}>Uygula</button>
          </label>
        </div>
        <div className="lab-controls">
          <label className="grow">
            veya ifade ({vars.join(', ')})
            <input className="q-input mono" value={exprIn} onChange={(e) => setExprIn(e.target.value)} placeholder="A'C + A'B + AB'C + BC" />
          </label>
          <label>
            <span>&nbsp;</span>
            <button className="btn" onClick={applyExpr}>Haritaya yerleştir</button>
          </label>
        </div>
        {inErr && <div className="lab-err">{inErr}</div>}
        <button className="btn btn-ghost small" onClick={() => setCells(init(n, [], []))}>Haritayı temizle</button>
      </details>
    </div>
  );
}

// ------------------------------------------------------------------
/** Rastgele K-map alıştırması */
export function KMapPractice({ n: n0 = 4 }: { n?: 3 | 4 }) {
  const [n, setN] = useState<3 | 4>(n0);
  const [withDc, setWithDc] = useState(false);
  const [mode, setMode] = useState<'sop' | 'pos'>('sop');
  const make = (nn: number, dc: boolean) => {
    const N = 1 << nn;
    for (;;) {
      const ones: number[] = [], dcs: number[] = [];
      for (let m = 0; m < N; m++) {
        const r = Math.random();
        if (r < 0.42) ones.push(m);
        else if (dc && r < 0.55) dcs.push(m);
      }
      if (ones.length >= 2 && ones.length <= N - 2) {
        const sol = minimalSOP(DEFAULT_VARS[nn], ones, dcs);
        if (sol.solution.length >= 2) return { ones, dcs };
      }
    }
  };
  const [prob, setProb] = useState(() => make(n0, false));
  const [ans, setAns] = useState('');
  const [fb, setFb] = useState<{ ok: boolean | 'partial'; msg: string } | null>(null);
  const [reveal, setReveal] = useState(false);
  const vars = DEFAULT_VARS[n];
  const sol = mode === 'sop' ? minimalSOP(vars, prob.ones, prob.dcs) : minimalPOS(vars, prob.ones, prob.dcs);
  const newProb = (nn = n, dc = withDc) => {
    setProb(make(nn, dc));
    setAns('');
    setFb(null);
    setReveal(false);
  };
  const check = () => {
    try {
      const ast = parse(ans);
      const tt = truthTable(ast, vars);
      const wrong = tt.flatMap((v, m) => (prob.dcs.includes(m) ? [] : v !== (prob.ones.includes(m) ? 1 : 0) ? [m] : []));
      if (wrong.length) return setFb({ ok: false, msg: `Fonksiyon eşleşmiyor (yanlış mintermler: ${wrong.join(', ')}).` });
      const L = countLiterals(ast), best = countLiterals(parse(sol.expr));
      if (L > best) return setFb({ ok: 'partial', msg: `Fonksiyon doğru, ama daha sade yazılabilir: ${L} literal kullandınız, en az ${best} mümkün.` });
      setFb({ ok: true, msg: 'Mükemmel! En sade ifadeyi buldunuz.' });
    } catch (e) {
      setFb({ ok: false, msg: 'Yazım hatası: ' + (e as Error).message });
    }
  };
  return (
    <div className="lab">
      <div className="lab-title">🏋️ K-map Antrenmanı (sonsuz soru)</div>
      <div className="lab-controls">
        <label>
          Değişken
          <div className="seg">
            {([3, 4] as const).map((k) => (
              <button key={k} className={k === n ? 'active' : ''} onClick={() => { setN(k); newProb(k); }}>
                {k}
              </button>
            ))}
          </div>
        </label>
        <label>
          Don't care
          <div className="seg">
            <button className={!withDc ? 'active' : ''} onClick={() => { setWithDc(false); newProb(n, false); }}>yok</button>
            <button className={withDc ? 'active' : ''} onClick={() => { setWithDc(true); newProb(n, true); }}>var</button>
          </div>
        </label>
        <label>
          İstenen
          <div className="seg">
            <button className={mode === 'sop' ? 'active' : ''} onClick={() => { setMode('sop'); setFb(null); }}>SOP</button>
            <button className={mode === 'pos' ? 'active' : ''} onClick={() => { setMode('pos'); setFb(null); }}>POS</button>
          </div>
        </label>
      </div>
      <div className="practice-q">
        Simplify into <b>{mode === 'sop' ? 'sum-of-products' : 'product-of-sums'}</b> form:
        <div className="mono big">
          F({vars.join(', ')}) = {sigma(prob.ones)}
          {prob.dcs.length > 0 && <> + d({prob.dcs.join(', ')})</>}
        </div>
      </div>
      <div className="q-input-row">
        <input className="q-input mono" value={ans} onChange={(e) => { setAns(e.target.value); setFb(null); }} onKeyDown={(e) => e.key === 'Enter' && ans && check()} placeholder={mode === 'sop' ? "örn: w'z + xy'" : "örn: (w + x')(y' + z)"} />
        <button className="btn" disabled={!ans} onClick={check}>Kontrol</button>
      </div>
      {fb && <div className={fb.ok === true ? 'ok-line' : fb.ok === 'partial' ? 'warn-line' : 'lab-err'}>{fb.msg}</div>}
      <div className="q-input-row">
        <button className="btn btn-ghost" onClick={() => setReveal(!reveal)}>{reveal ? 'Çözümü gizle' : 'Çözümü haritada göster'}</button>
        <button className="btn btn-ghost" onClick={() => newProb()}>Yeni soru →</button>
      </div>
      {reveal && <KMap key={`${prob.ones.join()}-${prob.dcs.join()}-${mode}`} n={n} ones={prob.ones} dcs={prob.dcs} mode={mode} lockN title="Çözüm" />}
    </div>
  );
}
