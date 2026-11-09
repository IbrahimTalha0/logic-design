// ÖZET PANEL — Bölüm 1: Sayı sistemleri ve kodlar
import { Box, Def, En, Formula, Table } from '../components/ui';
import { BaseConverter, BcdAdder, ComplementLab, SignedLab } from '../interactives/NumberLabs';
import type { SummaryDef } from '../data/types';

function S1_1() {
  return (
    <>
      <h2>Basamak değeri</h2>
      <p>
        r tabanlı bir sayıda her basamak, <b>basamak × r<sup>konum</sup></b> kadar değer taşır (noktanın solu 0, 1, 2… ; sağı −1, −2…). r tabanında yalnızca 0 … r−1 rakamları
        kullanılır.
      </p>
      <Formula>
        (a₂a₁a₀.a₋₁)ᵣ = a₂·r² + a₁·r¹ + a₀·r⁰ + a₋₁·r⁻¹
      </Formula>
      <Box kind="example">
        (4021.2)₅ = 4·125 + 0·25 + 2·5 + 1 + 2·0.2 = <b>511.4</b> · (B65F)₁₆ = 11·4096 + 6·256 + 5·16 + 15 = <b>46687</b>
      </Box>
      <Table
        compact
        head={['Kavram', 'Akılda tut']}
        rows={[
          ['bit', <><En>binary digit</En> — 0 veya 1</>],
          ['n bit ile en büyük sayı', '2ⁿ − 1 (16 bit → 65 535)'],
          ['K, M, G', 'K = 2¹⁰ = 1024 · M = 2²⁰ · G = 2³⁰ (16K = 16 384 byte)'],
          ['Hex rakamları', 'A=10, B=11, C=12, D=13, E=14, F=15'],
        ]}
      />
      <h2>İkili aritmetik</h2>
      <ul>
        <li>Toplama: 0+0=0, 0+1=1, 1+1=<b>10</b> (0 yaz, 1 elde), 1+1+1=11.</li>
        <li>Çıkarma: 0−1 için soldan <b>borç</b> al (10 − 1 = 1).</li>
        <li>Çarpma: onluktaki gibi; kısmi çarpımlar ya 0 ya da çarpılanın kaydırılmış halidir.</li>
      </ul>
      <Box kind="exam" title="Tabanı bul sorusu">
        "24 + 17 = 40 hangi tabanda doğru?" → sayıları b cinsinden yaz: (2b + 4) + (b + 7) = 4b → 3b + 11 = 4b → <b>b = 11</b>.
      </Box>
    </>
  );
}

function S1_2() {
  return (
    <>
      <Table
        head={['Dönüşüm', 'Yöntem']}
        rows={[
          ['r → onluk', 'Basamak × r^konum toplamı'],
          ['onluk → r (tam kısım)', <>Sürekli <b>÷ r</b>; kalanları <b>aşağıdan yukarı</b> oku</>],
          ['onluk → r (kesir)', <>Sürekli <b>× r</b>; tam kısımları <b>yukarıdan aşağı</b> oku</>],
          ['ikili ↔ sekizli', 'Noktadan başlayarak 3\'lü grupla'],
          ['ikili ↔ onaltılı', 'Noktadan başlayarak 4\'lü grupla'],
          ['sekizli ↔ onaltılı', 'Önce ikiliye çevir, sonra yeniden grupla'],
        ]}
      />
      <Box kind="example">
        41 → ikili: 41/2=20 k1, 20/2=10 k0, 10/2=5 k0, 5/2=2 k1, 2/2=1 k0, 1/2=0 k1 → <b>101001</b>. <br />
        0.6875 → ikili: ×2 → 1.375 (1), 0.75 (0), 1.5 (1), 1.0 (1) → <b>0.1011</b>. <br />
        (2C6B.F2)₁₆ = 0010 1100 0110 1011 . 1111 0010₂
      </Box>
      <Box kind="warn">Gruplarken eksik kalan yerlere sıfır ekle: tam kısımda <b>sola</b>, kesirde <b>sağa</b>.</Box>
      <BaseConverter />
    </>
  );
}

function S1_3() {
  return (
    <>
      <p>n basamaklı N sayısı için:</p>
      <Table
        head={['Tümleyen', 'Tanım', 'Kısa yol']}
        rows={[
          [<><b>(r−1)'s</b> — 9's, 1's</>, '(rⁿ − 1) − N', 'Her basamağı (r−1)\'den çıkar. 1\'s: bitleri ters çevir.'],
          [<><b>r's</b> — 10's, 2's</>, 'rⁿ − N (N=0 ise 0)', '(r−1)\'s + 1. 2\'s: sağdan ilk 1 dahil aynen yaz, solunu ters çevir.'],
        ]}
      />
      <Box kind="example">
        1101100 → 1's = 0010011, 2's = 0010100 · 546700 → 9's = 453299, 10's = 453300
      </Box>
      <h2>Tümleyenle çıkarma: M − N (işaretsiz)</h2>
      <ol>
        <li>Basamak sayılarını eşitle.</li>
        <li>M'ye N'nin r's tümleyenini ekle.</li>
        <li>
          <b>Elde (end carry) oluştuysa</b> M ≥ N: eldeyi at, kalan sonuçtur. <b>Elde yoksa</b> M &lt; N: sonuç = −(toplamın r's tümleyeni).
        </li>
      </ol>
      <Box kind="tip">
        (r−1)'s ile yapılırsa: elde oluşursa onu en sağa ekle (<En>end-around carry</En>); elde yoksa sonuç = −(toplamın (r−1)'s tümleyeni).
      </Box>
      <Box kind="example">
        72532 − 3250 (10's): 72532 + 96750 = 1 69282 → elde var, at → <b>69282</b>. <br />
        3250 − 72532: 03250 + 27468 = 30718 → elde yok → −(10's of 30718) = <b>−69282</b>.
      </Box>
      <ComplementLab />
    </>
  );
}

function S1_4() {
  return (
    <>
      <p>
        Negatif sayıda en soldaki bit (MSB) <b>işaret biti</b>: 0 = pozitif, 1 = negatif. Pozitif sayılar üç gösterimde de aynıdır.
      </p>
      <Table
        head={['−9 (8 bit)', 'Gösterim', 'Kural']}
        rows={[
          ['10001001', <En>signed-magnitude</En>, 'işaret + büyüklük'],
          ['11110110', <En>signed-1's complement</En>, '+9\'un 1\'s tümleyeni'],
          ['11110111', <En>signed-2's complement</En>, '+9\'un 2\'s tümleyeni'],
        ]}
      />
      <ul>
        <li>
          n bit 2's complement aralığı: <b>−2ⁿ⁻¹ … +2ⁿ⁻¹ − 1</b> (4 bit: −8 … +7). Tek sıfır vardır.
        </li>
        <li>Signed-magnitude ve 1's complement'te <b>iki sıfır</b> (+0, −0) vardır.</li>
        <li>Bilgisayarlar 2's complement kullanır.</li>
      </ul>
      <h2>2's complement aritmetiği</h2>
      <ul>
        <li>
          <b>Toplama:</b> işaret biti dahil topla, işaret bitinden çıkan eldeyi <b>at</b>.
        </li>
        <li>
          <b>Çıkarma:</b> A − B = A + (B'nin 2's tümleyeni).
        </li>
        <li>
          <b>Taşma</b> <En>overflow</En>: iki pozitifin toplamı negatif ya da iki negatifin toplamı pozitif çıkarsa. (Farklı işaretlilerin toplamında taşma olmaz.)
        </li>
      </ul>
      <Box kind="example">
        −6 + 13 (8 bit): 11111010 + 00001101 = 1 00000111 → eldeyi at → <b>+7</b>.
      </Box>
      <SignedLab />
    </>
  );
}

function S1_5() {
  return (
    <>
      <p>
        m farklı elemanı kodlamak için en az n bit gerekir: <b>2ⁿ ≥ m</b> (52 kart → 6 bit).
      </p>
      <h2>BCD</h2>
      <ul>
        <li>Her onluk rakam ayrı ayrı 4 bitle yazılır: 396 = 0011 1001 0110. 1010–1111 BCD'de <b>geçersizdir</b>.</li>
        <li>
          BCD toplama: rakamları ikili topla; sonuç <b>&gt; 9 veya elde oluştuysa +6 (0110)</b> ekle.
        </li>
      </ul>
      <Box kind="example">8 + 9 = 1 0001 (17, elde var) → + 0110 → 1 0111 = BCD 0001 0111</Box>
      <BcdAdder />
      <h2>Diğer onluk kodlar</h2>
      <Table
        compact
        head={['Kod', 'Ağırlık', '5 rakamı', 'Not']}
        rows={[
          ['BCD', '8 4 2 1', '0101', ''],
          ['2421', '2 4 2 1', '1011', 'self-complementing'],
          ['Excess-3', '— (BCD + 3)', '1000', 'self-complementing'],
          ['8 4 −2 −1', '8 4 −2 −1', '1011', 'self-complementing'],
        ]}
      />
      <p className="small">
        <b>Self-complementing</b>: bir rakamın 9's tümleyeni, kodun bitleri ters çevrilerek elde edilir.
      </p>
      <h2>Gray, ASCII, parite</h2>
      <ul>
        <li>
          <b>Gray</b>: ardışık sayılar arasında yalnızca <b>bir bit</b> değişir. İkiliden Gray: MSB aynen, sonra komşu bitlerin XOR'u (7 = 0111 → 0100).
        </li>
        <li>
          <b>ASCII</b>: 7 bit, 128 karakter: 94 yazdırılabilir (26 büyük + 26 küçük harf + 10 rakam + 32 özel) ve 34 kontrol karakteri. A = 1000001, a = 1100001 → büyük↔küçük
          harf yalnızca 6. bit (b₆).
        </li>
        <li>
          <b>Parite biti</b>: toplam 1 sayısını çift (even) veya tek (odd) yapacak şekilde eklenir; <b>tek bit hatalarını</b> yakalar.
        </li>
      </ul>
    </>
  );
}

function S1_6() {
  return (
    <>
      <Def
        term="Register"
        en="A register is a group of binary cells. A register with n cells can store any discrete quantity of information that contains n bits."
        tr="Register, ikili hücrelerden oluşan bir gruptur. n hücreli bir register, n bit içeren herhangi bir bilgiyi saklayabilir."
      />
      <p>Bitlerin anlamı (sayı mı, BCD mi, ASCII mi) kullanıcının <b>yorumuna</b> bağlıdır: aynı 12 bit ikili sayı da olabilir, 3 BCD rakamı da.</p>
      <h2>İkili mantık</h2>
      <Table
        compact
        head={['İşlem', 'Yazım', 'Sonuç 1 olur…']}
        rows={[
          ['AND', 'x·y veya xy', 'ikisi de 1 ise'],
          ['OR', 'x + y', 'en az biri 1 ise'],
          ['NOT', "x' veya x̄", 'x = 0 ise'],
        ]}
      />
      <Box kind="warn">
        Mantıkta <b>1 + 1 = 1</b> (OR); aritmetikte 1 + 1 = 10. İkisini karıştırma.
      </Box>
      <p>
        <b>Bitwise</b> işlemde karşılıklı bitlere ayrı ayrı uygulanır: 10110001 AND 10101100 = 10100000.
      </p>
    </>
  );
}

export const SUMMARY_CH1: Record<string, SummaryDef> = {
  '1-1': { Component: S1_1, minutes: 12, skip: ['1-1-i'] },
  '1-2': { Component: S1_2, minutes: 12 },
  '1-3': { Component: S1_3, minutes: 15 },
  '1-4': { Component: S1_4, minutes: 15 },
  '1-5': { Component: S1_5, minutes: 15 },
  '1-6': { Component: S1_6, minutes: 6 },
};
