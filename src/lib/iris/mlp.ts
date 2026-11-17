// A small fully-connected neural network (4 → hidden ReLU → 3 softmax)
// trained with mini-batch Adam and cross-entropy loss. Pure TypeScript.
import { createRng, shuffle } from "./preprocess";

export interface MlpConfig {
  hidden: number;
  learningRate: number;
  epochs: number;
  batchSize: number;
  seed: number;
}

export interface EpochLog {
  epoch: number;
  loss: number;
  trainAccuracy: number;
  testAccuracy: number;
}

type Mat = number[][];
const zeros = (r: number, c: number): Mat => Array.from({ length: r }, () => new Array(c).fill(0));

function softmax(z: number[]): number[] {
  const m = Math.max(...z);
  const e = z.map((v) => Math.exp(v - m));
  const s = e.reduce((a, b) => a + b, 0);
  return e.map((v) => v / s);
}

export class MlpModel {
  W1: Mat;
  b1: number[];
  W2: Mat;
  b2: number[];
  // Adam moment estimates
  private m: { W1: Mat; b1: number[]; W2: Mat; b2: number[] };
  private v: { W1: Mat; b1: number[]; W2: Mat; b2: number[] };
  private t = 0;

  constructor(
    private nIn: number,
    private nHidden: number,
    private nOut: number,
    seed: number,
  ) {
    const rng = createRng(seed);
    // He initialisation for the ReLU layer, Xavier-like for the output.
    const gauss = () => {
      const u = Math.max(rng(), 1e-12);
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng());
    };
    this.W1 = Array.from({ length: nIn }, () =>
      Array.from({ length: nHidden }, () => gauss() * Math.sqrt(2 / nIn)),
    );
    this.b1 = new Array(nHidden).fill(0);
    this.W2 = Array.from({ length: nHidden }, () =>
      Array.from({ length: nOut }, () => gauss() * Math.sqrt(1 / nHidden)),
    );
    this.b2 = new Array(nOut).fill(0);
    const z = () => ({
      W1: zeros(nIn, nHidden),
      b1: new Array(nHidden).fill(0),
      W2: zeros(nHidden, nOut),
      b2: new Array(nOut).fill(0),
    });
    this.m = z();
    this.v = z();
  }

  private forward(x: number[]) {
    const h = this.b1.map((b, j) => {
      let s = b;
      for (let i = 0; i < this.nIn; i++) s += x[i]! * this.W1[i]![j]!;
      return Math.max(0, s);
    });
    const z = this.b2.map((b, k) => {
      let s = b;
      for (let j = 0; j < this.nHidden; j++) s += h[j]! * this.W2[j]![k]!;
      return s;
    });
    return { h, p: softmax(z) };
  }

  predictProba(x: number[]): number[] {
    return this.forward(x).p;
  }

  predict(x: number[]): number {
    const p = this.predictProba(x);
    return p.indexOf(Math.max(...p));
  }

  /** One gradient step on a mini-batch; returns mean cross-entropy loss. */
  private step(X: Mat, y: number[], lr: number): number {
    const gW1 = zeros(this.nIn, this.nHidden);
    const gb1: number[] = new Array(this.nHidden).fill(0);
    const gW2 = zeros(this.nHidden, this.nOut);
    const gb2: number[] = new Array(this.nOut).fill(0);
    let loss = 0;

    for (let n = 0; n < X.length; n++) {
      const x = X[n]!;
      const target = y[n]!;
      const { h, p } = this.forward(x);
      loss -= Math.log(Math.max(p[target]!, 1e-12));
      const dz = p.map((v, k) => v - (k === target ? 1 : 0)); // softmax + CE gradient
      const dh: number[] = new Array(this.nHidden).fill(0);
      for (let j = 0; j < this.nHidden; j++) {
        const gRow = gW2[j]!;
        const wRow = this.W2[j]!;
        for (let k = 0; k < this.nOut; k++) {
          gRow[k]! += h[j]! * dz[k]!;
          dh[j]! += wRow[k]! * dz[k]!;
        }
        if (h[j]! <= 0) dh[j] = 0; // ReLU derivative
      }
      for (let k = 0; k < this.nOut; k++) gb2[k]! += dz[k]!;
      for (let i = 0; i < this.nIn; i++) {
        const gRow = gW1[i]!;
        for (let j = 0; j < this.nHidden; j++) gRow[j]! += x[i]! * dh[j]!;
      }
      for (let j = 0; j < this.nHidden; j++) gb1[j]! += dh[j]!;
    }

    const scale = 1 / X.length;
    this.t++;
    const b1c = 1 - 0.9 ** this.t;
    const b2c = 1 - 0.999 ** this.t;
    const adam = (param: number[], grad: number[], m: number[], v: number[]) => {
      for (let i = 0; i < param.length; i++) {
        const g = grad[i]! * scale;
        m[i] = 0.9 * m[i]! + 0.1 * g;
        v[i] = 0.999 * v[i]! + 0.001 * g * g;
        param[i]! -= (lr * (m[i]! / b1c)) / (Math.sqrt(v[i]! / b2c) + 1e-8);
      }
    };
    this.W1.forEach((row, i) => adam(row, gW1[i]!, this.m.W1[i]!, this.v.W1[i]!));
    adam(this.b1, gb1, this.m.b1, this.v.b1);
    this.W2.forEach((row, i) => adam(row, gW2[i]!, this.m.W2[i]!, this.v.W2[i]!));
    adam(this.b2, gb2, this.m.b2, this.v.b2);
    return loss * scale;
  }

  /** Runs one full pass over the training data in shuffled mini-batches. */
  trainEpoch(X: Mat, y: number[], cfg: MlpConfig, rng: () => number): number {
    const idx = shuffle(
      X.map((_, i) => i),
      rng,
    );
    let total = 0;
    let batches = 0;
    for (let s = 0; s < idx.length; s += cfg.batchSize) {
      const b = idx.slice(s, s + cfg.batchSize);
      total += this.step(
        b.map((i) => X[i]!),
        b.map((i) => y[i]!),
        cfg.learningRate,
      );
      batches++;
    }
    return total / batches;
  }
}
