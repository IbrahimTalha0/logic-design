import { useMemo, useState } from 'react';
import { CodeEditor } from '../components/CodeEditor';
import { SimOutput, V, WaveResult, gradeModule, simulate } from '../lib/verilog';

export const EXAMPLES: { name: string; code: string }[] = [
  {
    name: 'HDL Örnek 3.1 — Kapılarla devre',
    code: `// Verilog model of circuit of Figure 3.35. IEEE 1364-1995 Syntax
module Simple_Circuit (A, B, C, D, E);
  output D, E;
  input  A, B, C;
  wire   w1;

  and G1 (w1, A, B);   // Optional gate instance name
  not G2 (E, C);
  or  G3 (D, w1, E);
endmodule`,
  },
  {
    name: 'HDL Örnek 3.2 + 3.3 — Gecikmeler ve test bench',
    code: `// Verilog model of simple circuit with propagation delay
module Simple_Circuit_prop_delay (A, B, C, D, E);
  output D, E;
  input  A, B, C;
  wire   w1;

  and #(30) G1 (w1, A, B);
  not #(10) G2 (E, C);
  or  #(20) G3 (D, w1, E);
endmodule

// Test bench for Simple_Circuit_prop_delay
module t_Simple_Circuit_prop_delay;
  wire D, E;
  reg  A, B, C;

  Simple_Circuit_prop_delay M1 (A, B, C, D, E); // Instance name required

  initial
    begin
      A = 1'b0; B = 1'b0; C = 1'b0;
      #100 A = 1'b1; B = 1'b1; C = 1'b1;
    end

  initial #200 $finish;
endmodule`,
  },
  {
    name: 'Boole ifadesiyle (assign)',
    code: `// Aynı devre, continuous assignment ile
module Circuit_boolean (A, B, C, D, E);
  output D, E;
  input  A, B, C;

  assign D = (A & B) | ~C;   // & = AND, | = OR, ~ = NOT
  assign E = ~C;
endmodule`,
  },
  {
    name: '3-bit çift parite üreteci (xor)',
    code: `// P = x ^ y ^ z   (Bölüm 3.8)
module parity_gen (x, y, z, P);
  input  x, y, z;
  output P;

  xor G1 (P, x, y, z);   // çok girişli XOR = tek fonksiyon (odd function)
endmodule`,
  },
  {
    name: 'NAND–NAND: F = AB + CD',
    code: `// İki seviyeli NAND gerçeklemesi (Bölüm 3.6)
module nand_sop (A, B, C, D, F);
  input  A, B, C, D;
  output F;
  wire   n1, n2;

  nand G1 (n1, A, B);
  nand G2 (n2, C, D);
  nand G3 (F, n1, n2);
endmodule`,
  },
  {
    name: 'HDL Örnek 3.4 — Boole ifadeleri (&&, ||, !)',
    code: `// Kitaptaki yazım: && = AND, || = OR, ! = NOT
// E = A + BC + B'D     F = B'C + BC'D'
module Circuit_Boolean_CA (E, F, A, B, C, D);
  output E, F;
  input  A, B, C, D;

  assign E = A || (B && C) || ((!B) && D);
  assign F = ((!B) && C) || (B && (!C) && (!D));
endmodule`,
  },
  {
    name: 'HDL Örnek 3.5 — Kullanıcı tanımlı primitive (UDP)',
    code: `// D = f(A, B, C) = Σ(0, 2, 4, 6, 7)
primitive UDP_02467 (D, A, B, C);
  output D;          // tek çıkış, port listesinde İLK
  input  A, B, C;
  table
  //  A  B  C  :  D
      0  0  0  :  1;
      0  0  1  :  0;
      0  1  0  :  1;
      0  1  1  :  0;
      1  0  0  :  1;
      1  0  1  :  0;
      1  1  0  :  1;
      1  1  1  :  1;
  endtable
endprimitive

// UDP'yi bir devrede kapı gibi kullanmak (Şekil 3.37)
module Circuit_with_UDP_02467 (e, f, a, b, c, d);
  output e, f;
  input  a, b, c, d;

  UDP_02467 (e, a, b, c);   // örnek adı isteğe bağlı
  and       (f, e, d);
endmodule`,
  },
  {
    name: 'Şekil 4.2 — Analiz örneği (tam toplayıcı)',
    code: `// Bölüm 4.3 analiz örneği: F1 = toplam, F2 = elde
module Fig4_2 (A, B, C, F1, F2);
  input  A, B, C;
  output F1, F2;
  wire   T1, T2, T3, F2n, ab, ac, bc;

  and G1 (T2, A, B, C);      // T2 = ABC
  or  G2 (T1, A, B, C);      // T1 = A + B + C
  and G3 (ab, A, B);
  and G4 (ac, A, C);
  and G5 (bc, B, C);
  or  G6 (F2, ab, ac, bc);   // F2 = AB + AC + BC
  not G7 (F2n, F2);          // F2'
  and G8 (T3, F2n, T1);      // T3 = F2'T1
  or  G9 (F1, T3, T2);       // F1 = T3 + T2
endmodule`,
  },
  {
    name: 'Şekil 4.4 — BCD → Excess-3 dönüştürücü',
    code: `// Bölüm 4.4: ortak (C + D) kapısı ile çok seviyeli gerçekleme
module BCD_to_Excess3 (A, B, C, D, w, x, y, z);
  input  A, B, C, D;
  output w, x, y, z;

  assign z = ~D;
  assign y = (C & D) | ~(C | D);
  assign x = (~B & (C | D)) | (B & ~(C | D));
  assign w = A | (B & (C | D));
endmodule`,
  },
  {
    name: 'Boş şablon',
    code: `module my_circuit (A, B, F);
  input  A, B;
  output F;

  // kapıları buraya yazın: and (F, A, B);

endmodule`,
  },
];

interface Exercise {
  title: string;
  task: string;
  module: string;
  inputs: string[];
  outputs: Record<string, (e: Record<string, number>) => number>;
  onlyGates?: string[];
  noAssign?: boolean;
  requireUdp?: boolean;
  care?: (e: Record<string, number>) => boolean;
  starter: string;
  solution: string;
}

export const EXERCISES: Exercise[] = [
  {
    title: '1) İlk modülün',
    task: "F = x'y + z fonksiyonunu kapı primitive'leri (not, and, or) ile yazın. Modül adı: ex1, girişler x, y, z; çıkış F.",
    module: 'ex1',
    inputs: ['x', 'y', 'z'],
    outputs: { F: (e) => ((1 - e.x) & e.y) | e.z },
    noAssign: true,
    starter: `module ex1 (x, y, z, F);
  input  x, y, z;
  output F;
  wire   xn, t1;

  // buraya kapıları yazın

endmodule`,
    solution: `module ex1 (x, y, z, F);
  input  x, y, z;
  output F;
  wire   xn, t1;

  not G1 (xn, x);
  and G2 (t1, xn, y);
  or  G3 (F, t1, z);
endmodule`,
  },
  {
    title: '2) Şemadan koda',
    task: 'Devre: G1 = OR(A, B) → w1;  G2 = NOT(C) → w2;  G3 = AND(w1, w2) → F. Modül adı: ex2 (A, B, C, F). Kapılara G1, G2, G3 adlarını verin.',
    module: 'ex2',
    inputs: ['A', 'B', 'C'],
    outputs: { F: (e) => (e.A | e.B) & (1 - e.C) },
    noAssign: true,
    starter: `module ex2 (A, B, C, F);
  // port yönlerini ve iç telleri tanımlayın

endmodule`,
    solution: `module ex2 (A, B, C, F);
  input  A, B, C;
  output F;
  wire   w1, w2;

  or  G1 (w1, A, B);
  not G2 (w2, C);
  and G3 (F, w1, w2);
endmodule`,
  },
  {
    title: '3) Sadece NAND',
    task: "F = xy' + z  fonksiyonunu YALNIZCA nand primitive'leri ile yazın (inverter da NAND olmalı). Modül adı: ex3 (x, y, z, F).",
    module: 'ex3',
    inputs: ['x', 'y', 'z'],
    outputs: { F: (e) => (e.x & (1 - e.y)) | e.z },
    onlyGates: ['nand'],
    noAssign: true,
    starter: `module ex3 (x, y, z, F);
  input  x, y, z;
  output F;
  wire   yn, zn, t1;

endmodule`,
    solution: `module ex3 (x, y, z, F);
  input  x, y, z;
  output F;
  wire   yn, zn, t1;

  nand G1 (yn, y, y);      // y'  (NAND inverter)
  nand G2 (t1, x, yn);     // (xy')'
  nand G3 (zn, z, z);      // z'  (tek literal tümlenir!)
  nand G4 (F, t1, zn);     // ((xy')' z')' = xy' + z
endmodule`,
  },
  {
    title: '4) assign ile',
    task: "F = (A + B')(C + D) ifadesini tek bir assign ile yazın. Modül adı: ex4 (A, B, C, D, F). Verilog'da + yerine |, çarpım yerine & kullanılır.",
    module: 'ex4',
    inputs: ['A', 'B', 'C', 'D'],
    outputs: { F: (e) => (e.A | (1 - e.B)) & (e.C | e.D) },
    starter: `module ex4 (A, B, C, D, F);
  input  A, B, C, D;
  output F;

  assign F = ;
endmodule`,
    solution: `module ex4 (A, B, C, D, F);
  input  A, B, C, D;
  output F;

  assign F = (A | ~B) & (C | D);
endmodule`,
  },
  {
    title: '5) İki çıkışlı devre',
    task: "Çıkışlar: S = x ⊕ y,  C = xy  (yarım toplayıcı / half adder). Modül adı: ex5 (x, y, S, C). xor ve and primitive'lerini kullanın.",
    module: 'ex5',
    inputs: ['x', 'y'],
    outputs: { S: (e) => e.x ^ e.y, C: (e) => e.x & e.y },
    noAssign: true,
    starter: `module ex5 (x, y, S, C);

endmodule`,
    solution: `module ex5 (x, y, S, C);
  input  x, y;
  output S, C;

  xor G1 (S, x, y);
  and G2 (C, x, y);
endmodule`,
  },
  {
    title: '6) Kitap stili assign (&&, ||, !)',
    task: "E = A + BC + B'D fonksiyonunu tek bir assign satırıyla yazın (kitaptaki gibi &&, ||, ! kullanabilirsiniz). Modül adı: ex6, girişler A, B, C, D; çıkış E.",
    module: 'ex6',
    inputs: ['A', 'B', 'C', 'D'],
    outputs: { E: (e) => e.A | (e.B & e.C) | ((1 - e.B) & e.D) },
    starter: `module ex6 (E, A, B, C, D);
  output E;
  input  A, B, C, D;

  // assign E = ...

endmodule`,
    solution: `module ex6 (E, A, B, C, D);
  output E;
  input  A, B, C, D;

  assign E = A || (B && C) || ((!B) && D);
endmodule`,
  },
  {
    title: '7) UDP: çoğunluk fonksiyonu',
    task: "3 girişli çoğunluk (majority) fonksiyonunu kullanıcı tanımlı primitive (UDP) olarak yazın: girişlerin en az ikisi 1 ise çıkış 1. Primitive adı: majority, çıkış M, girişler A, B, C.",
    module: 'majority',
    inputs: ['A', 'B', 'C'],
    outputs: { M: (e) => (e.A + e.B + e.C >= 2 ? 1 : 0) },
    requireUdp: true,
    starter: `primitive majority (M, A, B, C);
  output M;
  input  A, B, C;
  table
  //  A  B  C  :  M
      0  0  0  :  0;
      // kalan 7 satırı yazın

  endtable
endprimitive`,
    solution: `primitive majority (M, A, B, C);
  output M;
  input  A, B, C;
  table
  //  A  B  C  :  M
      0  0  0  :  0;
      0  0  1  :  0;
      0  1  0  :  0;
      0  1  1  :  1;
      1  0  0  :  0;
      1  0  1  :  1;
      1  1  0  :  1;
      1  1  1  :  1;
  endtable
endprimitive`,
  },
  {
    title: '8) Şekil 4.2 → kod',
    task: "Bölüm 4.3'teki analiz devresini kapı seviyesinde yazın. Kapılar: T2 = AND(A, B, C); T1 = OR(A, B, C); ab = AND(A, B); ac = AND(A, C); bc = AND(B, C); F2 = OR(ab, ac, bc); F2n = NOT(F2); T3 = AND(F2n, T1); F1 = OR(T3, T2). Modül adı: fig4_2 (A, B, C, F1, F2).",
    module: 'fig4_2',
    inputs: ['A', 'B', 'C'],
    outputs: { F1: (e) => e.A ^ e.B ^ e.C, F2: (e) => (e.A + e.B + e.C >= 2 ? 1 : 0) },
    noAssign: true,
    starter: `module fig4_2 (A, B, C, F1, F2);
  input  A, B, C;
  output F1, F2;
  wire   T1, T2, T3, F2n, ab, ac, bc;

  // 9 kapıyı yazın

endmodule`,
    solution: `module fig4_2 (A, B, C, F1, F2);
  input  A, B, C;
  output F1, F2;
  wire   T1, T2, T3, F2n, ab, ac, bc;

  and G1 (T2, A, B, C);
  or  G2 (T1, A, B, C);
  and G3 (ab, A, B);
  and G4 (ac, A, C);
  and G5 (bc, B, C);
  or  G6 (F2, ab, ac, bc);
  not G7 (F2n, F2);
  and G8 (T3, F2n, T1);
  or  G9 (F1, T3, T2);
endmodule`,
  },
  {
    title: "9) BCD → Excess-3",
    task: "BCD → Excess-3 kod dönüştürücüyü assign ile yazın (Bölüm 4.4): z = D', y = CD + C'D', x = B'C + B'D + BC'D', w = A + BC + BD. Modül adı: bcd_ex3, girişler A, B, C, D; çıkışlar w, x, y, z. (10–15 girişleri don't-care olduğu için kontrol edilmez.)",
    module: 'bcd_ex3',
    inputs: ['A', 'B', 'C', 'D'],
    outputs: {
      w: (e) => ((e.A * 8 + e.B * 4 + e.C * 2 + e.D + 3) >> 3) & 1,
      x: (e) => ((e.A * 8 + e.B * 4 + e.C * 2 + e.D + 3) >> 2) & 1,
      y: (e) => ((e.A * 8 + e.B * 4 + e.C * 2 + e.D + 3) >> 1) & 1,
      z: (e) => (e.A * 8 + e.B * 4 + e.C * 2 + e.D + 3) & 1,
    },
    care: (e) => e.A * 8 + e.B * 4 + e.C * 2 + e.D <= 9,
    starter: `module bcd_ex3 (A, B, C, D, w, x, y, z);
  input  A, B, C, D;
  output w, x, y, z;

endmodule`,
    solution: `module bcd_ex3 (A, B, C, D, w, x, y, z);
  input  A, B, C, D;
  output w, x, y, z;

  assign z = ~D;
  assign y = (C & D) | (~C & ~D);
  assign x = (~B & C) | (~B & D) | (B & ~C & ~D);
  assign w = A | (B & C) | (B & D);
endmodule`,
  },
];

const vs = (v: V) => (v === 2 ? 'x' : String(v));

function Waveform({ r }: { r: WaveResult }) {
  const [cursor, setCursor] = useState<number | null>(null);
  const L = 70, W = 640, RH = 34;
  const T = Math.max(1, r.endTime);
  const sx = (t: number) => L + (t / T) * W;
  const step = T <= 50 ? 10 : T <= 250 ? 50 : T <= 600 ? 100 : 200;
  const ticks: number[] = [];
  for (let t = 0; t <= T; t += step) ticks.push(t);
  const H = r.signals.length * RH + 30;
  return (
    <div className="wave-wrap">
      <svg
        viewBox={`0 0 ${L + W + 20} ${H}`}
        className="wave-svg"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * (L + W + 20);
          const t = Math.round(((x - L) / W) * T);
          setCursor(t >= 0 && t <= T ? t : null);
        }}
        onMouseLeave={() => setCursor(null)}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={sx(t)} y1={0} x2={sx(t)} y2={H - 22} className="grid-line" />
            <text x={sx(t)} y={H - 8} textAnchor="middle" className="svg-tiny">
              {t}
            </text>
          </g>
        ))}
        {r.signals.map((s, i) => {
          const y0 = i * RH + 6, hi = y0 + 4, lo = y0 + RH - 12;
          const segs: JSX.Element[] = [];
          let start = 0;
          for (let t = 1; t <= s.values.length; t++) {
            if (t === s.values.length || s.values[t] !== s.values[start]) {
              const v = s.values[start];
              const x1 = sx(start), x2 = sx(Math.min(t, T));
              if (v === 2) segs.push(<rect key={start} x={x1} y={hi} width={Math.max(0, x2 - x1)} height={lo - hi} className="wave-x" />);
              else segs.push(<line key={start} x1={x1} y1={v ? hi : lo} x2={x2} y2={v ? hi : lo} className="wave-line" />);
              if (t < s.values.length && s.values[t] !== 2 && v !== 2) segs.push(<line key={'e' + t} x1={x2} y1={hi} x2={x2} y2={lo} className="wave-line" />);
              start = t;
            }
          }
          return (
            <g key={s.name}>
              <text x={4} y={y0 + RH / 2 + 1} className="svg-label">
                {s.name}
              </text>
              {segs}
              {cursor !== null && (
                <text x={L + W + 4} y={y0 + RH / 2} className="svg-tiny">
                  {vs(s.values[cursor])}
                </text>
              )}
            </g>
          );
        })}
        {cursor !== null && (
          <>
            <line x1={sx(cursor)} y1={0} x2={sx(cursor)} y2={H - 22} className="cursor-line" />
            <text x={sx(cursor) + 3} y={10} className="svg-tiny">
              t={cursor}
            </text>
          </>
        )}
      </svg>
      <div className="muted small">Fareyi dalga formu üzerinde gezdirin: imleçteki değerler sağda görünür. Gri taralı bölge = bilinmeyen (x) değer.</div>
      <details>
        <summary>Değişim listesi (kitaptaki Tablo 3.5 gibi)</summary>
        <table className="tbl compact">
          <thead>
            <tr>
              <th>Zaman</th>
              <th>Sinyal</th>
              <th>Yeni değer</th>
            </tr>
          </thead>
          <tbody>
            {r.changes.map((c, i) => (
              <tr key={i}>
                <td>{c.t}</td>
                <td className="mono">{c.name}</td>
                <td className="mono">{vs(c.v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}

function Results({ out }: { out: SimOutput }) {
  const errs = out.diags.filter((d) => d.level === 'error');
  return (
    <div className="sim-results">
      {out.diags.length > 0 && (
        <ul className="diags">
          {out.diags.map((d, i) => (
            <li key={i} className={`diag ${d.level}`}>
              <b>{d.level === 'error' ? '⛔ Hata' : d.level === 'warning' ? '⚠️ Uyarı' : 'ℹ️ Bilgi'}</b> (satır {d.line}): {d.msg}
            </li>
          ))}
        </ul>
      )}
      {errs.length === 0 && out.diags.length === 0 && <div className="ok-line">✓ Derleme başarılı, hata yok.</div>}
      {out.result?.mode === 'truth' && (
        <div>
          <div className="small muted">
            Modül <b className="mono">{out.result.module}</b> için tüm giriş kombinasyonları simüle edildi:
          </div>
          <div className="table-wrap">
          <table className="tbl compact tt">
            <thead>
              <tr>
                {out.result.inputs.map((x) => (
                  <th key={x}>{x}</th>
                ))}
                {out.result.internals.map((x) => (
                  <th key={x} className="muted">
                    {x}
                  </th>
                ))}
                {out.result.outputs.map((x) => (
                  <th key={x} className="out-col">
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {out.result.rows.map((row, i) => (
                <tr key={i}>
                  {row.in.map((v, j) => (
                    <td key={j}>{vs(v)}</td>
                  ))}
                  {row.internal.map((v, j) => (
                    <td key={j} className="muted">
                      {vs(v)}
                    </td>
                  ))}
                  {row.out.map((v, j) => (
                    <td key={j} className="out-col">
                      <b>{vs(v)}</b>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
      {out.result?.mode === 'wave' && <Waveform r={out.result} />}
    </div>
  );
}

export function VerilogPlayground({ initial = 0, height = 16 }: { initial?: number; height?: number }) {
  const [ex, setEx] = useState(initial);
  const [code, setCode] = useState(EXAMPLES[initial].code);
  const out = useMemo(() => simulate(code), [code]);
  return (
    <div className="lab">
      <div className="lab-title">🧪 Verilog Simülatörü</div>
      <div className="lab-controls">
        <label className="grow">
          Örnek yükle
          <select
            className="q-input"
            value={ex}
            onChange={(e) => {
              const i = +e.target.value;
              setEx(i);
              setCode(EXAMPLES[i].code);
            }}
          >
            {EXAMPLES.map((e, i) => (
              <option key={i} value={i}>
                {e.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <CodeEditor value={code} onChange={setCode} rows={height} errorLines={out.diags.filter((d) => d.level === 'error').map((d) => d.line)} />
      <div className="muted small">Kod siz yazdıkça otomatik derlenir ve simüle edilir.</div>
      <Results out={out} />
    </div>
  );
}

export function VerilogExercises() {
  const [i, setI] = useState(0);
  const [codes, setCodes] = useState(EXERCISES.map((e) => e.starter));
  const [fb, setFb] = useState<{ ok: boolean; msgs: string[] } | null>(null);
  const [showSol, setShowSol] = useState(false);
  const ex = EXERCISES[i];
  const code = codes[i];
  const out = useMemo(() => simulate(code, { topName: ex.module }), [code, ex.module]);
  const grade = () => {
    const r = gradeModule(code, { module: ex.module, inputs: ex.inputs, outputs: ex.outputs, care: ex.care });
    const msgs = [...r.messages];
    let ok = r.ok;
    const mod = r.sim.modules.find((m) => m.name === ex.module);
    if (mod && ex.onlyGates) {
      const bad = mod.gates.filter((g) => !ex.onlyGates!.includes(g.type));
      if (bad.length) {
        ok = false;
        msgs.push(`Bu alıştırmada yalnızca ${ex.onlyGates.join(', ')} kullanılabilir; satır ${bad.map((b) => b.line).join(', ')}'de "${bad[0].type}" var.`);
      }
    }
    if (ex.requireUdp && !mod?.udp) {
      ok = false;
      msgs.push('Bu alıştırmada "primitive … table … endtable … endprimitive" yapısında bir UDP yazmalısınız.');
    }
    if (mod && (ex.noAssign || ex.onlyGates) && mod.assigns.length) {
      ok = false;
      msgs.push('Bu alıştırma kapı seviyesinde (gate-level) yazılmalı: assign kullanmayın.');
    }
    setFb({ ok, msgs });
  };
  return (
    <div className="lab">
      <div className="lab-title">🎯 Kod Sorusu Antrenmanı (otomatik puanlanır)</div>
      <div className="seg wrap">
        {EXERCISES.map((e, k) => (
          <button key={k} className={k === i ? 'active' : ''} onClick={() => { setI(k); setFb(null); setShowSol(false); }}>
            {e.title}
          </button>
        ))}
      </div>
      <div className="task">{ex.task}</div>
      <CodeEditor
        value={code}
        onChange={(v) => {
          setCodes(codes.map((c, k) => (k === i ? v : c)));
          setFb(null);
        }}
        rows={13}
        errorLines={out.diags.filter((d) => d.level === 'error').map((d) => d.line)}
      />
      <div className="q-input-row">
        <button className="btn" onClick={grade}>Kontrol et</button>
        <button className="btn btn-ghost" onClick={() => setCodes(codes.map((c, k) => (k === i ? ex.starter : c)))}>Başa al</button>
        <button className="btn btn-ghost" onClick={() => setShowSol(!showSol)}>{showSol ? 'Çözümü gizle' : 'Örnek çözüm'}</button>
      </div>
      {fb && (
        <div className={fb.ok ? 'ok-line' : 'lab-err'}>
          {fb.ok ? '✅ Tebrikler! Tüm giriş kombinasyonlarında doğru çalışıyor.' : '❌ Henüz değil:'}
          {fb.msgs.map((m, k) => (
            <div key={k} className="small">• {m}</div>
          ))}
        </div>
      )}
      {showSol && <pre className="code-plain">{ex.solution}</pre>}
      <Results out={out} />
    </div>
  );
}
