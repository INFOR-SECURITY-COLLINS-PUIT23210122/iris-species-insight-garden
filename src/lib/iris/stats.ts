// Descriptive statistics for the Data Explorer.
import { FEATURES, SPECIES, type Feature, type IrisSample, type Species } from "./types";

export interface FeatureStats {
  feature: Feature;
  mean: number;
  std: number;
  min: number;
  median: number;
  max: number;
}

export function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / (xs.length || 1);
}

/** Sample standard deviation (n − 1). */
export function std(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(xs.reduce((a, x) => a + (x - m) ** 2, 0) / (xs.length - 1));
}

export function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
}

export function summarize(data: IrisSample[]): FeatureStats[] {
  return FEATURES.map((feature) => {
    const xs = data.map((d) => d[feature]);
    return {
      feature,
      mean: mean(xs),
      std: std(xs),
      min: Math.min(...xs),
      median: median(xs),
      max: Math.max(...xs),
    };
  });
}

export function classCounts(data: IrisSample[]): Record<Species, number> {
  const counts = { setosa: 0, versicolor: 0, virginica: 0 } as Record<Species, number>;
  for (const d of data) counts[d.species]++;
  return counts;
}

export function presentSpecies(data: IrisSample[]): Species[] {
  const c = classCounts(data);
  return SPECIES.filter((s) => c[s] > 0);
}
