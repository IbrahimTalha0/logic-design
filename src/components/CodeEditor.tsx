import { useRef } from 'react';
import { highlightVerilog } from './ui';

/** Renkli Verilog düzenleyici: şeffaf textarea + arkada renklendirilmiş <pre>. */
export function CodeEditor({ value, onChange, rows = 14, errorLines = [] }: { value: string; onChange: (v: string) => void; rows?: number; errorLines?: number[] }) {
  const pre = useRef<HTMLPreElement>(null);
  const gutter = useRef<HTMLDivElement>(null);
  const lines = value.split('\n').length;
  return (
    <div className="editor" style={{ height: `calc(${rows} * 1.5em + 20px)` }}>
      <div className="editor-gutter" ref={gutter} aria-hidden>
        {Array.from({ length: Math.max(lines, rows) }, (_, i) => (
          <div key={i} className={errorLines.includes(i + 1) ? 'err' : ''}>{i + 1}</div>
        ))}
      </div>
      <div className="editor-main">
        <pre ref={pre} className="editor-hl" aria-hidden>
          {highlightVerilog(value)}
          {'\n'}
        </pre>
        <textarea
          className="editor-ta"
          value={value}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          onChange={(e) => onChange(e.target.value)}
          onScroll={(e) => {
            const t = e.currentTarget;
            if (pre.current) {
              pre.current.scrollTop = t.scrollTop;
              pre.current.scrollLeft = t.scrollLeft;
            }
            if (gutter.current) gutter.current.scrollTop = t.scrollTop;
          }}
          onKeyDown={(e) => {
            if (e.key === 'Tab') {
              e.preventDefault();
              const t = e.currentTarget;
              const s = t.selectionStart, en = t.selectionEnd;
              const v = value.slice(0, s) + '  ' + value.slice(en);
              onChange(v);
              requestAnimationFrame(() => t.setSelectionRange(s + 2, s + 2));
            }
          }}
        />
      </div>
    </div>
  );
}
