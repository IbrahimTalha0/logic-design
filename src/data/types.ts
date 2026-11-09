import type { Question } from '../components/Quiz';

export interface LessonDef {
  id: string; // örn "1-2"
  chapter: 1 | 2 | 3 | 4;
  num: string; // görünen numara "1.2"
  title: string; // Türkçe başlık
  titleEn: string; // İngilizce başlık (sınav dili)
  book: string; // kitaptaki karşılığı
  minutes: number; // tahmini çalışma süresi
  Component: () => JSX.Element;
  questions: Question[];
}

export interface ChapterDef {
  n: 1 | 2 | 3 | 4;
  title: string;
  titleEn: string;
  lessons: LessonDef[];
}

/** Özet panel: aynı ders, daha kısa ve sadeleştirilmiş anlatım */
export interface SummaryDef {
  Component: () => JSX.Element;
  minutes: number;
  skip?: string[]; // özette çıkarılan konulara ait soru id'leri
}
