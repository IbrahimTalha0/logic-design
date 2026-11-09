// ÖZET PANEL — Bölüm 4: Kombinasyonel lojik (§4.5 girişine kadar)
import { Box, Def, Formula, Table } from '../components/ui';
import { AdderLab, AnalysisLab, CodeConverterLab } from '../interactives/Ch4Labs';
import type { SummaryDef } from '../data/types';

function S4_1() {
  return (
    <>
      <Def
        term="Combinational circuit"
        en="A combinational circuit consists of logic gates whose outputs at any time are determined from only the present combination of inputs."
        tr="Kombinasyonel devrenin çıkışları her an yalnızca girişlerin o anki kombinasyonuna bağlıdır."
      />
      <Def
        term="Sequential circuit"
        en="Sequential circuits employ storage elements in addition to logic gates. Their outputs are a function of the inputs and the state of the storage elements."
        tr="Ardışıl devreler kapılara ek olarak bellek elemanları kullanır; çıkışları girişlere ve bellek elemanlarının durumuna bağlıdır (dolayısıyla geçmiş girişlere de)."
      />
      <ul>
        <li>
          n giriş, m çıkış → <b>2ⁿ</b> satırlık doğruluk tablosu veya her çıkış için bir tane olmak üzere <b>m Boole fonksiyonu</b>.
        </li>
        <li>Kaynak/hedef register'lar devreye dahil edilirse toplam devre <b>ardışıl</b> olur.</li>
        <li>
          Standart bileşenler (MSI, VLSI'da standard cell): <b>adder, subtractor, comparator, decoder, encoder, multiplexer</b>.
        </li>
      </ul>
    </>
  );
}

function S4_2() {
  return (
    <>
      <p>
        <b>Analiz</b>: verilen şemadan Boole fonksiyonlarını / doğruluk tablosunu / devrenin işlevini bulmak.
      </p>
      <ol>
        <li>
          Devre kombinasyonel mi? <b>Geri besleme yolu</b> <i>(feedback path)</i> veya bellek elemanı olmamalı.
        </li>
        <li>Yalnız girişlere bağlı kapı çıkışlarını etiketle (T1, T2 …), fonksiyonlarını yaz.</li>
        <li>Önceki etiketlere bağlı kapıları etiketle; çıkışlara kadar tekrarla.</li>
        <li>
          <b>Yerine koy</b> (repeated substitution) → çıkışları girişler cinsinden yaz.
        </li>
      </ol>
      <p className="small">
        Tablo yolu: 0 … 2ⁿ − 1 satırlarını yaz, önce girişlere bağlı kapıların, sonra diğerlerinin sütunlarını doldur.
      </p>
      <AnalysisLab />
      <Box kind="exam">
        Şekil 4.2: F2 = AB + AC + BC, F1 = F2'(A + B + C) + ABC = A ⊕ B ⊕ C → <b>tam toplayıcı</b> (F1 = toplam, F2 = elde). Simülasyon analiz için pratik değil, ama{' '}
        <b>doğrulama</b> için çok faydalı.
      </Box>
    </>
  );
}

function S4_3() {
  return (
    <>
      <h2>Tasarımın 4 adımı</h2>
      <ol>
        <li>Spesifikasyondan giriş/çıkış sayısını belirle, sembol ver.</li>
        <li>
          <b>Doğruluk tablosunu</b> çıkar (sözel tanımı yanlış yorumlama → yanlış tablo).
        </li>
        <li>Her çıkışı sadeleştir (K-map).</li>
        <li>Şemayı çiz, doğrula (elle veya simülasyonla).</li>
      </ol>
      <p className="small">Seçim kriterleri: kapı sayısı, kapı giriş sayısı, yayılma süresi, bağlantı sayısı, sürme kapasitesi.</p>
      <h2>BCD → Excess-3 kod dönüştürücü</h2>
      <p>
        4 giriş (ABCD), 4 çıkış (wxyz). Geçerli giriş 10 tane; <b>1010–1111 (6 tane) don't-care</b>.
      </p>
      <Formula>
        z = D' · y = CD + C'D' · x = B'C + B'D + BC'D' · w = A + BC + BD
      </Formula>
      <CodeConverterLab />
      <p>
        Ortak <b>(C + D)</b> kapısıyla: y = CD + (C + D)', x = B'(C + D) + B(C + D)', w = A + B(C + D).
      </p>
      <Table
        compact
        head={['', 'İki seviyeli SOP', 'Şekil 4.4']}
        rows={[
          ['Kapılar', '7 AND + 3 OR', '4 AND + 4 OR + 1 NOT'],
          ['Giriş tersleyicileri', "B', C', D'", "B', D'"],
        ]}
      />
      <p className="small">Sonuç: üç seviyeli devre daha az kapı kullanır, hepsi en fazla iki girişlidir.</p>
    </>
  );
}

function S4_4() {
  return (
    <>
      <p>
        0 + 0 = 0, 0 + 1 = 1, 1 + 0 = 1, 1 + 1 = <b>10</b> → yüksek anlamlı bit <b>carry</b> (elde). Toplananlar: <i>augend</i> + <i>addend</i>.
      </p>
      <Table
        head={['', 'Toplar', 'Çıkışlar']}
        rows={[
          [<b>Half adder</b>, '2 bit', 'S = x ⊕ y, C = xy'],
          [<b>Full adder</b>, '3 bit (2 anlamlı bit + önceki elde)', 'S = x ⊕ y ⊕ z, C = xy + xz + yz'],
        ]}
      />
      <p className="small">İki half adder ile bir full adder yapılabilir; isimler buradan gelir.</p>
      <AdderLab />
    </>
  );
}

export const SUMMARY_CH4: Record<string, SummaryDef> = {
  '4-1': { Component: S4_1, minutes: 6, skip: ['4-1-h'] },
  '4-2': { Component: S4_2, minutes: 12 },
  '4-3': { Component: S4_3, minutes: 15 },
  '4-4': { Component: S4_4, minutes: 8 },
};
