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

export interface TrainedModel {
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
  }

  const yPred = Xtest.map(predict);
  const matrix = confusionMatrix(ytest, yPred);
  return {
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
