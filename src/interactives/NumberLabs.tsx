import { useMemo, useState } from 'react';
import {
  CODE_TABLE, DIGITS, addInBase, asciiCode, baseToDecimal, binToGray, diminishedComplement, formatNum, fracToBaseSteps,
  groupBinary, intToBaseSteps, isValidInBase, parityBit, radixComplement, signedViews, toSignedBinary,
} from '../lib/numbers';
import { En } from '../components/ui';

const BASES = [2, 8, 10, 16];
const baseName: Record<number, string> = { 2: 'ikili (binary)', 8: 'sekizli (octal)', 10: 'onlu (decimal)', 16: 'onaltılı (hex)' };

function BaseSelect({ value, onChange }: { value: number; onChange: (b: number) => void }) {
  return (
    <div className="seg">
      {BASES.map((b) => (
        <button key={b} className={b === value ? 'active' : ''} onClick={() => onChange(b)}>
          {b}
        </button>
      ))}
    </div>
  );
}

// ------------------------------------------------------------------
export function BaseConverter({ initial = '41.6875', from: f0 = 10, to: t0 = 2 }: { initial?: string; from?: number; to?: number }) {
  const [val, setVal] = useState(initial);
  const [from, setFrom] = useState(f0);
  const [to, setTo] = useState(t0);
  const clean = val.trim().toUpperCase();
  const valid = clean !== '' && isValidInBase(clean, from) && clean.length <= 14;

  const result = useMemo(() => {
    if (!valid) return null;
    const [ip, fp = ''] = clean.split('.');
    // 1) önce ondalığa
    const dec = baseToDecimal(clean, from);
    const intDec = from === 10 ? parseInt(ip, 10) : baseToDecimal(ip, from).value;
    // kesir kısmı: kesin olarak onluk basamak dizisine çevir (8 basamağa kadar)
    let fracStr = '';
    if (fp) {
      if (from === 10) fracStr = fp;
      else {
        const fv = baseToDecimal('0.' + fp, from).value;
        fracStr = fv.toFixed(8).split('.')[1].replace(/0+$/, '') || '0';
      }
    }
    const intSteps = intToBaseSteps(intDec, to);
    const fracSteps = fp ? fracToBaseSteps(fracStr, to, 8) : null;
    const shortcut = (from === 2 && (to === 8 || to === 16)) || ((from === 8 || from === 16) && to === 2);
    return { dec, intDec, fracStr, intSteps, fracSteps, shortcut, ip, fp };
  }, [clean, from, to, valid]);

  const final = result ? result.intSteps.result + (result.fracSteps ? '.' + (result.fracSteps.result || '0') : '') : '';

  return (
    <div className="lab">
      <div className="lab-title">🔁 Adım Adım Taban Dönüştürücü</div>
      <div className="lab-controls">
        <label>
          Sayı
          <input className="q-input mono" value={val} onChange={(e) => setVal(e.target.value)} spellCheck={false} />
        </label>
        <label>
          Kaynak taban
          <BaseSelect value={from} onChange={setFrom} />
        </label>
        <label>
          Hedef taban
          <BaseSelect value={to} onChange={setTo} />
        </label>
      </div>
      {!valid && <div className="lab-err">Bu sayı {from} tabanında geçerli değil (kullanılabilir rakamlar: {DIGITS.slice(0, from).split('').join(' ')}).</div>}
      {result && (
        <>
          <div className="result-line">
            <span className="mono">({clean})<sub>{from}</sub></span> = <span className="mono big">({final})<sub>{to}</sub></span>
            {result.fracSteps && !result.fracSteps.exact && <span className="muted small"> (kesir 8 basamakta kesildi)</span>}
          </div>

          {result.shortcut && (
            <div className="step-card">
              <div className="step-h">⚡ Kısa yol: gruplama</div>
              {from === 2 ? (
                <GroupView bin={clean} size={to === 8 ? 3 : 4} />
              ) : (
                <div className="mono">
                  Her {from === 8 ? 'octal' : 'hex'} basamağı {from === 8 ? '3' : '4'} bitle yazılır:{' '}
                  {[...clean].map((c, i) =>
                    c === '.' ? <span key={i}> . </span> : (
                      <span key={i} className="grp">
                        <b>{c}</b>→{parseInt(c, 16).toString(2).padStart(from === 8 ? 3 : 4, '0')}
                      </span>
                    ),
                  )}
                </div>
              )}
              <div className="muted small">Aşağıda aynı sonuca uzun yoldan (onluk üzerinden) nasıl gidildiği de gösteriliyor.</div>
            </div>
          )}

          {from !== 10 && (
            <div className="step-card">
              <div className="step-h">Adım 1 — Onluğa çevir: her basamak × taban<sup>konum</sup></div>
              <div className="mono wrap">
                {result.dec.terms.map((t, i) => (
                  <span key={i}>
                    {i > 0 && ' + '}
                    {t.digit}×{from}
                    <sup>{t.power}</sup>
                  </span>
                ))}
                {' = '}
                {result.dec.terms.map((t, i) => (
                  <span key={i}>
                    {i > 0 && ' + '}
                    {formatNum(t.value)}
                  </span>
                ))}
                {' = '}
                <b>{formatNum(result.dec.value)}</b>
              </div>
            </div>
          )}

          {to !== 10 && (
            <div className="step-card">
              <div className="step-h">
                {from !== 10 ? 'Adım 2' : 'Adım 1'} — Tam kısım: sürekli {to}'ye böl, kalanları <b>aşağıdan yukarı</b> oku
              </div>
              <table className="tbl compact steps-tbl">
                <thead>
                  <tr>
                    <th>Bölünen</th>
                    <th>÷ {to}</th>
                    <th>Bölüm</th>
                    <th>Kalan</th>
                  </tr>
                </thead>
                <tbody>
                  {result.intSteps.steps.map((s, i) => (
                    <tr key={i}>
                      <td>{s.dividend}</td>
                      <td>÷ {to}</td>
                      <td>{s.quotient}</td>
                      <td className="rem">{DIGITS[s.remainder]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mono">
                Kalanlar ters sırada: <b>{result.intSteps.result}</b> <span className="muted">(ilk kalan = en düşük basamak, LSB)</span>
              </div>
            </div>
          )}

          {to !== 10 && result.fracSteps && (
            <div className="step-card">
              <div className="step-h">Kesir kısmı: sürekli {to} ile çarp, tam kısımları <b>yukarıdan aşağı</b> oku</div>
              <table className="tbl compact steps-tbl">
                <thead>
                  <tr>
                    <th>Kesir</th>
                    <th>× {to}</th>
                    <th>Sonuç</th>
                    <th>Tam kısım</th>
                  </tr>
                </thead>
                <tbody>
                  {result.fracSteps.steps.map((s, i) => (
                    <tr key={i}>
                      <td>{s.frac}</td>
                      <td>× {to}</td>
                      <td>{s.product}</td>
                      <td className="rem">{DIGITS[s.digit]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mono">
                Kesir: <b>0.{result.fracSteps.result || '0'}</b> {result.fracSteps.exact ? <span className="muted">(kesir 0'a ulaştı → kesin sonuç)</span> : <span className="muted">(bitmeyen kesir — istenen basamakta durulur)</span>}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function GroupView({ bin, size }: { bin: string; size: 3 | 4 }) {
  const { groups, fracGroups } = groupBinary(bin, size);
  const conv = (g: string) => DIGITS[parseInt(g, 2)];
  return (
    <div className="group-view">
      <div className="muted small">Noktadan başlayarak {size}'erli gruplara ayır (eksikleri 0 ile tamamla):</div>
      <div className="groups">
        {groups.map((g, i) => (
          <div className="gcell" key={i}>
            <div className="mono">{g}</div>
            <div className="gdig">{conv(g)}</div>
          </div>
        ))}
        {fracGroups.length > 0 && <div className="gdot">.</div>}
        {fracGroups.map((g, i) => (
          <div className="gcell" key={'f' + i}>
            <div className="mono">{g}</div>
            <div className="gdig">{conv(g)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
export function ComplementLab() {
  const [base, setBase] = useState<2 | 10>(10);
  const [M, setM] = useState('72532');
  const [N, setN] = useState('3250');
  const valid = isValidInBase(M, base) && isValidInBase(N, base) && !M.includes('.') && !N.includes('.') && M.length <= 12 && N.length <= 12;
  const r = useMemo(() => {
    if (!valid) return null;
    const n = Math.max(M.length, N.length);
    const Mp = M.padStart(n, '0'), Np = N.padStart(n, '0');
    const dim = diminishedComplement(Np, base);
    const rad = radixComplement(Np, base);
    const sum = addInBase(Mp, rad, base);
    let resultText: string;
    let negative = false;
    if (sum.carryOut) resultText = sum.sum.replace(/^0+(?=.)/, '');
    else {
      negative = true;
      resultText = '-' + radixComplement(sum.sum, base).replace(/^0+(?=.)/, '');
    }
    return { n, Mp, Np, dim, rad, sum, resultText, negative };
  }, [M, N, base, valid]);
  const rName = base === 10 ? "10's complement" : "2's complement";
  const dName = base === 10 ? "9's complement" : "1's complement";
  return (
    <div className="lab">
      <div className="lab-title">➖ Tümleyen ile Çıkarma Laboratuvarı (M − N)</div>
      <div className="lab-controls">
        <label>
          Taban
          <div className="seg">
            <button className={base === 10 ? 'active' : ''} onClick={() => { setBase(10); setM('72532'); setN('3250'); }}>10</button>
            <button className={base === 2 ? 'active' : ''} onClick={() => { setBase(2); setM('1010100'); setN('1000011'); }}>2</button>
          </div>
        </label>
        <label>
          M (eksilen)
          <input className="q-input mono" value={M} onChange={(e) => setM(e.target.value.trim())} />
        </label>
        <label>
          N (çıkan)
          <input className="q-input mono" value={N} onChange={(e) => setN(e.target.value.trim())} />
        </label>
      </div>
      {!valid && <div className="lab-err">Sadece {base} tabanında, noktasız sayılar girin.</div>}
      {r && (
        <div className="calc">
          <div className="step-card">
            <div className="step-h">1) Basamak sayısını eşitle (n = {r.n})</div>
            <div className="mono">M = {r.Mp}, N = {r.Np}</div>
          </div>
          <div className="step-card">
            <div className="step-h">2) N'nin {rName}'ini bul</div>
            <div className="mono">
              {dName}: her basamak ({base - 1} − basamak) → <b>{r.dim}</b>
              <br />
              {rName} = {dName} + 1 → <b>{r.rad}</b>
            </div>
          </div>
          <div className="step-card">
            <div className="step-h">3) M + ({rName} of N)</div>
            <pre className="addition">
{`   ${r.Mp}
 + ${r.rad}
 ${'-'.repeat(r.n + 2)}
  ${r.sum.carryOut ? '1' : ' '}${r.sum.sum}`}
            </pre>
          </div>
          <div className="step-card">
            <div className="step-h">4) Son elde (end carry) var mı?</div>
            {r.sum.carryOut ? (
              <div>
                ✅ Evet → elde atılır (<b>discard</b>). Sonuç pozitiftir: <b className="mono">{r.resultText}</b>
              </div>
            ) : (
              <div>
                ❌ Hayır → M &lt; N, sonuç negatiftir. Toplamın {rName}'ini al ve başına − koy: <b className="mono">{r.resultText}</b>
              </div>
            )}
          </div>
          <div className="result-line">
            Sonuç: <span className="mono big">{r.resultText}</span>
            <span className="muted small">
              {' '}
              (kontrol: {parseInt(M, base)} − {parseInt(N, base)} = {parseInt(M, base) - parseInt(N, base)}
              {base === 2 ? ' onlukta' : ''})
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
export function SignedLab() {
  const [n, setN] = useState(8);
  const [b, setB] = useState('11111001');
  const bitsStr = b.padStart(n, '0').slice(-n);
  const v = signedViews(bitsStr);
  const [dec, setDec] = useState('-9');
  const dv = parseInt(dec, 10);
  const toggle = (i: number) => setB(bitsStr.slice(0, i) + (bitsStr[i] === '1' ? '0' : '1') + bitsStr.slice(i + 1));
  return (
    <div className="lab">
      <div className="lab-title">± İşaretli Sayı Görselleştirici</div>
      <div className="lab-controls">
        <label>
          Bit sayısı
          <div className="seg">
            {[4, 8].map((k) => (
              <button key={k} className={n === k ? 'active' : ''} onClick={() => { setN(k); setB(k === 4 ? '1001' : '11111001'); }}>
                {k}
              </button>
            ))}
          </div>
        </label>
      </div>
      <div className="muted small">Bitlere tıklayarak değiştir. En soldaki bit <b>işaret biti</b> <En>sign bit</En>: 0 = pozitif, 1 = negatif.</div>
      <div className="bit-row">
        {[...bitsStr].map((c, i) => (
          <button key={i} className={`bit ${c === '1' ? 'on' : ''} ${i === 0 ? 'sign' : ''}`} onClick={() => toggle(i)}>
            {c}
            <span className="bit-w">{i === 0 ? 'işaret' : 2 ** (n - 1 - i)}</span>
          </button>
        ))}
      </div>
      <table className="tbl compact">
        <thead>
          <tr>
            <th>Yorum (interpretation)</th>
            <th>Değer</th>
            <th>Nasıl?</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Unsigned (işaretsiz)</td>
            <td className="mono big">{v.unsigned}</td>
            <td className="small">Tüm bitler ağırlıklarıyla toplanır.</td>
          </tr>
          <tr>
            <td>Signed-magnitude</td>
            <td className="mono big">{v.signMagnitude === 0 && bitsStr[0] === '1' ? '−0' : v.signMagnitude}</td>
            <td className="small">İşaret biti + kalan bitler büyüklük.</td>
          </tr>
          <tr>
            <td>Signed-1's-complement</td>
            <td className="mono big">{v.onesComplement === 0 && bitsStr[0] === '1' ? '−0' : v.onesComplement}</td>
            <td className="small">Negatifse: tüm bitleri ters çevir → büyüklük.</td>
          </tr>
          <tr className="hl">
            <td>
              <b>Signed-2's-complement</b>
            </td>
            <td className="mono big">{v.twosComplement}</td>
            <td className="small">Negatifse: 2's complement al → büyüklük. (MSB ağırlığı −{2 ** (n - 1)})</td>
          </tr>
        </tbody>
      </table>
      <div className="step-card">
        <div className="step-h">Ondalıktan üç gösterime</div>
        <label className="inline">
          Sayı: <input className="q-input mono short" value={dec} onChange={(e) => setDec(e.target.value)} />
        </label>
        {!isNaN(dv) && (
          <table className="tbl compact">
            <tbody>
              {(['sm', 'ones', 'twos'] as const).map((k) => (
                <tr key={k}>
                  <td>{k === 'sm' ? 'Signed-magnitude' : k === 'ones' ? "Signed-1's-complement" : "Signed-2's-complement"}</td>
                  <td className="mono big">{toSignedBinary(dv, n, k) ?? `${n} bite sığmaz`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
export function TwosAdder() {
  const [a, setA] = useState('-6');
  const [b, setB] = useState('13');
  const n = 8;
  const av = parseInt(a, 10), bv = parseInt(b, 10);
  const ok = !isNaN(av) && !isNaN(bv) && Math.abs(av) <= 128 && Math.abs(bv) <= 128;
  const A = ok ? toSignedBinary(av, n, 'twos') : null;
  const B = ok ? toSignedBinary(bv, n, 'twos') : null;
  const sum = A && B ? addInBase(A, B, 2) : null;
  const res = sum ? signedViews(sum.sum).twosComplement : 0;
  const overflow = ok && (av + bv > 127 || av + bv < -128);
  const cin = sum ? sum.carries[1] : 0; // MSB'ye giren elde
  return (
    <div className="lab">
      <div className="lab-title">➕ 8-bit 2's Complement Toplama</div>
      <div className="lab-controls">
        <label>
          A <input className="q-input mono short" value={a} onChange={(e) => setA(e.target.value)} />
        </label>
        <label>
          B <input className="q-input mono short" value={b} onChange={(e) => setB(e.target.value)} />
        </label>
      </div>
      {(!A || !B) && <div className="lab-err">−128 … +127 aralığında sayılar girin.</div>}
      {A && B && sum && (
        <>
          <pre className="addition">
{`   ${A}   (${av})
 + ${B}   (${bv})
 ----------
 ${sum.carryOut}${' '}${sum.sum}   → ${res}`}
          </pre>
          <div className="small">
            Son elde (carry out) = {sum.carryOut} → <b>2's complement toplamada son elde her zaman atılır.</b> İşaret bitleri dahil her şey normal toplanır.
          </div>
          {overflow ? (
            <div className="lab-err">
              ⚠️ <b>Taşma (overflow)!</b> Gerçek sonuç {av + bv} ama 8 bitte gösterilemez. İpucu: MSB'ye giren elde ({cin}) ≠ MSB'den çıkan elde ({sum.carryOut}).
            </div>
          ) : (
            <div className="ok-line">✓ Sonuç doğru: {res}</div>
          )}
        </>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
export function BcdAdder() {
  const [a, setA] = useState('184');
  const [b, setB] = useState('576');
  const valid = /^\d{1,4}$/.test(a) && /^\d{1,4}$/.test(b);
  const cols = useMemo(() => {
    if (!valid) return [];
    const n = Math.max(a.length, b.length);
    const A = a.padStart(n, '0'), B = b.padStart(n, '0');
    let carry = 0;
    const out: { da: number; db: number; cin: number; raw: number; fix: boolean; digit: number; cout: number }[] = [];
    for (let i = n - 1; i >= 0; i--) {
      const da = +A[i], db = +B[i];
      const raw = da + db + carry;
      const fix = raw > 9;
      out.unshift({ da, db, cin: carry, raw, fix, digit: raw % 10, cout: fix ? 1 : 0 });
      carry = fix ? 1 : 0;
    }
    return out;
  }, [a, b, valid]);
  const b4 = (x: number) => x.toString(2).padStart(4, '0');
  return (
    <div className="lab">
      <div className="lab-title">🔢 BCD Toplama (6 düzeltmesi)</div>
      <div className="lab-controls">
        <label>
          A <input className="q-input mono short" value={a} onChange={(e) => setA(e.target.value)} />
        </label>
        <label>
          B <input className="q-input mono short" value={b} onChange={(e) => setB(e.target.value)} />
        </label>
      </div>
      {!valid && <div className="lab-err">En fazla 4 basamaklı onluk sayılar girin.</div>}
      {valid && (
        <div className="bcd-cols">
          {cols.map((c, i) => (
            <div key={i} className="bcd-col">
              <div className="muted small">basamak {cols.length - i}</div>
              {c.cin ? <div className="carry">elde 1</div> : <div className="carry dim">elde 0</div>}
              <div className="mono">{b4(c.da)} ({c.da})</div>
              <div className="mono">+{b4(c.db)} ({c.db})</div>
              <div className="mono line">= {c.raw > 15 ? '1 ' + b4(c.raw - 16) : b4(c.raw)} ({c.raw})</div>
              {c.fix ? (
                <>
                  <div className="mono fix">+0110 (6) ← {'>'} 9, düzelt!</div>
                  <div className="mono res">
                    <span className="carry-out">1</span> {b4(c.digit)} ({c.digit})
                  </div>
                </>
              ) : (
                <div className="mono res">{b4(c.digit)} ({c.digit}) ✓</div>
              )}
            </div>
          ))}
        </div>
      )}
      {valid && (
        <div className="result-line">
          Sonuç: <span className="mono big">{(cols[0]?.cout ? '0001 ' : '') + cols.map((c) => b4(c.digit)).join(' ')}</span> = {+a + +b}
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
export function CodeExplorer() {
  const [d, setD] = useState(5);
  const [txt, setTxt] = useState('G. Boole');
  const [par, setPar] = useState<'even' | 'odd'>('even');
  return (
    <div className="lab">
      <div className="lab-title">🧬 Kod Gezgini</div>
      <div className="muted small">Bir onluk basamak seç:</div>
      <div className="seg wrap">
        {Array.from({ length: 10 }, (_, i) => (
          <button key={i} className={i === d ? 'active' : ''} onClick={() => setD(i)}>
            {i}
          </button>
        ))}
      </div>
      <table className="tbl compact">
        <thead>
          <tr>
            <th>Kod</th>
            <th>{d} için</th>
            <th>Not</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>BCD (8421)</td>
            <td className="mono big">{CODE_TABLE.BCD[d]}</td>
            <td className="small">Ağırlıklar 8-4-2-1; düz ikili.</td>
          </tr>
          <tr>
            <td>2421</td>
            <td className="mono big">{CODE_TABLE['2421'][d]}</td>
            <td className="small">Self-complementing (kendini tümleyen).</td>
          </tr>
          <tr>
            <td>Excess-3</td>
            <td className="mono big">{CODE_TABLE['Excess-3'][d]}</td>
            <td className="small">BCD + 3 (0011). Ağırlıksız, self-complementing.</td>
          </tr>
          <tr>
            <td>8, 4, −2, −1</td>
            <td className="mono big">{CODE_TABLE['8,4,-2,-1'][d]}</td>
            <td className="small">Negatif ağırlıklı, self-complementing.</td>
          </tr>
          <tr>
            <td>Gray (4-bit)</td>
            <td className="mono big">{binToGray(d.toString(2).padStart(4, '0'))}</td>
            <td className="small">Ardışık sayılar arasında yalnızca 1 bit değişir.</td>
          </tr>
        </tbody>
      </table>
      <div className="step-card">
        <div className="step-h">ASCII + parite biti</div>
        <div className="lab-controls">
          <label>
            Metin <input className="q-input mono" value={txt} maxLength={16} onChange={(e) => setTxt(e.target.value)} />
          </label>
          <label>
            Parite
            <div className="seg">
              <button className={par === 'even' ? 'active' : ''} onClick={() => setPar('even')}>
                çift (even)
              </button>
              <button className={par === 'odd' ? 'active' : ''} onClick={() => setPar('odd')}>
                tek (odd)
              </button>
            </div>
          </label>
        </div>
        <div className="ascii-grid">
          {[...txt].filter((c) => c.charCodeAt(0) < 128).map((c, i) => {
            const code = asciiCode(c);
            const p = parityBit(code, par);
            return (
              <div key={i} className="ascii-cell">
                <div className="ascii-ch">{c === ' ' ? '␣' : c}</div>
                <div className="mono">
                  <span className="parity">{p}</span>
                  {code}
                </div>
                <div className="muted small">hex {c.charCodeAt(0).toString(16).toUpperCase()}</div>
              </div>
            );
          })}
        </div>
        <div className="muted small">
          Kırmızı bit = parite biti (en sola eklendi). {par === 'even' ? 'Çift paritede toplam 1 sayısı çift olur.' : 'Tek paritede toplam 1 sayısı tek olur.'}
        </div>
      </div>
    </div>
  );
}

export { baseName };
