import { useMemo, useState } from 'react';
import { GLOSSARY } from '../data/glossary';

export default function Glossary() {
  const [q, setQ] = useState('');
  const [ch, setCh] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [mode, setMode] = useState<'list' | 'cards'>('list');
  const list = useMemo(
    () =>
      GLOSSARY.filter((t) => (ch === 0 || t.ch === ch) && (q === '' || (t.en + ' ' + t.tr).toLocaleLowerCase('tr').includes(q.toLocaleLowerCase('tr')))),
    [q, ch],
  );
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);
  const [dir, setDir] = useState<'en' | 'tr'>('en');
  const card = list[i % Math.max(1, list.length)];
  return (
    <div className="page">
      <h1>Sözlük ve Çalışma Kartları</h1>
      <p className="muted">Sınavdaki İngilizce terimlerin Türkçe karşılıkları.</p>
      <div className="lab-controls">
        <div className="seg">
          <button className={mode === 'list' ? 'active' : ''} onClick={() => setMode('list')}>Liste</button>
          <button className={mode === 'cards' ? 'active' : ''} onClick={() => { setMode('cards'); setI(0); setFlip(false); }}>Kartlar</button>
        </div>
        <div className="seg">
          {([0, 1, 2, 3, 4] as const).map((c) => (
            <button key={c} className={ch === c ? 'active' : ''} onClick={() => { setCh(c); setI(0); }}>
              {c === 0 ? 'Tümü' : `Bölüm ${c}`}
            </button>
          ))}
        </div>
      </div>
      {mode === 'list' ? (
        <>
          <input className="q-input gloss-search" placeholder="Ara (İngilizce veya Türkçe)…" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="table-wrap">
            <table className="tbl gloss-table">
              <thead>
                <tr>
                  <th>English</th>
                  <th>Türkçe</th>
                  <th>Bölüm</th>
                </tr>
              </thead>
              <tbody>
                {list.map((t) => (
                  <tr key={t.en}>
                    <td>{t.en}</td>
                    <td>
                      {t.tr}
                      {t.note && <div className="muted small">{t.note}</div>}
                    </td>
                    <td>{t.ch}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        card && (
          <div>
            <div className="flash-controls">
              <div className="seg">
                <button className={dir === 'en' ? 'active' : ''} onClick={() => { setDir('en'); setFlip(false); }}>EN → TR</button>
                <button className={dir === 'tr' ? 'active' : ''} onClick={() => { setDir('tr'); setFlip(false); }}>TR → EN</button>
              </div>
            </div>
            <div className="flash">
              <div className="flash-card" onClick={() => setFlip(!flip)}>
                <div className="muted small">{(i % list.length) + 1} / {list.length} · karta tıkla</div>
                {!flip ? (
                  <div className="front">{dir === 'en' ? card.en : card.tr}</div>
                ) : (
                  <>
                    <div className="front" style={{ fontSize: '1.1rem' }}>{dir === 'en' ? card.en : card.tr}</div>
                    <div className="back">{dir === 'en' ? card.tr : card.en}</div>
                    {card.note && <div className="muted small">{card.note}</div>}
                  </>
                )}
              </div>
            </div>
            <div className="flash-controls">
              <button className="btn btn-ghost" onClick={() => { setI((i - 1 + list.length) % list.length); setFlip(false); }}>← Önceki</button>
              <button className="btn btn-ghost" onClick={() => { setI(Math.floor(Math.random() * list.length)); setFlip(false); }}>Rastgele</button>
              <button className="btn" onClick={() => { setI((i + 1) % list.length); setFlip(false); }}>Sonraki →</button>
            </div>
          </div>
        )
      )}
    </div>
  );
}
