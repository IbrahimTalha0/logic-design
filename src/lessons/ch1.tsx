import { Box, Def, En, Formula, KeyPoints, Sub, Table } from '../components/ui';
import { Drill } from '../components/Drill';
import { BaseConverter, BcdAdder, CodeExplorer, ComplementLab, SignedLab, TwosAdder } from '../interactives/NumberLabs';
import { GatePlayground, TimingDiagram } from '../interactives/LogicLabs';
import { binToGray, intToBaseSteps, radixComplement, diminishedComplement, randInt, toSignedBinary, signedViews, CODE_TABLE, parityBit } from '../lib/numbers';
import type { LessonDef } from '../data/types';

const rbin = (n: number) => Array.from({ length: n }, () => (Math.random() < 0.5 ? '0' : '1')).join('');

// =====================================================================
// 1.1 Dijital Sistemler ve İkili Sayılar
// =====================================================================
function L1_1() {
  return (
    <>
      <p>
        Hoş geldin! Bu derste her şeyin temelini atacağız: bilgisayarların neden yalnızca <b>0</b> ve <b>1</b> ile çalıştığını ve sayıları farklı
        tabanlarda nasıl yazdığımızı öğreneceğiz. Hiç bilgin olmadığını varsayarak başlıyoruz.
      </p>

      <h2>Analog mu, dijital mi?</h2>
      <p>
        Eski tip cıvalı bir termometre düşün: cıva sütunu <i>her</i> değeri alabilir (36,71... 36,7134...). Buna <b>analog</b> denir; değerler sürekli
        <En>continuous</En>'dir. Dijital termometre ise ekranda sadece belirli değerler gösterir (36,7 → 36,8). Değerler <b>ayrık</b>
        <En>discrete</En>'tir.
      </p>
      <Def
        term="Digital system"
        en="A digital system is a system that manipulates discrete elements of information. Discrete elements of information are represented in a digital system by physical quantities called signals."
        tr="Dijital sistem, ayrık (sayılabilir, kesikli) bilgi elemanlarını işleyen sistemdir. Bu bilgiler, sinyal adı verilen fiziksel büyüklüklerle (genelde voltaj) temsil edilir."
      />
      <p>
        Elektronik devrelerde sinyal genellikle bir <b>voltajdır</b>. En güvenilir yöntem sinyalin yalnızca <b>iki</b> değer almasıdır: düşük voltaj = <b>0</b>,
        yüksek voltaj = <b>1</b>. İki değerli bu sisteme <b>ikili</b> <En>binary</En> sistem, her bir 0 ya da 1'e de <b>bit</b> <En>binary digit</En> denir.
      </p>
      <Box kind="analogy">
        Bir lamba anahtarı düşün: ya <b>açık (1)</b> ya <b>kapalı (0)</b>. "Yarı açık" yok. Bilgisayar milyarlarca böyle minik anahtardan (transistör) oluşur.
        Bitleri gruplayarak (örneğin 8 bit = 1 <b>byte</b>) harfleri, sayıları, renkleri kodlayabiliriz.
      </Box>

      <h2>Basamak değerli sayı sistemi</h2>
      <p>
        Günlük hayatta kullandığımız onluk <En>decimal</En> sistemde her basamağın bir <b>ağırlığı</b> vardır. Örneğin 7392 sayısı aslında şudur:
      </p>
      <Formula>7392 = 7×10³ + 3×10² + 9×10¹ + 2×10⁰ = 7000 + 300 + 90 + 2</Formula>
      <p>
        Burada <b>10</b> sayısına <b>taban</b> <En>base</En> veya <En>radix</En> denir. Taban <b>r</b> olan bir sistemde <b>r</b> tane rakam vardır: 0, 1, …, r−1.
        Ondalık noktanın <En>radix point</En> solundaki basamakların ağırlıkları r⁰, r¹, r², …; sağındakilerin ağırlıkları r⁻¹, r⁻², … şeklindedir.
      </p>
      <Def
        term="Base-r number"
        en={<>A number expressed in a base-r system has coefficients multiplied by powers of r: a<sub>n</sub>·rⁿ + a<sub>n−1</sub>·rⁿ⁻¹ + … + a<sub>1</sub>·r + a<sub>0</sub> + a<sub>−1</sub>·r⁻¹ + … The coefficients a<sub>j</sub> range in value from 0 to r − 1.</>}
        tr="r tabanındaki bir sayının her basamağı (katsayısı) r'nin bir kuvvetiyle çarpılır ve hepsi toplanır. Katsayılar 0 ile r−1 arasındadır."
      />
      <Box kind="example" title="Örnek: başka tabandan onluğa">
        <p className="mono">
          (4021.2)<sub>5</sub> = 4×5³ + 0×5² + 2×5¹ + 1×5⁰ + 2×5⁻¹ = 500 + 0 + 10 + 1 + 0.4 = (511.4)<sub>10</sub>
        </p>
        <p className="mono">
          (11010.11)<sub>2</sub> = 16 + 8 + 0 + 2 + 0 + 0.5 + 0.25 = (26.75)<sub>10</sub>
        </p>
        <p>
          Gördüğün gibi <b>herhangi bir tabandan onluğa</b> çevirmek kolay: her basamağı ağırlığıyla çarp, topla. Sayının tabanını belirtmek için parantez ve alt
          indis kullanırız: <Sub b={2}>1011</Sub>.
        </p>
      </Box>

      <h3>Sık kullanılan tabanlar</h3>
      <Table
        head={['Sistem', 'Taban', 'Rakamlar', 'İngilizce']}
        rows={[
          ['İkili', '2', '0, 1', 'binary'],
          ['Sekizli', '8', '0 … 7', 'octal'],
          ['Onlu', '10', '0 … 9', 'decimal'],
          ['Onaltılı', '16', '0 … 9, A(10), B(11), C(12), D(13), E(14), F(15)', 'hexadecimal (hex)'],
        ]}
      />
      <Box kind="tip" title="2'nin kuvvetlerini ezberle">
        <Table
          compact
          head={['n', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '16', '20', '30']}
          rows={[['2ⁿ', '1', '2', '4', '8', '16', '32', '64', '128', '256', '512', '1024', '65536', '1 048 576', '≈10⁹']]}
        />
        <p>
          Bilgisayarda <b>K (kilo) = 2¹⁰ = 1024</b>, <b>M (mega) = 2²⁰</b>, <b>G (giga) = 2³⁰</b>, <b>T (tera) = 2⁴⁰</b>. Yani 4K = 4 × 1024 = <b>4096</b> byte,
          32K = 32 768 byte. (Sınavda "exact number of bytes" sorulursa 1000 değil 1024 ile çarp!)
        </p>
      </Box>
      <p>
        <b>n bitle</b> yazılabilecek en büyük işaretsiz sayı <b>2ⁿ − 1</b>'dir. Örneğin 8 bit: 11111111 = 255; 16 bit: 65 535 = (FFFF)<sub>16</sub>.
      </p>

      <h2>İkili aritmetik</h2>
      <p>Toplama, çıkarma ve çarpma tıpkı onlukta olduğu gibi yapılır; sadece "elde" 10'da değil <b>2'de</b> oluşur.</p>
      <Table
        compact
        head={['Toplama kuralı', 'Sonuç']}
        rows={[
          ['0 + 0', '0'],
          ['0 + 1 = 1 + 0', '1'],
          ['1 + 1', '10 (yaz 0, elde 1 — carry)'],
          ['1 + 1 + 1', '11 (yaz 1, elde 1)'],
        ]}
      />
      <Box kind="example" title="Kitaptaki örnekler">
        <pre className="addition">
{`  Toplama            Çıkarma            Çarpma
   101101  augend     101101  minuend      1011
 + 100111  addend   − 100111  subtrahend  × 101
 --------           --------             ------
  1010100  sum        000110  difference   1011
                                          0000
                                         1011
                                         ------
                                         110111`}
        </pre>
        <p>
          Çıkarmada 0'dan 1 çıkaramazsan soldaki basamaktan <b>ödünç</b> <En>borrow</En> alırsın (onlukta 10 alırken burada 2 alırsın).
        </p>
      </Box>
      <Box kind="info" title="Diğer tabanlarda aritmetik">
        Aynı mantık: iki basamağın toplamı tabanı (r) geçerse r çıkarılır ve 1 elde verilir. Örnek hex: (2E)<sub>16</sub> + (34)<sub>16</sub>: E + 4 = 14 + 4 = 18 = 16 + 2 →
        yaz 2, elde 1; 2 + 3 + 1 = 6 → <b>(62)<sub>16</sub></b>.
      </Box>
      <Box kind="exam" title="Sınavda sık çıkan tip: tabanı bul">
        <p>
          "14/2 = 5 işleminin doğru olması için taban kaç olmalı?" → (14)<sub>b</sub> = 1·b + 4. Bu, 2 × 5 = 10'a eşit olmalı: b + 4 = 10 → <b>b = 6</b>.
        </p>
        <p>Yöntem: sayıları b cinsinden açık yaz → denklem kur → çöz.</p>
      </Box>

      <KeyPoints
        items={[
          'Dijital = ayrık değerler; ikili sistemde sadece 0 ve 1 (bit).',
          'Taban r sistemde rakamlar 0…r−1; her basamak r^konum ile çarpılır.',
          'Herhangi bir tabandan onluğa: basamak × ağırlık, topla.',
          'K = 1024, M = 2²⁰, G = 2³⁰. n bitle en büyük sayı 2ⁿ − 1.',
          'İkili toplamada 1 + 1 = 10 (elde 1).',
        ]}
      />
    </>
  );
}

const q1_1: LessonDef['questions'] = [
  { id: '1-1-a', kind: 'text', q: <>Convert (4310)<sub>5</sub> to decimal.</>, tr: '(4310)₅ sayısını onluğa çevirin.', answer: '580', norm: 'num', explain: '4×125 + 3×25 + 1×5 + 0×1 = 500 + 75 + 5 + 0 = 580' },
  { id: '1-1-b', kind: 'text', q: <>Convert (198)<sub>12</sub> to decimal.</>, tr: '(198)₁₂ sayısını onluğa çevirin.', answer: '260', norm: 'num', explain: '1×144 + 9×12 + 8 = 144 + 108 + 8 = 260' },
  { id: '1-1-c', kind: 'mc', q: 'What is the largest unsigned binary number that can be expressed with 16 bits (in decimal)?', tr: '16 bitle ifade edilebilecek en büyük işaretsiz ikili sayı (onluk) nedir?', options: ['65 535', '65 536', '32 767', '16 384'], answer: 0, explain: 'n bit için en büyük sayı 2ⁿ − 1 = 2¹⁶ − 1 = 65 535 = (FFFF)₁₆.' },
  { id: '1-1-d', kind: 'text', q: 'What is the exact number of bytes in a system that contains 32K bytes?', tr: '32K byte içeren bir sistemde tam olarak kaç byte vardır?', answer: '32768', norm: 'num', explain: 'K = 2¹⁰ = 1024 → 32 × 1024 = 32 768.' },
  { id: '1-1-e', kind: 'text', q: 'Add the binary numbers 101101 + 100111.', tr: '101101 ve 100111 ikili sayılarını toplayın.', answer: '1010100', norm: 'bin', explain: '45 + 39 = 84 = 1010100₂. Sağdan başla: 1+1=10 (0 yaz, 1 elde) …' },
  { id: '1-1-f', kind: 'text', q: 'Multiply the binary numbers 1011 × 101 without converting to decimal.', tr: '1011 × 101 çarpımını onluğa çevirmeden yapın.', answer: '110111', norm: 'bin', explain: '1011 + 101100 (iki kaydırılmış) = 110111 (kontrol: 11 × 5 = 55).' },
  { id: '1-1-g', kind: 'text', q: 'Determine the base of the numbers so that 24 + 17 = 40 is correct.', tr: '24 + 17 = 40 işleminin doğru olması için taban kaç olmalı?', answer: '11', norm: 'num', explain: '(2b + 4) + (b + 7) = 4b → 3b + 11 = 4b → b = 11.' },
  { id: '1-1-h', kind: 'text', q: <>Add the hexadecimal numbers 2E + 34 (answer in hex).</>, tr: '2E + 34 onaltılık toplamını yapın (cevap hex).', answer: '62', norm: 'upper', explain: 'E(14) + 4 = 18 = 16 + 2 → 2 yaz, 1 elde. 2 + 3 + 1 = 6 → 62₁₆.' },
  { id: '1-1-i', kind: 'mc', q: 'Which statement best describes a digital system?', tr: 'Hangisi dijital sistemi en iyi tanımlar?', options: ['It manipulates discrete elements of information.', 'It processes only continuous signals.', 'It can only perform arithmetic.', 'It uses ten voltage levels.'], answer: 0 },
];

// =====================================================================
// 1.2 Taban dönüşümleri, octal ve hex
// =====================================================================
function L1_2() {
  return (
    <>
      <p>
        Önceki derste <b>başka tabandan onluğa</b> çevirmeyi öğrendik. Şimdi tersini — <b>onluktan başka tabana</b> — ve ikili ↔ sekizli ↔ onaltılı arasındaki
        çok hızlı kısa yolu öğreneceğiz.
      </p>

      <h2>Onluktan r tabanına: tam sayı kısmı</h2>
      <p>
        Kural çok basit: <b>sayıyı sürekli r'ye böl, kalanları yaz, en son kalandan ilk kalana doğru (aşağıdan yukarı) oku.</b>
      </p>
      <Box kind="example" title="Örnek: (41)₁₀ → ikili">
        <Table
          compact
          head={['Bölünen', 'Bölüm', 'Kalan', '']}
          rows={[
            ['41 ÷ 2', '20', '1', '← a₀ (LSB)'],
            ['20 ÷ 2', '10', '0', 'a₁'],
            ['10 ÷ 2', '5', '0', 'a₂'],
            ['5 ÷ 2', '2', '1', 'a₃'],
            ['2 ÷ 2', '1', '0', 'a₄'],
            ['1 ÷ 2', '0', '1', '← a₅ (MSB)'],
          ]}
        />
        <p>
          Aşağıdan yukarı: <b className="mono">(41)₁₀ = (101001)₂</b>. Bölüm 0 olunca dur.
        </p>
      </Box>
      <Box kind="example" title="Örnek: (153)₁₀ → sekizli">153 ÷ 8 = 19 kalan 1; 19 ÷ 8 = 2 kalan 3; 2 ÷ 8 = 0 kalan 2 → <b className="mono">(231)₈</b></Box>

      <h2>Onluktan r tabanına: kesir kısmı</h2>
      <p>
        Kesirler için tersini yaparız: <b>kesri sürekli r ile çarp, tam kısımları yaz, yukarıdan aşağı oku.</b> Kesir 0 olunca (veya istenen basamak sayısına
        ulaşınca) dur.
      </p>
      <Box kind="example" title="Örnek: (0.6875)₁₀ → ikili">
        <Table
          compact
          head={['Kesir × 2', 'Sonuç', 'Tam kısım']}
          rows={[
            ['0.6875 × 2', '1.3750', '1 ← a₋₁'],
            ['0.3750 × 2', '0.7500', '0'],
            ['0.7500 × 2', '1.5000', '1'],
            ['0.5000 × 2', '1.0000', '1 ← a₋₄'],
          ]}
        />
        <p>
          Yukarıdan aşağı: <b className="mono">(0.6875)₁₀ = (0.1011)₂</b>. Tam ve kesir kısmı varsa ikisini ayrı çevirip birleştir: (41.6875)₁₀ = (101001.1011)₂.
        </p>
      </Box>
      <Box kind="warn">
        Tam kısımda kalanlar <b>aşağıdan yukarı</b>, kesir kısmında tam kısımlar <b>yukarıdan aşağı</b> okunur. Karıştırmak en sık yapılan hatadır! Bazı
        kesirler hiç bitmez (örn. 0.513 → sekizli); o zaman soruda istenen basamak sayısında durulur.
      </Box>

      <BaseConverter />

      <h2>Sekizli (octal) ve onaltılı (hex): kısa yol</h2>
      <p>
        8 = 2³ ve 16 = 2⁴ olduğu için <b>her octal basamak tam olarak 3 bite</b>, <b>her hex basamak tam olarak 4 bite</b> karşılık gelir. Bu yüzden dönüşüm
        bölme yapmadan, sadece <b>gruplayarak</b> yapılır:
      </p>
      <ol>
        <li>
          İkili sayıyı <b>noktadan başlayarak</b> sola ve sağa doğru 3'erli (octal) ya da 4'erli (hex) gruplara ayır.
        </li>
        <li>Eksik kalan uç grupları 0 ile tamamla.</li>
        <li>Her grubu karşılık gelen rakamla değiştir.</li>
      </ol>
      <Box kind="example" title="Kitaptaki örnek">
        <p className="mono">(10 110 001 101 011 . 111 100 000 110)₂ = (26153.7406)₈</p>
        <p className="mono">(10 1100 0110 1011 . 1111 0000 0110)₂ = (2C6B.F06)₁₆</p>
        <p>Ters yön de aynı: her rakamı 3 (veya 4) bitle yaz.</p>
        <p className="mono">(673.124)₈ = (110 111 011 . 001 010 100)₂ &nbsp;&nbsp; (306.D)₁₆ = (0011 0000 0110 . 1101)₂</p>
      </Box>
      <Table
        compact
        caption="Tablo 1.2 — 0'dan 15'e dört tabanda sayılar (ezberlemek çok işe yarar)"
        head={['Onlu', 'İkili', 'Octal', 'Hex']}
        rows={Array.from({ length: 16 }, (_, i) => [i, i.toString(2).padStart(4, '0'), i.toString(8).padStart(2, '0'), i.toString(16).toUpperCase()])}
      />
      <Box kind="tip">
        Octal ↔ hex dönüşümü için doğrudan yol arama: <b>önce ikiliye</b> çevir, sonra yeniden grupla. Ayrıca onluktan ikiliye büyük sayıları çevirirken önce hex'e
        (16'ya bölerek) sonra ikiliye geçmek daha az adım sürer.
      </Box>

      <Drill
        title="Hızlı alıştırma: dönüşümler"
        make={() => {
          const t = randInt(0, 3);
          if (t === 0) {
            const n = randInt(5, 255);
            return { q: <>({n})<sub>10</sub> = ( ? )<sub>2</sub></>, answer: n.toString(2), norm: 'bin', explain: `Sürekli 2'ye böl: kalanlar ters sırada → ${intToBaseSteps(n, 2).result}` };
          }
          if (t === 1) {
            const b = rbin(randInt(6, 12)).replace(/^0+/, '1');
            const hx = parseInt(b, 2).toString(16).toUpperCase();
            return { q: <>({b})<sub>2</sub> = ( ? )<sub>16</sub></>, answer: hx, explain: 'Sağdan 4\'erli grupla, her grubu hex rakamına çevir.' };
          }
          if (t === 2) {
            const n = randInt(16, 4095);
            const hx = n.toString(16).toUpperCase();
            return { q: <>({hx})<sub>16</sub> = ( ? )<sub>2</sub></>, answer: [n.toString(2), n.toString(2).padStart(hx.length * 4, '0')], norm: 'bin', explain: 'Her hex rakamı 4 bitle yazılır.' };
          }
          const n = randInt(9, 511);
          return { q: <>({n})<sub>10</sub> = ( ? )<sub>8</sub></>, answer: n.toString(8), explain: `Sürekli 8'e böl → ${n.toString(8)}` };
        }}
      />

      <KeyPoints
        items={[
          'Onluk → r (tam kısım): sürekli r\'ye böl, kalanları aşağıdan yukarı oku.',
          'Onluk → r (kesir): sürekli r ile çarp, tam kısımları yukarıdan aşağı oku.',
          'İkili ↔ octal: 3\'lü grup; ikili ↔ hex: 4\'lü grup (noktadan başla).',
          'Octal ↔ hex: ikili üzerinden geç.',
        ]}
      />
    </>
  );
}
const q1_2: LessonDef['questions'] = [
  { id: '1-2-a', kind: 'text', q: 'Convert the hexadecimal number 64CD to binary.', tr: '64CD (hex) sayısını ikiliye çevirin.', answer: ['0110010011001101', '110010011001101'], norm: 'bin', explain: '6=0110, 4=0100, C=1100, D=1101 → 0110 0100 1100 1101' },
  { id: '1-2-b', kind: 'text', q: 'Convert the hexadecimal number 64CD to octal.', tr: '64CD (hex) sayısını sekizliye çevirin.', answer: '62315', norm: 'upper', explain: 'İkili: 110 010 011 001 101 (sağdan 3\'lü grupla) → 6 2 3 1 5.' },
  { id: '1-2-c', kind: 'text', q: 'Convert the decimal number 431 to binary.', tr: '431 onluk sayısını ikiliye çevirin.', answer: '110101111', norm: 'bin', explain: '431 = 1AF₁₆ → 0001 1010 1111 → 110101111. (Hex üzerinden gitmek daha hızlı.)' },
  { id: '1-2-d', kind: 'text', q: <>Express (10110.0101)<sub>2</sub> in decimal.</>, tr: '(10110.0101)₂ sayısını onluk olarak yazın.', answer: '22.3125', norm: 'upper', explain: '16 + 4 + 2 = 22; 0.25 + 0.0625 = 0.3125 → 22.3125' },
  { id: '1-2-e', kind: 'text', q: <>Express (26.24)<sub>8</sub> in decimal.</>, tr: '(26.24)₈ sayısını onluk olarak yazın.', answer: '22.3125', norm: 'upper', explain: '2×8 + 6 = 22; 2/8 + 4/64 = 0.25 + 0.0625 = 0.3125' },
  { id: '1-2-f', kind: 'text', q: <>Convert (0.6875)<sub>10</sub> to binary.</>, tr: '(0.6875)₁₀ sayısını ikiliye çevirin.', answer: ['0.1011', '.1011'], norm: 'upper', explain: '×2 → 1.375 (1), 0.75 (0), 1.5 (1), 1.0 (1) → 0.1011' },
  { id: '1-2-g', kind: 'text', q: <>Convert (1F)<sub>16</sub> to octal.</>, tr: '(1F)₁₆ sayısını sekizliye çevirin.', answer: '37', norm: 'upper', explain: '1F = 0001 1111 = 011 111 → 37₈ (=31₁₀).' },
  { id: '1-2-h', kind: 'mc', q: 'Why are octal and hexadecimal numbers useful in digital systems?', tr: 'Octal ve hex sayılar dijital sistemlerde neden kullanışlıdır?', options: ['Each octal digit corresponds to 3 bits and each hex digit to 4 bits, giving a compact form of binary numbers.', 'Computers internally compute in base 16.', 'They need fewer transistors.', 'They avoid fractions.'], answer: 0, explain: 'Bilgisayar içeride her zaman ikili çalışır; octal/hex sadece insanlar için kısa gösterimdir.' },
];

// =====================================================================
// 1.3 Tümleyenler
// =====================================================================
function L1_3() {
  return (
    <>
      <p>
        Bilgisayarlar çıkarma işlemini doğrudan yapmak yerine çoğunlukla <b>tümleyen</b> <En>complement</En> kullanarak <b>toplamaya çevirir</b>. Böylece
        aynı toplama devresi hem toplama hem çıkarma yapar. Bu ders sınavın en çok soru gelen konularından biridir.
      </p>
      <p>Her r tabanı için iki tür tümleyen vardır:</p>
      <Table
        head={['Tür', 'İngilizce', 'Onluk (r=10)', 'İkili (r=2)']}
        rows={[
          ['Taban tümleyeni', "radix complement (r's complement)", "10's complement", "2's complement"],
          ['Azaltılmış taban tümleyeni', "diminished radix complement ((r−1)'s complement)", "9's complement", "1's complement"],
        ]}
      />

      <h2>(r − 1)'s complement — 9'lar ve 1'ler tümleyeni</h2>
      <Def
        term="Diminished radix complement"
        en={<>Given a number N in base r having n digits, the (r − 1)'s complement of N is defined as (rⁿ − 1) − N.</>}
        tr="n basamaklı, r tabanındaki bir N sayısının (r−1)'ler tümleyeni (rⁿ − 1) − N'dir."
      />
      <p>
        Pratikte formüle gerek yok: <b>her basamağı (r − 1)'den çıkar.</b>
      </p>
      <ul>
        <li>
          <b>9's complement</b>: her basamağı 9'dan çıkar. 546700 → <b className="mono">453299</b>; 012398 → <b className="mono">987601</b>
        </li>
        <li>
          <b>1's complement</b>: her biti <b>ters çevir</b> (0↔1). 1011000 → <b className="mono">0100111</b>; 0101101 → <b className="mono">1010010</b>
        </li>
      </ul>

      <h2>r's complement — 10'lar ve 2'ler tümleyeni</h2>
      <Def
        term="Radix complement"
        en={<>The r's complement of an n-digit number N in base r is defined as rⁿ − N for N ≠ 0 and as 0 for N = 0. It can be obtained by adding 1 to the (r − 1)'s complement.</>}
        tr="n basamaklı N sayısının r'ler tümleyeni, N ≠ 0 için rⁿ − N, N = 0 için 0'dır. (r−1)'ler tümleyenine 1 eklenerek de bulunur."
      />
      <Formula>r's complement = (r − 1)'s complement + 1</Formula>
      <ul>
        <li>
          <b>10's complement</b> of 012398 = 987601 + 1 = <b className="mono">987602</b>; 246700 → 753299 + 1 = <b className="mono">753300</b>
        </li>
        <li>
          <b>2's complement</b> of 1101100 = 0010011 + 1 = <b className="mono">0010100</b>; 0110111 → 1001000 + 1 = <b className="mono">1001001</b>
        </li>
      </ul>
      <Box kind="tip" title="2's complement için süper kısa yol">
        <b>Sağdan başla: ilk 1'e kadar (o 1 dahil) bitleri aynen yaz, geri kalan tüm bitleri ters çevir.</b>
        <br />
        1101<b>100</b> → sağdaki "100" aynen kalır, soldaki "1101" ters döner → 0010<b>100</b>. ✓
        <br />
        Onlukta benzeri: sağdaki 0'ları aynen bırak, ilk sıfır olmayan basamağı 10'dan, geri kalanları 9'dan çıkar.
      </Box>
      <Box kind="info">
        Bir sayının tümleyeninin tümleyeni sayının kendisidir: (N')' = N. Sayıda nokta varsa, noktayı geçici olarak kaldırıp aynı kuralları uygula, sonra noktayı
        yerine koy.
      </Box>

      <Drill
        title="Tümleyen alıştırması"
        make={() => {
          const t = randInt(0, 2);
          if (t === 0) {
            const b = rbin(8);
            return { q: <>2's complement of <span className="mono">{b}</span> = ?</>, answer: radixComplement(b, 2), norm: 'bin', explain: 'Sağdan ilk 1 dahil aynen yaz, gerisini ters çevir.' };
          }
          if (t === 1) {
            const b = rbin(8);
            return { q: <>1's complement of <span className="mono">{b}</span> = ?</>, answer: diminishedComplement(b, 2), norm: 'bin', explain: 'Tüm bitleri ters çevir.' };
          }
          const d = String(randInt(10000, 99999)) + (Math.random() < 0.4 ? '00' : '');
          return { q: <>10's complement of <span className="mono">{d}</span> = ?</>, answer: radixComplement(d, 10), explain: `9's complement: ${diminishedComplement(d, 10)}, +1 → ${radixComplement(d, 10)}` };
        }}
      />

      <h2>Tümleyen ile çıkarma (işaretsiz sayılar)</h2>
      <p>
        <b>M − N</b> işlemini (ikisi de n basamaklı, işaretsiz) r's complement ile yapmak için:
      </p>
      <ol className="steps">
        <li>
          M'ye, N'nin <b>r's complement</b>'ini ekle: M + (rⁿ − N).
        </li>
        <li>
          <b>M ≥ N ise</b> son basamaktan bir <b>elde</b> <En>end carry</En> çıkar → bu elde <b>atılır</b> <En>discarded</En>; kalan sonuçtur.
        </li>
        <li>
          <b>M &lt; N ise</b> elde oluşmaz → sonuç negatiftir: toplamın <b>r's complement</b>'ini al ve önüne <b>−</b> koy.
        </li>
      </ol>
      <Box kind="example" title="Örnek 1.5 ve 1.6 (10's complement)">
        <pre className="addition">
{`72532 − 3250:   M = 72532          3250 − 72532:   M = 03250
  10's comp of N = + 96750          10's comp of N = + 27468
                  -------                          -------
            Sum = 1 69282                    Sum =   30718   (elde yok!)
  End carry'yi at → 69282          Cevap = −(10's comp of 30718) = −69282`}
        </pre>
      </Box>
      <Box kind="example" title="Örnek 1.7 (2's complement)">
        <pre className="addition">
{`X − Y  (X = 1010100, Y = 1000011)     Y − X
   X            =   1010100            Y            =   1000011
 + 2's comp of Y= + 0111101          + 2's comp of X= + 0101100
                  ---------                           ---------
   Sum          = 1 0010001            Sum          =   1101111  (elde yok)
   elde at → X − Y = 0010001          Y − X = −(2's comp of 1101111) = −0010001`}
        </pre>
      </Box>
      <h3>(r − 1)'s complement ile çıkarma: end-around carry</h3>
      <p>
        9's veya 1's complement kullanırsan tek fark şudur: elde çıkarsa atılmaz, <b>en sağdaki basamağa eklenir</b>. Buna <b>end-around carry</b> denir. Elde yoksa
        sonuç yine negatiftir: toplamın (r − 1)'s complement'ini al, − koy.
      </p>
      <Box kind="example" title="Örnek 1.8 (1's complement)">
        <pre className="addition">
{`X − Y:   1010100 + 0111100 (1's comp of Y) = 1 0010000
         end-around carry: 0010000 + 1 = 0010001
Y − X:   1000011 + 0101011 (1's comp of X) = 1101110 (elde yok)
         Y − X = −(1's comp of 1101110) = −0010001`}
        </pre>
      </Box>

      <ComplementLab />

      <Box kind="exam">
        <ul>
          <li>Önce iki sayının basamak sayısını <b>eşitle</b> (başa 0 ekle) — tümleyen n basamağa göre alınır!</li>
          <li>r's complement'te elde → at. (r−1)'s complement'te elde → en sağa ekle (end-around carry).</li>
          <li>Elde yoksa → cevap negatif: toplamın tümleyenini al, eksi koy.</li>
        </ul>
      </Box>

      <KeyPoints
        items={[
          "(r−1)'s complement: her basamağı (r−1)'den çıkar. 1's complement = bitleri ters çevir.",
          "r's complement = (r−1)'s complement + 1. 2's complement kısayolu: sağdan ilk 1'e kadar aynen yaz, gerisini çevir.",
          "M − N = M + (r's comp of N). Elde varsa at (sonuç pozitif); yoksa sonuç = −(r's comp of toplam).",
          '(r−1)\'s complement ile çıkarmada elde en sağa eklenir (end-around carry).',
        ]}
      />
    </>
  );
}
const q1_3: LessonDef['questions'] = [
  { id: '1-3-a', kind: 'text', q: "Obtain the 1's complement of 11011010.", tr: "11011010'un 1'ler tümleyenini bulun.", answer: '00100101', norm: 'bin', explain: 'Tüm bitleri ters çevir.' },
  { id: '1-3-b', kind: 'text', q: "Obtain the 2's complement of 11011010.", tr: "11011010'un 2'ler tümleyenini bulun.", answer: '00100110', norm: 'bin', explain: "1's complement 00100101 + 1 = 00100110. Kısayol: sağdaki '10' aynen, kalan '110110' ters → 001001 10." },
  { id: '1-3-c', kind: 'text', q: "Obtain the 2's complement of 00000000.", tr: "00000000'ın 2'ler tümleyenini bulun.", answer: '00000000', norm: 'bin', explain: "Tanım gereği 0'ın r's complement'i 0'dır (11111111 + 1 = 1 00000000, elde atılır)." },
  { id: '1-3-d', kind: 'text', q: "Find the 9's complement of 25,478,036.", tr: "25.478.036'nın 9'lar tümleyenini bulun.", answer: '74521963', norm: 'num', explain: 'Her basamağı 9\'dan çıkar.' },
  { id: '1-3-e', kind: 'text', q: "Find the 10's complement of 25,000,000.", tr: "25.000.000'ın 10'lar tümleyenini bulun.", answer: '75000000', norm: 'num', explain: "Sağdaki sıfırlar aynen; ilk sıfır olmayan 5 → 10−5 = 5; soldakiler 9'dan: 2 → 7. Sonuç 75 000 000." },
  { id: '1-3-f', kind: 'text', q: "Find the 16's complement of C3DF.", tr: "C3DF'nin 16'lar tümleyenini bulun.", answer: '3C21', norm: 'upper', explain: "15's complement: F−C=3, F−3=C, F−D=2, F−F=0 → 3C20; +1 → 3C21." },
  { id: '1-3-g', kind: 'text', q: "Perform 4637 − 2579 using the 10's complement of the subtrahend. Give the result.", tr: "4637 − 2579 işlemini çıkanın 10'lar tümleyeni ile yapın.", answer: '2058', norm: 'num', explain: "10's comp of 2579 = 7421. 4637 + 7421 = 12058 → elde (1) atılır → 2058." },
  { id: '1-3-h', kind: 'text', q: "Perform 10011 − 10010 using the 2's complement of the subtrahend (5-bit result).", tr: "10011 − 10010 işlemini 2'ler tümleyeni ile yapın (5 bit sonuç).", answer: ['00001', '1'], norm: 'bin', explain: "2's comp of 10010 = 01110. 10011 + 01110 = 1 00001 → elde atılır → 00001." },
  { id: '1-3-i', kind: 'mc', q: "When M − N is computed by adding M to the r's complement of N, what happens if no end carry occurs?", tr: "M − N, M'ye N'nin r's complement'i eklenerek hesaplanırken elde oluşmazsa ne olur?", options: ["The result is negative; take the r's complement of the sum and place a minus sign in front.", 'The result is positive and equals the sum.', 'An overflow occurred; the result is invalid.', 'Add 1 to the least significant digit.'], answer: 0, explain: "Elde yoksa M < N'dir. 'Add 1 to LSD' end-around carry'dir ve (r−1)'s complement'te, elde VARKEN yapılır." },
  { id: '1-3-j', kind: 'mc', q: "In subtraction with the 1's complement, the end carry is:", tr: "1'ler tümleyeni ile çıkarmada son elde:", options: ['added to the least significant bit (end-around carry)', 'discarded', 'ignored only if the numbers are negative', 'used as the sign bit'], answer: 0 },
];

// =====================================================================
// 1.4 İşaretli sayılar
// =====================================================================
function L1_4() {
  return (
    <>
      <p>
        Şimdiye kadar sadece pozitif (işaretsiz — <En>unsigned</En>) sayılarla çalıştık. Peki −9'u bir bilgisayarda nasıl saklarız? Donanımda "−" işareti yok;
        sadece bitler var! Çözüm: <b>en soldaki biti işaret için kullanmak.</b>
      </p>
      <Def
        term="Sign bit"
        en="It is customary to represent the sign with a bit placed in the leftmost position of the number. The convention is to make the sign bit 0 for positive and 1 for negative."
        tr="İşaret, sayının en solundaki bir bitle gösterilir. Kural: işaret biti pozitif için 0, negatif için 1'dir."
      />
      <Box kind="warn" title="Aynı bitler, farklı anlamlar!">
        <span className="mono">11001</span> bit dizisi; işaretsiz yorumlanırsa <b>25</b>, signed-magnitude yorumlanırsa <b>−9</b>'dur. Bitlerin ne anlama geldiğine
        <b>kullanıcı</b> (yorum) karar verir; donanım bilmez.
      </Box>

      <h2>Negatif sayıyı göstermenin üç yolu</h2>
      <p>+9 her üç sistemde de aynıdır: <span className="mono">00001001</span>. Fark negatif sayılardadır. 8 bit ile −9:</p>
      <Table
        head={['Gösterim', 'İngilizce', '−9 (8 bit)', 'Nasıl?']}
        rows={[
          ['İşaret-büyüklük', 'signed-magnitude', <b className="mono">1 0001001</b>, 'İşaret bitini 1 yap, büyüklük aynı kalır.'],
          ["İşaretli 1'ler tümleyeni", "signed-1's-complement", <b className="mono">11110110</b>, '+9\'un tüm bitlerini çevir.'],
          ["İşaretli 2'ler tümleyeni", "signed-2's-complement", <b className="mono">11110111</b>, "+9'un 2's complement'i (işaret biti dahil)."],
        ]}
      />
      <Table
        compact
        caption="Tablo 1.3 — 4 bitlik işaretli sayılar"
        head={['Onluk', "Signed-2's comp.", "Signed-1's comp.", 'Signed-magnitude']}
        rows={[
          ['+7', '0111', '0111', '0111'],
          ['+6', '0110', '0110', '0110'],
          ['+5', '0101', '0101', '0101'],
          ['+4', '0100', '0100', '0100'],
          ['+3', '0011', '0011', '0011'],
          ['+2', '0010', '0010', '0010'],
          ['+1', '0001', '0001', '0001'],
          ['+0', '0000', '0000', '0000'],
          ['−0', '—', '1111', '1000'],
          ['−1', '1111', '1110', '1001'],
          ['−2', '1110', '1101', '1010'],
          ['−3', '1101', '1100', '1011'],
          ['−4', '1100', '1011', '1100'],
          ['−5', '1011', '1010', '1101'],
          ['−6', '1010', '1001', '1110'],
          ['−7', '1001', '1000', '1111'],
          ['−8', '1000', '—', '—'],
        ]}
      />
      <Box kind="exam" title="Tablodan çıkan sınav bilgileri">
        <ul>
          <li>
            Signed-magnitude ve signed-1's-complement'te <b>iki tane sıfır</b> vardır (+0 ve −0). 2's complement'te <b>tek sıfır</b> vardır.
          </li>
          <li>
            n bit 2's complement aralığı: <b>−2ⁿ⁻¹ … +2ⁿ⁻¹ − 1</b> (4 bit: −8 … +7; 8 bit: −128 … +127).
          </li>
          <li>
            Signed-magnitude günlük aritmetikte kullanılır ama bilgisayarda zahmetlidir; 1's complement mantık işlemlerinde işe yarar; <b>bilgisayarlar aritmetik
            için 2's complement kullanır.</b>
          </li>
        </ul>
      </Box>

      <SignedLab />

      <h2>2's complement ile toplama</h2>
      <Def
        term="Arithmetic addition"
        en="The addition of two signed binary numbers with negative numbers represented in signed-2's-complement form is obtained from the addition of the two numbers, including their sign bits. A carry out of the sign-bit position is discarded."
        tr="2's complement gösterimdeki iki işaretli sayının toplamı, işaret bitleri DAHİL normal toplama yapılarak bulunur. İşaret bitinden taşan elde atılır."
      />
      <pre className="addition">
{`   +6   00000110        −6   11111010        +6   00000110        −6   11111010
 +13   00001101      +13   00001101      −13   11110011      −13   11110011
 ----  --------      ----  --------      ----  --------      ----  --------
 +19   00010011       +7 1 00000111       −7   11111001      −19 1 11101101
                         (elde atılır)                           (elde atılır)`}
      </pre>
      <p>
        Negatif sonuç (11111001) otomatik olarak 2's complement formundadır: değeri bulmak için 2's complement'ini al → 00000111 = 7 → sonuç <b>−7</b>.
      </p>
      <Box kind="warn" title="Taşma (overflow)">
        Sonuç n bite sığmazsa yanlış çıkar. İpucu: <b>iki pozitifin toplamı negatif</b> veya <b>iki negatifin toplamı pozitif</b> görünüyorsa taşma vardır. Bu yüzden
        yeterli sayıda bit kullanılmalıdır. (Farklı işaretli iki sayı toplanınca taşma olmaz.)
      </Box>

      <h2>2's complement ile çıkarma</h2>
      <Def
        term="Arithmetic subtraction"
        en="Take the 2's complement of the subtrahend (including the sign bit) and add it to the minuend (including the sign bit). A carry out of the sign-bit position is discarded."
        tr="Çıkanın (işaret biti dahil) 2's complement'ini al ve eksilene ekle. İşaret bitinden çıkan elde atılır."
      />
      <Formula>(±A) − (+B) = (±A) + (−B) &nbsp;&nbsp;&nbsp; (±A) − (−B) = (±A) + (+B)</Formula>
      <Box kind="example" title="(−6) − (−13) = +7">
        <span className="mono">11111010 − 11110011</span> → çıkanın 2's complement'i 00001101 → <span className="mono">11111010 + 00001101 = 1 00000111</span> → elde atılır →{' '}
        <b>+7</b>.
      </Box>
      <Box kind="info">
        Büyük avantaj: işaretli ve işaretsiz sayılar <b>aynı toplama devresiyle</b> işlenebilir; yorum farkı sadece kullanıcıdadır. Bu yüzden 2's complement evrensel
        olarak kullanılır.
      </Box>

      <TwosAdder />

      <Drill
        title="İşaretli sayı alıştırması"
        make={() => {
          const t = randInt(0, 1);
          if (t === 0) {
            const v = randInt(-127, -1);
            return { q: <>Represent {v} in 8-bit signed-2's-complement.</>, answer: toSignedBinary(v, 8, 'twos')!, norm: 'bin', explain: `+${-v} = ${toSignedBinary(-v, 8, 'twos')} → 2's complement` };
          }
          const b = '1' + rbin(7);
          return { q: <>The 8-bit signed-2's-complement number <span className="mono">{b}</span> equals (decimal)?</>, answer: String(signedViews(b).twosComplement), norm: 'num', explain: `İşaret biti 1 → negatif. 2's complement: ${radixComplement(b, 2)} = ${-signedViews(b).twosComplement}` };
        }}
      />

      <KeyPoints
        items={[
          'En soldaki bit işaret bitidir: 0 → +, 1 → −.',
          "−9 (8 bit): signed-magnitude 10001001, 1's comp 11110110, 2's comp 11110111.",
          "2's complement: tek sıfır, aralık −2ⁿ⁻¹ … 2ⁿ⁻¹−1. Bilgisayarlar bunu kullanır.",
          'Toplama: işaret bitleri dahil topla, işaret bitinden çıkan eldeyi at.',
          "Çıkarma: çıkanın 2's complement'ini al, topla.",
        ]}
      />
    </>
  );
}
const q1_4: LessonDef['questions'] = [
  { id: '1-4-a', kind: 'text', q: "Represent −9 in 8-bit signed-2's-complement form.", tr: "−9'u 8 bit işaretli 2'ler tümleyeni ile gösterin.", answer: '11110111', norm: 'bin' },
  { id: '1-4-b', kind: 'text', q: "Represent −9 in 8-bit signed-1's-complement form.", tr: "−9'u 8 bit işaretli 1'ler tümleyeni ile gösterin.", answer: '11110110', norm: 'bin' },
  { id: '1-4-c', kind: 'text', q: "What is the decimal value of the 8-bit signed-2's-complement number 11111001?", tr: '8 bit 2\'s complement 11111001 sayısının onluk değeri nedir?', answer: '-7', norm: 'num', explain: "İşaret biti 1 → negatif. 2's complement: 00000111 = 7 → −7." },
  { id: '1-4-d', kind: 'mc', q: "What is the range of a 4-bit signed-2's-complement number?", tr: '4 bitlik işaretli 2\'s complement sayının aralığı nedir?', options: ['−8 to +7', '−7 to +7', '−8 to +8', '0 to 15'], answer: 0 },
  { id: '1-4-e', kind: 'mc', q: 'Which representations have two distinct representations of zero (+0 and −0)?', tr: 'Hangi gösterimlerde iki farklı sıfır (+0 ve −0) vardır?', options: ["Signed-magnitude and signed-1's-complement", "Only signed-2's-complement", "Signed-2's-complement and signed-magnitude", 'All three'], answer: 0 },
  { id: '1-4-f', kind: 'text', q: "Using 8-bit signed-2's-complement, compute (+29) + (−49). Give the 8-bit result.", tr: '(+29) + (−49) işlemini 8 bit 2\'s complement ile yapın; 8 bitlik sonucu yazın.', answer: '11101100', norm: 'bin', explain: '+29 = 00011101, −49 = 11001111. Toplam = 11101100 = −20 ✓' },
  { id: '1-4-g', kind: 'mc', q: "When two signed-2's-complement numbers are added, the carry out of the sign-bit position is:", tr: "İki 2's complement sayı toplanırken işaret bitinden çıkan elde:", options: ['discarded', 'added to the LSB', 'kept as a new sign bit', 'an indication that the result is negative'], answer: 0 },
  { id: '1-4-h', kind: 'mc', q: 'The 5-bit string 10011 represents which values in unsigned and signed-magnitude interpretations, respectively?', tr: '10011 (5 bit) işaretsiz ve işaret-büyüklük olarak hangi değerlerdir?', options: ['19 and −3', '19 and −13', '−13 and 3', '3 and −19'], answer: 0, explain: 'İşaretsiz: 16+2+1 = 19. Signed-magnitude: işaret 1 (−), büyüklük 0011 = 3 → −3.' },
  { id: '1-4-i', kind: 'mc', q: "In 8-bit signed-2's-complement, (+70) + (+80) gives:", tr: "8 bit 2's complement'te (+70) + (+80) ne verir?", options: ['an overflow — the result appears negative', 'the correct result +150', 'a carry that must be added back', '−150'], answer: 0, explain: '+150 > +127 olduğu için 8 bite sığmaz; iki pozitifin toplamı negatif görünür → taşma.' },
];

// =====================================================================
// 1.5 İkili kodlar
// =====================================================================
function L1_5() {
  return (
    <>
      <p>
        Dijital sistemler sadece sayıları değil harfleri, sembolleri, komutları da işler. Hepsi bit gruplarıyla, yani <b>ikili kodlarla</b> <En>binary codes</En>{' '}
        gösterilir.
      </p>
      <Def
        term="Binary code"
        en={<>An n-bit binary code is a group of n bits that assumes up to 2ⁿ distinct combinations of 1's and 0's, with each combination representing one element of the set that is being coded.</>}
        tr="n bitlik bir ikili kod, en fazla 2ⁿ farklı 0-1 kombinasyonu alabilen n bitlik bir gruptur; her kombinasyon kodlanan kümenin bir elemanını temsil eder."
      />
      <Box kind="tip" title="Kaç bit gerekir?">
        m elemanı kodlamak için <b>2ⁿ ≥ m</b> olacak en küçük n gerekir. 10 rakam → 4 bit (2⁴ = 16, 6 kombinasyon kullanılmaz). 52 iskambil kartı → <b>6 bit</b> (2⁶ = 64).
      </Box>

      <h2>BCD (Binary-Coded Decimal)</h2>
      <p>
        İnsanlar onluk düşünür. BCD, <b>her onluk basamağı ayrı ayrı 4 bitle</b> yazar (ağırlıklar 8-4-2-1).
      </p>
      <Table compact head={['Rakam', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']} rows={[['BCD', ...CODE_TABLE.BCD]]} />
      <Box kind="example">
        <p className="mono">(396)₁₀ = 0011 1001 0110 (BCD) &nbsp; ama &nbsp; (396)₁₀ = 110001100 (ikili)</p>
        <p>
          BCD 12 bit, ikili 9 bit kullanır. <b>BCD ≠ ikili sayı!</b> 1010–1111 arası kombinasyonlar BCD'de <b>geçersizdir</b> (kullanılmaz). Örneğin onluk 10 BCD'de{' '}
          <span className="mono">0001 0000</span>'dır.
        </p>
      </Box>

      <h3>BCD toplama</h3>
      <p>Her basamak çifti ikili toplanır. Toplam 9'dan büyükse (veya elde oluşursa) sonuç geçersizdir → <b>6 (0110) eklenir</b>; bu, doğru basamağı ve bir sonraki basamağa eldeyi üretir.</p>
      <pre className="addition">
{`   4    0100          4    0100          8    1000
 + 5  + 0101        + 8  + 1000        + 9  + 1001
 ---  ------        ---  ------        ---  ------
   9    1001 ✓       12    1100 (>9)    17  1 0001 (elde!)
                          + 0110             + 0110
                         ------             ------
                        1 0010 = 12        1 0111 = 17`}
      </pre>
      <Box kind="info" title="Neden 6?">4 bit 16 kombinasyon taşır ama BCD sadece 10 kullanır. Aradaki 6 geçersiz kombinasyonu "atlamak" için 6 eklenir.</Box>
      <BcdAdder />

      <h3>Onluk aritmetik (kısaca)</h3>
      <p>
        İşaretli onluk sayılar da benzer şekilde gösterilebilir: işaret basamağı pozitif için <b>0</b>, negatif için <b>9</b> olur ve negatif sayılar
        <b>10's complement</b> ile yazılır (signed-10's-complement). Toplamada işaret basamağı dahil toplanır, taşan elde atılır. Örnek: (+375) + (−240) → 0 375 + 9 760 =
        <b> 1</b> 0 135 → elde atılır → +135.
      </p>

      <h2>Diğer onluk kodlar</h2>
      <Table
        compact
        caption="Tablo 1.5 — Dört farklı onluk kod"
        head={['Rakam', 'BCD 8421', '2421', 'Excess-3', '8 4 −2 −1']}
        rows={Array.from({ length: 10 }, (_, d) => [d, CODE_TABLE.BCD[d], CODE_TABLE['2421'][d], CODE_TABLE['Excess-3'][d], CODE_TABLE['8,4,-2,-1'][d]])}
      />
      <ul>
        <li>
          <b>Ağırlıklı kodlar</b> <En>weighted codes</En>: 8421, 2421, 84−2−1. Her bit bir ağırlık taşır; rakam = Σ(bit × ağırlık). Örn. 2421'de 1011 = 2+0+2+1 = 5.
        </li>
        <li>
          <b>Excess-3</b>: ağırlıksız; BCD değerine <b>3 eklenerek</b> elde edilir (5 → 0101 + 0011 = 1000).
        </li>
        <li>
          <b>Self-complementing</b> (kendini tümleyen): bir rakamın 9's complement'i, kodun bitleri ters çevrilerek elde edilir. 2421, excess-3 ve 84−2−1
          self-complementing'dir. Örnek (excess-3): 395 = 0110 1100 1000 → bitleri çevir → 1001 0011 0111 = 604 = 9's complement of 395 ✓
        </li>
      </ul>

      <h2>Gray kodu</h2>
      <p>
        Gray kodunda ardışık iki sayı arasında <b>yalnızca bir bit</b> değişir. Örneğin normal ikilide 7 → 8 geçişi (0111 → 1000) dört biti birden değiştirir;
        bitler aynı anda değişmezse ara geçişte yanlış değerler görülebilir. Gray kodunda 7 → 8 = 0100 → 1100: tek bit değişir.
      </p>
      <Table
        compact
        caption="Tablo 1.6 — 4 bit Gray kodu"
        head={['Onluk', ...Array.from({ length: 8 }, (_, i) => i)]}
        rows={[
          ['Gray', ...Array.from({ length: 8 }, (_, i) => binToGray(i.toString(2).padStart(4, '0')))],
        ]}
      />
      <Table
        compact
        head={['Onluk', ...Array.from({ length: 8 }, (_, i) => i + 8)]}
        rows={[['Gray', ...Array.from({ length: 8 }, (_, i) => binToGray((i + 8).toString(2).padStart(4, '0')))]]}
      />
      <Box kind="tip" title="İkiliden Gray'e pratik kural">
        İlk (en soldaki) bit aynen yazılır; sonraki her Gray biti, ikili sayıdaki <b>kendisi ve solundaki bit farklıysa 1, aynıysa 0</b>'dır (XOR). Örn. 0111 → 0, 0⊕1=1, 1⊕1=0, 1⊕1=0 → 0100.
        K-map'lerdeki 00, 01, 11, 10 sıralaması da Gray kodudur (Bölüm 3'te göreceğiz).
      </Box>

      <h2>ASCII karakter kodu</h2>
      <p>
        <b>ASCII</b> <En>American Standard Code for Information Interchange</En>, karakterleri <b>7 bit</b> ile kodlar → 2⁷ = <b>128</b> karakter:
      </p>
      <ul>
        <li>
          <b>94 yazdırılabilir</b> <En>printing</En> karakter: 26 büyük harf, 26 küçük harf, 10 rakam, 32 özel karakter (%, *, $ …).
        </li>
        <li>
          <b>34 kontrol karakteri</b> <En>control characters</En> (yazdırılmaz): format effectors (BS, HT, CR…), information separators, communication control (ACK, NAK, STX…).
        </li>
      </ul>
      <Table
        compact
        head={['Karakter', 'ASCII (7 bit)', 'Hex']}
        rows={[
          ['A', '100 0001', '41'],
          ['B', '100 0010', '42'],
          ['a', '110 0001', '61'],
          ['0', '011 0000', '30'],
          ['9', '011 1001', '39'],
          ['boşluk (SP)', '010 0000', '20'],
        ]}
      />
      <Box kind="exam">
        <ul>
          <li>Büyük ↔ küçük harf arasında sadece <b>b₆</b> biti farklıdır (A = 1000001, a = 1100001). Bu, sık sorulan bir sorudur.</li>
          <li>Rakamların ASCII kodu 011 ile başlar: '0' = 0110000, '5' = 0110101.</li>
          <li>ASCII genelde 8 bitlik bir byte'ta saklanır; fazladan bit parite veya ek karakterler için kullanılır.</li>
        </ul>
      </Box>

      <h2>Hata algılama: parite biti</h2>
      <Def
        term="Parity bit"
        en="To detect errors in data communication and processing, an eighth bit is sometimes added to the ASCII character to indicate its parity. A parity bit is an extra bit included with a message to make the total number of 1's either even or odd."
        tr="Veri iletiminde hataları algılamak için ASCII karakterine bazen sekizinci bir bit (parite biti) eklenir. Parite biti, toplam 1 sayısını çift ya da tek yapmak için eklenen fazladan bittir."
      />
      <Table
        compact
        head={['Karakter', 'Çift parite (even)', 'Tek parite (odd)']}
        rows={[
          ['A = 1000001', <span className="mono"><b>0</b>1000001</span>, <span className="mono"><b>1</b>1000001</span>],
          ['T = 1010100', <span className="mono"><b>1</b>1010100</span>, <span className="mono"><b>0</b>1010100</span>],
        ]}
      />
      <p>
        Alıcı, gelen 1'lerin sayısının paritesini kontrol eder; uymuyorsa hata vardır (gönderici NAK alır ve tekrar gönderir). Parite <b>tek sayıda</b> bit hatasını
        algılar; <b>iki (çift sayıda) bit</b> aynı anda bozulursa algılayamaz.
      </p>

      <CodeExplorer />

      <Drill
        title="Kod alıştırması"
        make={() => {
          const t = randInt(0, 2);
          if (t === 0) {
            const d = String(randInt(10, 9999));
            return { q: <>Decimal {d} in BCD = ?</>, answer: [...d].map((c) => CODE_TABLE.BCD[+c]).join(''), norm: 'bin', explain: 'Her rakamı ayrı ayrı 4 bitle yaz.' };
          }
          if (t === 1) {
            const d = randInt(0, 15);
            const b = d.toString(2).padStart(4, '0');
            return { q: <>4-bit Gray code of decimal {d} (binary {b}) = ?</>, answer: binToGray(b), norm: 'bin', explain: 'İlk bit aynen; sonra komşu bitler farklıysa 1.' };
          }
          const b = rbin(7);
          const kind = Math.random() < 0.5 ? 'even' : 'odd';
          return { q: <>The {kind} parity bit for <span className="mono">{b}</span> is?</>, answer: parityBit(b, kind as 'even'), norm: 'bin', explain: `1 sayısı: ${[...b].filter((c) => c === '1').length}` };
        }}
      />

      <KeyPoints
        items={[
          'm eleman için 2ⁿ ≥ m olacak n bit gerekir.',
          "BCD: her onluk rakam 4 bit; 1010–1111 geçersiz. BCD toplamada sonuç > 9 ise +6 (0110).",
          '2421, Excess-3 (BCD+3), 84−2−1 self-complementing kodlardır.',
          'Gray kodu: ardışık sayılar arasında tek bit değişir.',
          'ASCII: 7 bit, 128 karakter (94 yazdırılabilir + 34 kontrol). Büyük/küçük harf farkı b₆.',
          'Parite biti 1 sayısını çift/tek yapar; tek sayıda hatayı yakalar.',
        ]}
      />
    </>
  );
}
const q1_5: LessonDef['questions'] = [
  { id: '1-5-a', kind: 'text', q: 'Convert decimal 6,514 to BCD.', tr: '6514 sayısını BCD koduna çevirin.', answer: '0110010100010100', norm: 'bin', explain: '6=0110, 5=0101, 1=0001, 4=0100' },
  { id: '1-5-b', kind: 'text', q: 'Add the BCD digits 8 + 9 and give the BCD result (8 bits).', tr: '8 + 9 BCD toplamını yapın (8 bit BCD sonuç).', answer: '00010111', norm: 'bin', explain: '1000 + 1001 = 1 0001 (elde var) → +0110 → 1 0111 → 0001 0111 = 17' },
  { id: '1-5-c', kind: 'text', q: 'Represent the decimal number 6,248 in excess-3 code.', tr: '6248 sayısını excess-3 kodunda gösterin.', answer: '1001010101111011', norm: 'bin', explain: 'Her rakama 3 ekle: 9=1001, 5=0101, 7=0111, 11=1011' },
  { id: '1-5-d', kind: 'text', q: 'Represent the decimal number 6,248 in 2421 code.', tr: '6248 sayısını 2421 kodunda gösterin.', answer: '1100001001001110', norm: 'bin', explain: '6=1100, 2=0010, 4=0100, 8=1110 (Tablo 1.5)' },
  { id: '1-5-e', kind: 'mc', q: 'Which of the following codes is self-complementing?', tr: 'Aşağıdakilerden hangisi kendini tümleyen (self-complementing) bir koddur?', options: ['Excess-3', 'BCD (8421)', 'Gray code', 'ASCII'], answer: 0 },
  { id: '1-5-f', kind: 'text', q: 'What is the minimum number of bits needed to assign a unique binary code to each of the 52 playing cards?', tr: '52 iskambil kartının her birine farklı bir kod atamak için en az kaç bit gerekir?', answer: '6', norm: 'num', explain: '2⁵ = 32 < 52 ≤ 64 = 2⁶' },
  { id: '1-5-g', kind: 'text', q: 'What is the 4-bit Gray code for decimal 7?', tr: 'Onluk 7\'nin 4 bit Gray kodu nedir?', answer: '0100', norm: 'bin', explain: '7 = 0111 → 0, 0⊕1=1, 1⊕1=0, 1⊕1=0 → 0100' },
  { id: '1-5-h', kind: 'text', q: 'Decode the 7-bit ASCII code 1001010.', tr: '1001010 ASCII kodunu çözün (hangi karakter?).', answer: 'J', norm: 'upper', explain: '100 1010 = 4A hex = 74. A=41 olduğuna göre 4A, A\'dan 9 sonrası: J.' },
  { id: '1-5-i', kind: 'mc', q: 'Which bit must be complemented to change an ASCII letter from capital to lowercase?', tr: 'Bir ASCII harfini büyükten küçüğe çevirmek için hangi bit tümlenmelidir?', options: ['b6', 'b7', 'b1', 'b5'], answer: 0, explain: 'A = 1000001, a = 1100001 → soldan ikinci bit (b₇b₆…b₁ numaralamasında b₆).' },
  { id: '1-5-j', kind: 'text', q: 'The state of a 12-bit register is 100010010111. What is its content if it represents three decimal digits in BCD?', tr: '12 bitlik register 100010010111 içeriyor. BCD olarak hangi üç basamaklı sayıdır?', answer: '897', norm: 'num', explain: '1000 1001 0111 = 8 9 7' },
  { id: '1-5-k', kind: 'text', q: 'The same register 100010010111 — what is its content if it represents three decimal digits in excess-3 code?', tr: 'Aynı register excess-3 kodunda hangi sayıdır?', answer: '564', norm: 'num', explain: 'Her gruptan 3 çıkar: 1000→5, 1001→6, 0111→4' },
  { id: '1-5-l', kind: 'mc', q: 'How many printing characters are there in 7-bit ASCII, and how many of them are special characters?', tr: '7 bit ASCII\'de kaç yazdırılabilir karakter vardır, kaçı özel karakterdir?', options: ['94 printing, 32 special', '128 printing, 34 special', '95 printing, 10 special', '94 printing, 26 special'], answer: 0, explain: '94 − 26 − 26 − 10 = 32 özel karakter.' },
];

// =====================================================================
// 1.6 Registerlar ve ikili mantık
// =====================================================================
function L1_6() {
  return (
    <>
      <h2>İkili hücre ve register</h2>
      <p>
        Bilgiyi saklamak için <b>ikili hücre</b> <En>binary cell</En> kullanılır: iki kararlı durumu olan ve 1 bit saklayabilen bir eleman. Hücrelerin bir araya
        gelmesiyle <b>register</b> oluşur.
      </p>
      <Def
        term="Register"
        en="A register is a group of binary cells. A register with n cells can store any discrete quantity of information that contains n bits."
        tr="Register, ikili hücrelerden oluşan bir gruptur. n hücreli bir register, n bit içeren herhangi bir ayrık bilgiyi saklayabilir."
      />
      <Box kind="example">
        16 bitlik bir register'da <span className="mono">1100001111001001</span> olsun. Bu içerik ikili sayı olarak yorumlanırsa 50 121'dir; iki tane 8 bitlik ASCII
        karakteri (parite bitli) olarak yorumlanırsa "C" ve "I" harfleridir. <b>Register sadece bitleri tutar; anlamı uygulama belirler.</b>
      </Box>
      <h3>Register transferi</h3>
      <p>
        Dijital sistemlerde bilgi register'lar arasında taşınır: <b>register transfer</b>. Örneğin klavyeden basılan bir tuşun 8 bitlik kodu önce bir <i>giriş
        register'ına</i> gelir, sonra işlemcideki bir register'a, oradan da <i>bellek register'ına</i> aktarılır. İşlemcide iki register'daki (R1, R2) sayılar
        mantık devreleriyle toplanıp sonuç R3'e yazılabilir. Yani bir dijital sistem; <b>register'lar + aralarındaki transferler + işleme yapan mantık devreleri</b>
        olarak düşünülebilir.
      </p>

      <h2>İkili mantık</h2>
      <p>
        <b>İkili mantık</b> <En>binary logic</En>, iki değer alan değişkenler (0/1, doğru/yanlış, evet/hayır) ve üzerlerindeki mantıksal işlemlerden oluşur. Üç temel
        işlem vardır:
      </p>
      <Table
        head={['İşlem', 'Gösterim', 'Okunuşu', 'Anlamı']}
        rows={[
          ['AND (VE)', 'x · y  veya  xy', 'x and y', 'İkisi de 1 ise sonuç 1'],
          ['OR (VEYA)', 'x + y', 'x or y', 'En az biri 1 ise sonuç 1'],
          ['NOT (DEĞİL)', "x'  veya  x̄", 'not x', 'Tersi (complement)'],
        ]}
      />
      <Table
        compact
        caption="Tablo 1.8 — Doğruluk tabloları (truth tables)"
        head={['x', 'y', 'x · y (AND)', 'x + y (OR)', "x' (NOT)"]}
        rows={[
          [0, 0, 0, 0, 1],
          [0, 1, 0, 1, 1],
          [1, 0, 0, 1, 0],
          [1, 1, 1, 1, 0],
        ]}
      />
      <Def
        term="Truth table"
        en="A truth table is a table of all possible combinations of the variables, showing the relation between the values that the variables may take and the result of the operation."
        tr="Doğruluk tablosu, değişkenlerin alabileceği tüm kombinasyonları ve her kombinasyon için işlemin sonucunu gösteren tablodur."
      />
      <Box kind="warn" title="İkili mantık ≠ ikili aritmetik">
        Aritmetikte 1 + 1 = 10 (iki). Mantıkta <b>1 + 1 = 1</b> (OR: "en az biri 1 mi? evet"). Aynı + sembolü, bağlama göre farklı anlam taşır!
      </Box>

      <h2>Lojik kapılar</h2>
      <p>
        <b>Lojik kapılar</b> <En>logic gates</En>, bir veya daha fazla giriş sinyali alıp bir çıkış üreten elektronik devrelerdir. Sinyaller voltajdır: örneğin
        lojik 1 ≈ 3 V, lojik 0 ≈ 0 V. Her seviyenin kabul edilebilir bir aralığı vardır; aradaki <b>geçiş bölgesi</b> sadece geçiş sırasında kullanılır.
      </p>
      <GatePlayground only={['AND', 'OR', 'NOT']} />
      <p>
        AND ve OR kapılarının ikiden fazla girişi olabilir: 3 girişli AND, <b>tüm</b> girişler 1 ise 1 verir; 4 girişli OR, girişlerden <b>herhangi biri</b> 1 ise 1 verir.
      </p>
      <h3>Zamanlama diyagramı</h3>
      <p>
        Kapıların zaman içindeki davranışı <b>zamanlama diyagramı</b> <En>timing diagram</En> ile gösterilir: yatay eksen zaman, dikey eksen sinyal seviyesi (0 veya 1).
      </p>
      <TimingDiagram />
      <Box kind="exam">
        Sınavda verilen giriş dalga biçimlerine göre çıkış dalga biçimini çizmen istenebilir. Yöntem: zamanı dilimlere böl, her dilimde girişleri oku, doğruluk
        tablosundan çıkışı bul.
      </Box>
      <h3>Bit düzeyinde (bitwise) işlemler</h3>
      <p>İki bit dizisine mantık işlemi uygulamak için karşılıklı bitlere ayrı ayrı işlem yapılır:</p>
      <pre className="addition">
{`A     = 10110001
B     = 10101100
AND   = 10100000
OR    = 10111101
XOR   = 00011101   (bitler farklıysa 1)
NOT A = 01001110`}
      </pre>
      <KeyPoints
        items={[
          'Register = ikili hücreler grubu; n hücre n bit saklar. Anlamı yoruma bağlıdır.',
          'Üç temel işlem: AND (·), OR (+), NOT (\').',
          'Mantıkta 1 + 1 = 1; aritmetikte 1 + 1 = 10.',
          'Doğruluk tablosu tüm giriş kombinasyonlarını (2ⁿ satır) listeler.',
        ]}
      />
    </>
  );
}
const q1_6: LessonDef['questions'] = [
  { id: '1-6-a', kind: 'mc', q: 'In binary logic, 1 + 1 equals:', tr: 'İkili mantıkta 1 + 1 kaçtır?', options: ['1', '10', '2', '0'], answer: 0, explain: '+ burada OR işlemidir.' },
  { id: '1-6-b', kind: 'mc', q: 'A register with n cells can store:', tr: 'n hücreli bir register ne saklayabilir?', options: ['n bits of information', '2ⁿ bits of information', 'n bytes', 'only one decimal digit'], answer: 0 },
  { id: '1-6-c', kind: 'text', q: 'What is the output of a 3-input AND gate when the inputs are 1, 1, 0?', tr: 'Girişleri 1, 1, 0 olan 3 girişli AND kapısının çıkışı nedir?', answer: '0', norm: 'num' },
  { id: '1-6-d', kind: 'text', q: 'Given A = 10110001 and B = 10101100, evaluate A AND B (bitwise).', tr: 'A = 10110001, B = 10101100 için bit düzeyinde A AND B nedir?', answer: '10100000', norm: 'bin' },
  { id: '1-6-e', kind: 'text', q: 'Given A = 10110001 and B = 10101100, evaluate A XOR B (bitwise).', tr: 'A XOR B (bit düzeyinde) nedir?', answer: '00011101', norm: 'bin' },
  { id: '1-6-f', kind: 'text', q: 'Inputs over five time intervals are x = 0,1,1,0,0 and y = 0,0,1,1,0. Write the OR output sequence (5 bits).', tr: 'Beş zaman diliminde x = 0,1,1,0,0 ve y = 0,0,1,1,0. OR çıkış dizisini yazın (5 bit).', answer: '01110', norm: 'bin' },
  { id: '1-6-g', kind: 'mc', q: 'What determines the meaning of the bits stored in a register?', tr: "Bir register'daki bitlerin anlamını ne belirler?", options: ['The application / interpretation by the user', 'The number of cells', 'The voltage level', 'The clock frequency'], answer: 0 },
];

export const CH1: LessonDef[] = [
  { id: '1-1', chapter: 1, num: '1.1', title: 'Dijital Sistemler ve İkili Sayılar', titleEn: 'Digital Systems and Binary Numbers', book: '§1.1–1.2, s. 1–6', minutes: 30, Component: L1_1, questions: q1_1 },
  { id: '1-2', chapter: 1, num: '1.2', title: 'Taban Dönüşümleri, Octal ve Hex', titleEn: 'Number-Base Conversions, Octal and Hexadecimal', book: '§1.3–1.4, s. 6–10', minutes: 35, Component: L1_2, questions: q1_2 },
  { id: '1-3', chapter: 1, num: '1.3', title: 'Tümleyenler ve Tümleyenle Çıkarma', titleEn: 'Complements of Numbers', book: '§1.5, s. 10–14', minutes: 40, Component: L1_3, questions: q1_3 },
  { id: '1-4', chapter: 1, num: '1.4', title: 'İşaretli İkili Sayılar', titleEn: 'Signed Binary Numbers', book: '§1.6, s. 14–18', minutes: 35, Component: L1_4, questions: q1_4 },
  { id: '1-5', chapter: 1, num: '1.5', title: 'İkili Kodlar (BCD, Gray, ASCII, Parite)', titleEn: 'Binary Codes', book: '§1.7, s. 18–27', minutes: 45, Component: L1_5, questions: q1_5 },
  { id: '1-6', chapter: 1, num: '1.6', title: 'Registerlar ve İkili Mantık', titleEn: 'Binary Storage, Registers and Binary Logic', book: '§1.8–1.9, s. 27–33', minutes: 25, Component: L1_6, questions: q1_6 },
];
