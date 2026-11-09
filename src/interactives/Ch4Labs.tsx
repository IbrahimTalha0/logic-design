// Bölüm 4 (Kombinasyonel Lojik) etkileşimli laboratuvarları
import { ReactNode, useState } from 'react';
import { GateShape, GateType, inputYs } from '../components/Gate';
import { KMap } from './KMap';

const color = (b: number) => (b ? 'var(--on)' : 'var(--off)');

function Toggles({ names, env, set }: { names: string[]; env: Record<string, number>; set: (e: Record<string, number>) => void }) {
  return (
    <div className="gate-inputs row">
      {names.map((x) => (
        <button key={x} className={`toggle ${env[x] ? 'on' : ''}`} onClick={() => set({ ...env, [x]: env[x] ? 0 : 1 })}>
          {x} = {env[x] ?? 0}
        </button>
      ))}
    </div>
  );
}

/** Tek kapı: kendi giriş etiketleriyle (kitaptaki gibi) */
function G({ type, x, y, ins, labels, out, active }: { type: GateType; x: number; y: number; ins: number[]; labels?: string[]; out: number; active?: boolean }) {
  const ys = inputYs(ins.length);
  const off = type === 'OR' || type === 'NOR' ? 6 : 0;
  return (
    <g>
      {labels &&
        ys.map((yy, i) => (
          <g key={i}>
            <text x={x - 26} y={y + yy + 4} textAnchor="end" className="svg-label">
              {labels[i]}
            </text>
            <line x1={x - 22} y1={y + yy} x2={x + off + 1} y2={y + yy} stroke={color(ins[i])} strokeWidth={2.5} />
          </g>
        ))}
      <GateShape type={type} x={x} y={y} active={active ?? out === 1} />
    </g>
  );
}

function Wire({ pts, v }: { pts: [number, number][]; v: number }) {
  return <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={color(v)} strokeWidth={2.5} />;
}

function Tag({ x, y, children, hi }: { x: number; y: number; children: ReactNode; hi?: boolean }) {
  return (
    <text x={x} y={y} className={`svg-tiny ${hi ? 'warn-text' : ''}`} style={{ fontWeight: 700 }}>
      {children}
    </text>
  );
}

// ------------------------------------------------------------------
/** Şekil 4.2 — adım adım analiz */
export function AnalysisLab() {
  const [env, setEnv] = useState<Record<string, number>>({ A: 0, B: 0, C: 0 });
  const [step, setStep] = useState(0);
  const A = env.A ?? 0, B = env.B ?? 0, C = env.C ?? 0;
  const ab = A & B, ac = A & C, bc = B & C;
  const T2 = A & B & C, T1 = A | B | C, F2 = ab | ac | bc, F2n = 1 - F2, T3 = F2n & T1, F1 = T3 | T2;

  const steps = [
    { title: 'Devreyi tanı', text: 'Geri besleme (feedback) yolu veya bellek elemanı yok → devre kombinasyoneldir. 3 giriş (A, B, C), 2 çıkış (F1, F2).' },
    { title: '1. Yalnız girişlere bağlı kapılar', text: 'Sadece giriş değişkenlerine bağlı kapıların çıkışlarına isim ver ve fonksiyonlarını yaz: T1 = A + B + C, T2 = ABC, F2 = AB + AC + BC.' },
    { title: '2. Önceki etiketlere bağlı kapılar', text: "Daha önce isimlendirilmiş sinyalleri kullanan kapılar: F2' (tersleyici), T3 = F2'T1, F1 = T3 + T2." },
    { title: '3. Yerine koy (substitution)', text: "F1'i yalnız A, B, C cinsinden yazana kadar yerine koy: F1 = (AB + AC + BC)'(A + B + C) + ABC = A'BC' + A'B'C + AB'C' + ABC." },
    { title: '4. Yorumla', text: 'F1 = Σ(1, 2, 4, 7) (tek sayıda 1 → A⊕B⊕C) ve F2 = Σ(3, 5, 6, 7) (en az iki 1). Bu, tam toplayıcının (full adder) toplam (S) ve elde (C) çıkışlarıdır!' },
  ];
  const show = (lvl: number) => step >= lvl;

  const rows = Array.from({ length: 8 }, (_, m) => {
    const a = (m >> 2) & 1, b = (m >> 1) & 1, c = m & 1;
    const f2 = (a & b) | (a & c) | (b & c), t1 = a | b | c, t2 = a & b & c, t3 = (1 - f2) & t1;
    return { a, b, c, f2, f2n: 1 - f2, t1, t2, t3, f1: t3 | t2 };
  });
  const cur = A * 4 + B * 2 + C;

  return (
    <div className="lab">
      <div className="lab-title">🔍 Analiz Laboratuvarı — Şekil 4.2</div>
      <div className="seg wrap">
        {steps.map((s, i) => (
          <button key={i} className={step === i ? 'active' : ''} onClick={() => setStep(i)}>
            {i}. {s.title.replace(/^\d\. /, '')}
          </button>
        ))}
      </div>
      <div className="step-explain">{steps[step].text}</div>
      <Toggles names={['A', 'B', 'C']} env={env} set={setEnv} />
      <svg viewBox="-40 -6 660 330" className="circuit-svg" role="img" aria-label="Şekil 4.2 analiz devresi">
        {/* 1. seviye */}
        <G type="AND" x={60} y={10} ins={[A, B, C]} labels={['A', 'B', 'C']} out={T2} />
        <G type="OR" x={60} y={70} ins={[A, B, C]} labels={['A', 'B', 'C']} out={T1} />
        <G type="AND" x={60} y={150} ins={[A, B]} labels={['A', 'B']} out={ab} />
        <G type="AND" x={60} y={210} ins={[A, C]} labels={['A', 'C']} out={ac} />
        <G type="AND" x={60} y={270} ins={[B, C]} labels={['B', 'C']} out={bc} />
        {/* AND'ler → F2 OR3 */}
        <Wire pts={[[110, 170], [180, 170], [180, 216], [207, 216]]} v={ab} />
        <Wire pts={[[110, 230], [208, 230]]} v={ac} />
        <Wire pts={[[110, 290], [180, 290], [180, 244], [207, 244]]} v={bc} />
        <GateShape type="OR" x={200} y={210} active={F2 === 1} />
        {/* F2 çıkışı ve dalı */}
        <Wire pts={[[256, 230], [560, 230]]} v={F2} />
        <circle cx={272} cy={230} r={3.5} fill={color(F2)} />
        <Wire pts={[[272, 230], [272, 170], [290, 170]]} v={F2} />
        <g transform="translate(290,150)">
          <GateShape type="NOT" active={F2n === 1} />
        </g>
        {/* T3 = F2' T1 */}
        <Wire pts={[[116, 90], [360, 90], [360, 110], [381, 110]]} v={T1} />
        <Wire pts={[[338, 170], [365, 170], [365, 130], [381, 130]]} v={F2n} />
        <GateShape type="AND" x={380} y={100} active={T3 === 1} />
        {/* F1 = T3 + T2 */}
        <Wire pts={[[110, 30], [487, 30]]} v={T2} />
        <Wire pts={[[430, 120], [460, 120], [460, 50], [487, 50]]} v={T3} />
        <GateShape type="OR" x={480} y={20} active={F1 === 1} />
        <Wire pts={[[536, 40], [560, 40]]} v={F1} />
        <text x={566} y={45} className="svg-label">F1 = {F1}</text>
        <text x={566} y={235} className="svg-label">F2 = {F2}</text>
        {/* etiketler */}
        {show(1) && (
          <>
            <Tag x={130} y={24} hi={step === 1}>T2 = ABC = {T2}</Tag>
            <Tag x={130} y={84} hi={step === 1}>T1 = A+B+C = {T1}</Tag>
            <Tag x={262} y={250} hi={step === 1}>F2 = AB+AC+BC</Tag>
          </>
        )}
        {show(2) && (
          <>
            <Tag x={300} y={196} hi={step === 2}>F2' = {F2n}</Tag>
            <Tag x={394} y={160} hi={step === 2}>T3 = F2'T1 = {T3}</Tag>
            <Tag x={470} y={78} hi={step === 2}>F1 = T3+T2</Tag>
          </>
        )}
      </svg>
      <div className="small muted">Tablo 4.1 — sütunlar adım ilerledikçe dolar; seçtiğin giriş satırı vurgulanır.</div>
      <div className="table-wrap">
        <table className="tbl compact tt">
          <thead>
            <tr>
              <th>A</th>
              <th>B</th>
              <th>C</th>
              {show(1) && <th>F2</th>}
              {show(2) && <th>F2'</th>}
              {show(1) && <th>T1</th>}
              {show(1) && <th>T2</th>}
              {show(2) && <th>T3</th>}
              {show(2) && <th className="out-col">F1</th>}
              {show(1) && <th className="out-col">F2</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={i === cur ? 'hl' : ''}>
                <td>{r.a}</td>
                <td>{r.b}</td>
                <td>{r.c}</td>
                {show(1) && <td>{r.f2}</td>}
                {show(2) && <td>{r.f2n}</td>}
                {show(1) && <td>{r.t1}</td>}
                {show(1) && <td>{r.t2}</td>}
                {show(2) && <td>{r.t3}</td>}
                {show(2) && <td className="out-col"><b>{r.f1}</b></td>}
                {show(1) && <td className="out-col"><b>{r.f2}</b></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
const EX3 = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const bits4 = (n: number) => n.toString(2).padStart(4, '0');
const OUTS: { n: 'w' | 'x' | 'y' | 'z'; bit: number; expr: string }[] = [
  { n: 'w', bit: 3, expr: 'A + BC + BD' },
  { n: 'x', bit: 2, expr: "B'C + B'D + BC'D'" },
  { n: 'y', bit: 1, expr: "CD + C'D'" },
  { n: 'z', bit: 0, expr: "D'" },
];

/** BCD → Excess-3 kod dönüştürücü: tablo + 4 harita + canlı devre denklemleri */
export function CodeConverterLab() {
  const [d, setD] = useState(5);
  const [map, setMap] = useState<'w' | 'x' | 'y' | 'z'>('z');
  const A = (d >> 3) & 1, B = (d >> 2) & 1, C = (d >> 1) & 1, D = d & 1;
  const valid = d <= 9;
  const w = A | (B & C) | (B & D);
  const x = ((1 - B) & C) | ((1 - B) & D) | (B & (1 - C) & (1 - D));
  const y = (C & D) | ((1 - C) & (1 - D));
  const z = 1 - D;
  const out = [w, x, y, z].join('');
  const onesOf = (bit: number) => EX3.map((v, i) => ((v >> bit) & 1 ? i : -1)).filter((i) => i >= 0);
  const sel = OUTS.find((o) => o.n === map)!;
  return (
    <div className="lab">
      <div className="lab-title">🔁 BCD → Excess-3 Kod Dönüştürücü (Tablo 4.2, Şekil 4.3)</div>
      <div className="lab-controls">
        <label>
          BCD girişi (A B C D)
          <div className="gate-inputs row">
            {['A', 'B', 'C', 'D'].map((nm, i) => {
              const bit = 3 - i;
              const v = (d >> bit) & 1;
              return (
                <button key={nm} className={`toggle ${v ? 'on' : ''}`} onClick={() => setD(d ^ (1 << bit))}>
                  {nm} = {v}
                </button>
              );
            })}
          </div>
        </label>
      </div>
      {valid ? (
        <div className="conv-row">
          <div>
            <div className="small muted">Ondalık rakam</div>
            <div className="big-num">{d}</div>
          </div>
          <div className="arrow">→</div>
          <div>
            <div className="small muted">BCD</div>
            <div className="big-num mono">{bits4(d)}</div>
          </div>
          <div className="arrow">→</div>
          <div>
            <div className="small muted">Excess-3 (w x y z)</div>
            <div className="big-num mono">{out}</div>
          </div>
          <div className="small">
            = {parseInt(out, 2)} = {d} + 3 ✓
          </div>
        </div>
      ) : (
        <div className="lab-err">
          {bits4(d)} = {d} geçerli bir BCD rakamı değil. Bu 6 kombinasyon (10–15) <b>hiç gelmez</b> → haritada <b>don't-care (X)</b> olarak kullanıldı. Devrenin bu girişte
          verdiği çıkış ({out}) önemsizdir.
        </div>
      )}
      <div className="seg wrap" style={{ marginTop: 10 }}>
        {OUTS.map((o) => (
          <button key={o.n} className={map === o.n ? 'active' : ''} onClick={() => setMap(o.n)}>
            {o.n} haritası
          </button>
        ))}
      </div>
      <div className="small">
        Sadeleşmiş: <b className="mono">{sel.n} = {sel.expr}</b> · Mevcut girişte {sel.n} = <b>{[w, x, y, z][3 - sel.bit]}</b>
      </div>
      <KMap key={map} n={4} vars={['A', 'B', 'C', 'D']} ones={onesOf(sel.bit)} dcs={[10, 11, 12, 13, 14, 15]} lockN title={`${sel.n} çıkışı — Σ(${onesOf(sel.bit).join(', ')}) + d(10–15)`} />
    </div>
  );
}

// ------------------------------------------------------------------
/** Yarım ve tam toplayıcı oyun alanı */
export function AdderLab() {
  const [full, setFull] = useState(false);
  const [env, setEnv] = useState<Record<string, number>>({ x: 1, y: 1, z: 0 });
  const x = env.x ?? 0, y = env.y ?? 0, z = full ? env.z ?? 0 : 0;
  const sum = x + y + z;
  const S = sum & 1, Cc = sum >> 1;
  const names = full ? ['x', 'y', 'z'] : ['x', 'y'];
  const n = names.length;
  const rows = Array.from({ length: 1 << n }, (_, m) => {
    const v = names.map((_, i) => (m >> (n - 1 - i)) & 1);
    const s = v.reduce((a, b) => a + b, 0);
    return { v, C: s >> 1, S: s & 1 };
  });
  const cur = names.reduce((a, nm) => a * 2 + (env[nm] ?? 0), 0);
  return (
    <div className="lab">
      <div className="lab-title">➕ Yarım Toplayıcı / Tam Toplayıcı</div>
      <div className="seg">
        <button className={!full ? 'active' : ''} onClick={() => setFull(false)}>
          Half adder (2 bit)
        </button>
        <button className={full ? 'active' : ''} onClick={() => setFull(true)}>
          Full adder (3 bit)
        </button>
      </div>
      <Toggles names={names} env={env} set={setEnv} />
      <div className="conv-row">
        <div className="mono big-num" style={{ fontSize: '1.4rem' }}>
          {x} + {y}
          {full ? ` + ${z}` : ''} = {sum}
        </div>
        <div className="arrow">→</div>
        <div>
          <div className="small muted">C (carry) · S (sum)</div>
          <div className="big-num mono">
            {Cc}
            {S}
          </div>
        </div>
      </div>
      <div className="small">
        {full ? (
          <>
            S = x ⊕ y ⊕ z (tek sayıda 1 varsa 1) · C = xy + xz + yz (en az iki 1 varsa 1). <i>z = önceki basamaktan gelen elde.</i>
          </>
        ) : (
          <>S = x ⊕ y · C = xy</>
        )}
      </div>
      <div className="table-wrap">
        <table className="tbl compact tt">
          <thead>
            <tr>
              {names.map((nm) => (
                <th key={nm}>{nm}</th>
              ))}
              <th className="out-col">C</th>
              <th className="out-col">S</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={i === cur ? 'hl' : ''}>
                {r.v.map((b, j) => (
                  <td key={j}>{b}</td>
                ))}
                <td className="out-col"><b>{r.C}</b></td>
                <td className="out-col"><b>{r.S}</b></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
/** Kombinasyonel mi ardışıl mı? — kısa sınıflandırma oyunu */
const CS_ITEMS: { t: string; comb: boolean; why: string }[] = [
  { t: 'Çıkışı yalnızca o anki girişlere bağlı olan devre', comb: true, why: 'Tanımın kendisi: outputs depend only on the present inputs.' },
  { t: 'Bir çıkışı kendi girişlerinden birine geri bağlanan devre (feedback path)', comb: false, why: 'Geri besleme yolu → ardışıl devre.' },
  { t: 'Flip-flop / bellek elemanı içeren devre', comb: false, why: 'Bellek elemanı (storage element) → çıkış geçmiş girişlere de bağlı.' },
  { t: 'Toplayıcı (adder), kod dönüştürücü, kod çözücü (decoder)', comb: true, why: 'Standart kombinasyonel bileşenler (MSI).' },
  { t: 'Kaynak ve hedefi register olan, register\'ları da içine alan bütün devre', comb: false, why: 'Register dahil edilirse toplam devre ardışıl sayılır.' },
  { t: '2ⁿ satırlık bir doğruluk tablosu ile tamamen tanımlanabilen devre', comb: true, why: 'Kombinasyonel devre doğruluk tablosuyla (veya m tane Boole fonksiyonuyla) tanımlanır.' },
];
export function CombSeqGame() {
  const [ans, setAns] = useState<Record<number, boolean>>({});
  return (
    <div className="lab">
      <div className="lab-title">🧩 Kombinasyonel mi, ardışıl mı?</div>
      {CS_ITEMS.map((it, i) => {
        const a = ans[i];
        const answered = a !== undefined;
        return (
          <div key={i} className="cs-item">
            <div>{it.t}</div>
            <div className="q-input-row">
              <button className={`btn btn-ghost ${answered && it.comb ? 'done' : ''}`} disabled={answered} onClick={() => setAns({ ...ans, [i]: true })}>
                Combinational
              </button>
              <button className={`btn btn-ghost ${answered && !it.comb ? 'done' : ''}`} disabled={answered} onClick={() => setAns({ ...ans, [i]: false })}>
                Sequential
              </button>
              {answered && <span className="small">{a === it.comb ? '✅' : '❌'} {it.why}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

