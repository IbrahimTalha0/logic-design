// ÖZET PANEL — Bölüm 3: Kapı seviyesinde sadeleştirme + Verilog
import { Box, Code, Def, En, Formula, Table } from '../components/ui';
import { KMap, KMapPractice } from '../interactives/KMap';
import { TwoLevelCircuit } from '../interactives/Circuits';
import { ParityLab } from '../interactives/LogicLabs';
import { VerilogExercises, VerilogPlayground } from '../interactives/VerilogLab';
import type { SummaryDef } from '../data/types';

function S3_1() {
  return (
    <>
      <p>
        K-map, her karesi bir minterm olan bir diyagramdır. Fonksiyonun 1'lerini yerleştirip <b>komşu 1'leri gruplayarak</b> en sade SOP ifadesini buluruz.
      </p>
      <ul>
        <li>
          Sütunlar <b>Gray sırasında</b>: 00, 01, <b>11, 10</b>. Böylece yan yana iki kare yalnızca bir değişkende farklıdır.
        </li>
        <li>
          3 değişken: üst satır x = 0 (m0 m1 m3 m2), alt satır x = 1 (m4 m5 m7 m6). <b>Sol ve sağ kenar komşudur</b> (harita silindir gibi sarılır).
        </li>
        <li>Grup boyutu 1, 2, 4 veya 8 olmalı; dikdörtgen ve mümkün olduğunca büyük olmalı. Bir 1 birden fazla grupta kullanılabilir.</li>
      </ul>
      <Table
        compact
        head={['3 değişkende grup', 'Terimdeki literal']}
        rows={[
          ['1 kare', '3'],
          ['2 kare', '2'],
          ['4 kare', '1'],
          ['8 kare', 'F = 1'],
        ]}
      />
      <p className="small">
        Gruptan terim okuma: grup içinde <b>değişmeyen</b> değişkenler terime girer (0 ise tümleyeni, 1 ise kendisi).
      </p>
      <KMap n={3} ones={[2, 3, 4, 5]} lockN title="Örnek 3.1: F = Σ(2, 3, 4, 5) = x'y + xy'" />
    </>
  );
}

function S3_2() {
  return (
    <>
      <p>
        4 değişken: satırlar wx, sütunlar yz; ikisi de Gray sırasında. Üst–alt ve sol–sağ kenarlar komşu; <b>dört köşe</b> (m0, m2, m8, m10) birlikte bir gruptur (x'z').
      </p>
      <Table
        compact
        head={['4 değişkende grup', '1', '2', '4', '8', '16']}
        rows={[['Literal', '4', '3', '2', '1', 'F = 1']]}
      />
      <Def
        term="Prime implicant"
        en="A prime implicant is a product term obtained by combining the maximum possible number of adjacent squares in the map. If a minterm in a square is covered by only one prime implicant, that prime implicant is said to be essential."
        tr="Asal implikant, haritada mümkün olan en fazla komşu kare birleştirilerek elde edilen çarpım terimidir. Bir kare yalnızca tek bir asal implikant tarafından kapsanıyorsa, o asal implikant esastır (essential)."
      />
      <ol>
        <li>Tüm asal implikantları bul.</li>
        <li>Önce <b>esas</b> asal implikantları al.</li>
        <li>Kalan 1'leri en az sayıda asal implikantla kapsa. (Birden fazla en sade cevap olabilir.)</li>
      </ol>
      <KMap n={4} vars={['A', 'B', 'C', 'D']} ones={[0, 2, 3, 5, 7, 8, 9, 10, 11, 13, 15]} lockN title="Şekil 3.11: esaslar BD ve B'D' — adımlarla incele" />
      <KMapPractice n={4} />
    </>
  );
}

function S3_3() {
  return (
    <>
      <h2>POS ile sadeleştirme</h2>
      <ol>
        <li>Haritadaki <b>0'ları</b> grupla → F'yi SOP olarak bul.</li>
        <li>DeMorgan ile tümle → F (POS).</li>
      </ol>
      <p className="small">Kısa yol: 0 grubunun terimini doğrudan toplam olarak yaz — sabit 0 olan değişken → x, sabit 1 olan → x'.</p>
      <Box kind="example">
        F = Σ(0, 1, 2, 5, 8, 9, 10): SOP = B'D' + B'C' + A'C'D · 0'lardan F' = AB + CD + BD' → <b>F = (A' + B')(C' + D')(B' + D)</b>
      </Box>
      <h2>Don't-care (X)</h2>
      <p>
        Çıkışın önemsiz olduğu (hiç gelmeyen) kombinasyonlar. İşine geliyorsa grubu büyütmek için <b>1</b> say, gelmiyorsa <b>0</b> say. Hepsini kapsamak zorunlu değil. Örnek:
        BCD girişinde 1010–1111.
      </p>
      <KMap n={4} vars={['w', 'x', 'y', 'z']} ones={[1, 3, 7, 11, 15]} dcs={[0, 2, 5]} lockN title="Örnek 3.8: F = Σ(1, 3, 7, 11, 15), d = Σ(0, 2, 5)" />
    </>
  );
}

function S3_4() {
  return (
    <>
      <p>
        NAND ve NOR <b>evrensel kapılardır</b> <En>universal gates</En>: AND, OR ve NOT yalnız onlarla yapılabilir. Entegre devrelerde en kolay üretilen kapılardır.
      </p>
      <Table
        compact
        head={['Kapı', 'Sembol 1', 'Sembol 2 (alternatif)']}
        rows={[
          ['NAND', 'AND-invert', 'invert-OR: x\' + y\' = (xy)\''],
          ['NOR', 'OR-invert', 'invert-AND: x\'y\' = (x + y)\''],
        ]}
      />
      <ul>
        <li>
          <b>SOP → NAND–NAND</b>: AND–OR devresindeki tüm kapıları NAND yap. <b>POS → NOR–NOR</b>: OR–AND devresinde tüm kapıları NOR yap.
        </li>
        <li>
          <b>Tek literalli terim</b> ikinci seviyeye <b>tümlenerek</b> girer (F = xy' + x'y + z → NAND'e z' girer).
        </li>
        <li>NAND(x, x) = x' → tek girişli NAND tersleyicidir.</li>
        <li>Çok seviyeli: AND → NAND (AND-invert), OR → invert-OR. Aynı hatta karşılanmayan tek bir bubble kaldıysa araya tersleyici ekle.</li>
      </ul>
      <TwoLevelCircuit initial="xy' + x'y + z" />
    </>
  );
}

function S3_5() {
  return (
    <>
      <p>
        AND, OR, NAND, NOR ile 16 iki seviyeli kombinasyon vardır: <b>8'i degenerate</b> (tek işleme indirgenir, ör. AND–AND), <b>8'i nondegenerate</b>.
      </p>
      <Table
        head={['Form', 'Fonksiyon', 'Nasıl gerçeklenir?']}
        rows={[
          ['AND–OR, NAND–NAND', 'SOP', "1'leri grupla"],
          ['OR–AND, NOR–NOR', 'POS', "0'ları grupla"],
          [<b>AND–NOR = NAND–AND</b>, 'AND-OR-INVERT: F = (AB + CD + E)\'', "F'yi SOP bul (0'ları grupla)"],
          [<b>OR–NAND = NOR–OR</b>, 'OR-AND-INVERT: F = [(A + B)(C + D)E]\'', "F'yi POS bul (1'leri grupla, tümle)"],
        ]}
      />
      <ul className="small">
        <li>NAND–AND ve NOR–OR formlarında tek literalli terim için tersleyici gerekir.</li>
        <li>
          <b>Wired logic</b>: açık kollektörlü TTL NAND çıkışları birleşince <b>wired-AND</b> → AND-OR-INVERT; ECL NOR çıkışları birleşince <b>wired-OR</b> → OR-AND-INVERT.
        </li>
      </ul>
    </>
  );
}

function S3_6() {
  return (
    <>
      <Formula>x ⊕ y = xy' + x'y &nbsp; · &nbsp; x ⊙ y = (x ⊕ y)' = xy + x'y'</Formula>
      <Table
        compact
        head={['Özdeşlik', '']}
        rows={[
          ["x ⊕ 0 = x · x ⊕ 1 = x'", "x ⊕ x = 0 · x ⊕ x' = 1"],
          ["x ⊕ y' = x' ⊕ y = (x ⊕ y)'", 'değişmeli ve birleşmeli'],
        ]}
      />
      <ul>
        <li>XOR, 4 tane NAND kapısıyla gerçeklenebilir.</li>
        <li>
          Çok değişkenli XOR <b>tek fonksiyondur</b> <En>odd function</En>: tek sayıda 1 varsa 1. A ⊕ B ⊕ C = Σ(1, 2, 4, 7). Haritada dama tahtası deseni → K-map ile
          sadeleşmez. Tümleyeni (XNOR) çift fonksiyondur.
        </li>
        <li>
          <b>Çift parite üreteci</b>: P = x ⊕ y ⊕ z. <b>Denetleyici</b>: C = x ⊕ y ⊕ z ⊕ P; <b>C = 1 → hata</b>.
        </li>
      </ul>
      <ParityLab />
    </>
  );
}

function S3_7() {
  return (
    <>
      <p>
        <b>HDL</b>: dijital donanımı metinle tanımlayan dil. İki IEEE standardı: VHDL ve Verilog. Akış: <En>design entry</En> → <En>logic simulation</En> (stimulus veren koda{' '}
        <b>test bench</b> denir) → <En>logic synthesis</En> (HDL'den netlist türetir) → <En>timing verification</En> → <En>fault simulation</En>.
      </p>
      <h2>Modül iskeleti</h2>
      <Code>
{`module Simple_Circuit (A, B, C, D, E);
  output D, E;
  input  A, B, C;
  wire   w1;              // iç bağlantı
  and #(30) G1 (w1, A, B); // #(30): 30 birim gecikme (isteğe bağlı)
  not #(10) G2 (E, C);
  or  #(20) G3 (D, w1, E);
endmodule                 // ; YOK`}
      </Code>
      <ul>
        <li>
          Anahtar kelimeler <b>küçük harf</b>, Verilog <b>case sensitive</b>; isimler rakamla başlamaz; <code>//</code> ve <code>/* */</code> yorum.
        </li>
        <li>
          Primitive'ler: and, or, not, nand, nor, xor, xnor, buf. <b>İlk terminal çıkıştır.</b> Kapı örnek adı (G1) isteğe bağlıdır.
        </li>
        <li>
          <code>`timescale 1ns/100ps</code>: birim 1 ns, hassasiyet 0.1 ns.
        </li>
      </ul>
      <h2>Test bench</h2>
      <Code>
{`module t_Simple_Circuit;
  wire D, E;              // çıkışlar wire
  reg  A, B, C;           // girişler reg
  Simple_Circuit M1 (A, B, C, D, E);  // örnek adı ZORUNLU
  initial begin
    A = 1'b0; B = 1'b0; C = 1'b0;
    #100 A = 1'b1; B = 1'b1; C = 1'b1;
  end
  initial #200 $finish;
endmodule`}
      </Code>
      <Box kind="warn" title="En sık puan kaybı">
        Çıkışı sona yazmak · <code>;</code> unutmak / <code>endmodule;</code> · büyük harf anahtar kelime · iç teli wire ile tanımlamamak · test bench'te reg/wire'ı ters
        yapmak · örnek adını unutmak.
      </Box>
      <VerilogPlayground initial={1} height={16} />
    </>
  );
}

function S3_8() {
  return (
    <>
      <p>Bir devre Verilog'da üç yolla tanımlanır: kapı primitive'leri, <b>assign</b> (Boole ifadesi), <b>UDP</b> (doğruluk tablosu).</p>
      <h2>assign</h2>
      <Code>
{`// E = A + BC + B'D     (kitap: && AND, || OR, ! NOT)
assign E = A || (B && C) || ((!B) && D);
// tek bitte aynısı: assign E = A | (B & C) | (~B & D);`}
      </Code>
      <p className="small">
        Continuous assignment kalıcı bir ilişki kurar; kombinasyonel devre gibi davranır → <b>implicit combinational logic</b>. + ve * kullanılmaz.
      </p>
      <h2>UDP (user-defined primitive)</h2>
      <Code>
{`primitive UDP_02467 (D, A, B, C);  // tek çıkış, İLK sırada
  output D;
  input  A, B, C;
  table
  //  A B C : D
      0 0 0 : 1;
      0 0 1 : 0;
      // ... 8 satır: girişler : çıkış ;
  endtable
endprimitive`}
      </Code>
      <ul>
        <li>
          <code>module</code> değil <code>primitive … endprimitive</code>; tablo <code>table … endtable</code> arasında.
        </li>
        <li>Sütun sırası = input tanım sırası; üstteki başlık satırı yorumdur.</li>
        <li>
          Başka modülde kapı gibi örneklenir: <code>UDP_02467 (e, a, b, c);</code> (örnek adı isteğe bağlı).
        </li>
        <li>Hazır kapılar = <b>system primitives</b>.</li>
      </ul>
      <VerilogExercises />
    </>
  );
}

export const SUMMARY_CH3: Record<string, SummaryDef> = {
  '3-1': { Component: S3_1, minutes: 12 },
  '3-2': { Component: S3_2, minutes: 18 },
  '3-3': { Component: S3_3, minutes: 15 },
  '3-4': { Component: S3_4, minutes: 15 },
  '3-5': { Component: S3_5, minutes: 8 },
  '3-6': { Component: S3_6, minutes: 10 },
  '3-7': { Component: S3_7, minutes: 25 },
  '3-8': { Component: S3_8, minutes: 15 },
};
