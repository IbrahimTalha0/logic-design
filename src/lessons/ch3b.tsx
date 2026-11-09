import { useState } from 'react';
import { Box, Code, Def, En, KeyPoints, Table } from '../components/ui';
import { VerilogExercises, VerilogPlayground } from '../interactives/VerilogLab';
import type { LessonDef } from '../data/types';

// Problem 3.35 — sözdizimi hatası avı
const BUGGY: { code: string; errs: string[] }[] = [
  { code: 'module Exmpl-3(A, B, C, D, F)', errs: ['İsimde "-" kullanılamaz (yalnızca harf, rakam, _): Exmpl_3', 'Satır sonunda ";" eksik.'] },
  { code: '  inputs A, B, C, Output D, F,', errs: ['Anahtar kelime "inputs" değil "input".', '"Output" büyük harfle yazılmış ve input satırının içinde; çıkışlar ayrı bir "output" satırında tanımlanır.', 'Satır "," ile değil ";" ile biter.'] },
  { code: '  output B', errs: ['B zaten giriş; aynı sinyal hem input hem output olamaz (çıkışlar D ve F olmalı).', '";" eksik.'] },
  { code: '  and g1(A, B, D);', errs: ['İlk terminal ÇIKIŞTIR: burada A (bir giriş) sürülüyor. Doğrusu örn. and g1 (D, A, B);'] },
  { code: '  not (D, A, C),', errs: ['not kapısında sondaki terminal giriş, öncekiler çıkıştır → A (giriş) çıkış olarak kullanılmış.', 'Satır "," ile değil ";" ile bitmeli.'] },
  { code: '  OR (F, B; C);', errs: ['Kapı adları küçük harf: "or".', 'Terminaller "," ile ayrılır: (F, B, C).'] },
  { code: 'endmodule;', errs: ['"endmodule" sonrasına ";" konmaz.'] },
];

function SyntaxHunt() {
  const [open, setOpen] = useState<Record<number, boolean>>({});
  return (
    <div className="lab">
      <div className="lab-title">Hata Avı — Problem 3.35</div>
      <p className="small">Her satırdaki hataları önce kendin bul, sonra satıra tıklayıp kontrol et. (Kapı örnek adları isteğe bağlıdır.)</p>
      <div className="hunt">
        {BUGGY.map((l, i) => (
          <div key={i} className={`hunt-line ${open[i] ? 'open' : ''}`} onClick={() => setOpen({ ...open, [i]: !open[i] })}>
            <div className="hunt-code">
              <span className="hunt-no">{i + 1}</span>
              <code>{l.code}</code>
              <span className="hunt-badge">{open[i] ? `${l.errs.length} hata` : 'tıkla'}</span>
            </div>
            {open[i] && (
              <ul className="small">
                {l.errs.map((e, k) => (
                  <li key={k}>{e}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
      <details>
        <summary>Düzeltilmiş hali</summary>
        <Code>
{`module Exmpl_3 (A, B, C, D, F);
  input  A, B, C;
  output D, F;
  and g1 (D, A, B);
  not    (F, C);     // örnek düzeltme
endmodule`}
        </Code>
      </details>
    </div>
  );
}

function L3_8() {
  return (
    <>
      <p>
        3.7'de Verilog'un temelini (modül, kapı primitive'leri, gecikme, test bench) öğrendik. Kitabın 3.9 bölümünün kalanı, bir devreyi tanımlamanın <b>diğer iki yolunu</b>{' '}
        gösteriyor. Böylece aynı devreyi üç farklı şekilde yazabilirsin:
      </p>
      <Table
        head={['Yol', 'Verilog yapısı', 'Örnek']}
        rows={[
          ['1. Şema (kapılar)', 'and, or, not … primitive örneklemeleri', 'and G1 (w1, A, B);'],
          ['2. Boole ifadesi', 'assign (continuous assignment)', 'assign D = (A && B) || (!C);'],
          ['3. Doğruluk tablosu', 'UDP: primitive … table … endprimitive', '0 1 0 : 1;'],
        ]}
      />

      <h2>Boole ifadeleri: assign</h2>
      <p>
        Kombinasyonel lojik, <code>assign</code> anahtar kelimesi ve ardından bir Boole ifadesinden oluşan <b>sürekli atama</b> <En>continuous assignment</En> ile tanımlanır.
      </p>
      <Table
        head={['İşlem', 'Kitabın kullandığı', 'Bit düzeyi eşdeğeri', 'Örnek']}
        rows={[
          ['AND', <code>&amp;&amp;</code>, <code>&amp;</code>, <code>A &amp;&amp; B</code>],
          ['OR', <code>||</code>, <code>|</code>, <code>A || B</code>],
          ['NOT', <code>!</code>, <code>~</code>, <code>!C</code>],
        ]}
      />
      <Box kind="info">
        Kitap AND, OR, NOT için <b>&amp;&amp;, ||, !</b> sembollerini kullanır (aritmetik + ve * ile karışmasın diye). Tek bitlik sinyallerde <b>&amp;, |, ~</b> da aynı sonucu
        verir. Sınavda ikisi de doğrudur; ama <b>+ ve * kullanma!</b>
      </Box>
      <p>Şekil 3.35'teki basit devre tek satırla:</p>
      <Code>{`assign D = (A && B) || (!C);`}</Code>
      <h3>HDL Örnek 3.4</h3>
      <p>
        E = A + BC + B'D ve F = B'C + BC'D' fonksiyonlarını gerçekleyen devre:
      </p>
      <Code>
{`// Verilog model: Circuit with Boolean expressions
module Circuit_Boolean_CA (E, F, A, B, C, D);
  output E, F;
  input  A, B, C, D;
  assign E = A || (B && C) || ((!B) && D);
  assign F = ((!B) && C) || (B && (!C) && (!D));
endmodule`}
      </Code>
      <ul>
        <li>Simülatör, test bench girişlerden birini değiştirdiğini fark ettiği anda E ve F'yi günceller.</li>
        <li>
          Adı "sürekli" çünkü atanan değer ile değişkenler arasındaki ilişki <b>kalıcıdır</b>; tam bir kombinasyonel devre gibi davranır, kapı seviyesinde bir karşılığı vardır.
          Buna <b>örtük kombinasyonel lojik</b> <En>implicit combinational logic</En> denir.
        </li>
      </ul>
      <Box kind="tip">
        Öncelik: <code>!</code> en yüksek, sonra <code>&amp;&amp;</code>, en son <code>||</code> (NOT &gt; AND &gt; OR — Boole cebrindeki gibi). Emin değilsen{' '}
        <b>parantez kullan</b>; kitap da her terimi parantezle yazıyor.
      </Box>

      <h2>Kullanıcı tanımlı primitive (UDP)</h2>
      <Def
        term="User-defined primitive"
        en="The logic gates used in Verilog descriptions with keywords and, or, etc., are defined by the system and are referred to as system primitives. The user can create additional primitives by defining them in tabular form. These types of circuits are referred to as user-defined primitives (UDPs)."
        tr="and, or gibi anahtar kelimelerle kullanılan kapılar sistem tarafından tanımlıdır ve sistem primitive'i (system primitives) olarak adlandırılır. Kullanıcı, tablo biçiminde tanımlayarak ek primitive'ler oluşturabilir; bunlara kullanıcı tanımlı primitive (UDP) denir."
      />
      <p>
        Tablo biçiminde devre tanımlamanın bir yolu doğruluk tablosudur. UDP'ler <code>module … endmodule</code> <b>kullanmaz</b>; <code>primitive … endprimitive</code> ile
        tanımlanır.
      </p>
      <h3>UDP kuralları (sınavda sorulur)</h3>
      <Def
        term="UDP rules"
        en="It is declared with the keyword primitive, followed by a name and port list. There can be only one output, and it must be listed first in the port list and declared with keyword output. There can be any number of inputs; the order in which they are listed in the input declaration must conform to the order in which they are given values in the table. The truth table is enclosed within the keywords table and endtable. The values of the inputs are listed in order, ending with a colon (:). The output is always the last entry in a row and is followed by a semicolon (;). The declaration of a UDP ends with the keyword endprimitive."
        tr="primitive anahtar kelimesi, ardından isim ve port listesiyle tanımlanır. Yalnızca BİR çıkış olabilir; port listesinde İLK sırada yer almalı ve output ile tanımlanmalıdır. Giriş sayısı serbesttir; input tanımındaki sıra tablodaki değer sırasıyla aynı olmalıdır. Doğruluk tablosu table ve endtable arasına yazılır. Giriş değerleri sırayla yazılır ve iki nokta (:) ile biter. Çıkış her zaman satırın son elemanıdır ve ardından noktalı virgül (;) gelir. UDP tanımı endprimitive ile biter."
      />
      <h3>HDL Örnek 3.5</h3>
      <Code>
{`// D = f(A, B, C) = Σ(0, 2, 4, 6, 7)
primitive UDP_02467 (D, A, B, C);
  output D;
  input  A, B, C;
  table
  //  A  B  C  :  D      // sütun başlığı sadece yorum
      0  0  0  :  1;
      0  0  1  :  0;
      0  1  0  :  1;
      0  1  1  :  0;
      1  0  0  :  1;
      1  0  1  :  0;
      1  1  0  :  1;
      1  1  1  :  1;
  endtable
endprimitive

// UDP'yi kullanan devre (Şekil 3.37)
module Circuit_with_UDP_02467 (e, f, a, b, c, d);
  output e, f;
  input  a, b, c, d;
  UDP_02467 (e, a, b, c);
  and       (f, e, d);   // kapı örnek adı isteğe bağlı
endmodule`}
      </Code>
      <ul>
        <li>Tablonun üstündeki A B C : D satırı <b>yorumdur</b>; sistem değişkenleri input tanımındaki sıradan tanır.</li>
        <li>UDP, başka modüllerde tıpkı sistem primitive'leri gibi örneklenebilir (instantiate).</li>
        <li>Verilog'un hazır primitive'lerinin hiçbiri ardışıl lojik tanımlamaz. Ardışıl UDP'de çıkış <code>reg</code> olur ve tabloya bir sonraki durum sütunu eklenir: girişler : durum : sonraki durum. (Bilgi amaçlı.)</li>
      </ul>
      <Box kind="warn" title="UDP'de sık yapılan hatalar">
        <ul>
          <li>Çıkışı port listesinde ilk sıraya koymamak, ya da iki çıkış tanımlamak.</li>
          <li><code>endprimitive</code> yerine <code>endmodule</code>; <code>endtable</code>'ı unutmak.</li>
          <li>Satırda <code>:</code> veya sondaki <code>;</code> eksik; giriş sayısı kadar değer yazmamak.</li>
          <li>UDP içine <code>wire</code>, <code>assign</code> veya kapı yazmak (UDP yalnızca output, input ve table içerir).</li>
        </ul>
      </Box>
      <VerilogPlayground initial={6} height={18} />

      <h2>Kod okuma ve hata bulma</h2>
      <p>
        Kitabın problemlerinde iki tip daha var: <b>verilen koddaki hataları bulmak</b> (Problem 3.35) ve <b>koddan şema çizmek</b> (Problem 3.36). İkisi de sınavın "kolay kod
        sorusu" için iyi antrenman.
      </p>
      <SyntaxHunt />
      <Box kind="example" title="Koddan şemaya (Problem 3.36c)">
        <Code>
{`module Circuit_C (y1, y2, y3, a, b);
  output y1, y2, y3;
  input  a, b;
  assign y1 = a || b;
  and (y2, a, b);
  assign y3 = a && b;
endmodule`}
        </Code>
        y1 = a + b (bir OR kapısı), y2 = ab (AND primitive), y3 = ab (assign ile AND). y2 ve y3 aynı fonksiyonu iki farklı yazımla tanımlıyor.
      </Box>
      <VerilogExercises />

      <KeyPoints
        items={[
          'Devre tanımlamanın 3 yolu: kapı primitive\'leri (şema), assign (Boole ifadesi), UDP (doğruluk tablosu).',
          'assign E = A || (B && C) || ((!B) && D);  → && AND, || OR, ! NOT (tek bitte & | ~ de olur). + ve * kullanılmaz.',
          'Continuous assignment = implicit combinational logic; girişler değişince çıkış hemen güncellenir.',
          'System primitives: and, or, … ; UDP: primitive Ad (çıkış, girişler); … table … endtable … endprimitive.',
          'UDP: tek çıkış, port listesinde İLK; satır biçimi "giriş giriş : çıkış;"; sütun sırası = input tanım sırası.',
          'UDP örneklemesinde örnek adı isteğe bağlıdır (sistem kapıları gibi).',
        ]}
      />
    </>
  );
}

const q3_8: LessonDef['questions'] = [
  { id: '3-8-a', kind: 'mc', q: 'In the Verilog continuous assignment "assign E = A || (B && C) || ((!B) && D);", the symbols &&, || and ! denote:', tr: '"assign E = A || (B && C) || ((!B) && D);" ifadesinde &&, || ve ! neyi gösterir?', options: ['AND, OR, NOT', 'OR, AND, NOT', 'NAND, NOR, XOR', 'AND, XOR, NOT'], answer: 0 },
  { id: '3-8-b', kind: 'mc', q: 'Which Boolean function is described by "assign F = ((!B) && C) || (B && (!C) && (!D));"?', tr: '"assign F = ((!B) && C) || (B && (!C) && (!D));" hangi fonksiyonu tanımlar?', options: ["F = B'C + BC'D'", "F = BC' + B'CD", "F = (B' + C)(B + C' + D')", "F = B'C'D'"], answer: 0 },
  { id: '3-8-c', kind: 'mc', q: 'A user-defined primitive (UDP) is declared with the keyword pair:', tr: 'Kullanıcı tanımlı primitive (UDP) hangi anahtar kelime çiftiyle tanımlanır?', options: ['primitive … endprimitive', 'module … endmodule', 'table … endmodule', 'begin … end'], answer: 0 },
  { id: '3-8-d', kind: 'mc', q: 'Which statement about a combinational UDP is FALSE?', tr: 'Kombinasyonel UDP hakkında hangisi YANLIŞTIR?', options: ['It may have any number of outputs.', 'The output must be listed first in the port list.', 'The truth table is enclosed within table and endtable.', 'Each row ends with the output value followed by a semicolon.'], answer: 0, explain: 'UDP\'nin yalnızca BİR çıkışı olabilir.' },
  { id: '3-8-e', kind: 'mc', q: 'In a UDP truth table row such as "0 1 0 : 1;", the value after the colon is:', tr: '"0 1 0 : 1;" satırında iki noktadan sonraki değer nedir?', options: ['the output', 'the first input', 'the delay', 'the next state'], answer: 0 },
  { id: '3-8-f', kind: 'mc', q: 'The gates and, or, nand … that are predefined in Verilog are referred to as:', tr: "Verilog'da hazır tanımlı and, or, nand … kapılarına ne denir?", options: ['system primitives', 'user-defined primitives', 'test benches', 'continuous assignments'], answer: 0 },
  { id: '3-8-g', kind: 'mc', q: 'Why is the continuous assignment mechanism said to describe "implicit combinational logic"?', tr: 'Sürekli atama neden "örtük kombinasyonel lojik" tanımlar denir?', options: ['Because the relationship between the assigned value and the variables is permanent, acting just like combinational logic with a gate-level equivalent.', 'Because it can only be used in test benches.', 'Because it requires a clock.', 'Because it stores the previous value.'], answer: 0 },
  { id: '3-8-h', kind: 'mc', q: 'Which line contains a syntax error?', tr: 'Hangi satırda sözdizimi hatası var?', options: ['OR (F, B, C);', 'or (F, B, C);', 'not (D, C);', 'and g1 (D, A, B);'], answer: 0, explain: 'Verilog büyük/küçük harfe duyarlıdır; kapı adları küçük harf yazılır.' },
  {
    id: '3-8-i',
    kind: 'verilog',
    q: 'Write a user-defined primitive named UDP_odd with output F and inputs A, B, C, whose output is 1 when an odd number of inputs are 1, i.e., F(A, B, C) = Σ(1, 2, 4, 7).',
    tr: 'Çıkışı F, girişleri A, B, C olan ve tek sayıda giriş 1 iken çıkışı 1 olan (F = Σ(1, 2, 4, 7)) UDP_odd adlı kullanıcı tanımlı primitive\'i yazın.',
    module: 'UDP_odd',
    inputs: ['A', 'B', 'C'],
    outputs: { F: (e) => e.A ^ e.B ^ e.C },
    requireUdp: true,
    starter: `primitive UDP_odd (F, A, B, C);
  output F;
  input  A, B, C;
  table
  //  A  B  C  :  F

  endtable
endprimitive`,
    explain: 'Satırlar: 000:0; 001:1; 010:1; 011:0; 100:1; 101:0; 110:0; 111:1;',
  },
];

export const L3_8_DEF: LessonDef = {
  id: '3-8',
  chapter: 3,
  num: '3.8',
  title: 'Verilog II: Boole İfadeleri ve UDP',
  titleEn: 'Boolean Expressions and User-Defined Primitives',
  book: '§3.9 (devam), s. 115–122',
  minutes: 35,
  Component: L3_8,
  questions: q3_8,
};
