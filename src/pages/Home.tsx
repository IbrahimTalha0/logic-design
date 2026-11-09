import { CHAPTERS, ALL_LESSONS } from '../data/curriculum';
import { resetProgress, setState, useStore } from '../lib/store';
import { En } from '../components/ui';
import { Credit } from '../components/Credit';

export default function Home() {
  const done = useStore((s) => s.done);
  const panel = useStore((s) => s.panel);
  const base = panel === 'ozet' ? '#/ozet/' : '#/ders/';
  const quiz = useStore((s) => s.quiz);
  const firstUndone = ALL_LESSONS.find((l) => !done[l.id]) ?? ALL_LESSONS[0];
  const started = ALL_LESSONS.some((l) => done[l.id]);
  return (
    <div className="page">
      <section className="hero">
        <h1>Logic Design — Sıfırdan Sınava</h1>
        <p>
          Sayı sistemlerinden Karnaugh haritalarına, NAND/NOR devrelerinden Verilog koduna ve kombinasyonel devre analiz/tasarımına kadar sınav konularının tamamı; sade Türkçe anlatım, İngilizce terimler,
          etkileşimli simülasyonlar ve otomatik kontrol edilen sorularla.
        </p>
        <p className="small">Kaynak: Mano &amp; Ciletti, <i>Digital Design</i> (5. baskı), Bölüm 1–4 (§4.5 girişine kadar, s. 1–133).</p>
        <a className="btn" href={base + firstUndone.id}>
          {started ? `Kaldığın yerden devam et: ${firstUndone.num} ${firstUndone.title} →` : 'Derse başla →'}
        </a>
        <div>
          <Credit className="hero-credit" />
        </div>
      </section>

      <h2 style={{ borderTop: 0, marginTop: 0 }}>İki anlatım paneli</h2>
      <div className="cards panel-cards">
        <a className="card" href={'#/ders/' + firstUndone.id} onClick={() => setState({ panel: 'detay' })}>
          <h3>Detaylı Anlatım</h3>
          <p>Konuyu sıfırdan öğrenmek için. Bol örnek, benzetme, adım adım çözüm ve simülasyon. İlk kez çalışıyorsan buradan başla.</p>
        </a>
        <a className="card sum" href={'#/ozet/' + firstUndone.id} onClick={() => setState({ panel: 'ozet' })}>
          <h3>Özet Anlatım</h3>
          <p>Aynı dersler, sadeleştirilmiş: gereksiz ayrıntı ve çok basit bilgiler çıkarıldı; yalnızca kurallar, sınav tanımları ve kısa örnekler. Hızlı tekrar için.</p>
        </a>
      </div>
      <p className="small muted">Sol menünün üstündeki <b>Detaylı / Özet</b> düğmesiyle istediğin an geçiş yapabilirsin; her dersin başında da diğer panele bağlantı var.</p>

      <h2>Bu siteyi nasıl kullanmalısın?</h2>
      <div className="cards">
        <div className="card">
          <h3>1 · Sırayla oku</h3>
          <p>Dersler birbirinin üzerine kurulu. Her dersi baştan sona oku, simülasyonlarla oyna, örnekleri önce kendin çözmeye çalış.</p>
        </div>
        <div className="card">
          <h3>2 · Soruları çöz</h3>
          <p>Her dersin sonundaki soruları çöz. Sorular sınav gibi İngilizce; anlamazsan <b>TR çeviri</b> düğmesine bas. Yanlışlarda açıklamayı mutlaka oku.</p>
        </div>
        <div className="card">
          <h3>3 · Pekiştir</h3>
          <p>Alıştırma kutuları sınırsız rastgele soru üretir. K-map ve Verilog antrenmanlarında ustalaşana kadar devam et.</p>
        </div>
        <div className="card">
          <h3>4 · Sınava hazırlan</h3>
          <p>Son gün <a href="#/formul">Sınav Özeti</a>'ni oku, <a href="#/sozluk">Sözlük kartlarıyla</a> terimleri tekrar et ve <a href="#/sinav">Deneme Sınavı</a>'nı çöz.</p>
        </div>
      </div>

      <div className="box box-tip">
        <div className="box-title">Dil stratejisi: Türkçe anla, İngilizce cevapla</div>
        <div className="box-body">
          <ul>
            <li>
              Anlatım Türkçedir; teknik terimlerin İngilizcesi <En>bu şekilde</En> vurgulanır.
            </li>
            <li>
              Sınavda çıkabilecek kritik tanımlar <b>"EN · Sınav tanımı"</b> kutularında kitabın İngilizcesiyle ve altında Türkçe çevirisiyle verilir.
            </li>
            <li>
              Üst menüdeki <b>Çeviriler</b> düğmesiyle tüm çevirileri kapatıp kendini İngilizce test edebilirsin.
            </li>
            <li>
              <a href="#/sozluk">Sözlük</a> sayfasında ~150 terimin Türkçe karşılığı ve çalışma kartları var.
            </li>
          </ul>
        </div>
      </div>

      {CHAPTERS.map((ch) => (
        <section key={ch.n}>
          <h2>
            Bölüm {ch.n}: {ch.title} <span className="h-en small">— {ch.titleEn}</span>
          </h2>
          <ul className="ch-list">
            {ch.lessons.map((l) => {
              const q = quiz[l.id];
              return (
                <li key={l.id}>
                  <span className={`ch-mark${done[l.id] ? ' done' : ''}`} aria-label={done[l.id] ? 'Tamamlandı' : 'Tamamlanmadı'} />
                  <a href={base + l.id}>
                    <b>{l.num}</b> {l.title}
                  </a>
                  <span className="muted small">
                    · ~{l.minutes} dk {q && `· test: ${q.best}/${q.total}`}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <h2>Çalışma araçları</h2>
      <div className="cards">
        <a className="card" href="#/verilog">
          <h3>Verilog Laboratuvarı</h3>
          <p>Kod yaz, anında derle, doğruluk tablosu ve dalga formu gör. Otomatik puanlanan kod soruları.</p>
        </a>
        <a className="card" href="#/araclar">
          <h3>Tüm Simülatörler</h3>
          <p>K-map çözücü, taban dönüştürücü, tümleyen hesaplayıcı, doğruluk tablosu üretici, devre dönüştürücü…</p>
        </a>
        <a className="card" href="#/formul">
          <h3>Sınav Özeti</h3>
          <p>Tüm formüller ve kurallar tek sayfada. Yazdırılabilir.</p>
        </a>
        <a className="card" href="#/sinav">
          <h3>Deneme Sınavı</h3>
          <p>Tüm konulardan rastgele sorular + bir Verilog kod sorusu.</p>
        </a>
      </div>
      <p className="muted small" style={{ marginTop: 30 }}>
        İlerlemen yalnızca bu tarayıcıda saklanır.{' '}
        <button className="icon-btn" onClick={() => confirm('Tüm ilerleme ve test skorları silinsin mi?') && resetProgress()}>
          İlerlemeyi sıfırla
        </button>
      </p>
    </div>
  );
}
