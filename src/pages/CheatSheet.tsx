import { ReactNode } from 'react';

function B({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="cheat-block">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

export default function CheatSheet() {
  return (
    <div className="page" style={{ maxWidth: 1000 }}>
      <h1>Sınav Özeti (Formül Kâğıdı)</h1>
      <p className="muted">
        Sınavdan önceki son tekrar için. <button className="icon-btn" onClick={() => window.print()}>Yazdır</button>
      </p>

      <h2 style={{ borderTop: 0 }}>Bölüm 1 — Sayılar ve Kodlar</h2>
      <div className="cheat">
        <B title="Taban dönüşümü">
          <ul>
            <li>r → 10: Σ basamak × r^konum (kesirde r⁻¹, r⁻²…)</li>
            <li>10 → r (tam): sürekli ÷r, kalanlar <b>aşağıdan yukarı</b></li>
            <li>10 → r (kesir): sürekli ×r, tam kısımlar <b>yukarıdan aşağı</b></li>
            <li>2 ↔ 8: 3'lü grup · 2 ↔ 16: 4'lü grup (noktadan başla)</li>
            <li>K = 2¹⁰ = 1024, M = 2²⁰, G = 2³⁰ · n bit max = 2ⁿ − 1</li>
            <li>Tabanı bul: sayıları b cinsinden yaz, denklemi çöz</li>
          </ul>
        </B>
        <B title="Tümleyenler">
          <ul>
            <li>(r−1)'s = (rⁿ − 1) − N → her basamak (r−1)'den çıkar</li>
            <li>r's = rⁿ − N = (r−1)'s + 1 (N = 0 ise 0)</li>
            <li>1's: bitleri çevir · 2's: sağdan ilk 1 dahil aynen, gerisini çevir</li>
            <li>9's: 9'dan çıkar · 10's: sağ sıfırlar aynen, ilk sıfır olmayan 10'dan, diğerleri 9'dan</li>
          </ul>
        </B>
        <B title="Tümleyenle çıkarma M − N">
          <ul>
            <li>Basamak sayılarını eşitle!</li>
            <li>M + r's(N): elde var → at, sonuç (+) · elde yok → −r's(toplam)</li>
            <li>M + (r−1)'s(N): elde var → en sağa ekle (end-around carry) · yok → −(r−1)'s(toplam)</li>
          </ul>
        </B>
        <B title="İşaretli sayılar (n bit)">
          <ul>
            <li>MSB = işaret: 0 (+), 1 (−)</li>
            <li>−9 (8 bit): S-M 10001001 · 1's 11110110 · 2's 11110111</li>
            <li>2's aralık: −2ⁿ⁻¹ … 2ⁿ⁻¹−1 (tek sıfır); S-M ve 1's: iki sıfır</li>
            <li>2's toplama: işaret dahil topla, son eldeyi at</li>
            <li>Çıkarma: çıkanın 2's'ini ekle</li>
            <li>Taşma: (+)+(+) → (−) veya (−)+(−) → (+)</li>
          </ul>
        </B>
        <B title="Kodlar">
          <ul>
            <li>m eleman → 2ⁿ ≥ m · 52 kart → 6 bit</li>
            <li>BCD: her rakam 4 bit; 1010–1111 geçersiz</li>
            <li>BCD toplama: sonuç &gt; 9 veya elde → +0110</li>
            <li>Excess-3 = BCD + 0011 · Self-complementing: 2421, Excess-3, 84−2−1</li>
            <li>Gray: ardışıklarda 1 bit değişir; g = MSB, sonra komşu XOR</li>
            <li>ASCII 7 bit, 128 karakter: 94 yazdırılabilir (32 özel) + 34 kontrol</li>
            <li>A = 1000001 (41h), a = 1100001 (61h), '0' = 0110000 (30h); büyük↔küçük: b₆</li>
            <li>Çift parite: toplam 1 sayısı çift · parite tek hata yakalar</li>
          </ul>
        </B>
        <B title="Register / ikili mantık">
          <ul>
            <li>Register = n ikili hücre = n bit; anlamı yoruma bağlı</li>
            <li>Mantıkta 1 + 1 = 1; aritmetikte 1 + 1 = 10</li>
            <li>Bitwise: karşılıklı bitlere ayrı işlem</li>
          </ul>
        </B>
      </div>

      <h2>Bölüm 2 — Boole Cebri ve Kapılar</h2>
      <div className="cheat">
        <B title="Postülalar ve teoremler">
          <ul>
            <li>x + 0 = x · x·1 = x</li>
            <li>x + x' = 1 · x·x' = 0</li>
            <li>x + x = x · x·x = x (idempotent)</li>
            <li>x + 1 = 1 · x·0 = 0</li>
            <li>(x')' = x (involution)</li>
            <li>x(y + z) = xy + xz · <b>x + yz = (x + y)(x + z)</b></li>
            <li>DeMorgan: (x + y)' = x'y' · (xy)' = x' + y'</li>
            <li>Absorption: x + xy = x · x(x + y) = x</li>
            <li>x + x'y = x + y · x(x' + y) = xy</li>
            <li>Konsensüs: xy + x'z + yz = xy + x'z</li>
          </ul>
        </B>
        <B title="Dual, öncelik, tümleyen">
          <ul>
            <li>Dual: + ↔ ·, 0 ↔ 1 (değişkenler aynı)</li>
            <li>Öncelik: ( ) &gt; NOT &gt; AND &gt; OR</li>
            <li>F' = dual al + her literali tümle</li>
            <li>Boole cebrinde çıkarma/bölme yok (ters eleman yok)</li>
          </ul>
        </B>
        <B title="Minterm / Maxterm">
          <ul>
            <li>m_j: bit 0 → x', 1 → x (AND) · M_j: bit 0 → x, 1 → x' (OR)</li>
            <li>M_j = m_j'</li>
            <li>F = Σ(1 olan satırlar) = Π(0 olan satırlar)</li>
            <li>Σ ↔ Π: sembolü değiştir, eksik numaraları yaz</li>
            <li>F = Σ(A) ise F' = Σ(diğerleri)</li>
            <li>Eksik değişken: SOP'ta ×(x + x'), POS'ta + xx'</li>
            <li>SOP → AND–OR · POS → OR–AND (iki seviyeli)</li>
          </ul>
        </B>
        <B title="16 fonksiyon ve kapılar">
          <ul>
            <li>n değişken → 2^(2ⁿ) fonksiyon (n = 2 → 16)</li>
            <li>Inhibition xy', implication x' + y → kapı olarak kullanılmaz</li>
            <li>8 kapı: AND, OR, NOT, buffer, NAND, NOR, XOR, XNOR</li>
            <li>NAND/NOR: değişmeli, <b>birleşmeli değil</b>; x↑y↑z = (xyz)'</li>
            <li>XOR: farklıysa 1; çok girişli → tek sayıda 1</li>
            <li>Pozitif mantık AND = negatif mantık OR (dual)</li>
          </ul>
        </B>
        <B title="Entegre devreler">
          <ul>
            <li>SSI &lt; 10 · MSI 10–1000 · LSI binlerce · VLSI milyonlarca kapı</li>
            <li>TTL standart · ECL hız · MOS yoğunluk · CMOS düşük güç (baskın)</li>
            <li>Fan-out: sürülebilen standart yük · Fan-in: giriş sayısı</li>
            <li>Hız ∝ 1 / propagation delay · Noise margin: çıkışı bozmayan max gürültü</li>
            <li>ASIC, FPGA, PLD, full-custom · EDA · schematic capture</li>
          </ul>
        </B>
      </div>

      <h2>Bölüm 3 — Sadeleştirme ve Verilog</h2>
      <div className="cheat">
        <B title="K-map">
          <ul>
            <li>Sıra: 00, 01, 11, 10 (Gray) · kenarlar ve köşeler komşu</li>
            <li>Gruplar 1, 2, 4, 8, 16 kare, dikdörtgen, mümkün olduğunca büyük</li>
            <li>4 değişken: 2 kare → 3 lit, 4 → 2, 8 → 1</li>
            <li>Prime implicant: büyütülemeyen grup · Essential: bir 1'i tek başına kapsar</li>
            <li>Önce esaslar, sonra kalanları en az grupla</li>
          </ul>
        </B>
        <B title="POS ve don't-care">
          <ul>
            <li>POS: 0'ları grupla → F' (SOP) → DeMorgan → F</li>
            <li>0 grubu terimi: sabit 0 → x, sabit 1 → x'</li>
            <li>X: işine gelirse 1, gelmezse 0; hepsini kapsamak zorunlu değil</li>
          </ul>
        </B>
        <B title="NAND / NOR">
          <ul>
            <li>NAND = AND-invert = invert-OR · NOR = OR-invert = invert-AND</li>
            <li>SOP → NAND–NAND · POS → NOR–NOR (aynı yapı)</li>
            <li>Tek literalli terim 2. seviyeye <b>tümlenerek</b> girer</li>
            <li>Çok seviyeli: AND → NAND, OR → invert-OR; tek bubble → inverter</li>
            <li>NAND(x, x) = x'</li>
          </ul>
        </B>
        <B title="Diğer iki seviyeli formlar">
          <ul>
            <li>16 kombinasyon: 8 degenerate, 8 nondegenerate</li>
            <li>AND–NOR = NAND–AND = AND-OR-INVERT → F'yi 0'lardan SOP</li>
            <li>OR–NAND = NOR–OR = OR-AND-INVERT → F'yi POS (1'leri grupla, tümle)</li>
            <li>Wired-AND (açık kollektör TTL NAND) · Wired-OR (ECL NOR)</li>
          </ul>
        </B>
        <B title="XOR ve parite">
          <ul>
            <li>x ⊕ y = xy' + x'y · XNOR = xy + x'y'</li>
            <li>x⊕0 = x · x⊕1 = x' · x⊕x = 0 · x⊕x' = 1 · x⊕y' = (x⊕y)'</li>
            <li>Değişmeli + birleşmeli · 4 NAND ile kurulur</li>
            <li>A⊕B⊕C = Σ(1, 2, 4, 7) — tek fonksiyon (dama tahtası)</li>
            <li>Çift parite: P = x⊕y⊕z · Denetleyici C = x⊕y⊕z⊕P (1 → hata)</li>
          </ul>
        </B>
        <B title="Verilog">
          <ul>
            <li>
              <code>module Ad (portlar);</code> … <code>endmodule</code> (noktalı virgülsüz)
            </li>
            <li>
              <code>input A, B; output F; wire w1;</code>
            </li>
            <li>
              <code>and G1 (w1, A, B);</code> — <b>ilk terminal çıkış</b>, ad isteğe bağlı
            </li>
            <li>Primitive: and or not nand nor xor xnor buf</li>
            <li>
              Gecikme: <code>and #(30) G1 (…);</code> · <code>`timescale 1ns/100ps</code>
            </li>
            <li>
              <code>assign F = (A &amp; B) | ~C;</code> (&amp; AND, | OR, ~ NOT, ^ XOR)
            </li>
            <li>Test bench: port yok, girişler <b>reg</b>, çıkışlar <b>wire</b>, örnek adı zorunlu (M1)</li>
            <li>
              <code>initial begin … end</code> · <code>#100 A = 1'b1;</code> · <code>initial #200 $finish;</code>
            </li>
            <li>Kitap stili: <code>assign E = A || (B &amp;&amp; C) || ((!B) &amp;&amp; D);</code> (&amp;&amp; AND, || OR, ! NOT)</li>
            <li>Küçük harf anahtar kelimeler; case sensitive; isimler rakamla başlamaz</li>
            <li>Akış: design entry → simulation → synthesis (netlist) → timing verification → fault simulation</li>
          </ul>
        </B>
        <B title="UDP (kullanıcı tanımlı primitive)">
          <ul>
            <li>
              <code>primitive Ad (F, A, B);</code> … <code>endprimitive</code> (module değil!)
            </li>
            <li>Tek çıkış, port listesinde <b>ilk</b>; <code>output F; input A, B;</code></li>
            <li>
              <code>table</code> satır: <code>0 1 : 1;</code> (girişler : çıkış ;) <code>endtable</code>
            </li>
            <li>Sütun sırası = input tanım sırası · başlık satırı yorumdur</li>
            <li>Örnekleme: <code>Ad (e, a, b);</code> — örnek adı isteğe bağlı</li>
            <li>System primitives = and, or…; 3 yol: kapılar, assign, UDP</li>
          </ul>
        </B>
      </div>

      <h2>Bölüm 4 — Kombinasyonel Lojik</h2>
      <div className="cheat">
        <B title="Kombinasyonel vs ardışıl">
          <ul>
            <li>Combinational: çıkış yalnızca o anki girişlere bağlı</li>
            <li>Sequential: kapılar + bellek; çıkış geçmiş girişlere de bağlı</li>
            <li>n giriş → 2ⁿ kombinasyon; m çıkış → m Boole fonksiyonu</li>
            <li>Register dahil edilirse toplam devre ardışıl</li>
            <li>Standart bileşenler (MSI): adder, subtractor, comparator, decoder, encoder, multiplexer</li>
          </ul>
        </B>
        <B title="Analiz (şema → fonksiyon)">
          <ul>
            <li>0) Kombinasyonel mi? Feedback path / bellek yok</li>
            <li>1) Yalnız girişlere bağlı kapı çıkışlarını etiketle (T1, T2…)</li>
            <li>2) Önceki etiketlere bağlı kapıları etiketle · 3) Çıkışlara kadar tekrarla</li>
            <li>4) Yerine koy (repeated substitution) → girişler cinsinden</li>
            <li>Tablo yolu: 0…2ⁿ−1 satır, ara sütunlar, çıkışlar</li>
            <li>Şekil 4.2: F1 = A⊕B⊕C, F2 = AB + AC + BC → full adder</li>
          </ul>
        </B>
        <B title="Tasarım (tanım → şema)">
          <ul>
            <li>1) Giriş/çıkış sayısı + semboller · 2) Doğruluk tablosu</li>
            <li>3) Her çıkışı sadeleştir · 4) Şemayı çiz ve doğrula</li>
            <li>Kısıtlar: kapı sayısı, kapı giriş sayısı, yayılma süresi, bağlantı sayısı, sürme kapasitesi</li>
          </ul>
        </B>
        <B title="BCD → Excess-3">
          <ul>
            <li>4 giriş ABCD, 4 çıkış wxyz; 10 geçerli giriş, 6 don't-care (10–15)</li>
            <li>z = D' · y = CD + C'D' · x = B'C + B'D + BC'D' · w = A + BC + BD</li>
            <li>Ortak (C + D): y = CD + (C + D)', x = B'(C + D) + B(C + D)', w = A + B(C + D)</li>
            <li>SOP: 7 AND + 3 OR · Şekil 4.4: 4 AND + 4 OR + 1 NOT, hepsi ≤ 2 giriş</li>
          </ul>
        </B>
        <B title="Toplayıcılar">
          <ul>
            <li>0+0=0, 0+1=1, 1+0=1, 1+1=10 (carry)</li>
            <li>Half adder: 2 bit → S = x⊕y, C = xy</li>
            <li>Full adder: 3 bit (2 bit + önceki elde) → S = x⊕y⊕z, C = xy + xz + yz</li>
            <li>2 half adder → 1 full adder (isim buradan)</li>
          </ul>
        </B>
      </div>
    </div>
  );
}
