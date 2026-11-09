# Logic Design — Sıfırdan Sınava

Logic Design dersinin sınavına hazırlanırken kendim için yazdığım, etkileşimli bir çalışma sitesi. Konuları okuyup geçmek yerine her şeyi deneyerek öğrenmek istedim: K-map'leri elle doldurmak, devreleri simüle etmek, Verilog kodu yazıp anında kontrol ettirmek. Sonuç bu proje oldu. Aynı sınava çalışan başkalarının da işine yarayabilir diye paylaşıyorum.

Anlatım Türkçe, terimlerin İngilizceleri de yanında veriliyor.

**Canlı site:** https://ibrahimtalha0.github.io/logic-design/

## Kapsam

Kaynak kitap: Mano & Ciletti, *Digital Design* (5. baskı), Bölüm 1–4 (§4.5 girişine kadar).

| Bölüm | Konu |
|---|---|
| 1 | Sayı Sistemleri ve Kodlar (taban dönüşümleri, tümleyenler, işaretli sayılar, BCD, Gray) |
| 2 | Boole Cebri ve Lojik Kapılar |
| 3 | Kapı Seviyesinde Sadeleştirme (K-map, POS, don't-care, NAND/NOR, XOR, Verilog'a giriş) |
| 4 | Kombinasyonel Lojik (analiz ve tasarım) |

## Neler var

- **İki anlatım paneli:** Konuyu sıfırdan öğrenmek için *Detaylı Anlatım*, hızlı tekrar için sadeleştirilmiş *Özet Anlatım*.
- **Etkileşimli laboratuvarlar:** Karnaugh haritası, kapı ve devre simülasyonları, sayı sistemi dönüştürücüleri.
- **Verilog laboratuvarı:** Tarayıcıda çalışan küçük bir Verilog simülatörü; yazdığın modül doğruluk tablosuna göre otomatik notlanıyor.
- **Sorular ve deneme sınavı:** Her dersin sonunda otomatik kontrol edilen sorular, ayrıca bir deneme sınavı.
- **Kopya kağıdı ve sözlük:** Kurallar ve tanımlar tek sayfada, Türkçe–İngilizce terim sözlüğü.
- **İlerleme takibi:** Hangi dersleri bitirdiğin tarayıcıda saklanıyor, kaldığın yerden devam edebiliyorsun.

## Çalıştırma

Node.js 18+ gerekli.

```bash
npm install
npm run dev        # geliştirme sunucusu: http://localhost:5173
```

Tek dosyalık sürüm üretmek için:

```bash
npm run build      # çıktı: dist/index.html
```

`dist/index.html` tek başına çalışır: çift tıklayıp internetsiz açabilir ya da GitHub Pages gibi herhangi bir statik sunucuya koyabilirsiniz.

Sadeleştirme, sayı dönüşümü ve Verilog simülatörü için kitap örnekleriyle yazılmış testler:

```bash
npm test
```

## Teknolojiler

React 18, TypeScript, Vite (`vite-plugin-singlefile` ile tek HTML çıktısı). Harici bir bileşen ya da UI kütüphanesi kullanılmadı; Boole sadeleştirme, Verilog ayrıştırıcı/simülatör ve kapı çizimleri projenin içinde yazıldı.

## Not

Bu bir ders notu çalışmasıdır, resmi bir kaynak değildir. Hata görürseniz issue açabilirsiniz. Kitabın kendisi (PDF) telif hakkı nedeniyle depoya dahil edilmemiştir.

---

Hazırlayan: [İbrahim Talha Demir](https://www.linkedin.com/in/ibrahimtalhademir/)
