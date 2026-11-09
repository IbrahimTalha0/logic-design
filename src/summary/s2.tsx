// ÖZET PANEL — Bölüm 2: Boole cebri ve lojik kapılar
import { Box, En, Formula, Table } from '../components/ui';
import { GatePlayground, TruthTableLab } from '../interactives/LogicLabs';
import type { SummaryDef } from '../data/types';

function S2_1() {
  return (
    <>
      <h2>Postülalar (Huntington)</h2>
      <p className="small">Boole cebri iki işlem (+, ·) ve en az iki elemanla (0, 1) tanımlanır. Postülalar ispat gerektirmez; teoremler bunlardan türetilir.</p>
      <Table
        compact
        head={['', '(a)', '(b) — dual']}
        rows={[
          ['P2 Özdeşlik (identity)', 'x + 0 = x', 'x · 1 = x'],
          ['P3 Değişme (commutative)', 'x + y = y + x', 'xy = yx'],
          ['P4 Dağılma (distributive)', 'x(y + z) = xy + xz', <b>x + yz = (x + y)(x + z)</b>],
          ['P5 Tümleyen (complement)', "x + x' = 1", "x · x' = 0"],
        ]}
      />
      <Box kind="warn">
        <b>x + yz = (x + y)(x + z)</b> sıradan cebirde yanlıştır ama Boole cebrinde doğrudur. Boole cebrinde çıkarma ve bölme yoktur.
      </Box>
      <h2>Dualite</h2>
      <p>
        Bir ifadenin <b>duali</b>: + ↔ · ve 0 ↔ 1 değiştirilir, değişkenler aynı kalır. Doğru bir eşitliğin duali de doğrudur. (x + 0 = x → x · 1 = x)
      </p>
      <h2>Teoremler</h2>
      <Table
        compact
        head={['Teorem', '(a)', '(b)']}
        rows={[
          ['1 Idempotent', 'x + x = x', 'x · x = x'],
          ['2', 'x + 1 = 1', 'x · 0 = 0'],
          ['3 Involution', "(x')' = x", ''],
          ['4 Birleşme (associative)', 'x + (y + z) = (x + y) + z', 'x(yz) = (xy)z'],
          ['5 DeMorgan', <b>(x + y)' = x'y'</b>, <b>(xy)' = x' + y'</b>],
          ['6 Yutma (absorption)', 'x + xy = x', 'x(x + y) = x'],
        ]}
      />
      <p>
        Öncelik sırası: <b>parantez → NOT → AND → OR</b>.
      </p>
    </>
  );
}

function S2_2() {
  return (
    <>
      <ul>
        <li>
          Boole fonksiyonu; değişkenler, sabitler (0, 1), işlemler ve parantezlerle yazılır. n değişkenli fonksiyonun doğruluk tablosunda <b>2ⁿ satır</b> vardır.
        </li>
        <li>
          <b>Literal</b>: bir değişken veya tümleyeni (x, x'). <b>Terim</b>: literallerin çarpımı. Daha az literal = daha az kapı girişi = daha ucuz devre.
        </li>
      </ul>
      <h2>Cebirsel sadeleştirme — sık kullanılan kalıplar</h2>
      <Table
        compact
        head={['İfade', 'Sonuç', 'Neden']}
        rows={[
          ["x(x' + y)", 'xy', "xx' = 0"],
          ["x + x'y", 'x + y', 'dağılma: (x + x\')(x + y)'],
          ["(x + y)(x + y')", 'x', "x + yy' = x"],
          ["xy + x'z + yz", "xy + x'z", 'konsensüs (consensus) teoremi'],
          ["xy + xy'", 'x', "x(y + y') = x"],
        ]}
      />
      <h2>Tümleyen almak (F')</h2>
      <ol>
        <li>DeMorgan'ı tekrar tekrar uygula, veya</li>
        <li>
          Kısa yol: <b>fonksiyonun dualini al ve her literali tümle</b>.
        </li>
      </ol>
      <Box kind="example">
        F = x'yz' + x'y'z → dual: (x' + y + z')(x' + y' + z) → literalleri tümle: <b>F' = (x + y' + z)(x + y + z')</b>
      </Box>
      <TruthTableLab initial="x'y + xz" />
    </>
  );
}

function S2_3() {
  return (
    <>
      <Table
        compact
        head={['', 'Minterm mⱼ', 'Maxterm Mⱼ']}
        rows={[
          ['Yapı', 'Tüm değişkenlerin AND\'i', 'Tüm değişkenlerin OR\'u'],
          ['bit = 0', "x' yazılır", 'x yazılır'],
          ['bit = 1', 'x yazılır', "x' yazılır"],
          ['Örnek (101)', "m5 = xy'z", "M5 = x' + y + z'"],
        ]}
      />
      <p>
        <b>Mⱼ = mⱼ'</b>. Bir fonksiyon:
      </p>
      <Formula>F = Σ(1 olan satırlar) = Π(0 olan satırlar)</Formula>
      <ul>
        <li>
          Σ ↔ Π dönüşümü: sembolü değiştir, <b>listede olmayan</b> numaraları yaz. F(x,y,z) = Σ(1, 3, 5) = Π(0, 2, 4, 6, 7).
        </li>
        <li>F = Σ(A) ise F' = Σ(diğerleri).</li>
        <li>
          Eksik değişkeni tamamlamak: SOP'ta terimi (x + x') ile çarp; POS'ta terime xx' ekle.
        </li>
      </ul>
      <Box kind="example">
        F = A + B'C → A = AB'C' + AB'C + ABC' + ABC (m4–m7), B'C = A'B'C + AB'C (m1, m5) → <b>F = Σ(1, 4, 5, 6, 7)</b>
      </Box>
      <h2>Standart formlar</h2>
      <ul>
        <li>
          <b>SOP</b> <En>sum of products</En>: AB + C'D → <b>AND–OR</b> iki seviyeli devre.
        </li>
        <li>
          <b>POS</b> <En>product of sums</En>: (A + B)(C' + D) → <b>OR–AND</b> iki seviyeli devre.
        </li>
        <li>Kanonik formda her terim tüm değişkenleri içerir; standart formda içermek zorunda değildir.</li>
      </ul>
    </>
  );
}

function S2_4() {
  return (
    <>
      <p>
        n değişkenle <b>2^(2ⁿ)</b> farklı fonksiyon yazılabilir: 2 değişken → <b>16</b>.
      </p>
      <Table
        compact
        head={['Kapı', 'Fonksiyon', 'Not']}
        rows={[
          ['AND', 'xy', ''],
          ['OR', 'x + y', ''],
          ['NOT (inverter)', "x'", ''],
          ['Buffer', 'x', 'yalnızca sinyali güçlendirir'],
          ['NAND', "(xy)'", 'evrensel'],
          ['NOR', "(x + y)'", 'evrensel'],
          ['XOR', "xy' + x'y = x ⊕ y", 'farklıysa 1'],
          ['XNOR (equivalence)', "xy + x'y' = x ⊙ y", 'aynıysa 1'],
        ]}
      />
      <ul>
        <li>
          <b>Inhibition</b> (xy') ve <b>implication</b> (x' + y) ne değişmeli ne birleşmelidir → standart kapı olarak <b>kullanılmaz</b>.
        </li>
        <li>
          NAND ve NOR değişmelidir ama <b>birleşmeli değildir</b> → çok girişli NAND = (xyz)', NOR = (x + y + z)' olarak tanımlanır.
        </li>
        <li>
          Çok girişli XOR: <b>tek sayıda</b> giriş 1 ise çıkış 1.
        </li>
        <li>
          <b>Pozitif mantık</b> (H = 1) AND kapısı, <b>negatif mantıkta</b> (L = 1) OR kapısıdır (dual).
        </li>
      </ul>
      <GatePlayground />
    </>
  );
}

function S2_5() {
  return (
    <>
      <Table
        compact
        head={['Seviye', 'Kapı sayısı']}
        rows={[
          ['SSI (small-scale)', '< 10'],
          ['MSI (medium-scale)', '10 – 1000'],
          ['LSI (large-scale)', 'binlerce'],
          ['VLSI (very large-scale)', 'yüz binler – milyonlar'],
        ]}
      />
      <Table
        compact
        head={['Aile', 'Öne çıkan özellik']}
        rows={[
          ['TTL', 'yaygın standart'],
          ['ECL', 'yüksek hız'],
          ['MOS', 'yüksek yoğunluk'],
          ['CMOS', 'düşük güç tüketimi (günümüzde baskın)'],
        ]}
      />
      <h2>Parametreler</h2>
      <ul>
        <li>
          <b>Fan-out</b>: bir çıkışın sürebildiği standart yük sayısı. <b>Fan-in</b>: kapının giriş sayısı.
        </li>
        <li>
          <b>Power dissipation</b>: tüketilen güç. <b>Propagation delay</b>: girişten çıkışa geçen süre; çalışma hızı bununla <b>ters orantılıdır</b>.
        </li>
        <li>
          <b>Noise margin</b>: çıkışı bozmadan girişe eklenebilecek en büyük gürültü gerilimi.
        </li>
      </ul>
      <p>
        VLSI devreler <b>bilgisayar destekli tasarım</b> <En>CAD</En> / <En>EDA</En> araçlarıyla tasarlanır: devre şematik çizimle (<En>schematic capture</En>) veya HDL ile tanımlanır, yazılım fiziksel yerleşimi üretir.
      </p>
      <p className="small">Gerçekleme seçenekleri: ASIC, full-custom, FPGA ve PLD (sahada programlanabilir).</p>
    </>
  );
}

export const SUMMARY_CH2: Record<string, SummaryDef> = {
  '2-1': { Component: S2_1, minutes: 12 },
  '2-2': { Component: S2_2, minutes: 12 },
  '2-3': { Component: S2_3, minutes: 15 },
  '2-4': { Component: S2_4, minutes: 10 },
  '2-5': { Component: S2_5, minutes: 6 },
};
