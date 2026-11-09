// Sayı sistemleri yardımcıları — tüm adımlar "öğretici" biçimde döner.

export const DIGITS = '0123456789ABCDEF';

export function digitVal(c: string): number {
  return DIGITS.indexOf(c.toUpperCase());
}

export function isValidInBase(s: string, base: number): boolean {
  const clean = s.trim().toUpperCase();
  if (!/^[0-9A-F]+(\.[0-9A-F]+)?$/.test(clean)) return false;
  return [...clean.replace('.', '')].every((c) => digitVal(c) >= 0 && digitVal(c) < base);
}

export interface DivStep {
  dividend: number;
  quotient: number;
  remainder: number;
}

/** Tam sayı kısmı: tekrarlı bölme (kalanlar ters sırada okunur). */
export function intToBaseSteps(n: number, base: number): { steps: DivStep[]; result: string } {
  const steps: DivStep[] = [];
  if (n === 0) return { steps: [{ dividend: 0, quotient: 0, remainder: 0 }], result: '0' };
  let x = n;
  while (x > 0) {
    steps.push({ dividend: x, quotient: Math.floor(x / base), remainder: x % base });
    x = Math.floor(x / base);
  }
  return { steps, result: steps.map((s) => DIGITS[s.remainder]).reverse().join('') };
}

export interface MulStep {
  frac: string; // örn "0.6875"
  product: string; // örn "1.3750"
  digit: number;
}

/** Kesir kısmı: tekrarlı çarpma (tam kısımlar yukarıdan aşağı okunur). Kesin aritmetik. */
export function fracToBaseSteps(fracDigits: string, base: number, maxDigits = 8): { steps: MulStep[]; result: string; exact: boolean } {
  // fracDigits: "6875" -> 0.6875
  const k = fracDigits.length;
  const den = 10 ** k;
  let num = parseInt(fracDigits || '0', 10);
  const steps: MulStep[] = [];
  const fmt = (v: number) => (v / den).toFixed(k);
  while (num !== 0 && steps.length < maxDigits) {
    const prod = num * base;
    const digit = Math.floor(prod / den);
    steps.push({ frac: fmt(num), product: (prod / den).toFixed(k), digit });
    num = prod % den;
  }
  return { steps, result: steps.map((s) => DIGITS[s.digit]).join(''), exact: num === 0 };
}

/** r tabanındaki sayıyı ondalığa çevirir; açılımı (terimleri) da döner. */
export function baseToDecimal(s: string, base: number): { value: number; terms: { digit: string; power: number; value: number }[] } {
  const clean = s.trim().toUpperCase();
  const [ip, fp = ''] = clean.split('.');
  const terms: { digit: string; power: number; value: number }[] = [];
  [...ip].forEach((c, i) => {
    const power = ip.length - 1 - i;
    terms.push({ digit: c, power, value: digitVal(c) * base ** power });
  });
  [...fp].forEach((c, i) => {
    const power = -(i + 1);
    terms.push({ digit: c, power, value: digitVal(c) * base ** power });
  });
  return { value: terms.reduce((a, t) => a + t.value, 0), terms };
}

export function formatNum(v: number): string {
  const s = v.toFixed(8);
  return s.replace(/\.?0+$/, '');
}

/** İkiliyi 3'lü (octal) veya 4'lü (hex) gruplara ayır, nokta etrafından başlayarak. */
export function groupBinary(bin: string, size: 3 | 4): { groups: string[]; fracGroups: string[] } {
  const [ip, fp = ''] = bin.split('.');
  const padI = ip.padStart(Math.ceil(ip.length / size) * size, '0');
  const padF = fp ? fp.padEnd(Math.ceil(fp.length / size) * size, '0') : '';
  const groups: string[] = [];
  for (let i = 0; i < padI.length; i += size) groups.push(padI.slice(i, i + size));
  const fracGroups: string[] = [];
  for (let i = 0; i < padF.length; i += size) fracGroups.push(padF.slice(i, i + size));
  return { groups, fracGroups };
}

/** (r-1)'s complement: her basamağı (r-1)'den çıkar. */
export function diminishedComplement(s: string, base: number): string {
  return [...s.toUpperCase()].map((c) => (c === '.' ? '.' : DIGITS[base - 1 - digitVal(c)])).join('');
}

/** r's complement (tam sayılar): (r-1)'s complement + 1 */
export function radixComplement(s: string, base: number): string {
  const d = diminishedComplement(s, base);
  const arr = [...d].map(digitVal);
  let carry = 1;
  for (let i = arr.length - 1; i >= 0 && carry; i--) {
    const v = arr[i] + carry;
    arr[i] = v % base;
    carry = v >= base ? 1 : 0;
  }
  return arr.map((x) => DIGITS[x]).join('');
}

/** 2's complement kısa yol: sağdan ilk 1'e kadar (dahil) aynen yaz, sonra hepsini ters çevir. */
export function twosComplementShortcut(bin: string): { keep: string; flip: string; result: string } {
  const idx = bin.lastIndexOf('1');
  if (idx < 0) return { keep: bin, flip: '', result: bin };
  const keep = bin.slice(idx);
  const flipSrc = bin.slice(0, idx);
  const flip = [...flipSrc].map((b) => (b === '1' ? '0' : '1')).join('');
  return { keep, flip, result: flip + keep };
}

/** Taban r'de iki tam sayıyı topla (aynı uzunluk), elde (carry) taşmasını döndür. */
export function addInBase(a: string, b: string, base: number): { sum: string; carryOut: number; carries: number[] } {
  const n = Math.max(a.length, b.length);
  const A = a.padStart(n, '0'), B = b.padStart(n, '0');
  let carry = 0;
  const out: string[] = [];
  const carries: number[] = new Array(n + 1).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    const v = digitVal(A[i]) + digitVal(B[i]) + carry;
    out.unshift(DIGITS[v % base]);
    carry = v >= base ? 1 : 0;
    carries[i] = carry;
  }
  return { sum: out.join(''), carryOut: carry, carries };
}

/** n-bit işaretli gösterimler */
export function signedViews(bitsStr: string) {
  const n = bitsStr.length;
  const u = parseInt(bitsStr, 2);
  const sign = bitsStr[0] === '1';
  const mag = parseInt(bitsStr.slice(1) || '0', 2);
  return {
    unsigned: u,
    signMagnitude: sign ? -mag : mag,
    onesComplement: sign ? -((2 ** n - 1) - u) : u,
    twosComplement: sign ? u - 2 ** n : u,
  };
}

export function toSignedBinary(value: number, n: number, kind: 'sm' | 'ones' | 'twos'): string | null {
  const max = kind === 'twos' ? 2 ** (n - 1) - 1 : 2 ** (n - 1) - 1;
  const min = kind === 'twos' ? -(2 ** (n - 1)) : -(2 ** (n - 1) - 1);
  if (value > max || value < min) return null;
  if (value >= 0) return value.toString(2).padStart(n, '0');
  const mag = (-value).toString(2).padStart(n, '0');
  if (kind === 'sm') return '1' + mag.slice(1);
  const ones = [...mag].map((b) => (b === '1' ? '0' : '1')).join('');
  if (kind === 'ones') return ones;
  return (2 ** n + value).toString(2).padStart(n, '0');
}

// ----------- Kodlar -----------
export const BCD_WEIGHTS = {
  '8421': [8, 4, 2, 1],
  '2421': [2, 4, 2, 1],
  '84-2-1': [8, 4, -2, -1],
};

export const CODE_TABLE: Record<string, string[]> = {
  BCD: ['0000', '0001', '0010', '0011', '0100', '0101', '0110', '0111', '1000', '1001'],
  '2421': ['0000', '0001', '0010', '0011', '0100', '1011', '1100', '1101', '1110', '1111'],
  'Excess-3': ['0011', '0100', '0101', '0110', '0111', '1000', '1001', '1010', '1011', '1100'],
  '8,4,-2,-1': ['0000', '0111', '0110', '0101', '0100', '1011', '1010', '1001', '1000', '1111'],
};

export function toBCD(dec: string): string {
  return [...dec].map((d) => CODE_TABLE.BCD[+d]).join(' ');
}

export function binToGray(b: string): string {
  let g = b[0];
  for (let i = 1; i < b.length; i++) g += b[i] === b[i - 1] ? '0' : '1';
  return g;
}
export function grayToBin(g: string): string {
  let b = g[0];
  for (let i = 1; i < g.length; i++) b += g[i] === b[i - 1] ? '0' : '1';
  return b;
}

export function parityBit(bitsStr: string, kind: 'even' | 'odd'): string {
  const ones = [...bitsStr].filter((b) => b === '1').length;
  const even = ones % 2 === 0 ? '0' : '1';
  return kind === 'even' ? even : even === '0' ? '1' : '0';
}

export function asciiCode(ch: string): string {
  return ch.charCodeAt(0).toString(2).padStart(7, '0');
}

export function randInt(a: number, b: number) {
  return a + Math.floor(Math.random() * (b - a + 1));
}
