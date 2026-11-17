// Classification metrics: accuracy, confusion matrix and per-class precision/recall/F1.

export function accuracy(yTrue: number[], yPred: number[]): number {
  if (!yTrue.length) return 0;
  return yTrue.filter((y, i) => y === yPred[i]).length / yTrue.length;
}

/** matrix[actual][predicted] */
export function confusionMatrix(yTrue: number[], yPred: number[], nClasses = 3): number[][] {
  const m = Array.from({ length: nClasses }, () => new Array(nClasses).fill(0));
  yTrue.forEach((y, i) => m[y]![yPred[i]!]!++);
  return m;
}

export interface ClassReport {
  precision: number;
  recall: number;
  f1: number;
  support: number;
}

export function classificationReport(matrix: number[][]): ClassReport[] {
  return matrix.map((row, c) => {
    const tp = row[c]!;
    const support = row.reduce((a, b) => a + b, 0);
    const predicted = matrix.reduce((a, r) => a + r[c]!, 0);
    const precision = predicted ? tp / predicted : 0;
    const recall = support ? tp / support : 0;
    const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;
    return { precision, recall, f1, support };
  });
}
