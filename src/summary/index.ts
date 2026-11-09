import { SUMMARY_CH1 } from './s1';
import { SUMMARY_CH2 } from './s2';
import { SUMMARY_CH3 } from './s3';
import { SUMMARY_CH4 } from './s4';
import type { SummaryDef } from '../data/types';

export const SUMMARY: Record<string, SummaryDef> = { ...SUMMARY_CH1, ...SUMMARY_CH2, ...SUMMARY_CH3, ...SUMMARY_CH4 };
