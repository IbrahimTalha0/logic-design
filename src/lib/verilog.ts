// Eğitim amaçlı küçük bir Verilog alt-kümesi ayrıştırıcı + simülatör.
// Desteklenen: module/endmodule, input/output/wire/reg (tek bit), kapı primitive'leri
// (and, or, not, nand, nor, xor, xnor, buf) ve gecikmeleri (#), assign (~ & | ^ ~^ ?:),
// modül örnekleme (sıralı veya .ad(sinyal)), test bench: initial, begin/end, #gecikme, $finish,
// kombinasyonel kullanıcı tanımlı primitive (primitive … table … endtable … endprimitive).

export type V = 0 | 1 | 2; // 2 = x (bilinmeyen)

export interface Diag {
  line: number;
  msg: string;
  level: 'error' | 'warning' | 'info';
}

type TokKind = 'id' | 'num' | 'sys' | 'p' | 'eof';
interface Tok {
  k: TokKind;
  v: string;
  line: number;
}

const KEYWORDS = new Set([
  'module', 'endmodule', 'input', 'output', 'inout', 'wire', 'reg', 'assign', 'initial', 'begin', 'end',
  'and', 'or', 'not', 'nand', 'nor', 'xor', 'xnor', 'buf', 'always', 'integer', 'parameter',
  'primitive', 'endprimitive', 'table', 'endtable',
]);
const GATES = new Set(['and', 'or', 'not', 'nand', 'nor', 'xor', 'xnor', 'buf']);

class VerilogError extends Error {
  line: number;
  constructor(line: number, msg: string) {
    super(msg);
    this.line = line;
  }
}

function tokenize(src: string): Tok[] {
  const toks: Tok[] = [];
  let i = 0, line = 1;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    if (c === '\n') { line++; i++; continue; }
    if (/\s/.test(c)) { i++; continue; }
    if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
    if (c === '/' && src[i + 1] === '*') {
      i += 2;
      while (i < n && !(src[i] === '*' && src[i + 1] === '/')) { if (src[i] === '\n') line++; i++; }
      if (i >= n) throw new VerilogError(line, 'Kapanmamış /* ... */ yorum bloğu.');
      i += 2;
      continue;
    }
    if (c === '`') { // derleyici yönergesi (`timescale vb.) — yok say
      while (i < n && src[i] !== '\n') i++;
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < n && /[A-Za-z0-9_$]/.test(src[j])) j++;
      toks.push({ k: 'id', v: src.slice(i, j), line });
      i = j;
      continue;
    }
    if (c === '$') {
      let j = i + 1;
      while (j < n && /[A-Za-z0-9_]/.test(src[j])) j++;
      toks.push({ k: 'sys', v: src.slice(i, j), line });
      i = j;
      continue;
    }
    if (/[0-9']/.test(c)) {
      const m = /^(\d*)'([bBdDhHoO])([0-9a-fA-FxXzZ_]+)|^\d+(\.\d+)?/.exec(src.slice(i));
      if (!m) throw new VerilogError(line, `Hatalı sayı yazımı: "${src.slice(i, i + 6)}"`);
      toks.push({ k: 'num', v: m[0], line });
      i += m[0].length;
      continue;
    }
    const two = src.slice(i, i + 2);
    if (['~&', '~|', '~^', '^~', '&&', '||', '==', '!='].includes(two)) {
      toks.push({ k: 'p', v: two, line });
      i += 2;
      continue;
    }
    if ('(),;#=.~&|^!?:[]@{}'.includes(c)) {
      toks.push({ k: 'p', v: c, line });
      i++;
      continue;
    }
    throw new VerilogError(line, `Tanınmayan karakter: "${c}"`);
  }
  toks.push({ k: 'eof', v: '', line });
  return toks;
}

// ---------------- AST ----------------
export type VExpr =
  | { t: 'id'; n: string; line: number }
  | { t: 'num'; v: V }
  | { t: 'un'; op: string; a: VExpr }
  | { t: 'bin'; op: string; a: VExpr; b: VExpr }
  | { t: 'tern'; c: VExpr; a: VExpr; b: VExpr };

interface GateInst { type: string; delay: number; name?: string; out: string[]; ins: string[]; line: number; }
interface AssignSt { lhs: string; expr: VExpr; delay: number; line: number; }
interface ModInst { module: string; name?: string; conns: string[] | Record<string, string>; line: number; }
const newModule = (name: string, line: number): ModuleAst => ({
  name, line, ports: [], dirs: new Map(), kinds: new Map(), declOrder: [],
  gates: [], assigns: [], insts: [], initials: [], used: new Map(),
});
interface InitStmt { at: number; kind: 'set' | 'finish'; lhs?: string; expr?: VExpr; line: number; }

export interface ModuleAst {
  name: string;
  line: number;
  ports: string[];
  dirs: Map<string, 'input' | 'output' | 'inout'>;
  kinds: Map<string, 'wire' | 'reg'>;
  declOrder: string[];
  gates: GateInst[];
  assigns: AssignSt[];
  insts: ModInst[];
  initials: InitStmt[][];
  used: Map<string, number>; // kullanılan isim -> satır
  udp?: UdpDef; // kullanıcı tanımlı primitive ise
}

export interface UdpDef {
  inputs: string[]; // tablo sütun sırası = input tanım sırası
  rows: { ins: string[]; out: V; line: number }[];
}

function parseNumber(v: string, line: number): V {
  const m = /^(\d*)'([bBdDhHoO])([0-9a-fA-FxXzZ_]+)$/.exec(v);
  if (m) {
    const width = m[1] ? parseInt(m[1], 10) : 1;
    const digits = m[3].replace(/_/g, '').toLowerCase();
    if (digits === 'x' || digits === 'z') return 2;
    const base = { b: 2, d: 10, h: 16, o: 8 }[m[2].toLowerCase() as 'b'] ?? 2;
    const val = parseInt(digits, base);
    if (width !== 1 || val > 1)
      throw new VerilogError(line, `"${v}": Bu simülatör yalnızca 1-bitlik değerleri destekler (1'b0 veya 1'b1 kullanın).`);
    return val as V;
  }
  const n = Number(v);
  if (n === 0 || n === 1) return n as V;
  throw new VerilogError(line, `"${v}": Tek bitlik bir sinyale yalnızca 0 veya 1 atanabilir.`);
}

export function parseVerilog(src: string): { modules: ModuleAst[]; diags: Diag[] } {
  const diags: Diag[] = [];
  const toks = tokenize(src);
  let p = 0;
  const peek = (o = 0) => toks[Math.min(p + o, toks.length - 1)];
  const next = () => toks[p++];
  const isP = (v: string, o = 0) => peek(o).k === 'p' && peek(o).v === v;
  const isId = (v?: string, o = 0) => peek(o).k === 'id' && (v === undefined || peek(o).v === v);
  const expectP = (v: string, ctx: string) => {
    if (!isP(v)) {
      const t = peek();
      const near = t.k === 'eof' ? 'dosya sonu' : `"${t.v}"`;
      const line = v === ';' && p > 0 ? toks[p - 1].line : t.line;
      throw new VerilogError(line, `"${v}" bekleniyordu (${ctx}), fakat ${near} bulundu.${v === ';' ? ' Satır sonunda noktalı virgül (;) eksik olabilir.' : ''}`);
    }
    return next();
  };
  const expectId = (ctx: string) => {
    const t = peek();
    if (t.k !== 'id') throw new VerilogError(t.line, `Bir isim (identifier) bekleniyordu (${ctx}), fakat "${t.v || 'dosya sonu'}" bulundu.`);
    if (KEYWORDS.has(t.v)) throw new VerilogError(t.line, `"${t.v}" bir anahtar kelimedir (keyword); isim olarak kullanılamaz (${ctx}).`);
    return next().v;
  };

  const modules: ModuleAst[] = [];

  function parseDelay(): number {
    if (!isP('#')) return 0;
    next();
    let t: Tok;
    if (isP('(')) {
      next();
      t = next();
      expectP(')', 'gecikme');
    } else t = next();
    if (t.k !== 'num' || !/^\d+(\.\d+)?$/.test(t.v)) throw new VerilogError(t.line, `Gecikme değeri bir sayı olmalı: "#${t.v}"`);
    return Number(t.v);
  }

  function parseExpr(m: ModuleAst): VExpr {
    return parseTern(m);
  }
  function parseTern(m: ModuleAst): VExpr {
    const c = parseBinLevel(m, 0);
    if (isP('?')) {
      next();
      const a = parseTern(m);
      expectP(':', '?: operatörü');
      const b = parseTern(m);
      return { t: 'tern', c, a, b };
    }
    return c;
  }
  const LEVELS = [['||'], ['&&'], ['|', '~|'], ['^', '~^', '^~'], ['&', '~&'], ['==', '!=']];
  function parseBinLevel(m: ModuleAst, lvl: number): VExpr {
    if (lvl >= LEVELS.length) return parseUnary(m);
    let a = parseBinLevel(m, lvl + 1);
    while (peek().k === 'p' && LEVELS[lvl].includes(peek().v)) {
      const op = next().v;
      const b = parseBinLevel(m, lvl + 1);
      a = { t: 'bin', op, a, b };
    }
    return a;
  }
  function parseUnary(m: ModuleAst): VExpr {
    if (isP('~') || isP('!')) {
      const op = next().v;
      return { t: 'un', op, a: parseUnary(m) };
    }
    if (isP('(')) {
      next();
      const e = parseExpr(m);
      expectP(')', 'parantez');
      return e;
    }
    const t = peek();
    if (t.k === 'num') {
      next();
      return { t: 'num', v: parseNumber(t.v, t.line) };
    }
    if (t.k === 'id') {
      if (KEYWORDS.has(t.v)) throw new VerilogError(t.line, `İfade içinde anahtar kelime "${t.v}" kullanılamaz.`);
      next();
      if (isP('[')) throw new VerilogError(t.line, 'Vektör/bit seçimi ([ ]) bu simülatörde desteklenmiyor; tek bitlik sinyaller kullanın.');
      if (!m.used.has(t.v)) m.used.set(t.v, t.line);
      return { t: 'id', n: t.v, line: t.line };
    }
    if (t.k === 'p' && (t.v === '+' || t.v === '*'))
      throw new VerilogError(t.line, `Verilog'da OR için "||" (veya "|"), AND için "&&" (veya "&") kullanılır ("${t.v}" aritmetik operatördür).`);
    throw new VerilogError(t.line, `İfade bekleniyordu, fakat "${t.v || 'dosya sonu'}" bulundu.`);
  }

  function declare(m: ModuleAst, name: string, line: number, dir?: 'input' | 'output' | 'inout', kind?: 'wire' | 'reg') {
    if (dir) {
      if (m.dirs.has(name)) diags.push({ line, level: 'warning', msg: `"${name}" yönü iki kez tanımlandı.` });
      m.dirs.set(name, dir);
    }
    if (kind) m.kinds.set(name, kind);
    if (!m.declOrder.includes(name)) m.declOrder.push(name);
  }

  function parseDeclList(m: ModuleAst, first: string, line: number) {
    let dir: 'input' | 'output' | 'inout' | undefined;
    let kind: 'wire' | 'reg' | undefined;
    if (first === 'input' || first === 'output' || first === 'inout') {
      dir = first;
      if (isId('wire') || isId('reg')) kind = next().v as 'wire' | 'reg';
    } else kind = first as 'wire' | 'reg';
    if (isP('[')) throw new VerilogError(line, 'Vektör tanımı ([n:0]) bu simülatörde desteklenmiyor; her sinyali tek bit olarak tanımlayın.');
    for (;;) {
      const t = peek();
      const name = expectId(`${first} tanımı`);
      declare(m, name, t.line, dir, kind);
      if (dir && !m.ports.includes(name))
        diags.push({ line: t.line, level: 'error', msg: `"${name}" ${dir} olarak tanımlandı ama modülün port listesinde yok. Port listesine ekleyin.` });
      if (isP(',')) { next(); continue; }
      break;
    }
    expectP(';', `${first} tanımı`);
  }

  function parseInitial(m: ModuleAst): InitStmt[] {
    const out: InitStmt[] = [];
    let time = 0;
    function stmt() {
      if (isId('begin')) {
        next();
        while (!isId('end')) {
          if (peek().k === 'eof') throw new VerilogError(peek().line, '"begin" bloğu "end" ile kapatılmamış.');
          stmt();
        }
        next();
        return;
      }
      const line = peek().line;
      time += parseDelay();
      if (isP(';')) { next(); return; } // sadece bekleme: #10;
      const t = peek();
      if (t.k === 'sys') {
        next();
        if (t.v === '$finish' || t.v === '$stop') {
          if (isP('(')) { while (!isP(')')) next(); next(); }
          out.push({ at: time, kind: 'finish', line });
        } else {
          // $display, $monitor vb. — yok say
          let depth = 0;
          while (!(depth === 0 && isP(';'))) {
            if (peek().k === 'eof') break;
            if (isP('(')) depth++;
            if (isP(')')) depth--;
            next();
          }
          diags.push({ line, level: 'info', msg: `${t.v} bu simülatörde yok sayıldı (dalga formlarına bakın).` });
        }
        expectP(';', 'sistem görevi');
        return;
      }
      if (t.k === 'id' && !KEYWORDS.has(t.v)) {
        next();
        if (isP('[')) throw new VerilogError(t.line, 'Vektörler desteklenmiyor.');
        if (isP('<')) next();
        expectP('=', 'initial içinde atama');
        const expr = parseExpr(m);
        expectP(';', 'atama');
        if (!m.used.has(t.v)) m.used.set(t.v, t.line);
        out.push({ at: time, kind: 'set', lhs: t.v, expr, line });
        return;
      }
      if (t.k === 'id' && (t.v === 'repeat' || t.v === 'for' || t.v === 'forever' || t.v === 'if'))
        throw new VerilogError(t.line, `"${t.v}" bu basit simülatörde desteklenmiyor. Her değişikliği "#gecikme sinyal = değer;" biçiminde yazın.`);
      throw new VerilogError(t.line, `initial bloğunda beklenmeyen "${t.v}".`);
    }
    stmt();
    return out;
  }

  function parseModuleItem(m: ModuleAst): boolean {
    const t = peek();
    if (t.k === 'eof') throw new VerilogError(t.line, `"${m.name}" modülü "endmodule" ile bitirilmemiş.`);
    if (t.k !== 'id') {
      if (t.k === 'p' && t.v === ';') { next(); return true; }
      throw new VerilogError(t.line, `Beklenmeyen "${t.v}".`);
    }
    const w = t.v;
    if (w === 'endmodule') {
      next();
      if (isP(';')) {
        diags.push({ line: peek().line, level: 'warning', msg: '"endmodule" sonrasına noktalı virgül konmaz.' });
        next();
      }
      return false;
    }
    if (w === 'module') throw new VerilogError(t.line, `Yeni "module" başlamadan önce "${m.name}" modülü "endmodule" ile kapatılmalı.`);
    if (['input', 'output', 'inout', 'wire', 'reg'].includes(w)) {
      next();
      parseDeclList(m, w, t.line);
      return true;
    }
    if (w === 'assign') {
      next();
      const delay = parseDelay();
      for (;;) {
        const lt = peek();
        const lhs = expectId('assign sol tarafı');
        if (!m.used.has(lhs)) m.used.set(lhs, lt.line);
        expectP('=', 'assign');
        const expr = parseExpr(m);
        m.assigns.push({ lhs, expr, delay, line: lt.line });
        if (isP(',')) { next(); continue; }
        break;
      }
      expectP(';', 'assign');
      return true;
    }
    if (w === 'initial') {
      next();
      m.initials.push(parseInitial(m));
      return true;
    }
    if (w === 'always') throw new VerilogError(t.line, '"always" blokları bu derste (Bölüm 3) kapsam dışı ve simülatörde desteklenmiyor.');
    if (GATES.has(w)) {
      next();
      const delay = parseDelay();
      for (;;) {
        const gl = peek().line;
        let name: string | undefined;
        if (peek().k === 'id') name = expectId('kapı örnek adı');
        expectP('(', `${w} kapısı terminal listesi`);
        const terms: string[] = [];
        for (;;) {
          const tt = peek();
          if (tt.k === 'num') {
            next();
            terms.push(parseNumber(tt.v, tt.line) === 1 ? "1'b1" : "1'b0");
          } else {
            const nm = expectId(`${w} kapısı terminali`);
            if (!m.used.has(nm)) m.used.set(nm, tt.line);
            terms.push(nm);
          }
          if (isP(',')) { next(); continue; }
          break;
        }
        expectP(')', `${w} kapısı`);
        if (terms.length < 2) throw new VerilogError(gl, `"${w}" kapısının en az bir çıkış ve bir girişi olmalı: ${w} (çıkış, giriş...)`);
        if ((w === 'not' || w === 'buf') ) {
          m.gates.push({ type: w, delay, name, out: terms.slice(0, -1), ins: terms.slice(-1), line: gl });
        } else {
          if (terms.length < 3) diags.push({ line: gl, level: 'warning', msg: `"${w}" kapısının tek girişi var; genelde en az iki giriş olur. Unutmayın: ilk terminal ÇIKIŞTIR.` });
          m.gates.push({ type: w, delay, name, out: [terms[0]], ins: terms.slice(1), line: gl });
        }
        if (isP(',')) { next(); continue; }
        break;
      }
      expectP(';', 'kapı örneklemesi');
      return true;
    }
    // Yanlış büyük/küçük harf yazılmış anahtar kelime?
    if (KEYWORDS.has(w.toLowerCase()) && !KEYWORDS.has(w))
      throw new VerilogError(t.line, `"${w}" tanınmadı. Verilog büyük/küçük harfe duyarlıdır (case sensitive): "${w.toLowerCase()}" yazmalısınız.`);
    // Modül örneklemesi
    if (peek(1).k === 'id' || isP('(', 1) || isP('#', 1)) {
      next();
      if (isP('#')) parseDelay();
      for (;;) {
        const il = peek().line;
        let name: string | undefined;
        if (peek().k === 'id') name = expectId('modül örnek adı');
        expectP('(', 'modül bağlantıları');
        let conns: string[] | Record<string, string> = [];
        if (isP('.')) {
          const rec: Record<string, string> = {};
          for (;;) {
            expectP('.', 'isimli bağlantı');
            const port = expectId('port adı');
            expectP('(', 'isimli bağlantı');
            const tt = peek();
            const sig = expectId('sinyal adı');
            if (!m.used.has(sig)) m.used.set(sig, tt.line);
            expectP(')', 'isimli bağlantı');
            rec[port] = sig;
            if (isP(',')) { next(); continue; }
            break;
          }
          conns = rec;
        } else if (!isP(')')) {
          const arr: string[] = [];
          for (;;) {
            const tt = peek();
            const sig = expectId('bağlantı sinyali');
            if (!m.used.has(sig)) m.used.set(sig, tt.line);
            arr.push(sig);
            if (isP(',')) { next(); continue; }
            break;
          }
          conns = arr;
        }
        expectP(')', 'modül bağlantıları');
        m.insts.push({ module: w, name, conns, line: il });
        if (isP(',')) { next(); continue; }
        break;
      }
      expectP(';', 'modül örneklemesi');
      return true;
    }
    throw new VerilogError(t.line, `"${w}" ile başlayan ifade anlaşılamadı.`);
  }

  // ---- Kullanıcı tanımlı primitive (UDP) ----
  function parsePrimitive(line: number): ModuleAst {
    const name = expectId('primitive adı');
    const m = newModule(name, line);
    const inputs: string[] = [];
    expectP('(', 'primitive port listesi');
    for (;;) {
      const pt = peek();
      if (isId('output') || isId('input')) throw new VerilogError(pt.line, 'UDP port listesinde yön yazılmaz; output ve input satırlarını gövdede tanımlayın.');
      m.ports.push(expectId('primitive port listesi'));
      if (isP(',')) { next(); continue; }
      break;
    }
    expectP(')', 'primitive port listesi');
    expectP(';', 'primitive başlığı');
    const rows: UdpDef['rows'] = [];
    let sawTable = false;
    for (;;) {
      const t = peek();
      if (t.k === 'eof') throw new VerilogError(t.line, `"${name}" primitive'i "endprimitive" ile bitirilmemiş.`);
      if (isId('endprimitive')) { next(); break; }
      if (isId('endmodule')) throw new VerilogError(t.line, 'primitive "endmodule" ile değil "endprimitive" ile biter.');
      if (isId('output') || isId('input')) {
        const dir = next().v as 'input' | 'output';
        if (isId('reg')) throw new VerilogError(t.line, 'Çıkışı reg olan (ardışıl / sequential) UDP bu simülatörde desteklenmiyor; yalnızca kombinasyonel UDP yazın.');
        for (;;) {
          const nt = peek();
          const nm = expectId(`${dir} tanımı`);
          if (!m.ports.includes(nm)) diags.push({ line: nt.line, level: 'error', msg: `"${nm}" ${dir} olarak tanımlandı ama primitive'in port listesinde yok.` });
          m.dirs.set(nm, dir);
          m.kinds.set(nm, 'wire');
          if (!m.declOrder.includes(nm)) m.declOrder.push(nm);
          if (dir === 'input') inputs.push(nm);
          if (isP(',')) { next(); continue; }
          break;
        }
        expectP(';', `${dir} tanımı`);
        continue;
      }
      if (isId('reg')) throw new VerilogError(t.line, 'Ardışıl (sequential) UDP bu simülatörde desteklenmiyor.');
      if (isId('wire') || isId('assign') || GATES.has(t.v))
        throw new VerilogError(t.line, `UDP içinde "${t.v}" kullanılamaz; UDP yalnızca output, input ve table … endtable içerir.`);
      if (isId('table')) {
        next();
        sawTable = true;
        while (!isId('endtable')) {
          const rl = peek().line;
          if (peek().k === 'eof' || isId('endprimitive')) throw new VerilogError(rl, '"table" bloğu "endtable" ile kapatılmamış.');
          const ins: string[] = [];
          while (!isP(':')) {
            const e = peek();
            if (e.k === 'eof' || isP(';')) throw new VerilogError(e.line, 'Tablo satırında giriş değerlerinden sonra iki nokta (:) bekleniyordu. Biçim: 0 1 0 : 1;');
            next();
            const v = e.v.toLowerCase();
            if (e.k === 'num' && /^[01]+$/.test(v)) ins.push(...v.split(''));
            else if ((e.k === 'id' && /^[xb]+$/.test(v)) || (e.k === 'p' && v === '?')) ins.push(...v.split(''));
            else throw new VerilogError(e.line, `Tablo değeri "${e.v}" geçersiz; girişler için 0, 1, x veya ? kullanılır.`);
          }
          next();
          const o = peek();
          let out: V;
          if (o.k === 'num' && (o.v === '0' || o.v === '1')) out = Number(o.v) as V;
          else if (o.k === 'id' && o.v.toLowerCase() === 'x') out = 2;
          else throw new VerilogError(o.line, `Tablo satırının çıkışı 0, 1 veya x olmalı; "${o.v || 'dosya sonu'}" bulundu.`);
          next();
          if (isP(':')) throw new VerilogError(o.line, 'Bu kombinasyonel bir UDP; satırda tek bir ":" olmalı (girişler : çıkış;).');
          expectP(';', 'tablo satırı (çıkıştan sonra)');
          rows.push({ ins, out, line: rl });
        }
        next();
        continue;
      }
      throw new VerilogError(t.line, `primitive içinde beklenmeyen "${t.v}".`);
    }
    // UDP kuralları
    const outs = m.ports.filter((p) => m.dirs.get(p) === 'output');
    if (outs.length !== 1) diags.push({ line, level: 'error', msg: `UDP'nin tam olarak bir çıkışı olmalı (bulunan: ${outs.length}).` });
    else if (m.ports[0] !== outs[0]) diags.push({ line, level: 'error', msg: `UDP'de çıkış port listesinde İLK sırada olmalı: primitive ${name} (${outs[0]}, …);` });
    for (const pn of m.ports) if (!m.dirs.has(pn)) diags.push({ line, level: 'error', msg: `"${pn}" portunun yönü tanımlanmamış.` });
    if (!sawTable) diags.push({ line, level: 'error', msg: 'UDP\'de doğruluk tablosu "table … endtable" arasında verilmelidir.' });
    for (const r of rows)
      if (r.ins.length !== inputs.length)
        diags.push({ line: r.line, level: 'error', msg: `Tablo satırında ${r.ins.length} giriş değeri var ama ${inputs.length} giriş (${inputs.join(', ')}) tanımlı.` });
    if (inputs.join() !== m.ports.filter((p) => m.dirs.get(p) === 'input').join())
      diags.push({ line, level: 'warning', msg: 'Tablo sütunları input tanımındaki sıraya göre okunur; port listesindeki sıra ile aynı tutmanız önerilir.' });
    const seen = new Map<string, number>();
    for (const r of rows) {
      const k = r.ins.join('');
      if (seen.has(k) && rows[seen.get(k)!].out !== r.out)
        diags.push({ line: r.line, level: 'error', msg: `Aynı giriş kombinasyonu (${r.ins.join(' ')}) için çelişkili çıkışlar var.` });
      seen.set(k, rows.indexOf(r));
    }
    m.udp = { inputs, rows };
    return m;
  }

  try {
    while (peek().k !== 'eof') {
      const t = peek();
      if (!isId('module')) {
        if (isId('primitive')) {
          next();
          modules.push(parsePrimitive(t.line));
          continue;
        }
        if (t.k === 'id' && (t.v.toLowerCase() === 'module' || t.v.toLowerCase() === 'primitive'))
          throw new VerilogError(t.line, `"${t.v}" yerine küçük harfle "${t.v.toLowerCase()}" yazılmalı (Verilog büyük/küçük harfe duyarlıdır).`);
        throw new VerilogError(t.line, `Dosya "module" (veya "primitive") anahtar kelimesiyle başlamalı; "${t.v}" bulundu.`);
      }
      next();
      const nameTok = peek();
      if (nameTok.k === 'id' && /^[0-9]/.test(nameTok.v)) throw new VerilogError(nameTok.line, 'İsimler rakamla başlayamaz.');
      const name = expectId('modül adı');
      const m = newModule(name, t.line);
      if (isP('(')) {
        next();
        let dir: 'input' | 'output' | 'inout' | undefined;
        let kind: 'wire' | 'reg' | undefined;
        if (!isP(')')) {
          for (;;) {
            if (isId('input') || isId('output') || isId('inout')) {
              dir = next().v as 'input';
              kind = undefined;
              if (isId('wire') || isId('reg')) kind = next().v as 'wire';
              if (isP('[')) throw new VerilogError(peek().line, 'Vektör portlar desteklenmiyor.');
            }
            const pt = peek();
            const pn = expectId('port listesi');
            if (m.ports.includes(pn)) diags.push({ line: pt.line, level: 'error', msg: `"${pn}" port listesinde iki kez geçiyor.` });
            m.ports.push(pn);
            if (dir) declare(m, pn, pt.line, dir, kind);
            if (isP(',')) { next(); continue; }
            break;
          }
        }
        expectP(')', 'port listesi');
      }
      expectP(';', 'modül başlığı');
      while (parseModuleItem(m)) { /* devam */ }
      modules.push(m);
    }
  } catch (e) {
    if (e instanceof VerilogError) {
      diags.push({ line: e.line, level: 'error', msg: e.message });
      return { modules, diags };
    }
    throw e;
  }
  if (modules.length === 0) diags.push({ line: 1, level: 'error', msg: 'Hiç modül bulunamadı. Kod "module ... endmodule" yapısında olmalı.' });
  return { modules, diags };
}

// ---------------- Anlamsal kontroller ----------------
function lint(mods: ModuleAst[], diags: Diag[]) {
  const names = new Set(mods.map((m) => m.name));
  for (const m of mods) {
    if (m.udp) continue;
    for (const pn of m.ports)
      if (!m.dirs.has(pn)) diags.push({ line: m.line, level: 'error', msg: `"${pn}" portunun yönü tanımlanmamış: modül içinde "input ${pn};" veya "output ${pn};" yazın.` });
    for (const [nm, line] of m.used) {
      if (nm === "1'b0" || nm === "1'b1") continue;
      if (!m.dirs.has(nm) && !m.kinds.has(nm))
        diags.push({ line, level: 'warning', msg: `"${nm}" tanımlanmamış (Verilog bunu örtük "wire" sayar). Sınavda iç bağlantıları "wire ${nm};" ile tanımlamayı unutmayın.` });
    }
    const drivers = new Map<string, number>();
    const drive = (s: string, line: number) => {
      if (m.dirs.get(s) === 'input')
        diags.push({ line, level: 'error', msg: `Giriş (input) "${s}" bir kapı/assign tarafından sürülüyor. Hatırlatma: primitive kapılarda İLK terminal ÇIKIŞTIR → and (çıkış, giriş1, giriş2);` });
      if (drivers.has(s)) diags.push({ line, level: 'warning', msg: `"${s}" birden fazla kaynak tarafından sürülüyor (satır ${drivers.get(s)} ve ${line}).` });
      drivers.set(s, line);
    };
    m.gates.forEach((g) => g.out.forEach((o) => drive(o, g.line)));
    m.assigns.forEach((a) => {
      drive(a.lhs, a.line);
      if (m.kinds.get(a.lhs) === 'reg') diags.push({ line: a.line, level: 'error', msg: `"assign" ile reg değişkene ("${a.lhs}") atama yapılamaz; wire olmalı.` });
    });
    for (const ini of m.initials)
      for (const s of ini)
        if (s.kind === 'set' && s.lhs && m.kinds.get(s.lhs) !== 'reg')
          diags.push({ line: s.line, level: 'error', msg: `initial bloğunda yalnızca "reg" değişkenlere atama yapılabilir. "${s.lhs}" için "reg ${s.lhs};" tanımlayın.` });
    for (const inst of m.insts) {
      if (!names.has(inst.module)) {
        const lower = inst.module.toLowerCase();
        diags.push({
          line: inst.line, level: 'error',
          msg: GATES.has(lower) ? `"${inst.module}" tanınmadı; kapı adları küçük harfle yazılır: "${lower}".` : `Tanımsız modül: "${inst.module}". Aynı dosyada bu isimde bir modül tanımlanmalı (adlar büyük/küçük harfe duyarlı).`,
        });
        continue;
      }
      const child = mods.find((x) => x.name === inst.module)!;
      if (!inst.name && !child.udp)
        diags.push({ line: inst.line, level: 'error', msg: `"${inst.module}" modülünün örneklemesinde örnek adı (instance name) eksik. Örn: ${inst.module} M1 (...); — modül örneklemesinde ad zorunludur (yalnızca kapı ve UDP'lerde isteğe bağlıdır).` });
      if (Array.isArray(inst.conns) && inst.conns.length !== child.ports.length)
        diags.push({ line: inst.line, level: 'error', msg: `"${inst.module}" ${child.ports.length} porta sahip ama ${inst.conns.length} bağlantı verildi. Sıralı bağlantıda sıra modül başlığındaki port sırasıyla aynı olmalı: (${child.ports.join(', ')})` });
      if (!Array.isArray(inst.conns))
        for (const k of Object.keys(inst.conns))
          if (!child.ports.includes(k)) diags.push({ line: inst.line, level: 'error', msg: `"${inst.module}" modülünde "${k}" adında port yok.` });
      // test bench'te: modül girişleri reg ile sürülür
      const sigs = Array.isArray(inst.conns) ? inst.conns.map((s, i) => [child.ports[i], s]) : Object.entries(inst.conns);
      for (const [cp, sig] of sigs) {
        if (!cp) continue;
        if (child.dirs.get(cp) === 'output' && m.kinds.get(sig) === 'reg')
          diags.push({ line: inst.line, level: 'error', msg: `Test bench'te modül çıkışı "${sig}" reg değil wire olarak tanımlanmalı.` });
      }
    }
    for (const pn of m.ports)
      if (m.dirs.get(pn) === 'output') {
        const driven = m.gates.some((g) => g.out.includes(pn)) || m.assigns.some((a) => a.lhs === pn) || m.insts.length > 0;
        if (!driven) diags.push({ line: m.line, level: 'warning', msg: `Çıkış "${pn}" hiçbir kapı veya assign tarafından sürülmüyor (değeri x kalır).` });
      }
  }
}

// ---------------- Elaborasyon (düzleştirme) ----------------
interface Elem { kind: 'gate' | 'assign' | 'udp'; type?: string; delay: number; out: number; ins: number[]; expr?: VExpr; env?: Map<string, number>; udp?: UdpDef; }
interface Flat {
  netNames: string[];
  elems: Elem[];
  topMap: Map<string, number>;
  regs: Set<number>;
}

function elaborate(mods: ModuleAst[], top: ModuleAst): Flat {
  const netNames: string[] = [];
  const elems: Elem[] = [];
  const regs = new Set<number>();
  const newNet = (name: string) => { netNames.push(name); return netNames.length - 1; };
  const const0 = newNet("1'b0"), const1 = newNet("1'b1");
  let topMap = new Map<string, number>();
  function walk(m: ModuleAst, prefix: string, binding: Map<string, number>, depth: number): Map<string, number> {
    if (depth > 20) throw new Error('Modül örneklemesi çok derin (kendini mi örnekliyor?)');
    const map = new Map<string, number>();
    map.set("1'b0", const0);
    map.set("1'b1", const1);
    const get = (nm: string) => {
      if (!map.has(nm)) map.set(nm, binding.get(nm) ?? newNet(prefix + nm));
      return map.get(nm)!;
    };
    m.ports.forEach(get);
    m.declOrder.forEach(get);
    for (const [nm, k] of m.kinds) if (k === 'reg') regs.add(get(nm));
    if (m.udp) {
      const outName = m.ports.find((p) => m.dirs.get(p) === 'output') ?? m.ports[0];
      elems.push({ kind: 'udp', delay: 0, out: get(outName), ins: m.udp.inputs.map(get), udp: m.udp });
    }
    for (const g of m.gates)
      for (const o of g.out) elems.push({ kind: 'gate', type: g.type, delay: g.delay, out: get(o), ins: g.ins.map(get) });
    for (const a of m.assigns) {
      const env = new Map<string, number>();
      const collect = (e: VExpr) => {
        if (e.t === 'id') env.set(e.n, get(e.n));
        else if (e.t === 'un') collect(e.a);
        else if (e.t === 'bin') { collect(e.a); collect(e.b); }
        else if (e.t === 'tern') { collect(e.c); collect(e.a); collect(e.b); }
      };
      collect(a.expr);
      elems.push({ kind: 'assign', delay: a.delay, out: get(a.lhs), ins: [...env.values()], expr: a.expr, env });
    }
    for (const inst of m.insts) {
      const child = mods.find((x) => x.name === inst.module);
      if (!child) continue;
      const b = new Map<string, number>();
      if (Array.isArray(inst.conns)) inst.conns.forEach((sig, i) => child.ports[i] && b.set(child.ports[i], get(sig)));
      else for (const [k, sig] of Object.entries(inst.conns)) b.set(k, get(sig));
      walk(child, prefix + (inst.name ?? inst.module) + '.', b, depth + 1);
    }
    return map;
  }
  topMap = walk(top, '', new Map(), 0);
  return { netNames, elems, topMap, regs };
}

function evalGate(type: string, ins: V[]): V {
  switch (type) {
    case 'and': case 'nand': {
      let r: V = ins.some((v) => v === 0) ? 0 : ins.every((v) => v === 1) ? 1 : 2;
      if (type === 'nand') r = r === 2 ? 2 : r === 1 ? 0 : 1;
      return r;
    }
    case 'or': case 'nor': {
      let r: V = ins.some((v) => v === 1) ? 1 : ins.every((v) => v === 0) ? 0 : 2;
      if (type === 'nor') r = r === 2 ? 2 : r === 1 ? 0 : 1;
      return r;
    }
    case 'xor': case 'xnor': {
      if (ins.some((v) => v === 2)) return 2;
      let r = ins.reduce<number>((s, v) => s ^ v, 0) as V;
      if (type === 'xnor') r = r ? 0 : 1;
      return r;
    }
    case 'not':
      return ins[0] === 2 ? 2 : ins[0] ? 0 : 1;
    case 'buf':
      return ins[0];
  }
  return 2;
}

function evalExpr(e: VExpr, read: (n: string) => V): V {
  const not = (v: V): V => (v === 2 ? 2 : v ? 0 : 1);
  switch (e.t) {
    case 'num': return e.v;
    case 'id': return read(e.n);
    case 'un': return not(evalExpr(e.a, read));
    case 'tern': {
      const c = evalExpr(e.c, read);
      const a = evalExpr(e.a, read), b = evalExpr(e.b, read);
      if (c === 2) return a === b ? a : 2;
      return c ? a : b;
    }
    case 'bin': {
      const a = evalExpr(e.a, read), b = evalExpr(e.b, read);
      switch (e.op) {
        case '&': case '&&': return evalGate('and', [a, b]);
        case '|': case '||': return evalGate('or', [a, b]);
        case '^': return evalGate('xor', [a, b]);
        case '~^': case '^~': return evalGate('xnor', [a, b]);
        case '~&': return evalGate('nand', [a, b]);
        case '~|': return evalGate('nor', [a, b]);
        case '==': return a === 2 || b === 2 ? 2 : a === b ? 1 : 0;
        case '!=': return a === 2 || b === 2 ? 2 : a !== b ? 1 : 0;
      }
    }
  }
  return 2;
}

function evalUdp(u: UdpDef, ins: V[]): V {
  const sym = (v: V) => (v === 2 ? 'x' : String(v));
  for (const r of u.rows) {
    let ok = true;
    for (let i = 0; i < ins.length && ok; i++) {
      const e = r.ins[i], s = sym(ins[i]);
      ok = e === '?' || e === s || (e === 'b' && s !== 'x');
    }
    if (ok) return r.out;
  }
  return 2; // tabloda olmayan kombinasyon → x
}

function evalElem(el: Elem, flat: Flat, read: (net: number) => V): V {
  if (el.kind === 'gate') return evalGate(el.type!, el.ins.map(read));
  if (el.kind === 'udp') return evalUdp(el.udp!, el.ins.map(read));
  return evalExpr(el.expr!, (n) => read(el.env!.get(n)!));
  void flat;
}

// ---------------- Sonuçlar ----------------
export interface TruthResult {
  mode: 'truth';
  module: string;
  inputs: string[];
  outputs: string[];
  internals: string[];
  rows: { in: V[]; out: V[]; internal: V[] }[];
}
export interface WaveResult {
  mode: 'wave';
  module: string;
  endTime: number;
  signals: { name: string; values: V[]; isReg: boolean }[];
  changes: { t: number; name: string; v: V }[];
}
export interface SimOutput {
  diags: Diag[];
  modules: ModuleAst[];
  result?: TruthResult | WaveResult;
}

export function findTop(mods: ModuleAst[]): ModuleAst | undefined {
  const instantiated = new Set(mods.flatMap((m) => m.insts.map((i) => i.module)));
  const tops = mods.filter((m) => !instantiated.has(m.name));
  return tops.find((m) => m.initials.length > 0) ?? tops[tops.length - 1] ?? mods[mods.length - 1];
}

export function simulate(src: string, opts: { topName?: string; maxTime?: number } = {}): SimOutput {
  const { modules, diags } = parseVerilog(src);
  if (diags.some((d) => d.level === 'error')) return { diags, modules };
  lint(modules, diags);
  if (diags.some((d) => d.level === 'error')) return { diags, modules };
  const top = (opts.topName && modules.find((m) => m.name === opts.topName)) || findTop(modules);
  if (!top) return { diags, modules };
  let flat: Flat;
  try {
    flat = elaborate(modules, top);
  } catch (e) {
    diags.push({ line: top.line, level: 'error', msg: (e as Error).message });
    return { diags, modules };
  }
  const nNets = flat.netNames.length;

  const hasTestbench = top.initials.length > 0;
  if (!hasTestbench) {
    const inputs = top.ports.filter((p) => top.dirs.get(p) === 'input');
    const outputs = top.ports.filter((p) => top.dirs.get(p) === 'output');
    const internals = top.declOrder.filter((n) => !top.ports.includes(n));
    if (inputs.length > 6) {
      diags.push({ line: top.line, level: 'error', msg: 'Doğruluk tablosu için en fazla 6 giriş destekleniyor.' });
      return { diags, modules };
    }
    const rows: TruthResult['rows'] = [];
    let oscillation = false;
    for (let m = 0; m < 1 << inputs.length; m++) {
      const val = new Array<V>(nNets).fill(2);
      val[0] = 0; val[1] = 1;
      inputs.forEach((nm, i) => (val[flat.topMap.get(nm)!] = ((m >> (inputs.length - 1 - i)) & 1) as V));
      let changed = true, iter = 0;
      while (changed && iter < 200) {
        changed = false;
        iter++;
        for (const el of flat.elems) {
          const v = evalElem(el, flat, (k) => val[k]);
          if (val[el.out] !== v) { val[el.out] = v; changed = true; }
        }
      }
      if (changed) oscillation = true;
      rows.push({
        in: inputs.map((nm) => val[flat.topMap.get(nm)!]),
        out: outputs.map((nm) => val[flat.topMap.get(nm)!]),
        internal: internals.map((nm) => val[flat.topMap.get(nm)!]),
      });
    }
    if (oscillation) diags.push({ line: top.line, level: 'warning', msg: 'Devrede geri besleme (döngü) var; değerler kararlı hale gelmedi.' });
    return { diags, modules, result: { mode: 'truth', module: top.name, inputs, outputs, internals, rows } };
  }

  // ---- zamanlı simülasyon (test bench) ----
  const events: InitStmt[] = top.initials.flat();
  const finish = events.filter((e) => e.kind === 'finish').map((e) => e.at);
  const lastSet = Math.max(0, ...events.filter((e) => e.kind === 'set').map((e) => e.at));
  const sumDelay = flat.elems.reduce((s, e) => s + e.delay, 0);
  let endTime = finish.length ? Math.min(...finish) : lastSet + Math.max(50, sumDelay * 2);
  const cap = opts.maxTime ?? 5000;
  if (endTime > cap) {
    diags.push({ line: top.line, level: 'warning', msg: `Simülasyon ${cap} zaman biriminde kesildi.` });
    endTime = cap;
  }
  if (!finish.length) diags.push({ line: top.line, level: 'info', msg: `$finish bulunamadı; simülasyon t=${endTime}'de durduruldu. (initial #200 $finish; eklemeniz önerilir.)` });
  const T = Math.floor(endTime);
  const hist: V[][] = Array.from({ length: nNets }, () => new Array<V>(T + 1).fill(2));
  hist[0].fill(0); hist[1].fill(1);
  const sets = events.filter((e) => e.kind === 'set').sort((a, b) => a.at - b.at);
  const delayed = flat.elems.filter((e) => e.delay > 0);
  const zero = flat.elems.filter((e) => e.delay === 0);
  const topRegs = new Map<string, number>();
  for (const [nm, id] of flat.topMap) if (flat.regs.has(id)) topRegs.set(nm, id);
  for (let t = 0; t <= T; t++) {
    // reg'ler değerini korur
    for (const id of flat.regs) hist[id][t] = t > 0 ? hist[id][t - 1] : 2;
    for (const s of sets) if (Math.floor(s.at) === t && s.lhs) {
      const id = flat.topMap.get(s.lhs);
      if (id === undefined) continue;
      hist[id][t] = evalExpr(s.expr!, (n) => hist[flat.topMap.get(n) ?? 0][t]);
    }
    for (const el of delayed) {
      const tt = t - Math.round(el.delay);
      hist[el.out][t] = tt < 0 ? 2 : evalElem(el, flat, (k) => hist[k][tt]);
    }
    let changed = true, iter = 0;
    while (changed && iter < 100) {
      changed = false;
      iter++;
      for (const el of zero) {
        const v = evalElem(el, flat, (k) => hist[k][t]);
        if (hist[el.out][t] !== v) { hist[el.out][t] = v; changed = true; }
      }
    }
  }
  // gösterilecek sinyaller: test bench'teki tüm isimler (önce reg'ler)
  const shown = top.declOrder.length ? top.declOrder : [...flat.topMap.keys()].filter((k) => !k.startsWith("1'b"));
  const ordered = [...shown.filter((n) => top.kinds.get(n) === 'reg'), ...shown.filter((n) => top.kinds.get(n) !== 'reg')];
  const signals = ordered.map((name) => ({ name, values: hist[flat.topMap.get(name)!], isReg: top.kinds.get(name) === 'reg' }));
  const changes: WaveResult['changes'] = [];
  for (const s of signals)
    s.values.forEach((v, t) => {
      if (t === 0 ? v !== 2 : v !== s.values[t - 1]) changes.push({ t, name: s.name, v });
    });
  changes.sort((a, b) => a.t - b.t);
  return { diags, modules, result: { mode: 'wave', module: top.name, endTime: T, signals, changes } };
}

/** Bir modülü verilen hedef fonksiyona karşı test eder (alıştırma değerlendirmesi). */
export function gradeModule(
  src: string,
  spec: { module?: string; inputs: string[]; outputs: Record<string, (env: Record<string, number>) => number>; care?: (env: Record<string, number>) => boolean },
): { ok: boolean; messages: string[]; sim: SimOutput } {
  const sim = simulate(src, { topName: spec.module });
  const messages: string[] = [];
  if (sim.diags.some((d) => d.level === 'error') || !sim.result) return { ok: false, messages: ['Kod derlenemedi; önce hataları düzeltin.'], sim };
  if (sim.result.mode !== 'truth') return { ok: false, messages: ['Bu alıştırmada test bench değil, devre modülü bekleniyor.'], sim };
  const r = sim.result;
  if (spec.module && r.module !== spec.module) messages.push(`Modül adı "${spec.module}" olmalı (sizinki: "${r.module}").`);
  const missingIn = spec.inputs.filter((i) => !r.inputs.includes(i));
  const missingOut = Object.keys(spec.outputs).filter((o) => !r.outputs.includes(o));
  if (missingIn.length) messages.push(`Eksik giriş(ler): ${missingIn.join(', ')}`);
  if (missingOut.length) messages.push(`Eksik çıkış(lar): ${missingOut.join(', ')}`);
  if (missingIn.length || missingOut.length) return { ok: false, messages, sim };
  let wrong = 0;
  for (const row of r.rows) {
    const env: Record<string, number> = {};
    r.inputs.forEach((nm, i) => (env[nm] = row.in[i]));
    if (spec.care && !spec.care(env)) continue;
    for (const [o, f] of Object.entries(spec.outputs)) {
      const got = row.out[r.outputs.indexOf(o)];
      if (got !== f(env)) {
        wrong++;
        if (wrong <= 3) messages.push(`${spec.inputs.map((i) => `${i}=${env[i]}`).join(', ')} için ${o} = ${got === 2 ? 'x' : got} çıktı, ${f(env)} olmalıydı.`);
      }
    }
  }
  return { ok: wrong === 0 && messages.length === 0, messages, sim };
}
