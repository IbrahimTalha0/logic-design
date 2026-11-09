import { Box, Def, En, Formula, KeyPoints, Reveal, Table } from '../components/ui';
import { Drill } from '../components/Drill';
import { EquivalenceChecker, GatePlayground, TruthTableLab } from '../interactives/LogicLabs';
import { GateIcon } from '../components/Gate';
import { mintermsOf, sigma, pi, termSOP } from '../lib/boolean';
import { randInt } from '../lib/numbers';
import type { LessonDef } from '../data/types';

const V3 = ['x', 'y', 'z'];
const ABC = ['A', 'B', 'C'];

// =====================================================================
// 2.1 Boole cebri: postülalar ve teoremler
// =====================================================================
function L2_1() {
  return (
    <>
      <p>
        <b>Boole cebri</b> <En>Boolean algebra</En>, 0 ve 1 ile yapılan mantık işlemlerinin matematiğidir. George Boole 1854'te geliştirdi; Claude Shannon 1938'de
        anahtarlı devrelerin bu cebirle tasarlanabileceğini gösterdi. Devreleri <b>sadeleştirmek</b> (daha az kapı = daha ucuz devre) için bu kuralları kullanacağız.
      </p>

      <h2>Matematiksel sistemin temelleri (kısaca)</h2>
      <p>
        Her cebirsel sistem bir <b>eleman kümesi</b>, <b>işlemler</b> <En>operators</En> ve kanıtlanmadan kabul edilen temel kurallar olan <b>postülalardan</b> <En>postulates</En>{' '}
        oluşur. Sık kullanılan postülalar: kapalılık <En>closure</En>, birleşme <En>associative law</En>, değişme <En>commutative law</En>, birim eleman <En>identity element</En>,
        ters eleman <En>inverse</En>, dağılma <En>distributive law</En>.
      </p>

      <h2>Huntington postülaları (Boole cebrinin tanımı)</h2>
      <p>Boole cebri; bir B kümesi, iki ikili işlem (+ ve ·) ve şu postülalarla tanımlanır:</p>
      <Table
        head={['#', 'Postüla', '(a) + için', '(b) · için']}
        rows={[
          ['1', 'Kapalılık (closure)', 'x + y ∈ B', 'x · y ∈ B'],
          ['2', 'Birim eleman (identity)', 'x + 0 = x', 'x · 1 = x'],
          ['3', 'Değişme (commutative)', 'x + y = y + x', 'x · y = y · x'],
          ['4', 'Dağılma (distributive)', 'x · (y + z) = xy + xz', <b>x + (y · z) = (x + y)(x + z)</b>],
          ['5', 'Tümleyen (complement)', "x + x' = 1", "x · x' = 0"],
          ['6', 'En az iki farklı eleman', 'x ≠ y olan x, y ∈ B vardır', ''],
        ]}
      />
      <Box kind="warn" title="Sıradan cebirden farklar (sınavda sorulur!)">
        <ul>
          <li>
            <b>x + yz = (x + y)(x + z)</b> — + işleminin · üzerine dağılması Boole cebrinde geçerlidir, sıradan cebirde <b>geçersizdir</b>.
          </li>
          <li>Boole cebrinde toplama/çarpma için ters eleman yoktur → <b>çıkarma ve bölme yoktur</b>.</li>
          <li>Tümleyen (complement) işlemi sıradan cebirde yoktur.</li>
          <li>Sıradan cebir reel sayılarla (sonsuz eleman) çalışır; iki değerli Boole cebri sadece {'{'}0, 1{'}'} ile.</li>
          <li>Birleşme kuralı postüla olarak verilmez; diğer postülalardan türetilebilir (teorem).</li>
        </ul>
      </Box>
      <p>
        Bizim kullandığımız <b>iki değerli Boole cebri</b> <En>two-valued Boolean algebra</En>: B = {'{'}0, 1{'}'}, + = OR, · = AND, ' = NOT. Yani Bölüm 1'deki mantık işlemlerinin ta kendisi.
      </p>

      <h2>Dualite (ikilik) ilkesi</h2>
      <Def
        term="Duality principle"
        en="Every algebraic expression deducible from the postulates of Boolean algebra remains valid if the operators and identity elements are interchanged."
        tr="Boole cebri postülalarından türetilebilen her ifade, işlemler (+ ↔ ·) ve birim elemanlar (0 ↔ 1) yer değiştirildiğinde de geçerli kalır."
      />
      <p>
        Dual almak için: <b>+ ↔ ·</b> ve <b>0 ↔ 1</b> değiştir (değişkenlere ve tümleyenlere dokunma!). Örnek: x + 0 = x ifadesinin duali x · 1 = x'tir. Bu yüzden
        aşağıdaki tabloda her kural (a) ve (b) çifti halindedir — birini bilirsen diğerini dual alarak bulursun.
      </p>

      <h2>Temel teoremler</h2>
      <Table
        caption="Tablo 2.1 — Boole cebrinin postülaları ve teoremleri (EZBERLE!)"
        head={['', '(a)', '(b)']}
        rows={[
          ['Postulate 2', 'x + 0 = x', 'x · 1 = x'],
          ['Postulate 5', "x + x' = 1", "x · x' = 0"],
          ['Theorem 1 (idempotent)', 'x + x = x', 'x · x = x'],
          ['Theorem 2', 'x + 1 = 1', 'x · 0 = 0'],
          ['Theorem 3, involution', "(x')' = x", ''],
          ['Postulate 3, commutative', 'x + y = y + x', 'xy = yx'],
          ['Theorem 4, associative', 'x + (y + z) = (x + y) + z', 'x(yz) = (xy)z'],
          ['Postulate 4, distributive', 'x(y + z) = xy + xz', 'x + yz = (x + y)(x + z)'],
          ['Theorem 5, DeMorgan', "(x + y)' = x'y'", "(xy)' = x' + y'"],
          ['Theorem 6, absorption', 'x + xy = x', 'x(x + y) = x'],
        ]}
      />
      <h3>Teoremleri ispatlamak</h3>
      <p>İki yol vardır: (1) postülaları adım adım uygulamak (cebirsel ispat), (2) doğruluk tablosuyla tüm durumları kontrol etmek.</p>
      <Box kind="example" title="Cebirsel ispat — Teorem 1(a): x + x = x">
        <pre className="addition">
{`x + x = (x + x) · 1          postulate 2(b)
      = (x + x)(x + x')      5(a)
      = x + xx'              4(b)  (dağılma)
      = x + 0                5(b)
      = x                    2(a)`}
        </pre>
      </Box>
      <Box kind="example" title="Cebirsel ispat — Teorem 6(a): x + xy = x (absorption)">
        <pre className="addition">
{`x + xy = x · 1 + xy     postulate 2(b)
       = x(1 + y)       4(a)
       = x(y + 1)       3(a)
       = x · 1          teorem 2(a)
       = x              2(b)`}
        </pre>
      </Box>
      <p>
        <b>Doğruluk tablosu ile ispat:</b> İki tarafın tüm giriş kombinasyonlarında aynı değeri verdiğini göster. Aşağıda DeMorgan teoremini kendin dene — farklı
        ifadeler yazarak hangi eşitliklerin doğru olduğunu test edebilirsin:
      </p>
      <EquivalenceChecker />

      <h3>DeMorgan teoremi — en önemli teorem</h3>
      <Formula>(x + y)' = x'y' &nbsp;&nbsp;&nbsp;&nbsp; (xy)' = x' + y'</Formula>
      <p>
        Sözlü kural: <b>"Çizgiyi kır, işareti değiştir."</b> Bir ifadenin tümünün tümleyenini alırken: her değişkeni tümle, + yerine ·, · yerine + koy. Çok değişkenli:
        (A + B + C)' = A'B'C', (ABC)' = A' + B' + C'.
      </p>

      <h2>İşlem önceliği</h2>
      <Def
        term="Operator precedence"
        en="The operator precedence for evaluating Boolean expressions is (1) parentheses, (2) NOT, (3) AND, and (4) OR."
        tr="Boole ifadeleri hesaplanırken öncelik sırası: (1) parantez, (2) NOT, (3) AND, (4) OR."
      />
      <p>
        Örneğin <span className="mono">(x + y)'</span>: önce parantez içindeki OR, sonra tümleyen. <span className="mono">x'y'</span>: önce her değişkenin tümleyeni,
        sonra AND. Bu ikisi DeMorgan'a göre eşittir ama hesaplama sırası farklıdır.
      </p>

      <KeyPoints
        items={[
          'Huntington postülaları: kapalılık, birim (0 ve 1), değişme, dağılma (her iki yönde!), tümleyen, en az iki eleman.',
          'x + yz = (x + y)(x + z) Boole cebrinde geçerlidir, sıradan cebirde değil.',
          'Dual: + ↔ ·, 0 ↔ 1 (değişkenler aynı kalır).',
          'x + x = x, x + 1 = 1, x + xy = x (absorption), (x+y)\' = x\'y\' (DeMorgan).',
          'Öncelik: parantez > NOT > AND > OR.',
        ]}
      />
    </>
  );
}
const q2_1: LessonDef['questions'] = [
  { id: '2-1-a', kind: 'mc', q: 'What is the dual of x + 0 = x?', tr: 'x + 0 = x ifadesinin duali nedir?', options: ['x · 1 = x', "x' + 1 = x'", 'x · 0 = 0', 'x + 1 = 1'], answer: 0 },
  { id: '2-1-b', kind: 'mc', q: 'Which of the following laws is valid in Boolean algebra but NOT in ordinary algebra?', tr: 'Hangisi Boole cebrinde geçerli olup sıradan cebirde geçerli değildir?', options: ['x + yz = (x + y)(x + z)', 'x(y + z) = xy + xz', 'x + y = y + x', 'x · 1 = x'], answer: 0 },
  { id: '2-1-c', kind: 'expr', q: 'Simplify x + xy to a minimum number of literals.', tr: 'x + xy ifadesini en az literal sayısına indirin.', vars: ['x', 'y'], ones: [2, 3], minimal: 'sop', explain: 'Absorption teoremi: x + xy = x(1 + y) = x.' },
  { id: '2-1-d', kind: 'mc', q: "(x + y)' is equal to:", tr: "(x + y)' neye eşittir?", options: ["x'y'", "x' + y'", "xy'", "x'y"], answer: 0, explain: 'DeMorgan: çizgiyi kır, işareti değiştir.' },
  { id: '2-1-e', kind: 'mc', q: "By DeMorgan's theorem, (xyz)' equals:", tr: "DeMorgan'a göre (xyz)' neye eşittir?", options: ["x' + y' + z'", "x'y'z'", "(x + y + z)'", "x'yz"], answer: 0 },
  { id: '2-1-f', kind: 'mc', q: 'The correct operator precedence for evaluating Boolean expressions is:', tr: 'Boole ifadelerinde doğru işlem önceliği hangisidir?', options: ['parentheses, NOT, AND, OR', 'parentheses, AND, OR, NOT', 'NOT, OR, AND, parentheses', 'parentheses, OR, AND, NOT'], answer: 0 },
  { id: '2-1-g', kind: 'mc', q: 'According to Theorem 2, x + 1 equals:', tr: 'Teorem 2\'ye göre x + 1 neye eşittir?', options: ['1', 'x', "x'", '0'], answer: 0 },
  { id: '2-1-h', kind: 'mc', q: 'The identity x(x + y) = x is known as:', tr: 'x(x + y) = x özdeşliğinin adı nedir?', options: ['absorption', 'involution', 'idempotent', 'DeMorgan'], answer: 0 },
  { id: '2-1-i', kind: 'mc', q: 'What is the dual of x(y + z) = xy + xz?', tr: 'x(y + z) = xy + xz ifadesinin duali nedir?', options: ['x + yz = (x + y)(x + z)', "x' + y'z' = (x' + y')(x' + z')", 'x(yz) = (xy)z', 'x + y + z = xyz'], answer: 0 },
];

// =====================================================================
// 2.2 Boole fonksiyonları
// =====================================================================
function L2_2() {
  return (
    <>
      <Def
        term="Boolean function"
        en="A Boolean function described by an algebraic expression consists of binary variables, the constants 0 and 1, and the logic operation symbols. For a given value of the binary variables, the function can be equal to either 1 or 0."
        tr="Cebirsel ifadeyle tanımlanan bir Boole fonksiyonu; ikili değişkenler, 0 ve 1 sabitleri ve mantık işlem sembollerinden oluşur. Değişkenlerin her değer kombinasyonu için fonksiyon 1 ya da 0'dır."
      />
      <p>
        Örnek: <span className="mono">F₁ = x + y'z</span>. Bu fonksiyon x = 1 ise <b>veya</b> (y = 0 ve z = 1) ise 1'dir. Bir fonksiyon bir <b>doğruluk tablosu</b> ile
        de gösterilebilir. n değişkenli bir fonksiyonun tablosunda <b>2ⁿ satır</b> vardır (0'dan 2ⁿ−1'e kadar ikili sayılar).
      </p>
      <Table
        compact
        head={['x', 'y', 'z', "F₁ = x + y'z", "F₂ = x'y'z + x'yz + xy'"]}
        rows={[
          [0, 0, 0, 0, 0],
          [0, 0, 1, 1, 1],
          [0, 1, 0, 0, 0],
          [0, 1, 1, 0, 1],
          [1, 0, 0, 1, 1],
          [1, 0, 1, 1, 1],
          [1, 1, 0, 1, 0],
          [1, 1, 1, 1, 0],
        ]}
      />
      <p>
        Fonksiyon bir <b>lojik devreye</b> dönüştürülebilir: her değişken bir giriş, her işlem bir kapı, F çıkıştır. Doğruluk tablosu <b>tektir</b>, ama aynı
        fonksiyon <b>birçok farklı cebirsel ifadeyle</b> yazılabilir. Amacımız en ucuz (en sade) ifadeyi bulmak.
      </p>

      <h2>Literal ve terim</h2>
      <Def
        term="Literal"
        en="A literal is a single variable within a term, in complemented or uncomplemented form."
        tr="Literal, bir terim içindeki tümlenmiş (x') veya tümlenmemiş (x) tek bir değişkendir."
      />
      <p>
        <span className="mono">F₂ = x'y'z + x'yz + xy'</span> ifadesinde <b>3 terim</b> ve <b>8 literal</b> vardır (3 + 3 + 2). Cebirle sadeleştirince{' '}
        <span className="mono">F₂ = x'z + xy'</span> olur: <b>2 terim, 4 literal</b>. Her terim bir kapı, her literal bir kapı girişi demektir → daha az literal = daha
        ucuz devre.
      </p>
      <Box kind="example" title="F₂'nin sadeleştirilmesi">
        <pre className="addition">
{`F₂ = x'y'z + x'yz + xy'
   = x'z(y' + y) + xy'      (x'z ortak paranteze)
   = x'z · 1 + xy'          (y' + y = 1)
   = x'z + xy'`}
        </pre>
      </Box>

      <h2>Cebirsel sadeleştirme</h2>
      <p>Sadeleştirmede kullanacağın en önemli kalıplar (Örnek 2.1) — hepsini anlayarak çalış:</p>
      <Table
        head={['#', 'İfade', 'Adımlar', 'Sonuç']}
        rows={[
          ['1', "x(x' + y)", "xx' + xy = 0 + xy", <b className="mono">xy</b>],
          ['2', "x + x'y", "(x + x')(x + y) = 1·(x + y)", <b className="mono">x + y</b>],
          ['3', "(x + y)(x + y')", "x + xy + xy' + yy' = x(1 + y + y')", <b className="mono">x</b>],
          ['4', "xy + x'z + yz", "yz terimi gereksiz (konsensüs)", <b className="mono">xy + x'z</b>],
          ['5', "(x + y)(x' + z)(y + z)", '4\'ün duali', <b className="mono">(x + y)(x' + z)</b>],
        ]}
      />
      <Reveal label="4. kalıbın (konsensüs teoremi) ispatını göster">
        <pre className="addition">
{`xy + x'z + yz = xy + x'z + yz(x + x')
              = xy + x'z + xyz + x'yz
              = xy(1 + z) + x'z(1 + y)
              = xy + x'z`}
        </pre>
        <p>
          Kural: <b>xy + x'z</b> varken, x'i içermeyen <b>yz</b> terimi gereksizdir (konsensüs terimi).
        </p>
      </Reveal>
      <Box kind="tip" title="Sadeleştirme stratejisi">
        <ol>
          <li>Ortak çarpanı paranteze al → içinde x + x' = 1 oluşuyor mu bak.</li>
          <li>x + xy = x (absorption) ve x + x'y = x + y kalıplarını ara.</li>
          <li>Takıldığında: doğruluk tablosu çıkar → Bölüm 3'teki K-map ile kesin sonucu bul.</li>
        </ol>
      </Box>

      <h2>Bir fonksiyonun tümleyeni</h2>
      <p>
        F'nin tümleyeni F', F'nin 0 olduğu yerde 1 olan fonksiyondur. <b>Genelleştirilmiş DeMorgan</b> ile bulunur: (A + B + C + …)' = A'B'C'…, (ABC…)' = A' + B' + C' + …
      </p>
      <Box kind="example" title="Örnek 2.2">
        <p className="mono">F₁ = x'yz' + x'y'z → F₁' = (x'yz' + x'y'z)' = (x + y' + z)(x + y + z')</p>
        <p className="mono">F₂ = x(y'z' + yz) → F₂' = x' + (y'z' + yz)' = x' + (y + z)(y' + z')</p>
      </Box>
      <Box kind="tip" title="Kısa yol (Örnek 2.3)">
        <b>Tümleyen = dualini al + her literali tümle.</b> F₁ = x'yz' + x'y'z → duali (x' + y + z')(x' + y' + z) → her literali tümle → <b>(x + y' + z)(x + y + z')</b> ✓
      </Box>

      <TruthTableLab initial="x'y'z + x'yz + xy'" />

      <KeyPoints
        items={[
          'n değişken → doğruluk tablosunda 2ⁿ satır.',
          'Literal = bir değişken veya tümleyeni. Literal sayısı ≈ devre maliyeti.',
          "Kalıplar: x + x'y = x + y; x(x' + y) = xy; xy + x'z + yz = xy + x'z.",
          'Tümleyen: genelleştirilmiş DeMorgan veya "dual al + literalleri tümle".',
        ]}
      />
    </>
  );
}
const q2_2: LessonDef['questions'] = [
  { id: '2-2-a', kind: 'expr', q: "Simplify xy + xy' to a minimum number of literals.", tr: "xy + xy' ifadesini en az literale indirin.", vars: ['x', 'y'], ones: mintermsOf("xy + xy'", ['x', 'y']), minimal: 'sop', explain: "x(y + y') = x·1 = x" },
  { id: '2-2-b', kind: 'expr', q: "Simplify (x + y)(x + y') to a minimum number of literals.", tr: "(x + y)(x + y') ifadesini sadeleştirin.", vars: ['x', 'y'], ones: mintermsOf("(x + y)(x + y')", ['x', 'y']), minimal: 'sop', explain: "x + yy' = x + 0 = x (dağılma kuralı tersten)." },
  { id: '2-2-c', kind: 'expr', q: "Simplify xyz + x'y + xyz' to a minimum number of literals.", tr: "xyz + x'y + xyz' ifadesini sadeleştirin.", vars: V3, ones: mintermsOf("xyz + x'y + xyz'", V3), minimal: 'sop', explain: "xy(z + z') + x'y = xy + x'y = y(x + x') = y" },
  { id: '2-2-d', kind: 'expr', q: "Simplify x'yz + xz to a minimum number of literals.", tr: "x'yz + xz ifadesini sadeleştirin.", vars: V3, ones: mintermsOf("x'yz + xz", V3), minimal: 'sop', explain: "z(x'y + x) = z(x + y) = xz + yz" },
  { id: '2-2-e', kind: 'expr', q: "Reduce A'C' + ABC + AC' to three literals.", tr: "A'C' + ABC + AC' ifadesini üç literale indirin.", vars: ABC, ones: mintermsOf("A'C' + ABC + AC'", ABC), minimal: 'sop', explain: "A'C' + AC' = C'(A' + A) = C'. Sonra C' + ABC = C' + AB (x' + xy = x' + y kalıbı)." },
  { id: '2-2-f', kind: 'expr', q: "Find the complement of F = xy' + x'y (any equivalent expression).", tr: "F = xy' + x'y fonksiyonunun tümleyenini bulun.", vars: ['x', 'y'], ones: [0, 3], explain: "F' = (x' + y)(x + y') = xy + x'y'. (XOR'un tümleyeni XNOR'dur.)" },
  { id: '2-2-g', kind: 'text', q: "How many literals are in the expression F = x'y'z + x'yz + xy'?", tr: "F = x'y'z + x'yz + xy' ifadesinde kaç literal vardır?", answer: '8', norm: 'num', explain: '3 + 3 + 2 = 8' },
  { id: '2-2-h', kind: 'expr', q: "Simplify xy + x'z + yz (consensus) to a minimum number of literals.", tr: "xy + x'z + yz ifadesini sadeleştirin.", vars: V3, ones: mintermsOf("xy + x'z + yz", V3), minimal: 'sop', explain: 'Konsensüs teoremi: yz gereksizdir.' },
  { id: '2-2-i', kind: 'mc', q: 'How many rows does the truth table of a function of n variables have?', tr: 'n değişkenli bir fonksiyonun doğruluk tablosunda kaç satır vardır?', options: ['2ⁿ', 'n²', '2n', 'n'], answer: 0 },
];

// =====================================================================
// 2.3 Kanonik ve standart formlar
// =====================================================================
function L2_3() {
  const rows = Array.from({ length: 8 }, (_, m) => {
    const b = m.toString(2).padStart(3, '0');
    const mt = termSOP({ value: m, mask: 0, covers: [m] }, V3);
    const Mt = V3.map((v, i) => v + (b[i] === '1' ? "'" : '')).join(' + ');
    return [b[0], b[1], b[2], <span className="mono">{mt}</span>, <span className="mono">m{m}</span>, <span className="mono">{Mt}</span>, <span className="mono">M{m}</span>];
  });
  return (
    <>
      <p>
        Bu derste fonksiyonları yazmanın "standart" yollarını öğreneceğiz. Bölüm 3'teki K-map'lerin temeli <b>minterm</b> kavramıdır; bu yüzden bu ders çok önemli.
      </p>

      <h2>Minterm ve maxterm</h2>
      <Def
        term="Minterm (standard product)"
        en="A minterm is a product (AND) term of n variables in which each variable appears exactly once, primed if the corresponding bit is 0 and unprimed if it is 1. There are 2ⁿ minterms, denoted m_j."
        tr="Minterm, n değişkenin her birinin tam bir kez yer aldığı çarpım (AND) terimidir; ilgili bit 0 ise değişken tümlenmiş (x'), 1 ise tümlenmemiş (x) yazılır. 2ⁿ minterm vardır, m_j ile gösterilir."
      />
      <Def
        term="Maxterm (standard sum)"
        en="A maxterm is a sum (OR) term of n variables in which each variable appears exactly once, unprimed if the corresponding bit is 0 and primed if it is 1. Maxterms are denoted M_j. Each maxterm is the complement of its corresponding minterm."
        tr="Maxterm, n değişkenin her birinin tam bir kez yer aldığı toplam (OR) terimidir; bit 0 ise değişken tümlenmemiş, 1 ise tümlenmiş yazılır. M_j ile gösterilir. Her maxterm, aynı numaralı mintermin tümleyenidir: M_j = m_j'."
      />
      <Table caption="Tablo 2.3 — Üç değişken için mintermler ve maxtermler" head={['x', 'y', 'z', 'Minterm', '', 'Maxterm', '']} rows={rows} />
      <Box kind="warn" title="Ters kurala dikkat!">
        <b>Minterm:</b> 0 → tümlenmiş (x'), 1 → normal (x). <b>Maxterm:</b> 0 → normal (x), 1 → tümlenmiş (x'). Yani m5 = <span className="mono">xy'z</span> (101), M5 ={' '}
        <span className="mono">x' + y + z'</span>. Hafıza ipucu: minterm o satırda <b>1</b> olan tek çarpımdır; maxterm o satırda <b>0</b> olan tek toplamdır.
      </Box>

      <h2>Doğruluk tablosundan kanonik forma</h2>
      <Table
        compact
        caption="Tablo 2.4 — Üç değişkenli iki fonksiyon"
        head={['x', 'y', 'z', 'f₁', 'f₂']}
        rows={[
          [0, 0, 0, 0, 0],
          [0, 0, 1, 1, 0],
          [0, 1, 0, 0, 0],
          [0, 1, 1, 0, 1],
          [1, 0, 0, 1, 0],
          [1, 0, 1, 0, 1],
          [1, 1, 0, 0, 1],
          [1, 1, 1, 1, 1],
        ]}
      />
      <ul>
        <li>
          <b>Sum of minterms</b>: F'nin <b>1 olduğu</b> satırların mintermlerini OR'la.
          <br />
          <span className="mono">f₁ = x'y'z + xy'z' + xyz = m1 + m4 + m7 = Σ(1, 4, 7)</span>
        </li>
        <li>
          <b>Product of maxterms</b>: F'nin <b>0 olduğu</b> satırların maxtermlerini AND'le.
          <br />
          <span className="mono">f₁ = (x + y + z)(x + y' + z)(x + y' + z')(x' + y + z')(x' + y' + z) = M0·M2·M3·M5·M6 = Π(0, 2, 3, 5, 6)</span>
        </li>
      </ul>
      <Def
        term="Canonical form"
        en="Boolean functions expressed as a sum of minterms or product of maxterms are said to be in canonical form."
        tr="Mintermlerin toplamı veya maxtermlerin çarpımı olarak yazılan Boole fonksiyonlarının kanonik formda olduğu söylenir."
      />
      <p>
        Tümleyen için: <span className="mono">f₁' = Σ(0, 2, 3, 5, 6)</span> — yani f₁'de olmayan mintermler.
      </p>

      <h2>Bir ifadeyi sum of minterms'e çevirmek</h2>
      <p>
        Her terimde eksik olan değişken x ise, terimi <b>(x + x')</b> ile çarp (değer değişmez, çünkü x + x' = 1). Sonra açıp tekrarları at (x + x = x).
      </p>
      <Box kind="example" title="Örnek 2.4: F = A + B'C">
        <pre className="addition">
{`A     = A(B + B')(C + C') = ABC + ABC' + AB'C + AB'C'
B'C   = B'C(A + A')       = AB'C + A'B'C
F     = A'B'C + AB'C' + AB'C + ABC' + ABC
      = m1 + m4 + m5 + m6 + m7 = Σ(1, 4, 5, 6, 7)`}
        </pre>
        <p>Pratik yol: doğruluk tablosunu çıkar, 1 olan satırları oku. (Aşağıdaki araç bunu yapar.)</p>
      </Box>
      <h3>Product of maxterms'e çevirmek</h3>
      <p>
        Önce dağılma kuralı <b>x + yz = (x + y)(x + z)</b> ile ifadeyi OR terimlerinin çarpımı haline getir; sonra eksik değişkenler için <b>xx'</b> ekle (x + 0 = x).
      </p>
      <Box kind="example" title="Örnek 2.5: F = xy + x'z">
        <pre className="addition">
{`F = xy + x'z = (xy + x')(xy + z) = (x + x')(y + x')(x + z)(y + z)
  = (x' + y)(x + z)(y + z)
x' + y = x' + y + zz' = (x' + y + z)(x' + y + z')
x + z  = x + z + yy'  = (x + y + z)(x + y' + z)
y + z  = y + z + xx'  = (x + y + z)(x' + y + z)
F = (x + y + z)(x + y' + z)(x' + y + z)(x' + y + z') = Π(0, 2, 4, 5)`}
        </pre>
      </Box>

      <h2>Kanonik formlar arası dönüşüm</h2>
      <Box kind="tip" title="Altın kural">
        <b>Σ ↔ Π dönüşümünde: sembolü değiştir ve listede OLMAYAN numaraları yaz.</b>
        <br />
        F(A, B, C) = Σ(1, 4, 5, 6, 7) &nbsp;⟺&nbsp; F = Π(0, 2, 3)
        <br />
        F(x, y, z) = Π(0, 2, 4, 5) &nbsp;⟺&nbsp; F = Σ(1, 3, 6, 7)
        <br />
        Tümleyen: F = Σ(1, 4, 5, 6, 7) ise F' = Σ(0, 2, 3) = Π(1, 4, 5, 6, 7).
      </Box>
      <Reveal label="Neden böyle? (açıklama)">
        F' = Σ(0, 2, 3) = m0 + m2 + m3. DeMorgan ile F = (m0 + m2 + m3)' = m0'·m2'·m3' = M0·M2·M3 (çünkü m_j' = M_j). Yani F = Π(0, 2, 3).
      </Reveal>

      <h2>Standart formlar: SOP ve POS</h2>
      <p>Kanonik formlarda her terimde tüm değişkenler bulunur; bu genelde gereksiz uzundur. Pratikte <b>standart formlar</b> kullanılır — terimlerde daha az literal olabilir:</p>
      <ul>
        <li>
          <b>Sum of products (SOP)</b> — çarpımların toplamı: <span className="mono">F₁ = y' + xy + x'yz'</span>. Gerçekleme: AND kapıları → tek OR kapısı (<b>iki seviyeli</b>{' '}
          <En>two-level</En>).
        </li>
        <li>
          <b>Product of sums (POS)</b> — toplamların çarpımı: <span className="mono">F₂ = x(y' + z)(x' + y + z')</span>. Gerçekleme: OR kapıları → tek AND kapısı.
        </li>
      </ul>
      <p>
        Bazı ifadeler ikisi de değildir: <span className="mono">F₃ = AB + C(D + E)</span> → üç seviyeli devre. Dağılma ile SOP'a çevrilebilir: <span className="mono">AB + CD + CE</span>{' '}
        (iki seviyeli). Not: iki seviyeli gerçeklemede girişlerin hem normal hem tümlenmiş halinin hazır olduğu varsayılır.
      </p>

      <TruthTableLab initial="A + B'C" />

      <Drill
        title="Σ ↔ Π dönüşüm alıştırması"
        make={() => {
          const ms = Array.from({ length: 8 }, (_, i) => i).filter(() => Math.random() < 0.45);
          if (ms.length === 0) ms.push(randInt(0, 7));
          const rest = Array.from({ length: 8 }, (_, i) => i).filter((i) => !ms.includes(i));
          const toPi = Math.random() < 0.5;
          return toPi
            ? { q: <>F(x, y, z) = {sigma(ms)} → product of maxterms: Π( ? )</>, answer: rest.join(','), placeholder: 'örn: 0,2,5', explain: 'Listede olmayan numaralar.' }
            : { q: <>F(x, y, z) = {pi(ms)} → sum of minterms: Σ( ? )</>, answer: rest.join(','), placeholder: 'örn: 1,3,4', explain: 'Listede olmayan numaralar.' };
        }}
      />

      <KeyPoints
        items={[
          "Minterm: bit 0 → x', bit 1 → x (AND). Maxterm: bit 0 → x, bit 1 → x' (OR). M_j = m_j'.",
          "F = Σ(F'nin 1 olduğu satırlar) = Π(F'nin 0 olduğu satırlar).",
          'Σ ↔ Π: sembolü değiştir, eksik numaraları yaz. F\' = Σ(eksik numaralar).',
          'Eksik değişken eklemek: SOP\'ta (x + x\') ile çarp, POS\'ta xx\' ekle.',
          'SOP → AND-OR, POS → OR-AND (iki seviyeli gerçekleme).',
        ]}
      />
    </>
  );
}
const q2_3: LessonDef['questions'] = [
  { id: '2-3-a', kind: 'text', q: "Express F(A, B, C) = A + B'C as a sum of minterms. List the minterm numbers.", tr: "F = A + B'C fonksiyonunu mintermlerin toplamı olarak yazın (minterm numaralarını listeleyin).", answer: '1,4,5,6,7', norm: 'list', placeholder: 'örn: 1, 4, 5', explain: 'A → 4,5,6,7; B\'C → 1,5 → Σ(1, 4, 5, 6, 7)' },
  { id: '2-3-b', kind: 'text', q: 'Convert F(x, y, z) = Σ(1, 3, 5) to product of maxterms. List the maxterm numbers.', tr: 'F = Σ(1, 3, 5) fonksiyonunu maxtermlerin çarpımına çevirin.', answer: '0,2,4,6,7', norm: 'list', explain: '0–7 arasında listede olmayanlar: Π(0, 2, 4, 6, 7)' },
  { id: '2-3-c', kind: 'text', q: 'Convert F(A, B, C, D) = Π(3, 5, 8, 11) to sum of minterms. List the minterm numbers.', tr: 'F(A,B,C,D) = Π(3, 5, 8, 11) fonksiyonunu mintermlerin toplamına çevirin.', answer: '0,1,2,4,6,7,9,10,12,13,14,15', norm: 'list' },
  { id: '2-3-d', kind: 'text', q: "Express the complement of F(x, y, z) = Π(3, 5, 7) in sum-of-minterms form. List the numbers.", tr: "F = Π(3, 5, 7) fonksiyonunun tümleyenini minterm toplamı olarak yazın.", answer: '3,5,7', norm: 'list', explain: "F, 3, 5, 7'de 0'dır → F' tam olarak bu satırlarda 1'dir: F' = Σ(3, 5, 7)." },
  { id: '2-3-e', kind: 'mc', q: 'For variables x, y, z, maxterm M5 is:', tr: 'x, y, z değişkenleri için M5 maxtermi hangisidir?', options: ["x' + y + z'", "xy'z", "x + y' + z", "x'yz'"], answer: 0, explain: "5 = 101 → maxterm'de 1 → tümlenmiş: x' + y + z'." },
  { id: '2-3-f', kind: 'mc', q: 'For variables x, y, z, minterm m6 is:', tr: 'x, y, z için m6 minterm hangisidir?', options: ["xyz'", "x'y'z", "x' + y' + z", 'xyz'], answer: 0 },
  { id: '2-3-g', kind: 'text', q: "Express F = xy + x'z as a sum of minterms (x, y, z). List the numbers.", tr: "F = xy + x'z ifadesini minterm toplamı olarak yazın.", answer: '1,3,6,7', norm: 'list' },
  { id: '2-3-h', kind: 'mc', q: 'Which expression is in product-of-sums form?', tr: 'Hangisi toplamların çarpımı (POS) formundadır?', options: ["(x + y')(x' + z)(y + z)", "xy' + x'z", "AB + C(D + E)", "x + y'z"], answer: 0 },
  { id: '2-3-i', kind: 'text', q: "Express F(A, B, C, D) = B'D + A'D + BD as a sum of minterms.", tr: "F(A,B,C,D) = B'D + A'D + BD fonksiyonunu minterm toplamı olarak yazın.", answer: '1,3,5,7,9,11,13,15', norm: 'list', explain: "B'D + BD = D(B' + B) = D → D = 1 olan tüm satırlar (tek sayılar)." },
];

// =====================================================================
// 2.4 Diğer işlemler ve lojik kapılar
// =====================================================================
function L2_4() {
  const fns: [string, string, string, string, string][] = [
    ['F₀', '0000', '0', '', 'Null (sabit 0)'],
    ['F₁', '0001', 'xy', 'x · y', 'AND'],
    ['F₂', '0010', "xy'", 'x / y', 'Inhibition (x but not y)'],
    ['F₃', '0011', 'x', '', 'Transfer (x)'],
    ['F₄', '0100', "x'y", 'y / x', 'Inhibition (y but not x)'],
    ['F₅', '0101', 'y', '', 'Transfer (y)'],
    ['F₆', '0110', "xy' + x'y", 'x ⊕ y', 'Exclusive-OR (XOR)'],
    ['F₇', '0111', 'x + y', 'x + y', 'OR'],
    ['F₈', '1000', "(x + y)'", 'x ↓ y', 'NOR (Not-OR)'],
    ['F₉', '1001', "xy + x'y'", 'x ⊙ y', 'Equivalence (XNOR)'],
    ['F₁₀', '1010', "y'", "y'", 'Complement (y)'],
    ['F₁₁', '1011', "x + y'", 'x ⊂ y', 'Implication (if y then x)'],
    ['F₁₂', '1100', "x'", "x'", 'Complement (x)'],
    ['F₁₃', '1101', "x' + y", 'x ⊃ y', 'Implication (if x then y)'],
    ['F₁₄', '1110', "(xy)'", 'x ↑ y', 'NAND (Not-AND)'],
    ['F₁₅', '1111', '1', '', 'Identity (sabit 1)'],
  ];
  return (
    <>
      <h2>İki değişkenin 16 fonksiyonu</h2>
      <p>
        n değişkenin doğruluk tablosunda 2ⁿ satır vardır; her satıra 0 veya 1 yazabileceğimiz için <b>2^(2ⁿ)</b> farklı fonksiyon olur. İki değişken için 2⁴ ={' '}
        <b>16</b> fonksiyon:
      </p>
      <Table
        compact
        caption="Tablo 2.8 — İki değişkenin 16 fonksiyonu (sütun: xy = 00, 01, 10, 11 için çıkış)"
        head={['', 'Çıkış (00 01 10 11)', 'Boole ifadesi', 'Operatör', 'Adı']}
        rows={fns.map((f) => [f[0], <span className="mono">{f[1]}</span>, <span className="mono">{f[2]}</span>, <span className="mono">{f[3]}</span>, f[4]])}
      />
      <ul>
        <li>
          <b>2 sabit</b> fonksiyon (0 ve 1), <b>4 tekli</b> fonksiyon (complement ve transfer), <b>10 ikili</b> fonksiyon.
        </li>
        <li>
          Bu 10 ikili işlemden 6'sı kapı olarak kullanılır: <b>AND, OR, NAND, NOR, XOR, XNOR</b>. <b>Inhibition</b> ve <b>implication</b> değişme ve birleşme
          özelliğine sahip olmadığından standart kapı olarak kullanılmaz.
        </li>
      </ul>

      <h2>Dijital lojik kapılar</h2>
      <p>Bir işlemin kapı olarak üretilmesi için şunlara bakılır: fiziksel olarak yapılabilirlik ve maliyet, ikiden fazla girişe genişletilebilme, değişme ve birleşme özellikleri, tek başına veya diğerleriyle birlikte her fonksiyonu gerçekleyebilme.</p>
      <div className="universal">
        {(['AND', 'OR', 'NOT', 'BUF', 'NAND', 'NOR', 'XOR', 'XNOR'] as const).map((g) => (
          <div className="uni-card" key={g}>
            <div className="uni-title">{g === 'NOT' ? 'Inverter (NOT)' : g === 'BUF' ? 'Buffer' : g}</div>
            <GateIcon type={g} width={150} labels={g === 'NOT' || g === 'BUF' ? ['x'] : ['x', 'y']} out="F" />
            <div className="mono small">
              {{ AND: 'F = xy', OR: 'F = x + y', NOT: "F = x'", BUF: 'F = x', NAND: "F = (xy)'", NOR: "F = (x + y)'", XOR: "F = xy' + x'y = x ⊕ y", XNOR: "F = xy + x'y' = (x ⊕ y)'" }[g]}
            </div>
          </div>
        ))}
      </div>
      <Box kind="info">
        <b>Buffer</b> (tampon) mantıksal olarak hiçbir şey yapmaz (F = x) — sinyali güçlendirmek <En>power amplification</En> için kullanılır. Çıkıştaki küçük daire
        (<b>bubble</b>) tümleyeni (NOT) gösterir: NAND = AND + bubble, NOR = OR + bubble.
      </Box>
      <GatePlayground />

      <h2>Çok girişli kapılar</h2>
      <p>
        AND ve OR hem <b>değişme</b> hem <b>birleşme</b> özelliğine sahip → girişlerin sırası ve gruplanması önemli değil; istediğin kadar giriş verebilirsin.
      </p>
      <Box kind="warn" title="NAND ve NOR birleşme özelliğine sahip DEĞİL">
        (x ↓ y) ↓ z ≠ x ↓ (y ↓ z). Örneğin (x ↓ y) ↓ z = [(x + y)' + z]' = (x + y)z' ama x ↓ (y ↓ z) = x'(y + z). Bu yüzden çok girişli NAND/NOR şöyle{' '}
        <b>tanımlanır</b>: <span className="mono">x ↑ y ↑ z = (xyz)'</span> ve <span className="mono">x ↓ y ↓ z = (x + y + z)'</span> — yani tümlenmiş AND/OR.
      </Box>
      <Box kind="example" title="Kademeli (cascaded) NAND">
        <span className="mono">F = [(ABC)' · (DE)']' = ABC + DE</span> (DeMorgan ile). İki seviyeli NAND devreleri tam olarak bunu kullanır — Bölüm 3'te göreceğiz.
      </Box>
      <p>
        <b>XOR ve XNOR</b> değişme ve birleşme özelliğine sahiptir; çok girişli olabilirler ama genelde 2 girişli kapılarla kurulurlar. 3 girişli XOR, girişlerden{' '}
        <b>tek sayıda</b> (1 veya 3) 1 olduğunda 1 verir (<b>tek fonksiyon</b> — <En>odd function</En>).
      </p>

      <h2>Pozitif ve negatif mantık</h2>
      <p>
        Kapı aslında voltajlarla çalışır: <b>H</b> (yüksek) ve <b>L</b> (düşük). Hangisine 1 dediğimiz bir seçimdir:
      </p>
      <ul>
        <li>
          <b>Pozitif mantık</b> <En>positive logic</En>: H = 1, L = 0.
        </li>
        <li>
          <b>Negatif mantık</b> <En>negative logic</En>: L = 1, H = 0. (Girişlerde/çıkışta küçük üçgen — polarity indicator — ile gösterilir.)
        </li>
      </ul>
      <Table
        compact
        caption="Aynı fiziksel kapı: H/L tablosu"
        head={['x', 'y', 'z', '→ pozitif mantıkta', '→ negatif mantıkta']}
        rows={[
          ['L', 'L', 'L', '0 0 → 0', '1 1 → 1'],
          ['L', 'H', 'L', '0 1 → 0', '1 0 → 1'],
          ['H', 'L', 'L', '1 0 → 0', '0 1 → 1'],
          ['H', 'H', 'H', '1 1 → 1', '0 0 → 0'],
        ]}
      />
      <p>
        Pozitif mantıkta bu kapı <b>AND</b>'dir; negatif mantıkta aynı kapı <b>OR</b>'dur. Genel kural: pozitif mantıktaki bir fonksiyon, negatif mantıkta onun{' '}
        <b>dualidir</b>. Pozitif mantık NAND = negatif mantık NOR (ve tersi).
      </p>

      <KeyPoints
        items={[
          'İki değişken → 16 fonksiyon (2^(2ⁿ)). Inhibition ve implication kapı olarak kullanılmaz (değişme/birleşme yok).',
          '8 kapı: AND, OR, NOT, buffer, NAND, NOR, XOR, XNOR. Bubble = tümleyen.',
          'NAND/NOR değişmeli ama birleşmeli değil; çok girişli NAND = (xyz)\'.',
          'XOR: girişler farklıysa (tek sayıda 1) → 1. XNOR = eşitlik.',
          'Pozitif mantık AND = negatif mantık OR (dual).',
        ]}
      />
    </>
  );
}
const q2_4: LessonDef['questions'] = [
  { id: '2-4-a', kind: 'mc', q: 'Which binary operations of two variables are neither commutative nor associative and are therefore not used as standard logic gates?', tr: 'Hangi ikili işlemler değişme ve birleşme özelliği taşımadığı için standart kapı olarak kullanılmaz?', options: ['Inhibition and implication', 'NAND and NOR', 'XOR and XNOR', 'AND and OR'], answer: 0 },
  { id: '2-4-b', kind: 'mc', q: 'The NAND operation is:', tr: 'NAND işlemi:', options: ['commutative but not associative', 'associative but not commutative', 'both commutative and associative', 'neither commutative nor associative'], answer: 0 },
  { id: '2-4-c', kind: 'text', q: 'What is the output of a 3-input XOR gate when all inputs are 1?', tr: 'Üç girişi de 1 olan 3 girişli XOR kapısının çıkışı nedir?', answer: '1', norm: 'num', explain: 'Tek sayıda (3 tane) 1 var → odd function → 1.' },
  { id: '2-4-d', kind: 'mc', q: "The cascaded NAND expression F = [(ABC)'(DE)']' is equal to:", tr: "F = [(ABC)'(DE)']' neye eşittir?", options: ['ABC + DE', "(ABC + DE)'", 'ABCDE', "A'B'C' + D'E'"], answer: 0 },
  { id: '2-4-e', kind: 'mc', q: 'A positive-logic AND gate behaves as which gate in negative logic?', tr: 'Pozitif mantıkta AND olan kapı, negatif mantıkta hangi kapı gibi davranır?', options: ['OR', 'NAND', 'NOR', 'AND'], answer: 0 },
  { id: '2-4-f', kind: 'text', q: 'How many different Boolean functions of two variables are possible?', tr: 'İki değişkenle kaç farklı Boole fonksiyonu yazılabilir?', answer: '16', norm: 'num', explain: '2^(2²) = 2⁴ = 16' },
  { id: '2-4-g', kind: 'text', q: 'What is the value of the equivalence (XNOR) function x ⊙ y for x = 0, y = 0?', tr: 'x = 0, y = 0 için x ⊙ y (XNOR) değeri nedir?', answer: '1', norm: 'num' },
  { id: '2-4-h', kind: 'mc', q: 'The implication x ⊃ y ("if x then y") is equal to:', tr: 'x ⊃ y ("x ise y") işlemi neye eşittir?', options: ["x' + y", "x + y'", "xy'", "x'y"], answer: 0 },
  { id: '2-4-i', kind: 'mc', q: 'What is the purpose of a buffer gate?', tr: 'Buffer kapısının amacı nedir?', options: ['Power amplification of the signal (logically F = x)', 'Complementing the signal', 'Storing one bit', 'Adding two bits'], answer: 0 },
];

// =====================================================================
// 2.5 Entegre devreler
// =====================================================================
function L2_5() {
  return (
    <>
      <p>
        Bu ders ezber ağırlıklıdır ve sınavda genelde <b>tanım/çoktan seçmeli</b> soru olarak gelir. Tanım kutularındaki İngilizce cümlelere özellikle dikkat et.
      </p>
      <Def
        term="Integrated circuit (IC)"
        en="An integrated circuit (IC) is fabricated on a die of a silicon semiconductor crystal, called a chip, containing the electronic components for constructing digital gates."
        tr="Entegre devre (IC), çip adı verilen bir silikon yarı iletken kristal parçası üzerine üretilen ve dijital kapıları oluşturan elektronik bileşenleri içeren devredir."
      />
      <p>Çip seramik veya plastik bir kılıfa yerleştirilir, bağlantılar dış pinlere kaynaklanır (14 pinden binlerce pine kadar). Her IC'nin üzerinde tanıtıcı bir numara yazar.</p>

      <h2>Entegrasyon seviyeleri</h2>
      <Table
        head={['Seviye', 'Açılımı', 'Kapı sayısı', 'Örnek']}
        rows={[
          ['SSI', 'Small-scale integration', '< 10 bağımsız kapı', 'Tek kılıfta birkaç kapı (pin sayısıyla sınırlı)'],
          ['MSI', 'Medium-scale integration', '10 – 1 000', 'Decoder, adder, multiplexer, register, counter'],
          ['LSI', 'Large-scale integration', 'Binlerce', 'İşlemciler, bellek çipleri, programlanabilir mantık'],
          ['VLSI', 'Very large-scale integration', 'Milyonlarca', 'Büyük bellek dizileri, karmaşık mikroişlemciler'],
        ]}
      />

      <h2>Dijital lojik aileleri</h2>
      <p>
        IC'ler devre teknolojisine göre de sınıflandırılır; buna <b>lojik ailesi</b> <En>digital logic family</En> denir. Her ailenin temel devresi bir NAND, NOR veya
        inverter'dır.
      </p>
      <Table
        head={['Aile', 'Açılımı', 'Öne çıkan özelliği']}
        rows={[
          ['TTL', 'transistor–transistor logic', '~50 yıldır kullanılan standart aile'],
          ['ECL', 'emitter-coupled logic', <b>Yüksek hız</b>],
          ['MOS', 'metal-oxide semiconductor', <b>Yüksek bileşen yoğunluğu</b>],
          ['CMOS', 'complementary metal-oxide semiconductor', <b>Düşük güç tüketimi</b>],
        ]}
      />
      <Box kind="exam">
        <b>CMOS</b>, düşük güç tükettiği için VLSI tasarımında <b>baskın</b> ailedir (kameralar, taşınabilir cihazlar); TTL ve ECL kullanımı azalmaktadır. "Hangi
        aile hızlıdır?" → ECL. "Hangisi az güç harcar?" → CMOS. "Hangisi yoğunluk için uygundur?" → MOS.
      </Box>

      <h2>Lojik ailelerini ayıran parametreler</h2>
      <Def term="Fan-out" en="Fan-out specifies the number of standard loads that the output of a typical gate can drive without impairing its normal operation." tr="Fan-out, tipik bir kapı çıkışının normal çalışmasını bozmadan sürebileceği standart yük sayısıdır. (Standart yük: aynı ailedeki başka bir kapının bir girişinin çektiği akım.)" />
      <Def term="Fan-in" en="Fan-in is the number of inputs available in a gate." tr="Fan-in, bir kapıdaki giriş sayısıdır." />
      <Def term="Power dissipation" en="Power dissipation is the power consumed by the gate that must be available from the power supply." tr="Güç harcaması, kapının tükettiği ve güç kaynağından sağlanması gereken güçtür." />
      <Def
        term="Propagation delay"
        en="Propagation delay is the average transition delay time for a signal to propagate from input to output. The operating speed is inversely proportional to the propagation delay."
        tr="Yayılma gecikmesi, bir sinyalin girişten çıkışa ulaşması için geçen ortalama geçiş süresidir. Çalışma hızı yayılma gecikmesiyle ters orantılıdır."
      />
      <Def term="Noise margin" en="Noise margin is the maximum external noise voltage added to an input signal that does not cause an undesirable change in the circuit output." tr="Gürültü payı, giriş sinyaline eklendiğinde devre çıkışında istenmeyen bir değişikliğe yol açmayan en büyük dış gürültü voltajıdır." />
      <Box kind="tip" title="Hafıza ipucu">
        Fan-<b>in</b> = <b>in</b>put sayısı (içeri giren). Fan-<b>out</b> = çıkışın sürebildiği (dışarı) yük sayısı.
      </Box>

      <h2>VLSI için bilgisayar destekli tasarım (CAD)</h2>
      <p>
        Milyonlarca transistörlü devreler elle tasarlanamaz; <b>CAD</b> <En>computer-aided design</En> araçları kullanılır. Entegre devre tasarımının tüm aşamalarını
        kapsayan alana <b>EDA</b> <En>electronic design automation</En> denir. Fiziksel gerçekleme seçenekleri:
      </p>
      <ul>
        <li>
          <b>ASIC</b> — application-specific integrated circuit (uygulamaya özel IC)
        </li>
        <li>
          <b>FPGA</b> — field-programmable gate array (sahada programlanabilir kapı dizisi)
        </li>
        <li>
          <b>PLD</b> — programmable logic device
        </li>
        <li>
          <b>Full-custom IC</b> — tamamen özel tasarım
        </li>
      </ul>
      <p>
        Devre şemasını ekranda çizmeye <b>schematic capture / schematic entry</b> denir. Modern yöntem ise devreyi metinle anlatan <b>HDL</b>{' '}
        <En>hardware description language</En> kullanmaktır — Bölüm 3.9'da Verilog ile tanışacağız.
      </p>
      <KeyPoints
        items={[
          'SSI < 10, MSI 10–1000, LSI binlerce, VLSI milyonlarca kapı.',
          'TTL standart, ECL hızlı, MOS yoğun, CMOS düşük güç (VLSI\'da baskın).',
          'Fan-out: sürülebilen yük sayısı; fan-in: giriş sayısı; hız ∝ 1 / propagation delay.',
          'Noise margin: çıkışı bozmayan en büyük gürültü voltajı.',
          'ASIC, FPGA, PLD, full-custom; EDA, schematic capture, HDL.',
        ]}
      />
    </>
  );
}
const q2_5: LessonDef['questions'] = [
  { id: '2-5-a', kind: 'mc', q: 'Which logic family is preferable in systems requiring low power consumption?', tr: 'Düşük güç tüketimi gereken sistemlerde hangi lojik ailesi tercih edilir?', options: ['CMOS', 'ECL', 'TTL', 'MOS'], answer: 0 },
  { id: '2-5-b', kind: 'mc', q: 'ECL has an advantage in systems requiring:', tr: 'ECL hangi sistemlerde avantajlıdır?', options: ['high-speed operation', 'low power consumption', 'high component density', 'low cost'], answer: 0 },
  { id: '2-5-c', kind: 'mc', q: 'Fan-out specifies:', tr: 'Fan-out neyi belirtir?', options: ['the number of standard loads that the output of a gate can drive without impairing its normal operation', 'the number of inputs available in a gate', 'the power consumed by the gate', 'the maximum noise voltage tolerated'], answer: 0 },
  { id: '2-5-d', kind: 'mc', q: 'Noise margin is:', tr: 'Gürültü payı (noise margin) nedir?', options: ['the maximum external noise voltage added to an input signal that does not cause an undesirable change in the output', 'the delay between input and output', 'the number of gates in a package', 'the minimum supply voltage'], answer: 0 },
  { id: '2-5-e', kind: 'mc', q: 'A medium-scale integration (MSI) device contains approximately:', tr: 'MSI bir cihaz yaklaşık kaç kapı içerir?', options: ['10 to 1,000 gates', 'fewer than 10 gates', 'thousands of gates', 'millions of gates'], answer: 0 },
  { id: '2-5-f', kind: 'mc', q: 'The operating speed of a gate is inversely proportional to its:', tr: 'Bir kapının çalışma hızı neyle ters orantılıdır?', options: ['propagation delay', 'fan-out', 'fan-in', 'noise margin'], answer: 0 },
  { id: '2-5-g', kind: 'mc', q: 'Fan-in is:', tr: 'Fan-in nedir?', options: ['the number of inputs available in a gate', 'the number of outputs of a gate', 'the number of loads a gate can drive', 'the number of pins on a package'], answer: 0 },
  { id: '2-5-h', kind: 'mc', q: 'Which of the following is a field-programmable device?', tr: 'Hangisi sahada programlanabilir bir cihazdır?', options: ['FPGA', 'SSI', 'TTL', 'ECL'], answer: 0 },
];

export const CH2: LessonDef[] = [
  { id: '2-1', chapter: 2, num: '2.1', title: 'Boole Cebri: Postülalar ve Teoremler', titleEn: 'Boolean Algebra: Postulates and Theorems', book: '§2.1–2.4, s. 38–46', minutes: 40, Component: L2_1, questions: q2_1 },
  { id: '2-2', chapter: 2, num: '2.2', title: 'Boole Fonksiyonları ve Sadeleştirme', titleEn: 'Boolean Functions', book: '§2.5, s. 46–51', minutes: 35, Component: L2_2, questions: q2_2 },
  { id: '2-3', chapter: 2, num: '2.3', title: 'Kanonik ve Standart Formlar', titleEn: 'Canonical and Standard Forms', book: '§2.6, s. 51–58', minutes: 45, Component: L2_3, questions: q2_3 },
  { id: '2-4', chapter: 2, num: '2.4', title: 'Diğer İşlemler ve Lojik Kapılar', titleEn: 'Other Logic Operations and Digital Logic Gates', book: '§2.7–2.8, s. 58–66', minutes: 35, Component: L2_4, questions: q2_4 },
  { id: '2-5', chapter: 2, num: '2.5', title: 'Entegre Devreler', titleEn: 'Integrated Circuits', book: '§2.9, s. 66–68', minutes: 20, Component: L2_5, questions: q2_5 },
];
