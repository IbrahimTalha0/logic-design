import { ReactNode, useEffect, useState } from 'react';
import { go, useRoute } from './lib/router';
import { setState, useStore } from './lib/store';
import { CHAPTERS, ALL_LESSONS } from './data/curriculum';
import { SUMMARY } from './summary';
import { Credit } from './components/Credit';
import { Quiz } from './components/Quiz';
import Home from './pages/Home';
import Glossary from './pages/Glossary';
import CheatSheet from './pages/CheatSheet';
import MockExam from './pages/MockExam';
import Tools from './pages/Tools';
import VerilogPage from './pages/VerilogPage';

function useTheme() {
  const theme = useStore((s) => s.theme);
  useEffect(() => {
    const el = document.documentElement;
    if (theme === 'auto') el.removeAttribute('data-theme');
    else el.setAttribute('data-theme', theme);
  }, [theme]);
  return theme;
}

/** Rota veya kayıtlı tercihten aktif paneli bulur */
function usePanel(route: string): 'detay' | 'ozet' {
  const saved = useStore((s) => s.panel);
  if (route.startsWith('ozet/')) return 'ozet';
  if (route.startsWith('ders/')) return 'detay';
  return saved;
}

function PanelSwitch({ route, onNav }: { route: string; onNav?: () => void }) {
  const panel = usePanel(route);
  const lessonId = route.startsWith('ders/') || route.startsWith('ozet/') ? route.split('/')[1] : null;
  const pick = (p: 'detay' | 'ozet') => {
    setState({ panel: p });
    if (lessonId) go((p === 'ozet' ? 'ozet/' : 'ders/') + lessonId);
    onNav?.();
  };
  return (
    <div className="panel-switch" role="tablist" aria-label="Anlatım paneli">
      <button role="tab" aria-selected={panel === 'detay'} className={panel === 'detay' ? 'active' : ''} onClick={() => pick('detay')}>
        📘 Detaylı
      </button>
      <button role="tab" aria-selected={panel === 'ozet'} className={panel === 'ozet' ? 'active' : ''} onClick={() => pick('ozet')}>
        ⚡ Özet
      </button>
    </div>
  );
}

function Sidebar({ route, onNav }: { route: string; onNav: () => void }) {
  const done = useStore((s) => s.done);
  const panel = usePanel(route);
  const base = panel === 'ozet' ? 'ozet/' : 'ders/';
  const total = ALL_LESSONS.length;
  const completed = ALL_LESSONS.filter((l) => done[l.id]).length;
  const link = (path: string, label: ReactNode, extra?: ReactNode) => (
    <a key={path} href={'#/' + path} className={route === path ? 'nav-link active' : 'nav-link'} onClick={onNav}>
      {label}
      {extra}
    </a>
  );
  return (
    <nav className="sidebar-inner" aria-label="Dersler">
      <a href="#/" className="brand" onClick={onNav}>
        <span className="brand-logo">⊕</span>
        <span>
          <b>Logic Design</b>
          <small>Sıfırdan sınava</small>
        </span>
      </a>
      <PanelSwitch route={route} onNav={onNav} />
      <div className="progress">
        <div className="progress-bar">
          <div style={{ width: `${(completed / total) * 100}%` }} />
        </div>
        <span className="small muted">
          {completed}/{total} ders tamamlandı
        </span>
      </div>
      {CHAPTERS.map((ch) => (
        <div key={ch.n} className="nav-chapter">
          <div className="nav-ch-title">
            Bölüm {ch.n} · {ch.title}
          </div>
          {ch.lessons.map((l) =>
            link(
              base + l.id,
              <>
                <span className="nav-num">{l.num}</span>
                <span className="nav-t">{l.title}</span>
              </>,
              done[l.id] ? <span className="nav-check">✓</span> : null,
            ),
          )}
        </div>
      ))}
      <div className="nav-chapter">
        <div className="nav-ch-title">Çalışma Araçları</div>
        {link('verilog', <><span className="nav-num">⌨</span><span className="nav-t">Verilog Laboratuvarı</span></>)}
        {link('araclar', <><span className="nav-num">🧰</span><span className="nav-t">Tüm Simülatörler</span></>)}
        {link('formul', <><span className="nav-num">📋</span><span className="nav-t">Sınav Özeti (Formül Kâğıdı)</span></>)}
        {link('sozluk', <><span className="nav-num">📖</span><span className="nav-t">Sözlük & Kartlar (EN–TR)</span></>)}
        {link('sinav', <><span className="nav-num">🏁</span><span className="nav-t">Deneme Sınavı</span></>)}
      </div>
      <Credit className="sidebar-credit" />
    </nav>
  );
}

function LessonPage({ id, summary }: { id: string; summary: boolean }) {
  const idx = ALL_LESSONS.findIndex((l) => l.id === id);
  const done = useStore((s) => s.done[id]);
  useEffect(() => {
    setState({ panel: summary ? 'ozet' : 'detay' });
  }, [summary]);
  if (idx < 0) return <div className="page"><h1>Ders bulunamadı</h1><a href="#/">Ana sayfaya dön</a></div>;
  const l = ALL_LESSONS[idx];
  const S = summary ? SUMMARY[l.id] : undefined;
  const base = summary ? '#/ozet/' : '#/ders/';
  const prev = ALL_LESSONS[idx - 1], next = ALL_LESSONS[idx + 1];
  const C = S ? S.Component : l.Component;
  const questions = S?.skip ? l.questions.filter((q) => !S.skip!.includes(q.id)) : l.questions;
  return (
    <article className={`page lesson ${summary ? 'summary' : ''}`}>
      <header className="lesson-head">
        <div className="lesson-meta">
          {summary ? <span className="pill sum">⚡ Özet anlatım</span> : <span className="pill">📘 Detaylı anlatım</span>}
          <span className="pill ghost">Bölüm {l.chapter}</span>
          <span className="pill ghost">📖 {l.book}</span>
          <span className="pill ghost">⏱ ~{S ? S.minutes : l.minutes} dk</span>
          <span className="spacer" />
          <a className="switch-link" href={(summary ? '#/ders/' : '#/ozet/') + l.id}>
            {summary ? '📘 Detaylı anlatımı aç' : '⚡ Özetini aç'}
          </a>
        </div>
        <h1>
          <span className="h-num">{l.num}</span> {l.title}
        </h1>
        <div className="h-en">{l.titleEn}</div>
      </header>
      {summary && (
        <p className="sum-note small">
          Bu, dersin <b>özet</b> halidir: yalnızca sınav için gereken kurallar, tanımlar ve kısa örnekler. Bir yeri anlamazsan{' '}
          <a href={'#/ders/' + l.id}>detaylı anlatıma</a> geç.
        </p>
      )}
      <C />
      {questions.length > 0 && <Quiz id={summary ? 'ozet-' + l.id : l.id} questions={questions} />}
      <div className="lesson-foot">
        <button className={done ? 'btn done' : 'btn'} onClick={() => setState((s) => ({ done: { ...s.done, [id]: !s.done[id] } }))}>
          {done ? '✓ Tamamlandı' : 'Bu dersi tamamladım'}
        </button>
        <div className="pager">
          {prev && (
            <a className="pager-link" href={base + prev.id}>
              ← {prev.num} {prev.title}
            </a>
          )}
          {next && (
            <a
              className="pager-link next"
              href={base + next.id}
              onClick={() => !done && setState((s) => ({ done: { ...s.done, [id]: true } }))}
            >
              {next.num} {next.title} →
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default function App() {
  const route = useRoute();
  const theme = useTheme();
  const showTr = useStore((s) => s.showTr);
  const [open, setOpen] = useState(false);

  let page: JSX.Element;
  if (route.startsWith('ders/')) page = <LessonPage key={route} id={route.slice(5)} summary={false} />;
  else if (route.startsWith('ozet/')) page = <LessonPage key={route} id={route.slice(5)} summary />;
  else if (route === 'sozluk') page = <Glossary />;
  else if (route === 'formul') page = <CheatSheet />;
  else if (route === 'sinav') page = <MockExam />;
  else if (route === 'araclar') page = <Tools />;
  else if (route === 'verilog') page = <VerilogPage />;
  else page = <Home />;

  const nextTheme = theme === 'auto' ? 'dark' : theme === 'dark' ? 'light' : 'auto';
  return (
    <div className={`app ${open ? 'nav-open' : ''}`}>
      <aside className="sidebar">
        <Sidebar route={route} onNav={() => setOpen(false)} />
      </aside>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
      <div className="main">
        <header className="topbar">
          <button className="icon-btn menu-btn" onClick={() => setOpen(!open)} aria-label="Menü">
            ☰
          </button>
          <button className="crumb" onClick={() => go('')}>
            Logic Design
          </button>
          <span className="spacer" />
          <button className={`chip-toggle ${showTr ? 'on' : ''}`} onClick={() => setState({ showTr: !showTr })} title="İngilizce tanım ve soruların Türkçe çevirilerini göster/gizle">
            🇹🇷 Çeviriler: {showTr ? 'Açık' : 'Kapalı'}
          </button>
          <button className="icon-btn" onClick={() => setState({ theme: nextTheme })} title={`Tema: ${theme}`}>
            {theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '🌓'}
          </button>
        </header>
        <main className="content">{page}</main>
      </div>
    </div>
  );
}
