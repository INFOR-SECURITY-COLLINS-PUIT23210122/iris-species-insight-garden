// Shared types and constants for the Iris dataset.

export const FEATURES = ["sepalLength", "sepalWidth", "petalLength", "petalWidth"] as const;
export type Feature = (typeof FEATURES)[number];

export const FEATURE_LABELS: Record<Feature, string> = {
  sepalLength: "Sepal length",
  sepalWidth: "Sepal width",
  petalLength: "Petal length",
  petalWidth: "Petal width",
};

export const SPECIES = ["setosa", "versicolor", "virginica"] as const;
export type Species = (typeof SPECIES)[number];

/** CSS colour for each species; one source of truth for every chart. */
export const SPECIES_COLORS: Record<Species, string> = {
  setosa: "var(--species-setosa)",
  versicolor: "var(--species-versicolor)",
  virginica: "var(--species-virginica)",
};

export interface IrisSample {
  sepalLength: number;
  sepalWidth: number;
  petalLength: number;
  petalWidth: number;
  species: Species;
}

/** Converts a sample into a numeric feature vector in FEATURES order. */
export function toVector(s: Pick<IrisSample, Feature>): number[] {
  return FEATURES.map((f) => s[f]);
}
