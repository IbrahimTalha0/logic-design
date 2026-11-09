// Kitaptaki standart (ANSI) kapı sembollerinin SVG çizimleri.
export type GateType = 'AND' | 'OR' | 'NOT' | 'NAND' | 'NOR' | 'XOR' | 'XNOR' | 'BUF';

const BODY_H = 40;

export function outX(t: GateType): number {
  return { AND: 50, NAND: 58, OR: 56, NOR: 64, XOR: 62, XNOR: 70, NOT: 48, BUF: 40 }[t];
}
/** Girişin gövdeye değdiği x (OR ailesinde eğri olduğu için içeri girer) */
export function inX(t: GateType, y: number): number {
  if (t === 'OR' || t === 'NOR') return 0 + curveX(y);
  if (t === 'XOR' || t === 'XNOR') return 0 + curveX(y); // dış eğriye kadar
  return 0;
}
function curveX(y: number) {
  // Q15,20 eğrisi yaklaşık: x = 15 * (1 - ((y-20)/20)^2) * 0.5*2 ≈
  const u = (y - 20) / 20;
  return 7.5 * (1 - u * u);
}

export function inputYs(n: number, h = BODY_H): number[] {
  if (n === 1) return [h / 2];
  const pad = n === 2 ? 10 : 6;
  return Array.from({ length: n }, (_, i) => pad + (i * (h - 2 * pad)) / (n - 1));
}

export function GateShape({ type, x = 0, y = 0, active, stroke = 'var(--ink)', fill = 'var(--gate-fill)' }: { type: GateType; x?: number; y?: number; active?: boolean; stroke?: string; fill?: string }) {
  const sw = 2;
  const f = active ? 'var(--gate-on)' : fill;
  const bubble = (cx: number) => <circle cx={cx} cy={20} r={4} fill={f} stroke={stroke} strokeWidth={sw} />;
  let body: JSX.Element;
  switch (type) {
    case 'AND':
    case 'NAND':
      body = (
        <>
          <path d="M0,0 H30 A20,20 0 0 1 30,40 H0 Z" fill={f} stroke={stroke} strokeWidth={sw} />
          {type === 'NAND' && bubble(54)}
        </>
      );
      break;
    case 'OR':
    case 'NOR':
      body = (
        <>
          <path d="M0,0 Q15,20 0,40 Q38,40 56,20 Q38,0 0,0 Z" fill={f} stroke={stroke} strokeWidth={sw} />
          {type === 'NOR' && bubble(60)}
        </>
      );
      break;
    case 'XOR':
    case 'XNOR':
      body = (
        <>
          <path d="M6,0 Q21,20 6,40 Q44,40 62,20 Q44,0 6,0 Z" fill={f} stroke={stroke} strokeWidth={sw} />
          <path d="M0,0 Q15,20 0,40" fill="none" stroke={stroke} strokeWidth={sw} />
          {type === 'XNOR' && bubble(66)}
        </>
      );
      break;
    case 'NOT':
    case 'BUF':
      body = (
        <>
          <path d="M0,2 L40,20 L0,38 Z" fill={f} stroke={stroke} strokeWidth={sw} />
          {type === 'NOT' && bubble(44)}
        </>
      );
      break;
  }
  return <g transform={`translate(${x},${y})`}>{body}</g>;
}

/** Tek başına küçük kapı simgesi */
export function GateIcon({ type, width = 110, inputs, labels, out, values, outValue }: { type: GateType; width?: number; inputs?: number; labels?: string[]; out?: string; values?: number[]; outValue?: number }) {
  const n = inputs ?? (type === 'NOT' || type === 'BUF' ? 1 : 2);
  const ys = inputYs(n);
  const ox = outX(type);
  const wire = (v?: number) => (v === undefined ? 'var(--ink)' : v ? 'var(--on)' : 'var(--off)');
  return (
    <svg viewBox={`-34 -8 ${ox + 70} 56`} width={width} className="gate-svg" role="img" aria-label={`${type} kapısı`}>
      {ys.map((yy, i) => (
        <g key={i}>
          <line x1={-22} y1={yy} x2={inX(type, yy) + 1} y2={yy} stroke={wire(values?.[i])} strokeWidth={values ? 3 : 2} />
          {labels?.[i] && (
            <text x={-26} y={yy + 4} textAnchor="end" className="svg-label">
              {labels[i]}
            </text>
          )}
        </g>
      ))}
      <GateShape type={type} active={outValue === 1} />
      <line x1={ox} y1={20} x2={ox + 22} y2={20} stroke={wire(outValue)} strokeWidth={outValue !== undefined ? 3 : 2} />
      {out && (
        <text x={ox + 26} y={24} className="svg-label">
          {out}
        </text>
      )}
    </svg>
  );
}
