// K-Nearest Neighbours classifier on standardised features.

const NUM_CLASSES = 3;

function sqDist(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += (a[i]! - b[i]!) ** 2;
  return s;
}

export class KnnModel {
  constructor(
    private X: number[][],
    private y: number[],
    public k: number,
    private weighted = false,
  ) {}

  /** Class probabilities = (optionally distance-weighted) vote share of the k nearest points. */
  predictProba(x: number[]): number[] {
    const neighbours = this.X.map((row, i) => ({ d: Math.sqrt(sqDist(row, x)), c: this.y[i]! }))
      .sort((a, b) => a.d - b.d)
      .slice(0, this.k);
    const votes = new Array(NUM_CLASSES).fill(0);
    for (const n of neighbours) votes[n.c] += this.weighted ? 1 / (n.d + 1e-6) : 1;
    const total = votes.reduce((a, b) => a + b, 0);
    return votes.map((v) => v / total);
  }

  predict(x: number[]): number {
    const p = this.predictProba(x);
    return p.indexOf(Math.max(...p));
  }
}
