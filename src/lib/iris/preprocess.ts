// Seeded shuffling, train/test split and feature standardisation.
import { SPECIES, toVector, type IrisSample } from "./types";

/** Mulberry32: tiny deterministic PRNG so splits and weights are reproducible. */
export function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: T[], rng: () => number): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export const TEST_FRACTION = 0.2;

/** Shuffles with a fixed seed, then holds out 20% of samples as the test set. */
export function trainTestSplit(data: IrisSample[], seed: number, testFraction = TEST_FRACTION) {
  const shuffled = shuffle(data, createRng(seed));
  const nTest = Math.round(shuffled.length * testFraction);
  return { train: shuffled.slice(nTest), test: shuffled.slice(0, nTest) };
}

/** Z-score scaler: (x − mean) / std per feature. */
export interface Scaler {
  mean: number[];
  std: number[];
}

export function fitScaler(X: number[][]): Scaler {
  const d = X[0]!.length;
  const mean = Array.from({ length: d }, (_, j) => X.reduce((a, r) => a + r[j]!, 0) / X.length);
  const std = Array.from({ length: d }, (_, j) => {
    const v = X.reduce((a, r) => a + (r[j]! - mean[j]!) ** 2, 0) / X.length;
    return Math.sqrt(v) || 1; // avoid divide-by-zero for constant columns
  });
  return { mean, std };
}

export function transform(X: number[][], s: Scaler): number[][] {
  return X.map((r) => r.map((v, j) => (v - s.mean[j]!) / s.std[j]!));
}

export interface PreparedData {
  Xtrain: number[][];
  ytrain: number[];
  Xtest: number[][];
  ytest: number[];
  scaler: Scaler;
}

/**
 * Splits 80/20 with the seed, then standardises. The scaler is fitted on the
 * training rows only so no information from the test set leaks into training.
 */
export function prepareData(data: IrisSample[], seed: number): PreparedData {
  const { train, test } = trainTestSplit(data, seed);
  const scaler = fitScaler(train.map(toVector));
  return {
    Xtrain: transform(train.map(toVector), scaler),
    ytrain: train.map((s) => SPECIES.indexOf(s.species)),
    Xtest: transform(test.map(toVector), scaler),
    ytest: test.map((s) => SPECIES.indexOf(s.species)),
    scaler,
  };
}
