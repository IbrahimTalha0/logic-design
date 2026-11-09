import { Box, Code, Def, En, Formula, KeyPoints, Reveal, Table } from '../components/ui';
import { KMap, KMapPractice } from '../interactives/KMap';
import { TwoLevelCircuit, UniversalGates } from '../interactives/Circuits';
import { GatePlayground, ParityLab } from '../interactives/LogicLabs';
import { VerilogExercises, VerilogPlayground } from '../interactives/VerilogLab';
import { mintermsOf } from '../lib/boolean';
import type { LessonDef } from '../data/types';

const V3 = ['x', 'y', 'z'];
const W4 = ['w', 'x', 'y', 'z'];
const A4 = ['A', 'B', 'C', 'D'];

// =====================================================================
// 3.1 K-map: 2 ve 3 değişken
// =====================================================================
function L3_1() {
  return (
    <>
      <p>
        Bölüm 2'de ifadeleri cebirle sadeleştirdik; ama cebirde hangi kuralı ne zaman uygulayacağını bilmek zor ve <b>sistematik bir yöntem yok</b>. Bu bölümde
        sadeleştirmeyi neredeyse mekanik hale getiren bir resim yöntemi öğreneceğiz: <b>Karnaugh haritası</b> (K-map). Sınavın en garanti puan kaynağıdır!
      </p>
      <Def
        term="Gate-level minimization"
        en="Gate-level minimization is the design task of finding an optimal gate-level implementation of the Boolean functions describing a digital circuit."
        tr="Kapı seviyesinde sadeleştirme, bir dijital devreyi tanımlayan Boole fonksiyonlarının en uygun (en az kapılı) gerçeklemesini bulma işidir."
      />
      <Def
        term="Karnaugh map"
        en="The map is a diagram made up of squares, with each square representing one minterm of the function that is to be minimized."
        tr="K-map, her karesi sadeleştirilecek fonksiyonun bir mintermini temsil eden karelerden oluşan bir diyagramdır."
      />
      <p>
        Fonksiyonu haritaya yerleştirince (1 olan mintermlerin karelerine 1 yazınca), birbirine komşu 1'leri <b>gruplayarak</b> en sade ifadeyi görsel olarak buluruz.
        Haritadan çıkan ifade her zaman <b>SOP</b> veya <b>POS</b> formundadır (iki seviyeli devre). En sade ifade <b>tek olmayabilir</b>.
      </p>

      <h2>İki değişkenli harita</h2>
      <p>
        2 değişken → 4 minterm → 4 kare. Satır x'i, sütun y'yi gösterir. Örneğin <span className="mono">xy</span> sadece m3 karesine; <span className="mono">x + y</span>{' '}
        ise m1, m2, m3 karelerine 1 yazılarak gösterilir.
      </p>
      <KMap n={2} ones={[1, 2, 3]} lockN title="2 değişkenli harita: F = x + y" />

      <h2>Üç değişkenli harita</h2>
      <p>
        3 değişken → 8 kare. Satır x (0, 1), sütunlar yz. <b>Çok önemli:</b> sütunlar 00, 01, <b>11, 10</b> sırasıyla dizilir (ikili sıra değil, <b>Gray kodu</b>
        sırası). Böylece yan yana iki kare arasında <b>sadece bir değişken</b> değişir.
      </p>
      <Table
        compact
        head={['x \\ yz', '00', '01', '11', '10']}
        rows={[
          ['0', "m0  x'y'z'", "m1  x'y'z", "m3  x'yz", "m2  x'yz'"],
          ['1', "m4  xy'z'", "m5  xy'z", "m7  xyz", "m6  xyz'"],
        ]}
      />
      <h3>Neden komşuluk önemli?</h3>
      <p>Komşu iki kare tek bir değişkende farklıdır; bu değişken toplamda yok olur:</p>
      <Formula>m5 + m7 = xy'z + xyz = xz(y' + y) = xz</Formula>
      <p>
        İki komşu 1 → bir literal azalır. Dört komşu 1 → iki literal azalır. Ayrıca harita <b>kenarlardan sarılır</b>: en soldaki sütun ile en sağdaki sütun da
        komşudur (m0–m2, m4–m6). Haritayı bir silindir gibi düşün.
      </p>

      <h2>Gruplama kuralları</h2>
      <ol className="steps">
        <li>
          Gruplar <b>dikdörtgen</b> olmalı ve <b>1, 2, 4, 8</b> kare içermeli (2'nin kuvveti). 3 veya 6 karelik grup <b>olmaz</b>!
        </li>
        <li>Gruplar mümkün olduğunca <b>büyük</b> olmalı (büyük grup = az literal).</li>
        <li>Grup sayısı mümkün olduğunca <b>az</b> olmalı.</li>
        <li>Her 1 en az bir gruba girmeli. Bir 1 birden fazla grupta kullanılabilir (x + x = x).</li>
        <li>Çapraz kareler komşu değildir.</li>
      </ol>
      <Table
        compact
        head={['3 değişkenli haritada grup', 'Terimdeki literal sayısı']}
        rows={[
          ['1 kare', '3 literal (minterm)'],
          ['2 komşu kare', '2 literal'],
          ['4 komşu kare', '1 literal'],
          ['8 kare (tümü)', 'F = 1'],
        ]}
      />
      <Box kind="tip" title="Grubun terimini okumak">
        Grubun içinde <b>değişmeyen</b> değişkenleri yaz: hep 1 ise x, hep 0 ise x'. Grup içinde hem 0 hem 1 olan değişken yazılmaz (yok olur).
      </Box>

      <h2>Kitaptaki örnekler — haritada incele</h2>
      <p>
        <b>Örnek 3.1:</b> F(x, y, z) = Σ(2, 3, 4, 5). Aşağıdaki haritada "0 → 3" adımlarını gezerek asal implikantları ve sonucu izle:{' '}
        <span className="mono">F = x'y + xy'</span>.
      </p>
      <KMap n={3} ones={[2, 3, 4, 5]} title="Örnek 3.1: Σ(2, 3, 4, 5)" />
      <p>
        <b>Örnek 3.2:</b> F = Σ(3, 4, 6, 7) → <span className="mono">F = yz + xz'</span> (m4 ve m6 kenardan sarılarak komşu!).
      </p>
      <KMap n={3} ones={[3, 4, 6, 7]} title="Örnek 3.2: Σ(3, 4, 6, 7)" />
      <p>
        <b>Örnek 3.3:</b> F = Σ(0, 2, 4, 5, 6) → haritanın dört köşesi (m0, m2, m4, m6) kenardan sarılarak tek bir 4'lü gruptur: z'. Kalan m5, m4 ile: xy'. →{' '}
        <span className="mono">F = z' + xy'</span>.
      </p>
      <h3>Standart olmayan ifadeyi haritaya yerleştirmek</h3>
      <p>
        <b>Örnek 3.4:</b> F = A'C + A'B + AB'C + BC. Mintermlere açmana gerek yok: her terimin kapsadığı kareleri doğrudan doldur. A'C → A = 0 ve C = 1 olan kareler (m1,
        m3); A'B → m2, m3; AB'C → m5; BC → m3, m7. Sonuç: Σ(1, 2, 3, 5, 7) → <span className="mono">F = C + A'B</span>. Aşağıdaki haritanın altındaki "Fonksiyonu liste
        veya ifade ile gir" bölümünden bu ifadeyi kendin yerleştirebilirsin.
      </p>
      <KMap n={3} vars={['A', 'B', 'C']} ones={[1, 2, 3, 5, 7]} title="Örnek 3.4: F = A'C + A'B + AB'C + BC" />

      <KeyPoints
        items={[
          'K-map\'te her kare bir mintermdir. Sütun/satır sırası Gray kodu: 00, 01, 11, 10.',
          'Komşu kareler tek bitte farklıdır; harita kenarlardan sarılır.',
          'Gruplar 1, 2, 4, 8 kare; mümkün olduğunca büyük ve az sayıda.',
          'Grup içinde değişmeyen değişkenler terimi oluşturur.',
        ]}
      />
    </>
  );
}
const q3_1: LessonDef['questions'] = [
  { id: '3-1-a', kind: 'expr', q: 'Simplify the Boolean function F(x, y, z) = Σ(2, 3, 4, 5) into sum-of-products form.', tr: 'F(x, y, z) = Σ(2, 3, 4, 5) fonksiyonunu SOP formunda sadeleştirin.', vars: V3, ones: [2, 3, 4, 5], minimal: 'sop' },
  { id: '3-1-b', kind: 'expr', q: 'Simplify F(x, y, z) = Σ(3, 4, 6, 7).', tr: 'F(x, y, z) = Σ(3, 4, 6, 7) fonksiyonunu sadeleştirin.', vars: V3, ones: [3, 4, 6, 7], minimal: 'sop' },
  { id: '3-1-c', kind: 'expr', q: 'Simplify F(x, y, z) = Σ(0, 2, 4, 5, 6).', tr: 'F(x, y, z) = Σ(0, 2, 4, 5, 6) fonksiyonunu sadeleştirin.', vars: V3, ones: [0, 2, 4, 5, 6], minimal: 'sop' },
  { id: '3-1-d', kind: 'mc', q: 'Why are the columns of a three-variable map ordered 00, 01, 11, 10?', tr: '3 değişkenli haritada sütunlar neden 00, 01, 11, 10 sırasındadır?', options: ['So that any two adjacent squares differ by only one variable (Gray code order).', 'Because it is the binary counting order.', 'To reduce the number of squares.', 'Because maxterms must be listed first.'], answer: 0 },
  { id: '3-1-e', kind: 'mc', q: 'In a three-variable map, a group of four adjacent squares represents a product term of:', tr: '3 değişkenli haritada dört komşu karelik bir grup kaç literallik terimdir?', options: ['one literal', 'two literals', 'three literals', 'four literals'], answer: 0 },
  { id: '3-1-f', kind: 'expr', q: "Simplify F(A, B, C) = A'C + A'B + AB'C + BC.", tr: "F = A'C + A'B + AB'C + BC fonksiyonunu sadeleştirin.", vars: ['A', 'B', 'C'], ones: mintermsOf("A'C + A'B + AB'C + BC", ['A', 'B', 'C']), minimal: 'sop' },
  { id: '3-1-g', kind: 'mc', q: 'In a three-variable map, which squares are adjacent to m0?', tr: '3 değişkenli haritada m0\'a komşu kareler hangileridir?', options: ['m1, m2, m4', 'm1, m3, m4', 'm1, m4, m5', 'm2, m3, m6'], answer: 0, explain: 'm0 = 000; tek bit farklı olanlar: 001 (m1), 010 (m2), 100 (m4). m2 kenardan sarılarak komşudur.' },
  { id: '3-1-h', kind: 'expr', q: 'Simplify F(x, y, z) = Σ(0, 1, 2, 3).', tr: 'F(x, y, z) = Σ(0, 1, 2, 3) fonksiyonunu sadeleştirin.', vars: V3, ones: [0, 1, 2, 3], minimal: 'sop', explain: "Üst satırın tamamı (x = 0) → x'" },
];

// =====================================================================
// 3.2 4 değişkenli K-map, asal implikantlar
// =====================================================================
function L3_2() {
  return (
    <>
      <h2>Dört değişkenli harita</h2>
      <p>
        4 değişken → 16 kare. Satırlar wx, sütunlar yz; <b>ikisi de Gray sırasında</b> (00, 01, 11, 10).
      </p>
      <Table
        compact
        head={['wx \\ yz', '00', '01', '11', '10']}
        rows={[
          ['00', 'm0', 'm1', 'm3', 'm2'],
          ['01', 'm4', 'm5', 'm7', 'm6'],
          ['11', 'm12', 'm13', 'm15', 'm14'],
          ['10', 'm8', 'm9', 'm11', 'm10'],
        ]}
      />
      <Box kind="warn" title="Harita her yönden sarılır">
        Üst satır alt satıra, sol sütun sağ sütuna komşudur. <b>Dört köşe</b> (m0, m2, m8, m10) birlikte bir grup oluşturabilir!
      </Box>
      <Table
        compact
        head={['4 değişkenli haritada grup', 'Literal sayısı']}
        rows={[
          ['1 kare', '4 literal'],
          ['2 komşu kare', '3 literal'],
          ['4 komşu kare', '2 literal'],
          ['8 komşu kare', '1 literal'],
          ['16 kare', 'F = 1'],
        ]}
      />
      <Box kind="example" title="Örnek 3.5">
        <p>
          F(w, x, y, z) = Σ(0, 1, 2, 4, 5, 6, 8, 9, 12, 13, 14). Sol iki sütunun tamamı (8 kare) → <b>y'</b>. Sol üstteki m0, m2, m4, m6 (sarılarak) → <b>w'z'</b>.
          m4, m6, m12, m14 → <b>xz'</b>.
        </p>
        <p className="mono">F = y' + w'z' + xz'</p>
      </Box>
      <KMap n={4} ones={[0, 1, 2, 4, 5, 6, 8, 9, 12, 13, 14]} title="Örnek 3.5" />
      <Box kind="example" title="Örnek 3.6">
        F = A'B'C' + B'CD' + A'BCD' + AB'C' → haritada: m0, m1, m2, m6, m8, m9, m10 → <span className="mono">F = B'D' + B'C' + A'CD'</span>. (B'D' dört köşedir!)
      </Box>

      <h2>Asal implikantlar (prime implicants)</h2>
      <p>Karmaşık haritalarda hangi grupları seçeceğini bilmek için iki kavram kullanılır:</p>
      <Def
        term="Prime implicant"
        en="A prime implicant is a product term obtained by combining the maximum possible number of adjacent squares in the map."
        tr="Asal implikant, haritada mümkün olan en fazla sayıda komşu karenin birleştirilmesiyle elde edilen çarpım terimidir (daha fazla büyütülemeyen grup)."
      />
      <Def
        term="Essential prime implicant"
        en="If a minterm in a square is covered by only one prime implicant, that prime implicant is said to be essential."
        tr="Bir karedeki minterm yalnızca tek bir asal implikant tarafından kapsanıyorsa, o asal implikant esastır (essential)."
      />
      <h3>Sistematik yöntem</h3>
      <ol className="steps">
        <li>Tüm asal implikantları bul (her 1 için: içine girebileceği en büyük grupları çiz).</li>
        <li>
          <b>Esas asal implikantları</b> belirle: sadece tek bir asal implikantın kapsadığı 1'lere bak. Bu implikantlar çözümde <b>mutlaka</b> bulunur.
        </li>
        <li>Esaslar tarafından kapsanmayan 1'ler kaldıysa, onları <b>en az sayıda</b> ek asal implikantla kapsa.</li>
      </ol>
      <Box kind="example" title="Kitaptaki örnek (Şekil 3.11): birden fazla doğru cevap!">
        <p>F(A, B, C, D) = Σ(0, 2, 3, 5, 7, 8, 9, 10, 11, 13, 15)</p>
        <ul>
          <li>Asal implikantlar: BD, B'D', CD, B'C, AD, AB' (6 tane).</li>
          <li>
            <b>Esaslar: BD</b> (m5'i sadece o kapsar) ve <b>B'D'</b> (m0'ı sadece o kapsar).
          </li>
          <li>Kalan m3, m9, m11: m3 için CD veya B'C; m9 için AD veya AB'.</li>
        </ul>
        <p className="mono">F = BD + B'D' + CD + AD = BD + B'D' + CD + AB' = BD + B'D' + B'C + AD = BD + B'D' + B'C + AB'</p>
        <p>Dördü de eşit derecede sadedir ve <b>hepsi doğru cevaptır</b>. Aşağıdaki haritada "1. Tüm asal implikantlar" ve "2. Esas olanlar" adımlarını incele.</p>
      </Box>
      <KMap n={4} vars={A4} ones={[0, 2, 3, 5, 7, 8, 9, 10, 11, 13, 15]} title="Şekil 3.11: asal ve esas implikantlar" />

      <Box kind="warn" title="Sık yapılan hatalar">
        <ul>
          <li>3, 5, 6 karelik grup yapmak (sadece 1, 2, 4, 8, 16!).</li>
          <li>Kenar/köşe sarmasını unutmak.</li>
          <li>Çapraz kareleri komşu sanmak.</li>
          <li>Grubu büyütmek mümkünken küçük bırakmak.</li>
          <li>Tüm 1'leri zaten kapsanmış gereksiz bir grup eklemek.</li>
          <li>Sütun etiketlerini 00, 01, 10, 11 diye yanlış (ikili sırayla) yazmak.</li>
        </ul>
      </Box>

      <h2>Antrenman</h2>
      <p>Aşağıda sınırsız rastgele soru var. Cevabını yaz; sistem hem doğruluğunu hem de en sade olup olmadığını kontrol eder.</p>
      <KMapPractice n={4} />

      <KeyPoints
        items={[
          '4 değişkenli harita: 16 kare, satır ve sütunlar Gray sırasında; her yönden sarılır, 4 köşe komşu.',
          '2 kare → 3 literal, 4 kare → 2, 8 kare → 1 literal.',
          'Asal implikant = büyütülemeyen en büyük grup. Esas = bir 1\'i tek başına kapsayan asal implikant.',
          'Önce esasları al, sonra kalanları en az grupla kapsa. Birden çok doğru cevap olabilir.',
        ]}
      />
    </>
  );
}
const q3_2: LessonDef['questions'] = [
  { id: '3-2-a', kind: 'expr', q: 'Simplify F(w, x, y, z) = Σ(0, 1, 2, 4, 5, 6, 8, 9, 12, 13, 14).', tr: 'F(w, x, y, z) = Σ(0, 1, 2, 4, 5, 6, 8, 9, 12, 13, 14) fonksiyonunu sadeleştirin.', vars: W4, ones: [0, 1, 2, 4, 5, 6, 8, 9, 12, 13, 14], minimal: 'sop' },
  { id: '3-2-b', kind: 'expr', q: "Simplify F = A'B'C' + B'CD' + A'BCD' + AB'C'.", tr: "F = A'B'C' + B'CD' + A'BCD' + AB'C' fonksiyonunu sadeleştirin.", vars: A4, ones: mintermsOf("A'B'C' + B'CD' + A'BCD' + AB'C'", A4), minimal: 'sop' },
  { id: '3-2-c', kind: 'mc', q: 'In a four-variable map (w, x, y, z), the four corner squares combined represent the term:', tr: '4 değişkenli haritada (w, x, y, z) dört köşe kare birlikte hangi terimi verir?', options: ["x'z'", "w'z'", 'wz', "w'x'"], answer: 0, explain: "Köşeler m0, m2, m8, m10: x = 0 ve z = 0 sabit → x'z'." },
  { id: '3-2-d', kind: 'mc', q: 'A prime implicant is said to be essential if:', tr: 'Bir asal implikant ne zaman esastır (essential)?', options: ['it covers at least one minterm that is covered by no other prime implicant', 'it is the largest group in the map', 'it contains a don\'t-care', 'it has the fewest literals'], answer: 0 },
  { id: '3-2-e', kind: 'text', q: 'How many literals does the product term of a group of eight adjacent squares in a four-variable map have?', tr: '4 değişkenli haritada 8 komşu karelik bir grubun terimi kaç literallidir?', answer: '1', norm: 'num' },
  { id: '3-2-f', kind: 'expr', q: 'Simplify F(A, B, C, D) = Σ(0, 2, 3, 5, 7, 8, 9, 10, 11, 13, 15). (Any of the minimal answers is accepted.)', tr: 'F(A,B,C,D) = Σ(0, 2, 3, 5, 7, 8, 9, 10, 11, 13, 15) fonksiyonunu sadeleştirin. (Minimal cevaplardan herhangi biri kabul edilir.)', vars: A4, ones: [0, 2, 3, 5, 7, 8, 9, 10, 11, 13, 15], minimal: 'sop' },
  { id: '3-2-g', kind: 'expr', q: 'Simplify F(w, x, y, z) = Σ(1, 3, 4, 5, 9, 11, 12, 13, 14, 15).', tr: 'F(w, x, y, z) = Σ(1, 3, 4, 5, 9, 11, 12, 13, 14, 15) fonksiyonunu sadeleştirin.', vars: W4, ones: [1, 3, 4, 5, 9, 11, 12, 13, 14, 15], minimal: 'sop' },
  { id: '3-2-h', kind: 'mc', q: 'Which pair of minterms is adjacent in a four-variable map?', tr: '4 değişkenli haritada hangi minterm çifti komşudur?', options: ['m0 and m8', 'm5 and m10', 'm3 and m12', 'm1 and m4'], answer: 0, explain: '0000 ve 1000 yalnızca w bitinde farklı (üst–alt sarma).' },
];

// =====================================================================
// 3.3 POS sadeleştirme ve don't-care
// =====================================================================
function L3_3() {
  return (
    <>
      <h2>Toplamların çarpımı (POS) sadeleştirme</h2>
      <p>Şimdiye kadar 1'leri grupladık ve SOP bulduk. POS bulmak için hile şudur:</p>
      <ol className="steps">
        <li>
          Haritadaki <b>0'lar</b>, F'nin tümleyeninin (F') mintermleridir.
        </li>
        <li>
          0'ları grupla → <b>F'</b>'yi SOP olarak yaz.
        </li>
        <li>
          F'nin tümleyenini al (DeMorgan) → <b>F</b>, POS formunda çıkar.
        </li>
      </ol>
      <Box kind="example" title="Örnek 3.7: F(A, B, C, D) = Σ(0, 1, 2, 5, 8, 9, 10)">
        <p>
          (a) 1'leri grupla: <span className="mono">F = B'D' + B'C' + A'C'D</span>
        </p>
        <p>
          (b) 0'ları grupla: <span className="mono">F' = AB + CD + BD'</span> → DeMorgan:{' '}
          <span className="mono">
            <b>F = (A' + B')(C' + D')(B' + D)</b>
          </span>
        </p>
        <p>SOP → AND-OR devresi; POS → OR-AND devresi. Hangisi daha az kapı/literal kullanıyorsa o seçilir.</p>
      </Box>
      <KMap n={4} vars={A4} ones={[0, 1, 2, 5, 8, 9, 10]} mode="pos" title="Örnek 3.7 — POS modu (0'lar gruplandı)" />
      <Box kind="tip" title="Kısa yol">
        0'ları gruplarken her grubun terimini doğrudan <b>toplam terimi</b> olarak okuyabilirsin: grupta sabit kalan değişken <b>0 ise x</b>, <b>1 ise x'</b> yazılır
        (minterm kuralının tersi — maxterm kuralı). Örn. A = 1, B = 1 grubu → (A' + B').
      </Box>
      <p>
        Fonksiyon POS olarak verildiyse (örn. F = Π(0, 2, 5, 7)), listelenen karelere <b>0</b>, diğerlerine 1 yazılır. Örnek: F(x, y, z) = Σ(1, 3, 4, 6) → SOP:{' '}
        <span className="mono">x'z + xz'</span>, POS: <span className="mono">(x' + z')(x + z)</span>.
      </p>

      <h2>Önemsiz durumlar (don't-care conditions)</h2>
      <p>
        Bazen bazı giriş kombinasyonları <b>hiç oluşmaz</b> ya da oluşsa da çıkışın ne olduğu umurumuzda değildir. Örneğin BCD girişli bir devrede 1010–1111
        (10–15) kombinasyonları asla gelmez. Böyle fonksiyonlara <b>tam belirtilmemiş fonksiyon</b> <En>incompletely specified function</En> denir.
      </p>
      <Def
        term="Don't-care condition"
        en="Functions that have unspecified outputs for some input combinations are called incompletely specified functions. The unspecified minterms of a function are called don't-care conditions and are marked with an X in the map. They can be used to provide further simplification."
        tr="Bazı giriş kombinasyonları için çıkışı belirtilmemiş fonksiyonlara tam belirtilmemiş fonksiyon denir. Belirtilmemiş mintermlere don't-care (önemsiz) durum denir; haritada X ile işaretlenir ve ek sadeleştirme için kullanılabilir."
      />
      <Box kind="info" title="X'leri nasıl kullanırım?">
        Her X'i, işine gelirse <b>1</b>, gelmezse <b>0</b> say. Bir X'i gruba katmak grubu büyütüyorsa kat; büyütmüyorsa dışarıda bırak. <b>X'lerin hepsini kapsamak
        zorunda değilsin</b> — ama gruplar sadece X'lerden oluşmamalı (gereksiz olur).
      </Box>
      <Box kind="example" title="Örnek 3.8: F(w, x, y, z) = Σ(1, 3, 7, 11, 15), d(w, x, y, z) = Σ(0, 2, 5)">
        <p>
          SOP: <span className="mono">F = yz + w'x'</span> (m0 ve m2'yi 1 sayarak) veya <span className="mono">F = yz + w'z</span> (m5'i 1 sayarak). İkisi de doğru; X'lerin
          farklı seçilmesi farklı (ama eşit sadelikte) cevaplar verebilir.
        </p>
        <p>
          POS: 0'ları grupla (X'ler 0 sayılabilir) → <span className="mono">F = z(w' + y)</span>.
        </p>
      </Box>
      <KMap n={4} ones={[1, 3, 7, 11, 15]} dcs={[0, 2, 5]} title="Örnek 3.8 — don't-care ile (X'ler mor)" />

      <KeyPoints
        items={[
          "POS: 0'ları grupla → F' (SOP) → DeMorgan → F (POS).",
          "0 grubundan toplam terimi: sabit değişken 0 → x, 1 → x'.",
          "Don't-care (X): işine gelirse 1, gelmezse 0. Hepsini kullanmak zorunda değilsin.",
          'BCD girişli devrelerde 10–15 mintermleri don\'t-care\'dir.',
        ]}
      />
    </>
  );
}
const q3_3: LessonDef['questions'] = [
  { id: '3-3-a', kind: 'expr', q: 'Simplify F(A, B, C, D) = Σ(0, 1, 2, 5, 8, 9, 10) into product-of-sums form.', tr: 'F(A,B,C,D) = Σ(0, 1, 2, 5, 8, 9, 10) fonksiyonunu POS formunda sadeleştirin.', vars: A4, ones: [0, 1, 2, 5, 8, 9, 10], minimal: 'pos', placeholder: "örn: (A' + B')(C + D)", explain: "0'ları grupla: F' = AB + CD + BD' → F = (A' + B')(C' + D')(B' + D)" },
  { id: '3-3-b', kind: 'expr', q: 'Simplify the same function F(A, B, C, D) = Σ(0, 1, 2, 5, 8, 9, 10) into sum-of-products form.', tr: 'Aynı fonksiyonu SOP formunda sadeleştirin.', vars: A4, ones: [0, 1, 2, 5, 8, 9, 10], minimal: 'sop' },
  { id: '3-3-c', kind: 'expr', q: 'Simplify F(x, y, z) = Σ(1, 3, 4, 6) into product-of-sums form.', tr: 'F(x, y, z) = Σ(1, 3, 4, 6) fonksiyonunu POS formunda sadeleştirin.', vars: V3, ones: [1, 3, 4, 6], minimal: 'pos' },
  { id: '3-3-d', kind: 'expr', q: "Simplify F(w, x, y, z) = Σ(1, 3, 7, 11, 15) with don't-care conditions d = Σ(0, 2, 5) into sum-of-products form.", tr: "F = Σ(1, 3, 7, 11, 15), d = Σ(0, 2, 5) fonksiyonunu SOP formunda sadeleştirin.", vars: W4, ones: [1, 3, 7, 11, 15], dc: [0, 2, 5], minimal: 'sop' },
  { id: '3-3-e', kind: 'expr', q: "Simplify the same function (d = Σ(0, 2, 5)) into product-of-sums form.", tr: 'Aynı fonksiyonu POS formunda sadeleştirin.', vars: W4, ones: [1, 3, 7, 11, 15], dc: [0, 2, 5], minimal: 'pos' },
  { id: '3-3-f', kind: 'mc', q: "What does a don't-care condition in a K-map mean?", tr: "K-map'te don't-care ne anlama gelir?", options: ['The output for that input combination is unspecified, so it may be taken as 0 or 1, whichever gives a simpler expression.', 'The output must be 1.', 'The output must be 0.', 'The minterm must be included in every group.'], answer: 0 },
  { id: '3-3-g', kind: 'mc', q: 'In a circuit whose 4-bit input is a BCD digit, which minterms can be treated as don\'t-cares?', tr: '4 bitlik BCD girişli bir devrede hangi mintermler don\'t-care kabul edilebilir?', options: ['10 through 15', '0 through 5', 'only 15', 'odd minterms'], answer: 0 },
  { id: '3-3-h', kind: 'mc', q: 'How is a product-of-sums expression obtained from a K-map?', tr: "K-map'ten POS ifadesi nasıl elde edilir?", options: ["Combine the 0's to obtain F' in SOP form, then complement it using DeMorgan's theorem.", "Combine the 1's and write each group as a sum term.", "Combine the don't-cares only.", 'Read the minterms in binary order.'], answer: 0 },
];

// =====================================================================
// 3.4 NAND ve NOR gerçekleme
// =====================================================================
function L3_4() {
  return (
    <>
      <p>
        Gerçek entegre devrelerde AND ve OR yerine çoğunlukla <b>NAND</b> ve <b>NOR</b> kullanılır: üretimi daha kolaydır ve tüm lojik ailelerinin temel kapısıdır. Bu
        derste her devreyi <b>sadece NAND</b> veya <b>sadece NOR</b> ile kurmayı öğreneceğiz.
      </p>
      <Def
        term="Universal gate"
        en="The NAND gate is said to be a universal gate because any logic circuit can be implemented with it. To show that any Boolean function can be implemented with NAND gates, we need only show that the logical operations of AND, OR, and complement can be obtained with NAND gates alone."
        tr="NAND kapısı evrensel (universal) kapıdır çünkü her lojik devre onunla gerçeklenebilir. Bunu göstermek için AND, OR ve NOT işlemlerinin sadece NAND ile yapılabildiğini göstermek yeterlidir. (Aynısı NOR için de geçerlidir.)"
      />
      <UniversalGates kind="NAND" />

      <h2>NAND'in iki sembolü</h2>
      <p>DeMorgan'a göre <span className="mono">(xyz)' = x' + y' + z'</span>. Bu yüzden NAND iki şekilde çizilebilir:</p>
      <ul>
        <li>
          <b>AND-invert</b>: AND + çıkışta bubble (normal sembol).
        </li>
        <li>
          <b>Invert-OR</b>: girişlerinde bubble olan OR (alternatif sembol).
        </li>
      </ul>
      <p>İkisi de aynı kapıdır! Bu alternatif sembol, dönüşümleri görsel olarak çok kolaylaştırır.</p>

      <h2>İki seviyeli NAND gerçekleme</h2>
      <p>
        <b>SOP</b> formundaki her fonksiyon, <b>NAND–NAND</b> devresiyle aynı yapıda gerçeklenir. Örnek: <span className="mono">F = AB + CD</span>
      </p>
      <Formula>F = AB + CD = ((AB)' · (CD)')'</Formula>
      <p>
        Aşağıdaki simülatörde üç görünümü sırayla incele: (1) AND–OR, (2) her bağlantıya iki bubble eklenmiş ara adım (iki tersleme birbirini götürür), (3) NAND–NAND.
        Girişleri değiştirip çıkışın üçünde de aynı olduğunu doğrula.
      </p>
      <TwoLevelCircuit initial="AB + CD" />
      <h3>Kural (iki seviyeli NAND)</h3>
      <ol className="steps">
        <li>Fonksiyonu sadeleştir ve <b>SOP</b> olarak yaz.</li>
        <li>En az iki literalli her çarpım terimi için bir NAND kapısı çiz (1. seviye).</li>
        <li>2. seviyeye tek bir NAND (invert-OR) koy; girişleri 1. seviye çıkışları.</li>
        <li>
          <b>Tek literalli terim</b> 2. seviyeye <b>tümlenerek</b> girer (bubble dengelensin diye inverter gerekir).
        </li>
      </ol>
      <Box kind="example" title="Örnek 3.9: F(x, y, z) = Σ(1, 2, 3, 4, 5, 7)">
        K-map ile <span className="mono">F = xy' + x'y + z</span>. NAND–NAND: xy' ve x'y için birer NAND, ikinci seviyede 3 girişli NAND — <b>z, z' olarak</b> girer.
      </Box>
      <TwoLevelCircuit initial="xy' + x'y + z" />

      <h2>Çok seviyeli NAND devreleri</h2>
      <p>Standart olmayan (iki seviyeden fazla) devreleri NAND'e çevirmek için:</p>
      <ol className="steps">
        <li>
          Her <b>AND</b> kapısını <b>AND-invert</b> (NAND) sembolüyle değiştir.
        </li>
        <li>
          Her <b>OR</b> kapısını <b>invert-OR</b> (NAND) sembolüyle değiştir.
        </li>
        <li>
          Her hat üzerindeki bubble'ları kontrol et: <b>çift</b> bubble birbirini götürür; <b>tek</b> kalan bubble için hatta bir inverter ekle (veya giriş literalini
          tümle).
        </li>
      </ol>
      <Box kind="example" title="Kitaptaki örnek: F = A(CD + B) + BC'">
        AND-OR devresinde AND'ler NAND, OR'lar invert-OR olur. Bubble'lar eşleşmeyen yerlerde girişler tümlenir: B girişi B' olarak, C' girişi de C olarak beslenir.
        Bir diğer örnek F = (AB' + A'B)(C + D') için de aynı kural uygulanır; tek kalan bubble'lar için inverter eklenir.
      </Box>

      <h2>NOR gerçekleme (dual)</h2>
      <p>NOR da evrenseldir. Her şey NAND'in dualidir:</p>
      <UniversalGates kind="NOR" />
      <ul>
        <li>
          NOR'un iki sembolü: <b>OR-invert</b> (normal) ve <b>invert-AND</b> (girişleri bubble'lı AND), çünkü <span className="mono">(x + y + z)' = x'y'z'</span>.
        </li>
        <li>
          İki seviyeli NOR, <b>POS</b> formundan yapılır: OR–AND → <b>NOR–NOR</b>. Tek literalli terimler yine tümlenerek girer.
        </li>
        <li>Çok seviyeli: OR → OR-invert, AND → invert-AND, tek bubble'lara inverter.</li>
      </ul>
      <Box kind="example" title="F = (A + B)(C + D)E">
        NOR–NOR: (A + B) ve (C + D) için birer NOR, ikinci seviyede NOR; <b>E, E' olarak</b> girer. Aşağıda dene:
      </Box>
      <TwoLevelCircuit initial="(A + B)(C + D)E" />
      <Box kind="exam">
        <ul>
          <li>
            <b>SOP → NAND–NAND</b>, <b>POS → NOR–NOR</b>. Karıştırma!
          </li>
          <li>Tek literalli terim ikinci seviyeye tümlenerek girer.</li>
          <li>Tek NAND'in iki girişini birleştirirsen inverter olur: (x·x)' = x'.</li>
        </ul>
      </Box>

      <KeyPoints
        items={[
          'NAND ve NOR evrensel kapılardır (NOT, AND, OR yapılabilir).',
          "NAND = AND-invert = invert-OR. NOR = OR-invert = invert-AND.",
          'SOP → AND-OR → NAND-NAND (aynı yapı). POS → OR-AND → NOR-NOR.',
          'Çok seviyeli: AND→NAND, OR→invert-OR; eşleşmeyen bubble için inverter.',
        ]}
      />
    </>
  );
}
const q3_4: LessonDef['questions'] = [
  { id: '3-4-a', kind: 'mc', q: 'Why is the NAND gate called a universal gate?', tr: 'NAND kapısına neden evrensel kapı denir?', options: ['Because AND, OR and NOT operations can all be obtained with NAND gates alone, so any logic circuit can be implemented with it.', 'Because it is the fastest gate.', 'Because it has the highest fan-out.', 'Because it is both commutative and associative.'], answer: 0 },
  { id: '3-4-b', kind: 'mc', q: "In the two-level NAND implementation of F = xy' + x'y + z, how does the single literal z enter the second-level gate?", tr: "F = xy' + x'y + z'nin iki seviyeli NAND gerçeklemesinde tek literal z ikinci seviyeye nasıl girer?", options: ["as z' (complemented)", 'as z (unchanged)', 'through two inverters', 'it is not needed'], answer: 0 },
  { id: '3-4-c', kind: 'mc', q: "The output of the two-level circuit F = [(AB)'(CD)']' is:", tr: "F = [(AB)'(CD)']' devresinin çıkışı nedir?", options: ['AB + CD', "(A + B)(C + D)", "(AB + CD)'", "A'B' + C'D'"], answer: 0 },
  { id: '3-4-d', kind: 'mc', q: 'A two-level NOR–NOR implementation is obtained directly from a function expressed in:', tr: 'İki seviyeli NOR–NOR gerçekleme doğrudan hangi formdan elde edilir?', options: ['product-of-sums form', 'sum-of-products form', 'sum of minterms only', 'any nonstandard form'], answer: 0 },
  { id: '3-4-e', kind: 'mc', q: 'The alternative graphic symbol for a NAND gate is:', tr: 'NAND kapısının alternatif sembolü nedir?', options: ['invert-OR (an OR gate with bubbles at its inputs)', 'invert-AND', 'OR-invert', 'AND-OR'], answer: 0 },
  { id: '3-4-f', kind: 'expr', q: "Write the function realized by NAND(NAND(x, y), NAND(x', z)) in simplest SOP form.", tr: "NAND(NAND(x, y), NAND(x', z)) devresinin gerçeklediği fonksiyonu SOP olarak yazın.", vars: V3, ones: mintermsOf("xy + x'z", V3), minimal: 'sop', explain: "((xy)'(x'z)')' = xy + x'z" },
  { id: '3-4-g', kind: 'text', q: 'How many 2-input NAND gates are needed to implement F = AB + CD in two-level NAND form?', tr: 'F = AB + CD\'yi iki seviyeli NAND ile gerçeklemek için kaç tane 2 girişli NAND gerekir?', answer: '3', norm: 'num' },
  { id: '3-4-h', kind: 'mc', q: "The two-level circuit NOR(NOR(A, B), NOR(C, D)) implements:", tr: 'NOR(NOR(A, B), NOR(C, D)) devresi neyi gerçekler?', options: ['(A + B)(C + D)', 'AB + CD', "(A + B + C + D)'", "A'B' + C'D'"], answer: 0 },
  { id: '3-4-i', kind: 'mc', q: 'A single NAND gate with both inputs connected to x produces:', tr: 'Her iki girişi x\'e bağlı tek bir NAND kapısının çıkışı nedir?', options: ["x'", 'x', '0', '1'], answer: 0 },
];

// =====================================================================
// 3.5 Diğer iki seviyeli gerçeklemeler
// =====================================================================
function L3_5() {
  return (
    <>
      <h2>Kablolu mantık (wired logic)</h2>
      <p>
        Bazı NAND ve NOR kapılarının çıkışları doğrudan birbirine bağlanabilir; bu bağlantı fazladan bir kapı gibi davranır. Buna <b>kablolu mantık</b>{' '}
        <En>wired logic</En> denir (fiziksel bir kapı yoktur, sembol olarak çizilir).
      </p>
      <ul>
        <li>
          <b>Açık kollektörlü TTL NAND</b> çıkışları birleştirilirse <b>wired-AND</b> oluşur: <span className="mono">F = (AB)' · (CD)' = (AB + CD)'</span> →{' '}
          <b>AND-OR-INVERT</b> fonksiyonu.
        </li>
        <li>
          <b>ECL NOR</b> çıkışları birleştirilirse <b>wired-OR</b> oluşur: <span className="mono">F = (A + B)' + (C + D)' = [(A + B)(C + D)]'</span> → <b>OR-AND-INVERT</b>.
        </li>
      </ul>

      <h2>Bozulmayan (nondegenerate) formlar</h2>
      <p>
        4 kapı tipi (AND, OR, NAND, NOR) iki seviyede 4 × 4 = <b>16</b> kombinasyon verir. Bunların <b>8'i bozulur</b> <En>degenerate</En>: tek bir işleme indirgenir
        (örn. AND–AND sadece büyük bir AND'dir; AND–NAND tek bir NAND'dir). Kalan <b>8 nondegenerate</b> form:
      </p>
      <Table
        compact
        head={['Form', 'Duali', 'Gerçeklediği']}
        rows={[
          ['AND–OR', 'OR–AND', 'SOP / POS (Bölüm 3.4)'],
          ['NAND–NAND', 'NOR–NOR', 'SOP / POS (Bölüm 3.6)'],
          ['NOR–OR', 'NAND–AND', 'OR-AND-INVERT / AND-OR-INVERT'],
          ['OR–NAND', 'AND–NOR', 'OR-AND-INVERT / AND-OR-INVERT'],
        ]}
      />
      <p>Yeni olan dört form iki gruba ayrılır:</p>
      <ul>
        <li>
          <b>AND–NOR</b> ve <b>NAND–AND</b> → <b>AND-OR-INVERT</b>: <span className="mono">F = (AB + CD + E)'</span>
        </li>
        <li>
          <b>OR–NAND</b> ve <b>NOR–OR</b> → <b>OR-AND-INVERT</b>: <span className="mono">F = [(A + B)(C + D)E]'</span>
        </li>
      </ul>
      <p>
        Hepsinin sonunda bir <b>INVERT</b> olduğu için, F yerine <b>F'</b>'yi sadeleştirip AND-OR (veya OR-AND) kısmıyla gerçekleriz; çıkıştaki tersleme F'yi verir.
      </p>
      <Table
        caption="Tablo 3.2 — Diğer iki seviyeli formlarla gerçekleme"
        head={['Eşdeğer formlar', 'Gerçeklediği', "F' nasıl sadeleştirilir?", 'Çıkış']}
        rows={[
          ['AND–NOR, NAND–AND*', 'AND-OR-INVERT', "0'ları gruplayarak SOP olarak", 'F'],
          ['OR–NAND, NOR–OR*', 'OR-AND-INVERT', "1'leri gruplayıp tümleyerek POS olarak", 'F'],
        ]}
      />
      <p className="small muted">* (b) formları tek literalli terim için bir inverter gerektirir.</p>
      <Box kind="example" title="Örnek 3.10: F = x'y'z' + xyz'">
        <p>
          <b>AND-OR-INVERT:</b> 0'ları grupla → <span className="mono">F' = x'y + xy' + z</span> → <span className="mono">F = (x'y + xy' + z)'</span>. AND–NOR: x'y ve xy'
          için AND, ikinci seviyede 3 girişli NOR (z doğrudan). NAND–AND: z için ek inverter gerekir (ya da z' uygulanır).
        </p>
        <p>
          <b>OR-AND-INVERT:</b> 1'leri grupla → <span className="mono">F = x'y'z' + xyz'</span> → tümle: <span className="mono">F' = (x + y + z)(x' + y' + z)</span> →{' '}
          <span className="mono">F = [(x + y + z)(x' + y' + z)]'</span>. OR–NAND veya NOR–OR ile gerçeklenir.
        </p>
      </Box>
      <KMap n={3} ones={[0, 6]} mode="pos" title="Örnek 3.10 haritası (0'lar → F' = x'y + xy' + z)" />
      <Box kind="exam">
        Sınavda "Implement F with AND–NOR (or OR–NAND) gates" gelirse: <b>AND–NOR/NAND–AND → F'yi 0'lardan SOP bul</b>; <b>OR–NAND/NOR–OR → F'yi POS bul</b> (1'leri grupla, F'yi
        SOP yaz, tümle).
      </Box>
      <KeyPoints
        items={[
          'Wired-AND: açık kollektörlü TTL NAND → AND-OR-INVERT. Wired-OR: ECL NOR → OR-AND-INVERT.',
          '16 iki seviyeli kombinasyonun 8\'i degenerate, 8\'i nondegenerate.',
          'AND–NOR = NAND–AND = AND-OR-INVERT; OR–NAND = NOR–OR = OR-AND-INVERT.',
          "Bu formlarda F' sadeleştirilir (Tablo 3.2).",
        ]}
      />
    </>
  );
}
const q3_5: LessonDef['questions'] = [
  { id: '3-5-a', kind: 'mc', q: 'Connecting the outputs of open-collector TTL NAND gates together produces:', tr: 'Açık kollektörlü TTL NAND çıkışlarını birleştirmek ne oluşturur?', options: ['a wired-AND, giving the AND-OR-INVERT function', 'a wired-OR, giving the OR-AND-INVERT function', 'a short circuit only', 'an XOR function'], answer: 0 },
  { id: '3-5-b', kind: 'mc', q: 'How many of the 16 possible two-level combinations of AND, OR, NAND, NOR are nondegenerate?', tr: 'AND, OR, NAND, NOR ile oluşan 16 iki seviyeli kombinasyonun kaçı nondegenerate\'dir?', options: ['8', '4', '6', '16'], answer: 0 },
  { id: '3-5-c', kind: 'mc', q: 'Which pair of forms both implement the AND-OR-INVERT function?', tr: 'Hangi form çifti AND-OR-INVERT fonksiyonunu gerçekler?', options: ['AND–NOR and NAND–AND', 'OR–NAND and NOR–OR', 'NAND–NAND and NOR–NOR', 'AND–OR and OR–AND'], answer: 0 },
  { id: '3-5-d', kind: 'mc', q: "To implement F with the AND–NOR form, F' should be simplified into:", tr: "F'yi AND–NOR ile gerçeklemek için F' hangi forma sadeleştirilmelidir?", options: ["sum-of-products form by combining the 0's in the map", "product-of-sums form by combining the 1's", 'canonical POS', 'nonstandard form'], answer: 0 },
  { id: '3-5-e', kind: 'mc', q: 'Which of the following is a degenerate form?', tr: 'Hangisi degenerate (tek işleme indirgenen) bir formdur?', options: ['AND–AND', 'AND–NOR', 'NOR–OR', 'NAND–NAND'], answer: 0 },
  { id: '3-5-f', kind: 'expr', q: "For F = x'y'z' + xyz', find F' in simplest sum-of-products form (needed for AND–NOR implementation).", tr: "F = x'y'z' + xyz' için F'yi en sade SOP olarak bulun.", vars: V3, ones: [1, 2, 3, 4, 5, 7], minimal: 'sop', explain: "0'ları grupla: F' = x'y + xy' + z" },
  { id: '3-5-g', kind: 'mc', q: 'The OR–NAND form implements the function:', tr: 'OR–NAND formu hangi fonksiyonu gerçekler?', options: ['F = [(A + B)(C + D)E]\'', "F = (AB + CD + E)'", 'F = AB + CD + E', 'F = (A + B)(C + D)E'], answer: 0 },
];

// =====================================================================
// 3.6 XOR fonksiyonu ve parite
// =====================================================================
function L3_6() {
  return (
    <>
      <Def
        term="Exclusive-OR"
        en="The exclusive-OR (XOR), denoted by the symbol ⊕, is a logical operation that performs the following Boolean operation: x ⊕ y = xy' + x'y. It is equal to 1 if only x is equal to 1 or if only y is equal to 1 (i.e., x and y differ in value), but not when both are equal to 1 or when both are equal to 0."
        tr="XOR (⊕): x ⊕ y = xy' + x'y. Sadece x veya sadece y 1 olduğunda (yani x ve y farklı olduğunda) 1'dir; ikisi de 1 veya ikisi de 0 ise 0'dır."
      />
      <p>
        <b>Exclusive-NOR</b> (equivalence) onun tümleyenidir: <span className="mono">(x ⊕ y)' = xy + x'y'</span> — x ve y eşitse 1.
      </p>
      <h2>XOR özdeşlikleri</h2>
      <Table
        compact
        head={['Özdeşlik', 'Neden?']}
        rows={[
          ['x ⊕ 0 = x', '0 ile XOR değiştirmez'],
          ["x ⊕ 1 = x'", '1 ile XOR tersler (kontrollü inverter!)'],
          ['x ⊕ x = 0', 'Aynı değerler → 0'],
          ["x ⊕ x' = 1", 'Farklı değerler → 1'],
          ["x ⊕ y' = x' ⊕ y = (x ⊕ y)'", 'Bir girişi terslemek çıkışı tersler'],
          ['A ⊕ B = B ⊕ A', 'Değişme (commutative)'],
          ['(A ⊕ B) ⊕ C = A ⊕ (B ⊕ C) = A ⊕ B ⊕ C', 'Birleşme (associative)'],
        ]}
      />
      <p>
        XOR, AND-OR-NOT ile (2 AND, 1 OR, 2 NOT) veya <b>4 NAND</b> ile kurulabilir: <span className="mono">x ⊕ y = (x' + y')x + (x' + y')y</span>. İlk NAND (xy)' = x' + y'
        üretir, diğerleri bunu kullanır.
      </p>
      <GatePlayground only={['XOR', 'XNOR']} />

      <h2>Tek fonksiyon (odd function)</h2>
      <p>Çok değişkenli XOR'u minterm cinsinden yazınca ilginç bir şey görürüz:</p>
      <Formula>A ⊕ B ⊕ C = AB'C' + A'BC' + A'B'C + ABC = Σ(1, 2, 4, 7)</Formula>
      <p>
        Bunlar, ikili gösteriminde <b>tek sayıda 1</b> olan mintermlerdir (001, 010, 100, 111). Bu yüzden n değişkenli XOR'a <b>tek fonksiyon</b> <En>odd function</En>{' '}
        denir: girişlerde tek sayıda 1 varsa çıkış 1'dir. Tümleyeni (XNOR) ise <b>çift fonksiyondur</b> <En>even function</En>.
      </p>
      <Def
        term="Odd function"
        en="The multiple-variable exclusive-OR operation is defined as an odd function: it is equal to 1 if the input variables have an odd number of 1's."
        tr="Çok değişkenli XOR işlemi tek fonksiyon olarak tanımlanır: giriş değişkenlerinde tek sayıda 1 varsa çıkış 1'dir."
      />
      <KMap n={3} vars={['A', 'B', 'C']} ones={[1, 2, 4, 7]} title="3 değişkenli XOR: dama tahtası deseni — hiç komşu 1 yok!" />
      <Box kind="info">
        XOR/XNOR haritalarında 1'ler <b>dama tahtası</b> gibi dağılır; hiçbir iki 1 komşu değildir → K-map ile sadeleşmez. Bu yüzden XOR kapısı ayrı bir yapı taşı olarak
        kullanılır. 4 değişkenli: A ⊕ B ⊕ C ⊕ D = Σ(1, 2, 4, 7, 8, 11, 13, 14).
      </Box>

      <h2>Parite üreteci ve denetleyicisi</h2>
      <p>
        Bölüm 1.7'deki parite bitini hatırla. XOR, parite işi için mükemmeldir çünkü 1'lerin sayısının tek/çift olduğunu doğrudan söyler.
      </p>
      <ul>
        <li>
          <b>Parite üreteci</b> <En>parity generator</En> (gönderici tarafta): 3 bitlik mesaj x, y, z için <b>çift parite</b> biti{' '}
          <span className="mono">P = x ⊕ y ⊕ z</span>. (Mesajda tek sayıda 1 varsa P = 1 olur ve toplam çift olur.)
        </li>
        <li>
          <b>Parite denetleyicisi</b> <En>parity checker</En> (alıcı tarafta): gelen 4 bit için <span className="mono">C = x ⊕ y ⊕ z ⊕ P</span>. C = 1 ise <b>hata var</b>{' '}
          (tek sayıda 1 alınmış).
        </li>
      </ul>
      <ParityLab />
      <Box kind="tip">
        Aynı devre (4 girişli XOR) hem üreteç hem denetleyici olarak kullanılabilir: P girişi 0'a bağlanırsa çıkış parite bitini üretir (z ⊕ 0 = z). Çift fonksiyon
        gerekirse çıkış kapısı XNOR yapılır.
      </Box>
      <KeyPoints
        items={[
          "x ⊕ y = xy' + x'y (farklıysa 1). XNOR = xy + x'y' (eşitse 1).",
          "x ⊕ 0 = x, x ⊕ 1 = x', x ⊕ x = 0, x ⊕ x' = 1. XOR değişmeli ve birleşmeli.",
          'Çok değişkenli XOR = tek fonksiyon (tek sayıda 1 → 1). XNOR = çift fonksiyon.',
          'Çift parite üreteci P = x ⊕ y ⊕ z; denetleyici C = x ⊕ y ⊕ z ⊕ P (C = 1 → hata).',
        ]}
      />
    </>
  );
}
const q3_6: LessonDef['questions'] = [
  { id: '3-6-a', kind: 'mc', q: 'x ⊕ 1 is equal to:', tr: 'x ⊕ 1 neye eşittir?', options: ["x'", 'x', '1', '0'], answer: 0 },
  { id: '3-6-b', kind: 'mc', q: "x ⊕ y' is equal to:", tr: "x ⊕ y' neye eşittir?", options: ["(x ⊕ y)'", 'x ⊕ y', "x' ⊕ y'", '1'], answer: 0 },
  { id: '3-6-c', kind: 'text', q: 'List the minterms of the three-variable function F = A ⊕ B ⊕ C.', tr: 'F = A ⊕ B ⊕ C fonksiyonunun mintermlerini listeleyin.', answer: '1,2,4,7', norm: 'list' },
  { id: '3-6-d', kind: 'mc', q: 'The multiple-variable exclusive-OR function is called an odd function because:', tr: 'Çok değişkenli XOR neden tek fonksiyon (odd function) olarak adlandırılır?', options: ["it is equal to 1 when the input variables have an odd number of 1's", 'it has an odd number of minterms', 'it requires an odd number of gates', 'its map has an odd number of squares'], answer: 0 },
  { id: '3-6-e', kind: 'text', q: 'For a 3-bit message x y z = 1 0 1, what is the even parity bit P?', tr: '3 bitlik x y z = 1 0 1 mesajı için çift parite biti P nedir?', answer: '0', norm: 'num', explain: '1 ⊕ 0 ⊕ 1 = 0 (zaten iki tane 1 var, çift).' },
  { id: '3-6-f', kind: 'text', q: 'An even-parity checker receives x y z P = 1 1 1 0. What is the checker output C?', tr: 'Çift parite denetleyicisi x y z P = 1 1 1 0 alıyor. Çıkış C nedir?', answer: '1', norm: 'num', explain: '1 ⊕ 1 ⊕ 1 ⊕ 0 = 1 → tek sayıda 1 → hata var.' },
  { id: '3-6-g', kind: 'mc', q: 'Why can\'t an XOR function be simplified with a K-map?', tr: 'XOR fonksiyonu neden K-map ile sadeleştirilemez?', options: ["Its 1's form a checkerboard pattern; no two 1's are adjacent.", 'It has too many variables.', 'It contains don\'t-cares.', 'It is not a Boolean function.'], answer: 0 },
  { id: '3-6-h', kind: 'text', q: 'How many 2-input NAND gates are needed to implement an exclusive-OR in the standard NAND realization?', tr: 'Standart NAND gerçeklemesinde bir XOR için kaç tane 2 girişli NAND gerekir?', answer: '4', norm: 'num' },
];

// =====================================================================
// 3.7 Verilog HDL
// =====================================================================
function L3_7() {
  return (
    <>
      <p>
        Gerçek devreler milyonlarca kapıdan oluşur; elle çizilemez. Bunun yerine devre bir <b>donanım tanımlama dili</b> ile metin olarak yazılır. Bu derste sınavdaki{' '}
        <b>kod sorusunu</b> rahatça çözebilmen için Verilog'u adım adım öğreneceğiz.
      </p>
      <Def
        term="Hardware description language (HDL)"
        en="A hardware description language (HDL) is a computer-based language that describes the hardware of digital systems in a textual form. It resembles an ordinary computer programming language, such as C, but is specifically oriented to describing hardware structures and the behavior of logic circuits."
        tr="HDL, dijital sistemlerin donanımını metin biçiminde tanımlayan bilgisayar tabanlı bir dildir. C gibi sıradan programlama dillerine benzer ama özellikle donanım yapılarını ve lojik devrelerin davranışını tanımlamaya yöneliktir."
      />

      <h2>HDL'in tasarım akışındaki yeri</h2>
      <Table
        head={['Aşama', 'İngilizce', 'Ne yapar?']}
        rows={[
          ['Tasarım girişi', 'design entry', 'Devrenin HDL ile tanımlanması (Boole denklemi, doğruluk tablosu, kapı bağlantı listesi, davranışsal model).'],
          ['Lojik simülasyon', 'logic simulation', 'Devrenin davranışını bilgisayarda gösterir (dalga formları). Üretmeden önce hataları bulur.'],
          ['Test bench', 'test bench', 'Simülasyonda devreye giriş uyaranlarını (stimulus) veren HDL kodu.'],
          ['Lojik sentez', 'logic synthesis', 'HDL modelinden fiziksel bileşenler ve bağlantı listesi (netlist) türetir. Derlemeye benzer.'],
          ['Zamanlama doğrulama', 'timing verification', 'Yayılma gecikmelerine rağmen devrenin istenen hızda çalıştığını doğrular.'],
          ['Hata simülasyonu', 'fault simulation', 'İdeal devre ile üretim hatası olan devreyi karşılaştırır; test desenleri üretir.'],
        ]}
      />
      <Box kind="info">
        IEEE tarafından desteklenen iki standart HDL vardır: <b>VHDL</b> (ABD Savunma Bakanlığı kaynaklı; V = VHSIC, very high-speed integrated circuit) ve <b>Verilog</b>{' '}
        (Cadence'ın dili; 1995'te IEEE standardı, 2001 ve 2005'te güncellendi). Verilog öğrenmesi daha kolaydır; kitap bu yüzden onu kullanır.
      </Box>

      <h2>Verilog'un temel kuralları</h2>
      <ul>
        <li>
          Yaklaşık 100 <b>anahtar kelime</b> <En>keyword</En> vardır ve hepsi <b>küçük harflidir</b>: <code>module</code>, <code>endmodule</code>, <code>input</code>,{' '}
          <code>output</code>, <code>wire</code>, <code>and</code>, <code>or</code>, <code>not</code> …
        </li>
        <li>
          Verilog <b>büyük/küçük harfe duyarlıdır</b> <En>case sensitive</En>: <code>not</code> ≠ <code>NOT</code>.
        </li>
        <li>
          Yorum: <code>//</code> satır sonuna kadar; çok satırlı: <code>/* … */</code>.
        </li>
        <li>
          <b>İsimler</b> <En>identifiers</En>: harf, rakam ve alt çizgi (_) içerir; <b>rakamla başlayamaz</b>.
        </li>
        <li>
          Her ifade <b>noktalı virgül (;)</b> ile biter — <b>endmodule hariç</b>!
        </li>
      </ul>

      <h2>Modül: Verilog'un temel birimi</h2>
      <Def
        term="Module"
        en="The term module refers to the text enclosed by the keyword pair module … endmodule. A module is the fundamental descriptive unit in the Verilog language."
        tr="Modül, module … endmodule anahtar kelime çifti arasındaki metindir. Verilog'un temel tanımlama birimidir."
      />
      <p>Kitaptaki devre (Şekil 3.35): G1 = AND(A, B) → w1; G2 = NOT(C) → E; G3 = OR(w1, E) → D.</p>
      <Code title="HDL Örnek 3.1 — Kapı primitive'leriyle devre">
{`// Verilog model of circuit of Figure 3.35. IEEE 1364-1995 Syntax
module Simple_Circuit (A, B, C, D, E);
  output D, E;
  input  A, B, C;
  wire   w1;

  and G1 (w1, A, B);   // Optional gate instance name
  not G2 (E, C);
  or  G3 (D, w1, E);
endmodule`}
      </Code>
      <h3>Satır satır açıklama</h3>
      <Table
        head={['Satır', 'Anlamı']}
        rows={[
          [<code>module Simple_Circuit (A, B, C, D, E);</code>, <>Modül adı + <b>port listesi</b> (devrenin dış dünyayla bağlantıları). Port sırası serbest.</>],
          [<code>output D, E;</code>, 'D ve E çıkış portları.'],
          [<code>input A, B, C;</code>, 'A, B, C giriş portları.'],
          [<code>wire w1;</code>, <>İç bağlantı (kapılar arası tel) <b>wire</b> ile tanımlanır.</>],
          [<code>and G1 (w1, A, B);</code>, <>AND kapısı örneği: ad G1 (isteğe bağlı), <b>önce çıkış (w1)</b>, sonra girişler.</>],
          [<code>endmodule</code>, 'Modülü bitirir — sonunda noktalı virgül YOK.'],
        ]}
      />
      <Box kind="warn" title="En kritik kural">
        Primitive kapılarda <b>ilk terminal HER ZAMAN çıkıştır</b>: <code>and (çıkış, giriş1, giriş2, …);</code>. Modülün port listesinde ise sıra serbesttir.
      </Box>
      <Box kind="info" title="Bildirim (declaration) vs örnekleme (instantiation)">
        Bir modül <b>bildirilir</b> <En>declared</En>. Önceden tanımlı kapılar (primitive) bildirilmez, <b>örneklenir</b> <En>instantiated</En> — tıpkı bir devre kartına kapı
        takmak gibi. Ayrıca Verilog modeli bir program değildir: kapı satırlarının <b>sırası önemsizdir</b>; model hesaplama sırası değil, <b>yapıyı</b> (hangi kapı nereye
        bağlı) tanımlar.
      </Box>
      <p>
        Kullanılabilen kapı primitive'leri: <code>and</code>, <code>or</code>, <code>not</code>, <code>nand</code>, <code>nor</code>, <code>xor</code>, <code>xnor</code>,{' '}
        <code>buf</code>.
      </p>

      <h2>Kapı gecikmeleri</h2>
      <p>
        Gerçek kapılarda giriş değişince çıkış hemen değişmez (<b>propagation delay</b>). Verilog'da gecikme <code>#</code> ile verilir. Sayılar birimsizdir; birimi{' '}
        <code>`timescale</code> derleyici yönergesi belirler (örn. <code>`timescale 1ns/100ps</code>: birim 1 ns, hassasiyet 0.1 ns). Belirtilmezse genelde 1 ns varsayılır.
      </p>
      <Code title="HDL Örnek 3.2 — Gecikmeli model">
{`module Simple_Circuit_prop_delay (A, B, C, D, E);
  output D, E;
  input  A, B, C;
  wire   w1;

  and #(30) G1 (w1, A, B);
  not #(10) G2 (E, C);
  or  #(20) G3 (D, w1, E);
endmodule`}
      </Code>
      <Table
        compact
        caption="Tablo 3.5 — Girişler ABC = 000 → 111 olunca (t = 0'da değişim)"
        head={['Zaman (ns)', 'ABC', 'E', 'w1', 'D']}
        rows={[
          ['başlangıç', '000', '1', '0', '1'],
          ['değişim (0)', '111', '1', '0', '1'],
          ['10', '111', <b>0</b>, '0', '1'],
          ['20', '111', '0', '0', '1'],
          ['30', '111', '0', <b>1</b>, <b>0</b>],
          ['40', '111', '0', '1', '0'],
          ['50', '111', '0', '1', <b>1</b>],
        ]}
      />
      <p>
        E, 10 ns sonra 0 olur (NOT gecikmesi). w1, 30 ns sonra 1 olur (AND gecikmesi). D ise OR girişleri 10 ns'de (0, 0) olduğu için 10 + 20 = 30 ns'de 0'a düşer, w1'in
        30 ns'de 1 olması yüzünden 30 + 20 = 50 ns'de tekrar 1 olur. Sonuçta D'nin son değeri değişmese de <b>20 ns süren negatif bir sıçrama (glitch)</b> oluşur. Bu,
        gecikmelerin önemini gösterir.
      </p>

      <h2>Test bench</h2>
      <Def
        term="Test bench"
        en="An HDL description that provides the stimulus to a design is called a test bench."
        tr="Bir tasarıma giriş uyaranlarını (stimulus) sağlayan HDL tanımına test bench denir."
      />
      <Code title="HDL Örnek 3.3 — Test bench">
{`// Test bench for Simple_Circuit_prop_delay
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
endmodule`}
      </Code>
      <ul>
        <li>
          Test bench'in <b>portu yoktur</b> (dış dünyayla bağlantısı yok). Adı genelde <code>t_</code> ile başlar.
        </li>
        <li>
          Test edilen devrenin <b>girişleri reg</b>, <b>çıkışları wire</b> olarak tanımlanır.
        </li>
        <li>
          Modül örneklemesinde <b>örnek adı zorunludur</b> (M1). (Kapı primitive'lerinde isteğe bağlıydı!)
        </li>
        <li>
          <code>initial</code> bloğu simülasyon başlarken çalışır; birden fazla ifade <code>begin … end</code> içine yazılır ve sırayla çalıştırılır.
        </li>
        <li>
          <code>1'b0</code> = 1 bitlik ikili 0 değeri. <code>#100</code> = 100 zaman birimi bekle. <code>$finish</code> simülasyonu bitiren sistem görevidir.
        </li>
      </ul>
      <p>Simülasyonda E ilk 10 ns, D ilk 30 ns bilinmeyendir (x). E 110 ns'de 0 olur; D 130 ns'de 0'a düşer ve 150 ns'de 1'e döner — Tablo 3.5'teki tahminle aynı.</p>

      <h2>Boole ifadeleri: assign</h2>
      <p>
        Kapıları tek tek yazmak yerine Boole denklemi de yazılabilir: <b>continuous assignment</b> — <code>assign</code> anahtar kelimesi. Verilog'da AND için{' '}
        <code>&amp;</code>, OR için <code>|</code>, NOT için <code>~</code> kullanılır (XOR için <code>^</code>).
      </p>
      <Code>
{`assign D = (A & B) | ~C;   // D = AB + C'
assign E = ~C;             // E = C'`}
      </Code>

      <h2>Simülatörde dene</h2>
      <p>
        Aşağıdaki editörde kitabın örneklerini çalıştırabilir, kodu değiştirebilirsin. Kod yazdıkça derlenir; hata yaparsan <b>Türkçe hata mesajı</b> ve satır numarası
        görürsün. Devre modülü için doğruluk tablosu, test bench için dalga formu çıkar.
      </p>
      <VerilogPlayground initial={0} />

      <h2>🎯 Sınavdaki kod sorusu için adım adım tarif</h2>
      <Box kind="exam" title="Şemadan Verilog yazma — 6 adım">
        <ol>
          <li>
            Şemada <b>girişleri</b>, <b>çıkışları</b> ve kapılar arası <b>iç telleri</b> belirle; iç tellere isim ver (w1, w2…).
          </li>
          <li>
            <code>module Ad (portlar);</code> — tüm giriş ve çıkışları port listesine yaz.
          </li>
          <li>
            <code>input …;</code> ve <code>output …;</code> satırlarını yaz.
          </li>
          <li>
            <code>wire w1, w2;</code> ile iç telleri tanımla.
          </li>
          <li>
            Her kapı için bir satır: <code>kapı_tipi Ad (ÇIKIŞ, giriş1, giriş2);</code>
          </li>
          <li>
            <code>endmodule</code> ile bitir (noktalı virgülsüz). Tüm diğer satırların sonunda <code>;</code> olduğunu kontrol et.
          </li>
        </ol>
      </Box>
      <Reveal label="Çözümlü örnek: F = x'y + z devresi">
        <p>Devre: G1 = NOT(x) → w1, G2 = AND(w1, y) → w2, G3 = OR(w2, z) → F.</p>
        <Code>
{`module circuit_F (x, y, z, F);
  input  x, y, z;
  output F;
  wire   w1, w2;

  not G1 (w1, x);
  and G2 (w2, w1, y);
  or  G3 (F, w2, z);
endmodule`}
        </Code>
        <p>
          Aynı devre tek satırla: <code>assign F = (~x &amp; y) | z;</code>
        </p>
      </Reveal>
      <Box kind="warn" title="Kod sorusunda en sık kaybedilen puanlar">
        <ul>
          <li>Kapıda çıkışı sona yazmak (<code>and (A, B, F)</code> ✗ → <code>and (F, A, B)</code> ✓).</li>
          <li>Satır sonu <code>;</code> unutmak veya <code>endmodule;</code> yazmak.</li>
          <li>
            <code>AND</code>, <code>Module</code> gibi büyük harfli anahtar kelimeler.
          </li>
          <li>İç bağlantıyı <code>wire</code> ile tanımlamamak.</li>
          <li>Test bench'te girişleri <code>wire</code>, çıkışları <code>reg</code> yapmak (tersi doğru!).</li>
          <li>Modül örneklemesinde örnek adını (M1) unutmak.</li>
          <li>assign içinde <code>+</code> ve <code>*</code> kullanmak (Verilog'da <code>|</code> ve <code>&amp;</code>).</li>
        </ul>
      </Box>
      <VerilogExercises />

      <KeyPoints
        items={[
          'HDL: donanımı metinle tanımlar. Akış: design entry → simulation (test bench) → synthesis (netlist) → timing verification → fault simulation.',
          'module Ad (portlar); input/output/wire; kapılar; endmodule. Anahtar kelimeler küçük harf; case sensitive.',
          'Primitive kapıda ilk terminal çıkış: and G1 (w1, A, B);',
          'Gecikme: and #(30) G1 (…); `timescale birimi belirler.',
          "Test bench: port yok, girişler reg, çıkışlar wire, örnek adı zorunlu, initial/begin/end, #gecikme, 1'b0, $finish.",
          'assign D = (A & B) | ~C;',
        ]}
      />
    </>
  );
}
const q3_7: LessonDef['questions'] = [
  { id: '3-7-a', kind: 'mc', q: 'In a Verilog gate primitive instantiation such as "and G1 (w1, A, B);", which terminal is the output?', tr: '"and G1 (w1, A, B);" satırında hangi terminal çıkıştır?', options: ['w1 (the first terminal)', 'B (the last terminal)', 'G1', 'A'], answer: 0 },
  { id: '3-7-b', kind: 'mc', q: 'Which statement about Verilog is TRUE?', tr: 'Verilog hakkında hangisi DOĞRUDUR?', options: ['Verilog is case sensitive and keywords are lowercase.', 'Keywords may be written in uppercase or lowercase.', 'endmodule must be followed by a semicolon.', 'Identifiers may start with a number.'], answer: 0 },
  { id: '3-7-c', kind: 'mc', q: 'In a test bench, the inputs to the circuit under test are declared with the keyword ___ and the outputs with ___.', tr: 'Test bench\'te test edilen devrenin girişleri ___, çıkışları ___ ile tanımlanır.', options: ['reg, wire', 'wire, reg', 'input, output', 'output, input'], answer: 0 },
  { id: '3-7-d', kind: 'mc', q: 'An HDL description that provides the stimulus to a design is called:', tr: 'Bir tasarıma uyaran sağlayan HDL tanımına ne denir?', options: ['a test bench', 'a netlist', 'a primitive', 'a timescale'], answer: 0 },
  { id: '3-7-e', kind: 'mc', q: 'Logic synthesis is:', tr: 'Lojik sentez nedir?', options: ['the process of deriving a list of physical components and their interconnections (netlist) from an HDL model', 'displaying waveforms of a circuit', 'checking that the circuit operates at a specified speed', 'writing the stimulus for a simulation'], answer: 0 },
  { id: '3-7-f', kind: 'mc', q: 'In "and #(30) G1 (w1, A, B);", what does #(30) specify?', tr: '"and #(30) G1 (w1, A, B);" satırında #(30) neyi belirtir?', options: ['a propagation delay of 30 time units', 'a 30-input AND gate', 'the instance number', 'a clock period'], answer: 0 },
  { id: '3-7-g', kind: 'mc', q: "What does 1'b0 represent in Verilog?", tr: "Verilog'da 1'b0 neyi temsil eder?", options: ['one binary digit with value 0', 'the number 10 in binary', 'a 1-ns delay', 'a bus of zero width'], answer: 0 },
  { id: '3-7-h', kind: 'mc', q: 'Which Verilog continuous assignment describes D = AB + C\'?', tr: "D = AB + C' ifadesini hangi assign doğru tanımlar?", options: ['assign D = (A & B) | ~C;', 'assign D = A * B + !C;', 'assign D = (A | B) & ~C;', 'D = AB + C\';'], answer: 0 },
  {
    id: '3-7-i',
    kind: 'verilog',
    q: "Write a gate-level Verilog module named circ with inputs A, B, C and output F that implements F = (A + B)C' using the primitives or, not, and.",
    tr: "A, B, C girişli ve F çıkışlı, F = (A + B)C' fonksiyonunu or, not, and primitive'leri ile gerçekleyen circ adlı modülü yazın.",
    module: 'circ',
    inputs: ['A', 'B', 'C'],
    outputs: { F: (e) => (e.A | e.B) & (1 - e.C) },
    starter: `module circ (A, B, C, F);

endmodule`,
    explain: 'Örnek çözüm: input A, B, C; output F; wire w1, w2; or G1 (w1, A, B); not G2 (w2, C); and G3 (F, w1, w2);',
  },
];

export const CH3: LessonDef[] = [
  { id: '3-1', chapter: 3, num: '3.1', title: 'K-map: 2 ve 3 Değişken', titleEn: 'The Map Method', book: '§3.1–3.2, s. 73–80', minutes: 40, Component: L3_1, questions: q3_1 },
  { id: '3-2', chapter: 3, num: '3.2', title: '4 Değişkenli K-map ve Asal İmplikantlar', titleEn: 'Four-Variable K-Map', book: '§3.3, s. 80–84', minutes: 45, Component: L3_2, questions: q3_2 },
  { id: '3-3', chapter: 3, num: '3.3', title: "POS Sadeleştirme ve Don't-Care", titleEn: "Product-of-Sums Simplification and Don't-Care Conditions", book: '§3.4–3.5, s. 84–90', minutes: 40, Component: L3_3, questions: q3_3 },
  { id: '3-4', chapter: 3, num: '3.4', title: 'NAND ve NOR Gerçekleme', titleEn: 'NAND and NOR Implementation', book: '§3.6, s. 90–97', minutes: 45, Component: L3_4, questions: q3_4 },
  { id: '3-5', chapter: 3, num: '3.5', title: 'Diğer İki Seviyeli Gerçeklemeler', titleEn: 'Other Two-Level Implementations', book: '§3.7, s. 97–102', minutes: 30, Component: L3_5, questions: q3_5 },
  { id: '3-6', chapter: 3, num: '3.6', title: 'XOR Fonksiyonu ve Parite', titleEn: 'Exclusive-OR Function', book: '§3.8, s. 103–108', minutes: 30, Component: L3_6, questions: q3_6 },
  { id: '3-7', chapter: 3, num: '3.7', title: "Verilog HDL'e Giriş (Kod Sorusu)", titleEn: 'Hardware Description Language (Verilog)', book: '§3.9, s. 108–115', minutes: 60, Component: L3_7, questions: q3_7 },
];
