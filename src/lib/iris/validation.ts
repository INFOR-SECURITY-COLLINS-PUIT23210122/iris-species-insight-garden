// Zod schemas for user-entered settings and measurements.
import { z } from "zod";

export const trainConfigSchema = z.object({
  model: z.enum(["knn", "mlp"]),
  seed: z.coerce.number().int("Seed must be a whole number").min(0).max(1_000_000),
  k: z.coerce.number().int("k must be a whole number").min(1, "k must be at least 1").max(50, "k can be at most 50"),
  weighted: z.boolean(),
  hidden: z.coerce.number().int().min(2, "Use at least 2 hidden units").max(64, "Use at most 64 hidden units"),
  epochs: z.coerce.number().int().min(1, "At least 1 epoch").max(1000, "At most 1000 epochs"),
  learningRate: z.coerce
    .number()
    .gt(0, "Learning rate must be greater than 0")
    .max(1, "Learning rate must be at most 1"),
  batchSize: z.coerce.number().int().min(1).max(120),
});

export const MEASUREMENT_MIN = 0.1;
export const MEASUREMENT_MAX = 10;

const measurement = (label: string) =>
  z.coerce
    .number({ invalid_type_error: `${label} must be a number` })
    .min(MEASUREMENT_MIN, `${label} must be at least ${MEASUREMENT_MIN} cm`)
    .max(MEASUREMENT_MAX, `${label} must be at most ${MEASUREMENT_MAX} cm`);

export const measurementSchema = z.object({
  sepalLength: measurement("Sepal length"),
  sepalWidth: measurement("Sepal width"),
  petalLength: measurement("Petal length"),
  petalWidth: measurement("Petal width"),
});
