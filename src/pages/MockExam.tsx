import { useEffect, useMemo, useState } from 'react';
import { ALL_LESSONS } from '../data/curriculum';
import { Quiz, Question } from '../components/Quiz';

const CODE_POOL: Question[] = [
  {
    id: 'mock-v1', kind: 'verilog', module: 'mux_like', inputs: ['x', 'y', 'z'],
    q: "Write a gate-level Verilog module mux_like (x, y, z, F) that implements F = xy + x'z using the primitives not, and, or. Declare the internal connections as wires.",
    tr: "F = xy + x'z fonksiyonunu not, and, or primitive'leriyle gerçekleyen mux_like (x, y, z, F) modülünü yazın. İç bağlantıları wire olarak tanımlayın.",
    outputs: { F: (e) => (e.x & e.y) | ((1 - e.x) & e.z) },
    starter: 'module mux_like (x, y, z, F);\n\nendmodule',
    explain: 'input x, y, z; output F; wire xn, t1, t2; not G1 (xn, x); and G2 (t1, x, y); and G3 (t2, xn, z); or G4 (F, t1, t2);',
  },
  {
    id: 'mock-v2', kind: 'verilog', module: 'parity3', inputs: ['a', 'b', 'c'],
    q: 'Write a Verilog module parity3 (a, b, c, P) that generates the even parity bit P for the 3-bit message a, b, c.',
    tr: '3 bitlik a, b, c mesajı için çift parite biti P üreten parity3 (a, b, c, P) modülünü yazın.',
    outputs: { P: (e) => e.a ^ e.b ^ e.c },
    starter: 'module parity3 (a, b, c, P);\n\nendmodule',
    explain: 'input a, b, c; output P; xor G1 (P, a, b, c);',
  },
  {
    id: 'mock-v3', kind: 'verilog', module: 'two_out', inputs: ['A', 'B', 'C'],
    q: "Write a gate-level Verilog module two_out (A, B, C, D, E) where E = C' and D = AB + E. Use gate instance names G1, G2, G3.",
    tr: "E = C' ve D = AB + E olan two_out (A, B, C, D, E) modülünü kapı seviyesinde yazın. Kapı adları G1, G2, G3 olsun.",
    outputs: { D: (e) => (e.A & e.B) | (1 - e.C), E: (e) => 1 - e.C },
    starter: 'module two_out (A, B, C, D, E);\n\nendmodule',
    explain: 'output D, E; input A, B, C; wire w1; and G1 (w1, A, B); not G2 (E, C); or G3 (D, w1, E);',
  },
  {
    id: 'mock-v4', kind: 'verilog', module: 'pos_fn', inputs: ['w', 'x', 'y'],
    q: "Write a Verilog module pos_fn (w, x, y, F) for F = (w + x')(x + y) using a single continuous assignment.",
    tr: "F = (w + x')(x + y) için tek bir assign kullanan pos_fn (w, x, y, F) modülünü yazın.",
    outputs: { F: (e) => (e.w | (1 - e.x)) & (e.x | e.y) },
    starter: 'module pos_fn (w, x, y, F);\n  input  w, x, y;\n  output F;\n\nendmodule',
    explain: 'assign F = (w | ~x) & (x | y);',
  },
  {
    id: 'mock-v5', kind: 'verilog', module: 'UDP_0356', inputs: ['A', 'B', 'C'], requireUdp: true,
    q: 'Write a user-defined primitive UDP_0356 with output F and inputs A, B, C that implements F(A, B, C) = Σ(0, 3, 5, 6).',
    tr: 'F(A, B, C) = Σ(0, 3, 5, 6) fonksiyonunu gerçekleyen, çıkışı F ve girişleri A, B, C olan UDP_0356 adlı kullanıcı tanımlı primitive\'i yazın.',
    outputs: { F: (e) => 1 - (e.A ^ e.B ^ e.C) },
    starter: 'primitive UDP_0356 (F, A, B, C);\n  output F;\n  input  A, B, C;\n  table\n  //  A  B  C  :  F\n\n  endtable\nendprimitive',
    explain: 'Tablo: 000:1; 001:0; 010:0; 011:1; 100:0; 101:1; 110:1; 111:0;',
  },
  {
    id: 'mock-v6', kind: 'verilog', module: 'Circuit_BE', inputs: ['A', 'B', 'C'],
    q: "Using continuous assignment statements, write a Verilog module Circuit_BE (E, F, A, B, C) for E = A'B + C and F = AB' + BC'.",
    tr: "Sürekli atama (assign) kullanarak E = A'B + C ve F = AB' + BC' için Circuit_BE (E, F, A, B, C) modülünü yazın.",
    outputs: { E: (e) => ((1 - e.A) & e.B) | e.C, F: (e) => (e.A & (1 - e.B)) | (e.B & (1 - e.C)) },
    starter: 'module Circuit_BE (E, F, A, B, C);\n  output E, F;\n  input  A, B, C;\n\nendmodule',
    explain: 'assign E = ((!A) && B) || C;  assign F = (A && (!B)) || (B && (!C));',
  },
  {
    id: 'mock-v7', kind: 'verilog', module: 'full_adder', inputs: ['x', 'y', 'z'],
    q: 'Write a Verilog module full_adder (x, y, z, S, C) for a full adder, where S = x ⊕ y ⊕ z and C = xy + xz + yz.',
    tr: 'S = x ⊕ y ⊕ z ve C = xy + xz + yz olan tam toplayıcı full_adder (x, y, z, S, C) modülünü yazın.',
    outputs: { S: (e) => e.x ^ e.y ^ e.z, C: (e) => (e.x + e.y + e.z >= 2 ? 1 : 0) },
    starter: 'module full_adder (x, y, z, S, C);\n\nendmodule',
    explain: 'input x, y, z; output S, C; xor (S, x, y, z); assign C = (x & y) | (x & z) | (y & z);',
  },
  {
    id: 'mock-v8', kind: 'verilog', module: 'analyze_me', inputs: ['A', 'B'],
    q: 'Write a gate-level Verilog description of the circuit with T1 = NOR(A, B), T2 = AND(A, B) and output F = NOR(T1, T2). Module name: analyze_me (A, B, F).',
    tr: 'T1 = NOR(A, B), T2 = AND(A, B) ve çıkış F = NOR(T1, T2) olan devrenin kapı seviyesinde Verilog tanımını yazın. Modül adı: analyze_me (A, B, F).',
    outputs: { F: (e) => e.A ^ e.B },
    starter: 'module analyze_me (A, B, F);\n\nendmodule',
    explain: 'input A, B; output F; wire T1, T2; nor (T1, A, B); and (T2, A, B); nor (F, T1, T2);  — bu devre aslında XOR.',
  },
];

function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

export default function MockExam() {
  const [seed, setSeed] = useState(0);
  const [scope, setScope] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [start, setStart] = useState(Date.now());
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const questions = useMemo(() => {
    const byCh = (c: number) => shuffle(ALL_LESSONS.filter((l) => l.chapter === c).flatMap((l) => l.questions).filter((q) => q.kind !== 'verilog'));
    let qs: Question[];
    if (scope === 0) qs = [...byCh(1).slice(0, 5), ...byCh(2).slice(0, 5), ...byCh(3).slice(0, 5), ...byCh(4).slice(0, 5)];
    else qs = byCh(scope).slice(0, 15);
    if (scope === 0 || scope >= 3) qs.push(shuffle(CODE_POOL)[0]);
    return qs;
  }, [seed, scope]); // eslint-disable-line
  const mins = Math.floor((now - start) / 60000);
  const secs = Math.floor(((now - start) / 1000) % 60);
  const restart = () => {
    setSeed((s) => s + 1);
    setStart(Date.now());
  };
  return (
    <div className="page">
      <h1>Deneme Sınavı</h1>
      <p className="muted">
        Her denemede soru havuzundan rastgele sorular seçilir. Sınav koşullarını taklit etmek için üst menüden <b>Çeviriler: Kapalı</b> yapıp çözmeyi dene.
      </p>
      <div className="exam-bar">
        <div className="seg">
          {([0, 1, 2, 3, 4] as const).map((c) => (
            <button key={c} className={scope === c ? 'active' : ''} onClick={() => { setScope(c); restart(); }}>
              {c === 0 ? 'Karma (20 + kod)' : `Bölüm ${c}`}
            </button>
          ))}
        </div>
        <span className="mono">{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
        <span className="spacer" />
        <button className="btn btn-ghost small" onClick={restart}>Yeni deneme</button>
      </div>
      <Quiz key={`${seed}-${scope}`} id={`mock-${scope}`} questions={questions} title="Deneme Soruları" />
    </div>
  );
}
