import { ReactNode, useState } from 'react';
import { useStore } from '../lib/store';

/** Türkçe metin içinde İngilizce teknik terim (sınavda bu kelimeyle karşılaşacaksın). */
export function En({ children }: { children: ReactNode; say?: string }) {
  return (
    <span className="en" title="İngilizce terim (sınav dili)">
      {children}
    </span>
  );
}

/** Sınav dilinde (İngilizce) kritik tanım + Türkçe çevirisi */
export function Def({ en, tr, term }: { en: ReactNode; tr: ReactNode; term?: string }) {
  const showTr = useStore((s) => s.showTr);
  const [local, setLocal] = useState<boolean | null>(null);
  const visible = local ?? showTr;
  return (
    <div className="def">
      <div className="def-head">
        <span className="def-badge">EN · Sınav tanımı</span>
        {term && <strong className="def-term">{term}</strong>}
        <span className="spacer" />
        <button className="icon-btn" onClick={() => setLocal(!visible)} title="Türkçe çeviriyi göster/gizle">
          {visible ? 'TR gizle' : 'TR göster'}
        </button>
      </div>
      <p className="def-en">{en}</p>
      {visible && <p className="def-tr">{tr}</p>}
    </div>
  );
}

type BoxKind = 'tip' | 'warn' | 'exam' | 'example' | 'info' | 'summary' | 'analogy';
const BOX: Record<BoxKind, string> = {
  tip: 'İpucu',
  warn: 'Dikkat',
  exam: 'Sınavda',
  example: 'Örnek',
  info: 'Bilgi',
  summary: 'Özet',
  analogy: 'Günlük hayattan',
};

export function Box({ kind = 'info', title, children }: { kind?: BoxKind; title?: ReactNode; children: ReactNode }) {
  const label = BOX[kind];
  return (
    <div className={`box box-${kind}`}>
      <div className="box-kicker">{kind === 'warn' && !title ? 'Dikkat — sık yapılan hata' : label}</div>
      {title && <div className="box-title">{title}</div>}
      <div className="box-body">{children}</div>
    </div>
  );
}

/** Önce dene, sonra çözümü aç */
export function Reveal({ label = 'Çözümü göster', children }: { label?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="reveal">
      <button className="btn btn-ghost" onClick={() => setOpen(!open)}>
        {open ? '▲ Gizle' : `▼ ${label}`}
      </button>
      {open && <div className="reveal-body">{children}</div>}
    </div>
  );
}

export function Formula({ children }: { children: ReactNode }) {
  return <div className="formula">{children}</div>;
}

/** Üst çizgi (complement) gösterimi */
export function Bar({ children }: { children: ReactNode }) {
  return <span className="ovl">{children}</span>;
}

export function Sub({ children, b }: { children: ReactNode; b: ReactNode }) {
  return (
    <span className="num">
      ({children})<sub>{b}</sub>
    </span>
  );
}

export function Steps({ children }: { children: ReactNode }) {
  return <ol className="steps">{children}</ol>;
}

export function Tabs({ tabs }: { tabs: { label: string; content: ReactNode }[] }) {
  const [i, setI] = useState(0);
  return (
    <div className="tabs">
      <div className="tab-bar" role="tablist">
        {tabs.map((t, k) => (
          <button key={k} role="tab" aria-selected={i === k} className={i === k ? 'tab active' : 'tab'} onClick={() => setI(k)}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="tab-body">{tabs[i].content}</div>
    </div>
  );
}

/** Basit tablo: başlık + satırlar */
export function Table({ head, rows, highlight, compact, caption }: { head: ReactNode[]; rows: ReactNode[][]; highlight?: (r: number) => boolean; compact?: boolean; caption?: ReactNode }) {
  return (
    <div className="table-wrap">
      <table className={compact ? 'tbl compact' : 'tbl'}>
        {caption && <caption>{caption}</caption>}
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={highlight?.(i) ? 'hl' : ''}>
              {r.map((c, j) => (
                <td key={j}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------- Verilog sözdizimi renklendirme ----------
const VKW = new Set(['module', 'endmodule', 'input', 'output', 'wire', 'reg', 'assign', 'initial', 'begin', 'end', 'always', 'inout', 'primitive', 'endprimitive', 'table', 'endtable']);
const VGATE = new Set(['and', 'or', 'not', 'nand', 'nor', 'xor', 'xnor', 'buf']);

export function highlightVerilog(src: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(`\w+[^\n]*)|(\$\w+)|(\d*'[bBdDhH][0-9a-fA-FxXzZ_]+|#\s*\(?\d+\)?|\b\d+\b)|([A-Za-z_][A-Za-z0-9_$]*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(src))) {
    if (m.index > last) out.push(src.slice(last, m.index));
    const [tok] = m;
    let cls = '';
    if (m[1]) cls = 'c-com';
    else if (m[2]) cls = 'c-dir';
    else if (m[3]) cls = 'c-sys';
    else if (m[4]) cls = 'c-num';
    else if (m[5]) cls = VKW.has(tok) ? 'c-kw' : VGATE.has(tok) ? 'c-gate' : '';
    out.push(cls ? <span key={k++} className={cls}>{tok}</span> : tok);
    last = m.index + tok.length;
  }
  if (last < src.length) out.push(src.slice(last));
  return out;
}

export function Code({ children, lang = 'verilog', title }: { children: string; lang?: 'verilog' | 'text'; title?: ReactNode }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="code">
      {title && <div className="code-title">{title}</div>}
      <button
        className="code-copy"
        onClick={() => {
          navigator.clipboard?.writeText(children).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
          });
        }}
      >
        {copied ? 'Kopyalandı ✓' : 'Kopyala'}
      </button>
      <pre>{lang === 'verilog' ? highlightVerilog(children) : children}</pre>
    </div>
  );
}

export function Bits({ value, groups }: { value: string; groups?: number }) {
  if (!groups) return <span className="bits">{value}</span>;
  const parts: string[] = [];
  for (let i = value.length; i > 0; i -= groups) parts.unshift(value.slice(Math.max(0, i - groups), i));
  return <span className="bits">{parts.join(' ')}</span>;
}

export function KeyPoints({ items }: { items: ReactNode[] }) {
  return (
    <Box kind="summary" title="Bu derste aklında kalması gerekenler">
      <ul className="keypoints">
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </Box>
  );
}

export function Figure({ children, caption }: { children: ReactNode; caption?: ReactNode }) {
  return (
    <figure className="fig">
      {children}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
