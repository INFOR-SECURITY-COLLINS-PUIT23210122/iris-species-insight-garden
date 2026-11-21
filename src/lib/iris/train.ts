// Orchestrates preprocessing, training and evaluation for either model type.
import { KnnModel } from "./knn";
import { accuracy, classificationReport, confusionMatrix, type ClassReport } from "./metrics";
import { MlpModel, type EpochLog } from "./mlp";
import { createRng, prepareData, type Scaler } from "./preprocess";
import { toVector, type Feature, type IrisSample } from "./types";

export type ModelType = "knn" | "mlp";

export interface TrainConfig {
  model: ModelType;
  seed: number;
  // KNN
  k: number;
  weighted: boolean;
  // Neural network
  hidden: number;
  epochs: number;
  learningRate: number;
  batchSize: number;
}

export const DEFAULT_CONFIG: TrainConfig = {
  model: "mlp",
  seed: 42,
  k: 5,
  weighted: false,
  hidden: 10,
  epochs: 150,
  learningRate: 0.01,
  batchSize: 16,
};

export interface KSweepPoint {
  k: number;
  trainAccuracy: number;
  testAccuracy: number;
}

export interface Evaluation {
  testAccuracy: number;
  matrix: number[][];
  report: ClassReport[];
  nTrain: number;
  nTest: number;
}

/** Plain-JSON copy of the learned parameters, so a model can be saved and restored offline. */
export type ModelSnapshot =
  | { kind: "knn"; X: number[][]; y: number[]; k: number; weighted: boolean }
  | { kind: "mlp"; hidden: number; W1: number[][]; b1: number[]; W2: number[][]; b2: number[] };

export interface TrainedModel {
  snapshot: ModelSnapshot;
  config: TrainConfig;
  scaler: Scaler;
  history: EpochLog[]; // neural network learning curve
  kSweep: KSweepPoint[]; // KNN accuracy for several k values
  evaluation: Evaluation;
  trainedAt: number;
  durationMs: number;
  /** Takes raw measurements in cm and returns probabilities for each species. */
  predictProba: (input: Record<Feature, number>) => number[];
}

export type ProgressFn = (log: EpochLog, fraction: number) => void;

const yieldToBrowser = () => new Promise<void>((r) => setTimeout(r, 0));

function evaluate(predict: (x: number[]) => number, X: number[][], y: number[]) {
  return accuracy(y, X.map(predict));
}

export async function trainModel(
  data: IrisSample[],
  config: TrainConfig,
  onProgress?: ProgressFn,
  signal?: AbortSignal,
): Promise<TrainedModel> {
  const start = performance.now();
  const { Xtrain, ytrain, Xtest, ytest, scaler } = prepareData(data, config.seed);
  const scale = (input: Record<Feature, number>) =>
    toVector(input).map((v, j) => (v - scaler.mean[j]!) / scaler.std[j]!);

  let predict: (x: number[]) => number;
  let predictProbaScaled: (x: number[]) => number[];
  let snapshot: ModelSnapshot;
  const history: EpochLog[] = [];
  const kSweep: KSweepPoint[] = [];

  if (config.model === "knn") {
    if (config.k > Xtrain.length) {
      throw new Error(`k (${config.k}) can't exceed the ${Xtrain.length} training samples.`);
    }
    // Sweep odd k values to show how accuracy depends on k.
    const maxK = Math.min(25, Xtrain.length);
    for (let k = 1; k <= maxK; k += 2) {
      const m = new KnnModel(Xtrain, ytrain, k, config.weighted);
      kSweep.push({
        k,
        trainAccuracy: evaluate((x) => m.predict(x), Xtrain, ytrain),
        testAccuracy: evaluate((x) => m.predict(x), Xtest, ytest),
      });
      await yieldToBrowser();
    }
    const model = new KnnModel(Xtrain, ytrain, config.k, config.weighted);
    predict = (x) => model.predict(x);
    predictProbaScaled = (x) => model.predictProba(x);
    snapshot = { kind: "knn", X: Xtrain, y: ytrain, k: config.k, weighted: config.weighted };
  } else {
    const model = new MlpModel(4, config.hidden, 3, config.seed);
    const rng = createRng(config.seed + 1);
    for (let epoch = 1; epoch <= config.epochs; epoch++) {
      if (signal?.aborted) throw new DOMException("Training cancelled", "AbortError");
      const loss = model.trainEpoch(Xtrain, ytrain, config, rng);
      if (!Number.isFinite(loss)) {
        throw new Error("Training diverged (loss became NaN). Try a smaller learning rate.");
      }
      const log: EpochLog = {
        epoch,
        loss,
        trainAccuracy: evaluate((x) => model.predict(x), Xtrain, ytrain),
        testAccuracy: evaluate((x) => model.predict(x), Xtest, ytest),
      };
      history.push(log);
      onProgress?.(log, epoch / config.epochs);
      // Yield every few epochs so the UI (progress bar, chart) can repaint.
      if (epoch % 3 === 0) await yieldToBrowser();
    }
    predict = (x) => model.predict(x);
    predictProbaScaled = (x) => model.predictProba(x);
    snapshot = { kind: "mlp", hidden: config.hidden, W1: model.W1, b1: model.b1, W2: model.W2, b2: model.b2 };
  }

  const yPred = Xtest.map(predict);
  const matrix = confusionMatrix(ytest, yPred);
  return {
    snapshot,
    config,
    scaler,
    history,
    kSweep,
    evaluation: {
      testAccuracy: accuracy(ytest, yPred),
      matrix,
      report: classificationReport(matrix),
      nTrain: Xtrain.length,
      nTest: Xtest.length,
    },
    trainedAt: Date.now(),
    durationMs: performance.now() - start,
    predictProba: (input) => predictProbaScaled(scale(input)),
  };
}

export type SavedModel = Omit<TrainedModel, "predictProba">;

/** Rebuilds a usable model (with predictProba) from its saved JSON form. */
export function restoreModel(saved: SavedModel): TrainedModel {
  const { scaler, snapshot } = saved;
  let proba: (x: number[]) => number[];
  if (snapshot.kind === "knn") {
    const m = new KnnModel(snapshot.X, snapshot.y, snapshot.k, snapshot.weighted);
    proba = (x) => m.predictProba(x);
  } else {
    const m = new MlpModel(4, snapshot.hidden, 3, 0);
    m.W1 = snapshot.W1;
    m.b1 = snapshot.b1;
    m.W2 = snapshot.W2;
    m.b2 = snapshot.b2;
    proba = (x) => m.predictProba(x);
  }
  return {
    ...saved,
    predictProba: (input) =>
      proba(toVector(input).map((v, j) => (v - scaler.mean[j]!) / scaler.std[j]!)),
  };
}
