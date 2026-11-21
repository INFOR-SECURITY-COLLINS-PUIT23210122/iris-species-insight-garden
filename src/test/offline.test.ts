import { describe, expect, it } from "vitest";
import { loadDefaultDataset } from "@/lib/iris/data";
import { DEFAULT_CONFIG, restoreModel, trainModel } from "@/lib/iris/train";
import { shouldRegisterSW } from "@/lib/pwa-register";

const flower = { sepalLength: 6.3, sepalWidth: 2.9, petalLength: 5.6, petalWidth: 1.8 };

describe("saved models work after restore", () => {
  for (const model of ["mlp", "knn"] as const) {
    it(`${model} gives identical probabilities after a JSON round trip`, async () => {
      const trained = await trainModel(loadDefaultDataset(), { ...DEFAULT_CONFIG, model, epochs: 20 });
      const { predictProba: _p, ...saved } = trained;
      const restored = restoreModel(JSON.parse(JSON.stringify(saved)));
      expect(restored.predictProba(flower)).toEqual(trained.predictProba(flower));
    });
  }
});

describe("offline worker never registers in previews", () => {
  const base = { prod: true, inIframe: false, search: "" };
  it("registers on the published site", () => {
    expect(shouldRegisterSW({ ...base, host: "iris.lovable.app" })).toBe(true);
  });
  it("refuses the editor preview", () => {
    expect(shouldRegisterSW({ ...base, host: "id-preview--bae9fd6f.lovable.app" })).toBe(false);
  });
  it("refuses in dev, iframes and with ?sw=off", () => {
    expect(shouldRegisterSW({ ...base, prod: false, host: "iris.lovable.app" })).toBe(false);
    expect(shouldRegisterSW({ ...base, inIframe: true, host: "iris.lovable.app" })).toBe(false);
    expect(shouldRegisterSW({ ...base, search: "?sw=off", host: "iris.lovable.app" })).toBe(false);
  });
});
