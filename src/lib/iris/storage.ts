// Saves the dataset, settings and trained model on this device so they survive
// refreshes and work offline. Browser-only; every call is safe to fail silently.
import { restoreModel, type SavedModel, type TrainConfig, type TrainedModel } from "./train";
import type { IrisSample } from "./types";

const KEY = "iris-state-v1";

export interface PersistedState {
  dataset?: { rows: IrisSample[]; name: string };
  config: TrainConfig;
  model: SavedModel | null;
}

export function saveState(state: {
  dataset?: { rows: IrisSample[]; name: string };
  config: TrainConfig;
  model: TrainedModel | null;
}): void {
  try {
    let model: SavedModel | null = null;
    if (state.model) {
      const { predictProba: _omit, ...rest } = state.model;
      model = rest;
    }
    const out: PersistedState = { config: state.config, model };
    if (state.dataset) out.dataset = state.dataset;
    localStorage.setItem(KEY, JSON.stringify(out));
  } catch {
    /* storage full or unavailable — keep working in memory */
  }
}

export function loadState(): (Omit<PersistedState, "model"> & { model: TrainedModel | null }) | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as PersistedState;
    if (!p.config) return null;
    return { ...p, model: p.model?.snapshot ? restoreModel(p.model) : null };
  } catch {
    return null;
  }
}
