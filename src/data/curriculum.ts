import { CH1 } from '../lessons/ch1';
import { CH2 } from '../lessons/ch2';
import { CH3 } from '../lessons/ch3';
import { L3_8_DEF } from '../lessons/ch3b';
import { CH4 } from '../lessons/ch4';
import type { ChapterDef, LessonDef } from './types';

export const CHAPTERS: ChapterDef[] = [
  { n: 1, title: 'Sayı Sistemleri ve Kodlar', titleEn: 'Digital Systems and Binary Numbers', lessons: CH1 },
  { n: 2, title: 'Boole Cebri ve Lojik Kapılar', titleEn: 'Boolean Algebra and Logic Gates', lessons: CH2 },
  { n: 3, title: 'Kapı Seviyesinde Sadeleştirme', titleEn: 'Gate-Level Minimization', lessons: [...CH3, L3_8_DEF] },
  { n: 4, title: 'Kombinasyonel Lojik', titleEn: 'Combinational Logic', lessons: CH4 },
];

export const ALL_LESSONS: LessonDef[] = CHAPTERS.flatMap((c) => c.lessons);
