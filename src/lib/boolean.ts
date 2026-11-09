// Boole ifadesi ayrıştırıcı, değerlendirici ve Quine–McCluskey sadeleştirici.
// Desteklenen yazım: A'B + C   |  ~A & B | C   |  (A+B)(A'+C)  |  A ^ B (XOR)
// Değişkenler tek harftir (xy = x AND y). Tümleyen: postfix ' veya ’, prefix ~ veya !

export type Ast =
  | { t: 'var'; n: string }
  | { t: 'const'; v: 0 | 1 }
  | { t: 'not'; a: Ast }
  | { t: 'and'; args: Ast[] }
  | { t: 'or'; args: Ast[] }
  | { t: 'xor'; args: Ast[] }
  | { t: 'xnor'; args: Ast[] };

export class ParseError extends Error {}

type Tok = { k: 'var' | 'const' | 'op' | 'lp' | 'rp' | 'not' | 'prime'; v: string; pos: number };

function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (/\s/.test(c)) continue;
    if (/[A-Za-z]/.test(c)) out.push({ k: 'var', v: c, pos: i });
    else if (c === '0' || c === '1') out.push({ k: 'const', v: c, pos: i });
    else if (c === '(' || c === '[') out.push({ k: 'lp', v: c, pos: i });
    else if (c === ')' || c === ']') out.push({ k: 'rp', v: c, pos: i });
    else if (c === "'" || c === '’' || c === '′') out.push({ k: 'prime', v: c, pos: i });
    else if (c === '~' || c === '!' || c === '¬') out.push({ k: 'not', v: c, pos: i });
    else if (c === '+' || c === '|' || c === '∨') out.push({ k: 'op', v: '+', pos: i });
    else if (c === '*' || c === '&' || c === '·' || c === '.' || c === '∧') out.push({ k: 'op', v: '*', pos: i });
    else if (c === '^' || c === '⊕') out.push({ k: 'op', v: '^', pos: i });
    else if (c === '⊙') out.push({ k: 'op', v: '⊙', pos: i });
    else throw new ParseError(`Tanınmayan karakter: "${c}" (konum ${i + 1})`);
  }
  return out;
}

export function parse(src: string): Ast {
  const toks = tokenize(src);
  if (toks.length === 0) throw new ParseError('İfade boş.');
  let p = 0;
  const peek = () => toks[p];

  function parseOr(): Ast {
    const args = [parseXor()];
    while (peek() && peek().k === 'op' && peek().v === '+') {
      p++;
      args.push(parseXor());
    }
    return args.length === 1 ? args[0] : { t: 'or', args };
  }
  function parseXor(): Ast {
    let left = parseAnd();
    while (peek() && peek().k === 'op' && (peek().v === '^' || peek().v === '⊙')) {
      const op = toks[p++].v;
      const right = parseAnd();
      left = op === '^' ? { t: 'xor', args: [left, right] } : { t: 'xnor', args: [left, right] };
    }
    return left;
  }
  function startsFactor(t?: Tok) {
    return !!t && (t.k === 'var' || t.k === 'const' || t.k === 'lp' || t.k === 'not');
  }
  function parseAnd(): Ast {
    const args = [parseUnary()];
    for (;;) {
      const t = peek();
      if (t && t.k === 'op' && t.v === '*') {
        p++;
        args.push(parseUnary());
      } else if (startsFactor(t)) {
        args.push(parseUnary()); // örtük çarpım: xy
      } else break;
    }
    return args.length === 1 ? args[0] : { t: 'and', args };
  }
  function parseUnary(): Ast {
    const t = peek();
    if (t && t.k === 'not') {
      p++;
      return { t: 'not', a: parseUnary() };
    }
    let base = parseAtom();
    while (peek() && peek().k === 'prime') {
      p++;
      base = { t: 'not', a: base };
    }
    return base;
  }
  function parseAtom(): Ast {
    const t = peek();
    if (!t) throw new ParseError('İfade beklenmedik şekilde bitti (eksik terim?).');
    if (t.k === 'var') {
      p++;
      return { t: 'var', n: t.v };
    }
    if (t.k === 'const') {
      p++;
      return { t: 'const', v: t.v === '1' ? 1 : 0 };
    }
    if (t.k === 'lp') {
      p++;
      const e = parseOr();
      if (!peek() || peek().k !== 'rp') throw new ParseError('Kapanmamış parantez var.');
      p++;
      return e;
    }
    throw new ParseError(`Beklenmeyen "${t.v}" (konum ${t.pos + 1}).`);
  }
  const ast = parseOr();
  if (p < toks.length) throw new ParseError(`Fazladan "${toks[p].v}" (konum ${toks[p].pos + 1}).`);
  return ast;
}

export function varsOf(ast: Ast, acc = new Set<string>()): Set<string> {
  switch (ast.t) {
    case 'var':
      acc.add(ast.n);
      break;
    case 'const':
      break;
    case 'not':
      varsOf(ast.a, acc);
      break;
    default:
      ast.args.forEach((a) => varsOf(a, acc));
  }
  return acc;
}

export function sortedVars(ast: Ast): string[] {
  return [...varsOf(ast)].sort((a, b) => {
    const la = a.toLowerCase(), lb = b.toLowerCase();
    // w,x,y,z sırası a..v'den sonra gelsin diye standart alfabetik yeterli
    return la < lb ? -1 : la > lb ? 1 : a < b ? -1 : 1;
  });
}

export function evaluate(ast: Ast, env: Record<string, number>): number {
  switch (ast.t) {
    case 'var':
      return env[ast.n] ? 1 : 0;
    case 'const':
      return ast.v;
    case 'not':
      return evaluate(ast.a, env) ? 0 : 1;
    case 'and':
      return ast.args.every((a) => evaluate(a, env)) ? 1 : 0;
    case 'or':
      return ast.args.some((a) => evaluate(a, env)) ? 1 : 0;
    case 'xor':
      return ast.args.reduce((s, a) => s ^ evaluate(a, env), 0);
    case 'xnor':
      return ast.args.reduce((s, a) => s ^ evaluate(a, env), 0) ? 0 : 1;
  }
}

/** Minterm sırasına göre çıkışlar. vars[0] en anlamlı bit (MSB). */
export function truthTable(ast: Ast, vars: string[]): number[] {
  const n = vars.length;
  const out: number[] = [];
  for (let m = 0; m < 1 << n; m++) {
    const env: Record<string, number> = {};
    vars.forEach((v, i) => (env[v] = (m >> (n - 1 - i)) & 1));
    out.push(evaluate(ast, env));
  }
  return out;
}

export function mintermsOf(src: string, vars: string[]): number[] {
  const tt = truthTable(parse(src), vars);
  return tt.flatMap((v, i) => (v ? [i] : []));
}

export function bits(m: number, n: number): string {
  return m.toString(2).padStart(n, '0');
}

// ---------------- Quine–McCluskey ----------------

export interface Implicant {
  value: number; // değeri sabit olan bitler
  mask: number; // 1 olan bitler "fark etmez" (birleştirilmiş) konumlar
  covers: number[]; // kapsadığı mintermler (dc dahil)
}

function popcount(x: number) {
  let c = 0;
  while (x) {
    c += x & 1;
    x >>= 1;
  }
  return c;
}

export function primeImplicants(n: number, ones: number[], dcs: number[]): Implicant[] {
  const all = [...new Set([...ones, ...dcs])].sort((a, b) => a - b);
  if (all.length === 0) return [];
  let current: Implicant[] = all.map((m) => ({ value: m, mask: 0, covers: [m] }));
  const primes: Implicant[] = [];
  const key = (i: Implicant) => `${i.value}/${i.mask}`;
  while (current.length) {
    const used = new Set<string>();
    const next = new Map<string, Implicant>();
    for (let i = 0; i < current.length; i++) {
      for (let j = i + 1; j < current.length; j++) {
        const a = current[i], b = current[j];
        if (a.mask !== b.mask) continue;
        const diff = a.value ^ b.value;
        if (popcount(diff) !== 1) continue;
        const merged: Implicant = {
          value: a.value & ~diff,
          mask: a.mask | diff,
          covers: [...new Set([...a.covers, ...b.covers])].sort((x, y) => x - y),
        };
        next.set(key(merged), merged);
        used.add(key(a));
        used.add(key(b));
      }
    }
    for (const imp of current) if (!used.has(key(imp)) && !primes.some((p) => key(p) === key(imp))) primes.push(imp);
    current = [...next.values()];
  }
  void n;
  return primes;
}

export function literalCount(imp: Implicant, n: number): number {
  return n - popcount(imp.mask);
}

export interface Minimization {
  primes: Implicant[];
  essential: Implicant[];
  solution: Implicant[]; // bir minimal çözüm
  alternatives: number; // eşit maliyetli çözüm sayısı
}

/** ones: 1 olan mintermler, dcs: don't-care. Minimal SOP örtüsü. */
export function minimize(n: number, ones: number[], dcs: number[] = []): Minimization {
  const primes = primeImplicants(n, ones, dcs);
  if (ones.length === 0) return { primes: [], essential: [], solution: [], alternatives: 1 };
  const essential: Implicant[] = [];
  for (const m of ones) {
    const cov = primes.filter((p) => p.covers.includes(m));
    if (cov.length === 1 && !essential.includes(cov[0])) essential.push(cov[0]);
  }
  const covered = new Set(essential.flatMap((e) => e.covers));
  const remaining = ones.filter((m) => !covered.has(m));
  const candidates = primes.filter((p) => !essential.includes(p) && p.covers.some((m) => remaining.includes(m)));

  let best: Implicant[][] = [[]];
  if (remaining.length) {
    best = [];
    let bestCost: [number, number] = [Infinity, Infinity];
    const k = candidates.length;
    // küçük problemler için alt küme taraması (≤4 değişkende her zaman küçük)
    const limit = Math.min(k, 18);
    for (let s = 1; s < 1 << limit; s++) {
      const chosen = candidates.filter((_, i) => (s >> i) & 1);
      const cov = new Set(chosen.flatMap((c) => c.covers));
      if (!remaining.every((m) => cov.has(m))) continue;
      const cost: [number, number] = [chosen.length, chosen.reduce((a, c) => a + literalCount(c, n), 0)];
      if (cost[0] < bestCost[0] || (cost[0] === bestCost[0] && cost[1] < bestCost[1])) {
        bestCost = cost;
        best = [chosen];
      } else if (cost[0] === bestCost[0] && cost[1] === bestCost[1]) best.push(chosen);
    }
  }
  const sortImp = (a: Implicant, b: Implicant) => popcount(b.mask) - popcount(a.mask) || a.covers[0] - b.covers[0];
  return {
    primes: [...primes].sort(sortImp),
    essential: [...essential].sort(sortImp),
    solution: [...essential, ...(best[0] ?? [])].sort(sortImp),
    alternatives: best.length,
  };
}

/** SOP çarpım terimi: x'yz gibi. */
export function termSOP(imp: Implicant, vars: string[]): string {
  const n = vars.length;
  let s = '';
  for (let i = 0; i < n; i++) {
    const bit = 1 << (n - 1 - i);
    if (imp.mask & bit) continue;
    s += vars[i] + (imp.value & bit ? '' : "'");
  }
  return s || '1';
}

/** POS toplam terimi: 0'ları gruplayan implikant → (x + y' + z). */
export function termPOS(imp: Implicant, vars: string[]): string {
  const n = vars.length;
  const lits: string[] = [];
  for (let i = 0; i < n; i++) {
    const bit = 1 << (n - 1 - i);
    if (imp.mask & bit) continue;
    lits.push(vars[i] + (imp.value & bit ? "'" : ''));
  }
  if (lits.length === 0) return '0';
  return lits.length === 1 ? lits[0] : `(${lits.join(' + ')})`;
}

export function sopString(sol: Implicant[], vars: string[]): string {
  if (sol.length === 0) return '0';
  return sol.map((s) => termSOP(s, vars)).join(' + ');
}

export function posString(sol: Implicant[], vars: string[]): string {
  if (sol.length === 0) return '1';
  return sol.map((s) => termPOS(s, vars)).join('');
}

export function minimalSOP(vars: string[], ones: number[], dcs: number[] = []) {
  const r = minimize(vars.length, ones, dcs);
  return { ...r, expr: sopString(r.solution, vars) };
}

export function minimalPOS(vars: string[], ones: number[], dcs: number[] = []) {
  const n = vars.length;
  const zeros: number[] = [];
  for (let m = 0; m < 1 << n; m++) if (!ones.includes(m) && !dcs.includes(m)) zeros.push(m);
  const r = minimize(n, zeros, dcs);
  return { ...r, zeros, expr: posString(r.solution, vars) };
}

/** İfadenin literal sayısı (sadeleştirme sorularında karşılaştırma için). */
export function countLiterals(ast: Ast): number {
  switch (ast.t) {
    case 'var':
      return 1;
    case 'const':
      return 0;
    case 'not':
      return countLiterals(ast.a);
    default:
      return ast.args.reduce((s, a) => s + countLiterals(a), 0);
  }
}

/** Kanonik formlar */
export function sumOfMintermsString(vars: string[], ones: number[]): string {
  const n = vars.length;
  return ones.map((m) => termSOP({ value: m, mask: 0, covers: [m] }, vars)).join(' + ') || (n ? '0' : '');
}
export function productOfMaxtermsString(vars: string[], zeros: number[]): string {
  return zeros.map((m) => termPOS({ value: m, mask: 0, covers: [m] }, vars)).join('') || '1';
}

/** Verilen kümeyi Σ / Π gösterimine çevirir */
export const sigma = (ms: number[]) => `Σ(${ms.join(', ')})`;
export const pi = (ms: number[]) => `Π(${ms.join(', ')})`;

/** İki ifadeyi verilen değişken kümesi ve dc'ler üzerinde karşılaştırır. */
export function equivalent(a: string, targetOnes: number[], vars: string[], dcs: number[] = []): { ok: boolean; wrong: number[] } {
  const tt = truthTable(parse(a), vars);
  const wrong: number[] = [];
  tt.forEach((v, m) => {
    if (dcs.includes(m)) return;
    const want = targetOnes.includes(m) ? 1 : 0;
    if (v !== want) wrong.push(m);
  });
  return { ok: wrong.length === 0, wrong };
}

/** Gray kod sırası (K-map etiketleri) */
export const GRAY2 = [0, 1, 3, 2];
