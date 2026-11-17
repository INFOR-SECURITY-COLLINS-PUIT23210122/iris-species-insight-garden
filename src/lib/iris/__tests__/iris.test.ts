import { describe, expect, it } from "vitest";
import { parseIrisCsv, CsvError } from "../csv";
import { loadDefaultDataset } from "../data";
import { classificationReport, confusionMatrix } from "../metrics";
import { fitScaler, prepareData, transform, trainTestSplit } from "../preprocess";
import { DEFAULT_CONFIG, trainModel } from "../train";

const data = loadDefaultDataset();

describe("dataset", () => {
  it("embeds all 150 samples, 50 per species", () => {
    expect(data).toHaveLength(150);
    expect(data.filter((d) => d.species === "setosa")).toHaveLength(50);
    expect(data.filter((d) => d.species === "virginica")).toHaveLength(50);
  });
});

describe("train/test split", () => {
  it("holds out 20% (30 of 150) for testing", () => {
    const { train, test } = trainTestSplit(data, 42);
    expect(train).toHaveLength(120);
    expect(test).toHaveLength(30);
  });

  it("is identical for the same seed and different for another seed", () => {
    const a = trainTestSplit(data, 42).test;
    const b = trainTestSplit(data, 42).test;
    const c = trainTestSplit(data, 7).test;
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
  });
});

describe("standardisation", () => {
  it("gives training features mean 0 and std 1", () => {
    const X = [
      [1, 10],
      [2, 20],
      [3, 30],
    ];
    const Z = transform(X, fitScaler(X));
    const col0 = Z.map((r) => r[0]!);
    expect(col0.reduce((a, b) => a + b, 0)).toBeCloseTo(0);
    expect(Math.sqrt(col0.reduce((a, b) => a + b * b, 0) / 3)).toBeCloseTo(1);
  });

  it("fits the scaler on training rows only", () => {
    const prepared = prepareData(data, 42);
    const means = prepared.Xtrain[0]!.map(
      (_, j) => prepared.Xtrain.reduce((a, r) => a + r[j]!, 0) / prepared.Xtrain.length,
    );
    means.forEach((m) => expect(m).toBeCloseTo(0));
  });
});

describe("models", () => {
  it("KNN reaches at least 90% test accuracy", async () => {
    const m = await trainModel(data, { ...DEFAULT_CONFIG, model: "knn", k: 5 });
    expect(m.evaluation.testAccuracy).toBeGreaterThanOrEqual(0.9);
    expect(m.evaluation.nTest).toBe(30);
  });

  it("neural network reaches at least 90% test accuracy", async () => {
    const m = await trainModel(data, { ...DEFAULT_CONFIG, model: "mlp", epochs: 100 });
    expect(m.history).toHaveLength(100);
    expect(m.evaluation.testAccuracy).toBeGreaterThanOrEqual(0.9);
  });

  it("returns probabilities that sum to 1 and pick setosa for a short petal", async () => {
    const m = await trainModel(data, { ...DEFAULT_CONFIG, model: "mlp", epochs: 60 });
    const p = m.predictProba({ sepalLength: 5.0, sepalWidth: 3.4, petalLength: 1.5, petalWidth: 0.2 });
    expect(p.reduce((a, b) => a + b, 0)).toBeCloseTo(1);
    expect(p.indexOf(Math.max(...p))).toBe(0);
  });

  it("rejects k larger than the training set", async () => {
    await expect(trainModel(data, { ...DEFAULT_CONFIG, model: "knn", k: 500 })).rejects.toThrow();
  });
});

describe("metrics", () => {
  it("computes precision, recall and F1 per class", () => {
    const m = confusionMatrix([0, 0, 1, 1, 2, 2], [0, 1, 1, 1, 2, 0]);
    const r = classificationReport(m);
    expect(r[1]!.precision).toBeCloseTo(2 / 3);
    expect(r[1]!.recall).toBe(1);
    expect(r[0]!.f1).toBeCloseTo(0.5);
  });
});

describe("CSV upload", () => {
  const header = "sepal_length,sepal_width,petal_length,petal_width,species";
  const rows = Array.from({ length: 15 }, (_, i) =>
    i % 2 ? "5.1,3.5,1.4,0.2,Iris-setosa" : "6.3,3.3,6.0,2.5,virginica",
  );

  it("accepts the standard columns and Iris- prefixed species", () => {
    const parsed = parseIrisCsv([header, ...rows].join("\n"));
    expect(parsed).toHaveLength(15);
    expect(parsed[1]!.species).toBe("setosa");
  });

  it("reports missing columns", () => {
    expect(() => parseIrisCsv("a,b\n1,2")).toThrow(CsvError);
  });

  it("reports non-numeric values and unknown species", () => {
    const bad = [header, "x,3.5,1.4,0.2,setosa", "5,3,1,0.2,rose", ...rows].join("\n");
    try {
      parseIrisCsv(bad);
      throw new Error("should fail");
    } catch (e) {
      expect(e).toBeInstanceOf(CsvError);
      expect((e as CsvError).details).toHaveLength(2);
    }
  });

  it("requires at least 15 rows", () => {
    expect(() => parseIrisCsv([header, ...rows.slice(0, 5)].join("\n"))).toThrow(/at least 15/);
  });
});
