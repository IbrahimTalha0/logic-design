// Küçük, bağımlılıksız global durum: ayarlar + ilerleme (localStorage'da saklanır).
import { useSyncExternalStore } from 'react';

export interface State {
  showTr: boolean; // İngilizce tanımların altındaki Türkçe çeviriler
  theme: 'light' | 'dark' | 'auto';
  done: Record<string, boolean>; // tamamlanan dersler
  quiz: Record<string, { best: number; total: number }>; // ders id -> en iyi skor
  answered: Record<string, boolean>; // soru id -> doğru cevaplandı mı
  panel: 'detay' | 'ozet'; // seçili anlatım paneli
}

const KEY = 'lojik-tasarim-v1';
const defaults: State = { showTr: true, theme: 'auto', done: {}, quiz: {}, answered: {}, panel: 'detay' };

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch {
    /* gizli sekme vb. */
  }
  return defaults;
}

let state: State = load();
const listeners = new Set<() => void>();

export function setState(patch: Partial<State> | ((s: State) => Partial<State>)) {
  const p = typeof patch === 'function' ? patch(state) : patch;
  state = { ...state, ...p };
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* yoksay */
  }
  listeners.forEach((l) => l());
}

export function getState() {
  return state;
}

export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => sel(state),
  );
}

export function resetProgress() {
  setState({ done: {}, quiz: {}, answered: {} });
}
