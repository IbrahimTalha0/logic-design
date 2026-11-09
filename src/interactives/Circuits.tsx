import { useMemo, useState } from 'react';
import { Ast, parse, sortedVars } from '../lib/boolean';
import { GateShape, GateType, inputYs, outX } from '../components/Gate';

type Lit = { v: string; neg: boolean };
type Form = { kind: 'sop' | 'pos'; terms: Lit[][] };

function lit(a: Ast): Lit | null {
  if (a.t === 'var') return { v: a.n, neg: false };
  if (a.t === 'not' && a.a.t === 'var') return { v: a.a.n, neg: true };
  return null;
}

function toForm(src: string): Form {
  const ast = parse(src);
  const asTerm = (a: Ast, inner: 'and' | 'or'): Lit[] | null => {
    const l = lit(a);
    if (l) return [l];
    if (a.t === inner) {
      const ls = a.args.map(lit);
      return ls.every(Boolean) ? (ls as Lit[]) : null;
    }
    return null;
  };
  if (ast.t === 'or') {
    const ts = ast.args.map((a) => asTerm(a, 'and'));
    if (ts.every(Boolean)) return { kind: 'sop', terms: ts as Lit[][] };
  }
  if (ast.t === 'and') {
    const ts = ast.args.map((a) => asTerm(a, 'or'));
    if (ts.every(Boolean) && ts.some((t) => t!.length > 1)) return { kind: 'pos', terms: ts as Lit[][] };
    const single = asTerm(ast, 'and');
    if (single) return { kind: 'sop', terms: [single] };
  }
  const l = lit(ast);
  if (l) return { kind: 'sop', terms: [[l]] };
  throw new Error('İfade iki seviyeli olmalı: çarpımların toplamı (xy + z) veya toplamların çarpımı ((x+y)(z+w)).');
}

const litStr = (l: Lit, flip = false) => l.v + (l.neg !== flip ? "'" : '');

export function TwoLevelCircuit({ initial = "AB + CD'" }: { initial?: string }) {
  const [src, setSrc] = useState(initial);
  const [view, setView] = useState(0);
  const [env, setEnv] = useState<Record<string, number>>({});

  const parsed = useMemo(() => {
    try {
      const f = toForm(src);
      const vars = sortedVars(parse(src));
      return { f, vars };
    } catch (e) {
      return { err: (e as Error).message };
    }
  }, [src]);

  if ('err' in parsed) {
    return (
      <div className="lab">
        <div className="lab-title">🔌 İki Seviyeli Devre Dönüştürücü</div>
        <input className="q-input mono" value={src} onChange={(e) => setSrc(e.target.value)} />
        <div className="lab-err">{parsed.err}</div>
      </div>
    );
  }
  const { f, vars } = parsed;
  const sop = f.kind === 'sop';
  const views = sop ? ['AND–OR', 'Ara adım (çift tersleme)', 'NAND–NAND'] : ['OR–AND', 'Ara adım (çift tersleme)', 'NOR–NOR'];
  const v = Math.min(view, 2);
  const g1: GateType = sop ? (v === 0 ? 'AND' : 'NAND') : v === 0 ? 'OR' : 'NOR';
  const g2: GateType = sop ? (v === 2 ? 'NAND' : 'OR') : v === 2 ? 'NOR' : 'AND';
  const g2InBubbles = v === 1; // invert-OR / invert-AND sembolü
  const val = (l: Lit) => ((env[l.v] ?? 0) ^ (l.neg ? 1 : 0));
  const termVal = (t: Lit[]) => (sop ? (t.every((l) => val(l)) ? 1 : 0) : t.some((l) => val(l)) ? 1 : 0);
  const outVal = sop ? (f.terms.some((t) => termVal(t)) ? 1 : 0) : f.terms.every((t) => termVal(t)) ? 1 : 0;
  const color = (b: number) => (b ? 'var(--on)' : 'var(--off)');

  const ROW = 64, X1 = 70, X2 = 260;
  const H = Math.max(f.terms.length * ROW, 80);
  const g2y = H / 2 - 20;
  const g2ins = inputYs(f.terms.length).map((y) => g2y + y);
  const els: JSX.Element[] = [];
  f.terms.forEach((t, i) => {
    const yTop = i * ROW + (ROW - 40) / 2;
    const yc = yTop + 20;
    const tv = termVal(t);
    const firstOut = v === 0 ? tv : 1 - tv; // NAND/NOR çıkışı terslenmiş
    const xm = X1 + outX(g1) + 18 + i * 10;
    if (t.length === 1) {
      // tek literal doğrudan ikinci seviyeye (NAND/NOR'da tümlenmeli!)
      const l = t[0];
      const flip = v !== 0;
      const lv = val(l);
      const wireV = flip ? 1 - lv : lv;
      els.push(
        <g key={i}>
          <text x={X1 - 8} y={yc + 4} textAnchor="end" className={`svg-label ${flip ? 'flipped' : ''}`}>
            {litStr(l, flip)}
          </text>
          <polyline points={`${X1 - 4},${yc} ${xm},${yc} ${xm},${g2ins[i]} ${X2 + (g2 === 'OR' || g2 === 'NOR' ? 6 : 0)},${g2ins[i]}`} fill="none" stroke={color(wireV)} strokeWidth={2.5} />
          {flip && (
            <text x={X1 + 10} y={yc - 6} className="svg-tiny warn-text">
              tek literal → tümlendi!
            </text>
          )}
        </g>,
      );
      return;
    }
    const ys = inputYs(t.length).map((y) => yTop + y);
    els.push(
      <g key={i}>
        {t.map((l, k) => (
          <g key={k}>
            <text x={X1 - 26} y={ys[k] + 4} textAnchor="end" className="svg-label">
              {litStr(l)}
            </text>
            <line x1={X1 - 22} y1={ys[k]} x2={X1 + (g1 === 'OR' || g1 === 'NOR' ? 6 : 1)} y2={ys[k]} stroke={color(val(l))} strokeWidth={2.5} />
          </g>
        ))}
        <GateShape type={g1} x={X1} y={yTop} active={firstOut === 1} />
        <polyline points={`${X1 + outX(g1)},${yc} ${xm},${yc} ${xm},${g2ins[i]} ${X2 + (g2 === 'OR' || g2 === 'NOR' ? 6 : 0) - (g2InBubbles ? 8 : 0)},${g2ins[i]}`} fill="none" stroke={color(firstOut)} strokeWidth={2.5} />
      </g>,
    );
  });

  const ox = X2 + outX(g2);
  return (
    <div className="lab">
      <div className="lab-title">🔌 İki Seviyeli Devre Dönüştürücü</div>
      <div className="lab-controls">
        <label className="grow">
          İfade (SOP veya POS)
          <input className="q-input mono" value={src} onChange={(e) => setSrc(e.target.value)} spellCheck={false} />
        </label>
      </div>
      <div className="seg wrap">
        {views.map((l, i) => (
          <button key={i} className={v === i ? 'active' : ''} onClick={() => setView(i)}>
            {l}
          </button>
        ))}
      </div>
      <div className="gate-inputs row">
        {vars.map((x) => (
          <button key={x} className={`toggle ${env[x] ? 'on' : ''}`} onClick={() => setEnv({ ...env, [x]: env[x] ? 0 : 1 })}>
            {x} = {env[x] ?? 0}
          </button>
        ))}
      </div>
      <svg viewBox={`-10 -10 ${ox + 70} ${H + 20}`} className="circuit-svg" role="img" aria-label="devre şeması">
        {els}
        <GateShape type={g2} x={X2} y={g2y} active={outVal === 1} />
        {g2InBubbles &&
          g2ins.map((y, i) => <circle key={i} cx={X2 + (g2 === 'OR' ? 6 : 0) - 4} cy={y} r={4} fill="var(--gate-fill)" stroke="var(--ink)" strokeWidth={2} />)}
        <line x1={ox} y1={g2y + 20} x2={ox + 26} y2={g2y + 20} stroke={color(outVal)} strokeWidth={2.5} />
        <text x={ox + 30} y={g2y + 25} className="svg-label">
          F = {outVal}
        </text>
      </svg>
      <div className="step-explain small">
        {v === 0 && (sop ? 'Standart iki seviyeli AND–OR devresi (SOP).' : 'Standart iki seviyeli OR–AND devresi (POS).')}
        {v === 1 && (
          <>
            Her bağlantıya <b>iki tane tersleyici (bubble)</b> eklendi: biri {sop ? 'AND' : 'OR'} çıkışına, biri {sop ? 'OR' : 'AND'} girişine. İki tersleme birbirini götürür (x'' = x) → fonksiyon değişmez.
            {sop ? " Girişleri terslenmiş OR (invert-OR) aslında bir NAND'dir: x' + y' = (xy)'." : " Girişleri terslenmiş AND (invert-AND) aslında bir NOR'dur: x'y' = (x + y)'."}
          </>
        )}
        {v === 2 &&
          (sop
            ? 'Sonuç: aynı yapıda sadece NAND kapıları. Kural: tek literal içeren terimler 2. seviyeye TÜMLENEREK girer.'
            : 'Sonuç: aynı yapıda sadece NOR kapıları. Kural: tek literal içeren terimler 2. seviyeye TÜMLENEREK girer.')}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
/** NAND ve NOR'un evrensel (universal) olduğunu gösteren mini devreler */
export function UniversalGates({ kind = 'NAND' }: { kind?: 'NAND' | 'NOR' }) {
  const G: GateType = kind;
  const W = 200, H = 70;
  const lbl = (x: number, y: number, t: string) => (
    <text x={x} y={y} className="svg-label small">
      {t}
    </text>
  );
  const nand = kind === 'NAND';
  const cards = [
    {
      title: 'NOT (inverter)',
      expr: nand ? "(x·x)' = x'" : "(x + x)' = x'",
      svg: (
        <svg viewBox={`0 0 ${W} ${H}`} className="mini-circ">
          {lbl(4, 40, 'x')}
          <line x1={16} y1={36} x2={40} y2={36} stroke="var(--ink)" strokeWidth={2} />
          <line x1={40} y1={26} x2={40} y2={46} stroke="var(--ink)" strokeWidth={2} />
          <line x1={40} y1={26} x2={62} y2={26} stroke="var(--ink)" strokeWidth={2} />
          <line x1={40} y1={46} x2={62} y2={46} stroke="var(--ink)" strokeWidth={2} />
          <circle cx={40} cy={36} r={3} fill="var(--ink)" />
          <GateShape type={G} x={60} y={16} />
          <line x1={60 + outX(G)} y1={36} x2={150} y2={36} stroke="var(--ink)" strokeWidth={2} />
          {lbl(154, 40, "x'")}
        </svg>
      ),
    },
    {
      title: nand ? 'AND' : 'OR',
      expr: nand ? "((xy)')' = xy" : "((x+y)')' = x + y",
      svg: (
        <svg viewBox={`0 0 ${W + 30} ${H}`} className="mini-circ">
          {lbl(4, 30, 'x')}
          {lbl(4, 50, 'y')}
          <line x1={16} y1={26} x2={36} y2={26} stroke="var(--ink)" strokeWidth={2} />
          <line x1={16} y1={46} x2={36} y2={46} stroke="var(--ink)" strokeWidth={2} />
          <GateShape type={G} x={34} y={16} />
          <line x1={34 + outX(G)} y1={36} x2={110} y2={36} stroke="var(--ink)" strokeWidth={2} />
          <line x1={110} y1={26} x2={110} y2={46} stroke="var(--ink)" strokeWidth={2} />
          <line x1={110} y1={26} x2={122} y2={26} stroke="var(--ink)" strokeWidth={2} />
          <line x1={110} y1={46} x2={122} y2={46} stroke="var(--ink)" strokeWidth={2} />
          <GateShape type={G} x={120} y={16} />
          <line x1={120 + outX(G)} y1={36} x2={W + 10} y2={36} stroke="var(--ink)" strokeWidth={2} />
          {lbl(W + 12, 40, nand ? 'xy' : 'x+y')}
        </svg>
      ),
    },
    {
      title: nand ? 'OR' : 'AND',
      expr: nand ? "(x'·y')' = x + y" : "(x' + y')' = xy",
      svg: (
        <svg viewBox={`0 0 ${W + 50} ${H + 30}`} className="mini-circ">
          {[0, 1].map((i) => (
            <g key={i}>
              {lbl(4, 24 + i * 50, i ? 'y' : 'x')}
              <line x1={16} y1={20 + i * 50} x2={30} y2={20 + i * 50} stroke="var(--ink)" strokeWidth={2} />
              <line x1={30} y1={12 + i * 50} x2={30} y2={28 + i * 50} stroke="var(--ink)" strokeWidth={2} />
              <line x1={30} y1={12 + i * 50} x2={42} y2={12 + i * 50} stroke="var(--ink)" strokeWidth={2} />
              <line x1={30} y1={28 + i * 50} x2={42} y2={28 + i * 50} stroke="var(--ink)" strokeWidth={2} />
              <g transform={`translate(40, ${i * 50}) scale(0.8)`}>
                <GateShape type={G} y={0} />
              </g>
              <polyline points={`${40 + outX(G) * 0.8},${16 + i * 50} 120,${16 + i * 50} 120,${i ? 60 : 40} 138,${i ? 60 : 40}`} fill="none" stroke="var(--ink)" strokeWidth={2} />
            </g>
          ))}
          <GateShape type={G} x={136} y={30} />
          <line x1={136 + outX(G)} y1={50} x2={W + 26} y2={50} stroke="var(--ink)" strokeWidth={2} />
          {lbl(W + 28, 54, nand ? 'x+y' : 'xy')}
        </svg>
      ),
    },
  ];
  return (
    <div className="universal">
      {cards.map((c) => (
        <div key={c.title} className="uni-card">
          <div className="uni-title">
            {kind} ile {c.title}
          </div>
          {c.svg}
          <div className="mono small">{c.expr}</div>
        </div>
      ))}
    </div>
  );
}
