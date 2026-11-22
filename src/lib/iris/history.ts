// Saved prediction history (newest first), kept on this device so it works offline.
import type { Feature, Species } from "./types";

export const HISTORY_LIMIT = 20;
const KEY = "iris-predictions-v1";

export interface PredictionRecord {
  id: string;
  at: number;
  input: Record<Feature, number>;
  species: Species;
  probs: number[];
  modelLabel: string;
}

/** Adds a record to the front and keeps only the newest HISTORY_LIMIT. */
export function addRecord(list: PredictionRecord[], rec: PredictionRecord): PredictionRecord[] {
  return [rec, ...list].slice(0, HISTORY_LIMIT);
}

export function loadHistory(): PredictionRecord[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? (v as PredictionRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveHistory(list: PredictionRecord[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable */
  }
}
