// Predict: enter four measurements and see the predicted species with class probabilities.
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, Shuffle, Sparkles, Wand2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Panel, SpeciesDot } from "@/components/iris/Panel";
import { PageHeader } from "@/components/layout/PageHeader";
import { MeasurementInput } from "@/components/predict/MeasurementInput";
import { ProbabilityChart } from "@/components/predict/ProbabilityChart";
import { Button } from "@/components/ui/button";
import { useIris } from "@/hooks/use-iris";
import { DEFAULT_CONFIG } from "@/lib/iris/train";
import { FEATURES, FEATURE_LABELS, SPECIES, SPECIES_COLORS, type Feature, type Species } from "@/lib/iris/types";
import { measurementSchema } from "@/lib/iris/validation";

export const Route = createFileRoute("/predict")({
  head: () => ({
    meta: [
      { title: "Predict — Iris Species Classifier" },
      {
        name: "description",
        content: "Enter sepal and petal measurements and get the predicted iris species with a probability for each class.",
      },
      { property: "og:title", content: "Predict — Iris Species Classifier" },
      {
        property: "og:description",
        content: "Enter four flower measurements and see which iris species the model predicts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PredictPage,
});

type Values = Record<Feature, string>;

const EXAMPLES: Record<Species, Values> = {
  setosa: { sepalLength: "5.0", sepalWidth: "3.4", petalLength: "1.5", petalWidth: "0.2" },
  versicolor: { sepalLength: "5.9", sepalWidth: "2.8", petalLength: "4.3", petalWidth: "1.3" },
  virginica: { sepalLength: "6.6", sepalWidth: "3.0", petalLength: "5.6", petalWidth: "2.1" },
};

function PredictPage() {
  const { model, data, train, status } = useIris();
  const [values, setValues] = useState<Values>(EXAMPLES.versicolor);
  const [errors, setErrors] = useState<Partial<Record<Feature, string>>>({});
  const [result, setResult] = useState<number[] | null>(null);

  // Observed min/max per feature, shown as a hint under each input.
  const ranges = useMemo(
    () =>
      Object.fromEntries(
        FEATURES.map((f) => {
          const xs = data.map((d) => d[f]);
          return [f, { min: Math.min(...xs), max: Math.max(...xs) }];
        }),
      ) as Record<Feature, { min: number; max: number }>,
    [data],
  );

  const set = (f: Feature) => (v: string) => {
    setValues((s) => ({ ...s, [f]: v }));
    setErrors((e) => ({ ...e, [f]: undefined }));
  };

  function predict() {
    const parsed = measurementSchema.safeParse(
      Object.fromEntries(FEATURES.map((f) => [f, values[f].trim() === "" ? undefined : values[f]])),
    );
    if (!parsed.success) {
      const next: Partial<Record<Feature, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as Feature;
        if (!next[key]) next[key] = issue.code === "invalid_type" ? `${FEATURE_LABELS[key]} is required` : issue.message;
      }
      setErrors(next);
      setResult(null);
      return;
    }
    if (!model) return;
    setResult(model.predictProba(parsed.data));
  }

  const best = result ? result.indexOf(Math.max(...result)) : -1;
  const bestSpecies = best >= 0 ? SPECIES[best] : undefined;
  const outOfRange = FEATURES.filter((f) => {
    const n = Number(values[f]);
    return Number.isFinite(n) && (n < ranges[f].min || n > ranges[f].max);
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="03 · Predict"
        title="Which iris is it?"
        description="Measure a flower, enter the four sizes, and the trained model will name the species."
      />

      {!model ? (
        <Panel>
          <div className="flex flex-col items-center py-12 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-accent text-accent-foreground">
              <Wand2 className="size-6" />
            </span>
            <h2 className="mt-4 text-xl font-semibold">Train a model first</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Predictions need a trained model. Set one up yourself, or train a quick neural network with the default settings.
            </p>
            <div className="mt-5 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button className="w-full sm:w-auto" onClick={() => void train(DEFAULT_CONFIG)} disabled={status === "training"}>
                {status === "training" ? <Loader2 className="animate-spin" /> : <Sparkles />}
                {status === "training" ? "Training…" : "Quick train"}
              </Button>
              <Button variant="outline" className="w-full sm:w-auto" asChild>
                <Link to="/train">Choose settings</Link>
              </Button>
            </div>
          </div>
        </Panel>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel
            title="Measurements"
            description="Values between 0.1 and 10 cm."
            action={
              <div className="flex flex-wrap gap-1">
                {SPECIES.map((s) => (
                  <Button key={s} variant="outline" size="sm" className="capitalize" onClick={() => { setValues(EXAMPLES[s]); setErrors({}); }}>
                    <SpeciesDot color={SPECIES_COLORS[s]} className="size-2" />
                    {s}
                  </Button>
                ))}
              </div>
            }
          >
            <form
              className="space-y-5"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                predict();
              }}
            >
              {FEATURES.map((f) => (
                <MeasurementInput key={f} id={f} label={FEATURE_LABELS[f]} value={values[f]} onChange={set(f)} error={errors[f]} range={ranges[f]} />
              ))}
              <div className="flex gap-2">
                <Button type="submit" size="lg" className="flex-1">
                  <Wand2 /> Predict
                </Button>
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  className="shrink-0"
                  aria-label="Random flower from the data"
                  onClick={() => {
                    const r = data[Math.floor(Math.random() * data.length)];
                    if (!r) return;
                    setValues(Object.fromEntries(FEATURES.map((f) => [f, r[f].toFixed(1)])) as Values);
                    setErrors({});
                  }}
                >
                  <Shuffle />
                </Button>
              </div>
            </form>
          </Panel>

          <Panel title="Prediction" description={`Using the ${model.config.model === "knn" ? `KNN (k=${model.config.k})` : "neural network"} model · ${(model.evaluation.testAccuracy * 100).toFixed(1)}% test accuracy`}>
            {result && bestSpecies ? (
              <div className="animate-rise space-y-5" aria-live="polite">
                <div className="flex items-center gap-4 rounded-xl border p-4" style={{ borderColor: SPECIES_COLORS[bestSpecies] }}>
                  <span className="size-12 shrink-0 rounded-full" style={{ backgroundColor: SPECIES_COLORS[bestSpecies] }} />
                  <div>
                    <p className="eyebrow">Predicted species</p>
                    <p className="font-display text-3xl font-semibold italic">Iris {bestSpecies}</p>
                    <p className="tabular text-sm text-muted-foreground">{((result[best] ?? 0) * 100).toFixed(1)}% confident</p>
                  </div>
                </div>
                <ProbabilityChart probs={result} />
                {outOfRange.length > 0 && (
                  <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                    Heads up: {outOfRange.map((f) => FEATURE_LABELS[f].toLowerCase()).join(", ")} is outside the range seen in the training data, so this prediction is less reliable.
                  </p>
                )}
              </div>
            ) : (
              <div className="flex h-full min-h-[260px] flex-col items-center justify-center text-center text-sm text-muted-foreground">
                <Wand2 className="mb-3 size-8 opacity-50" />
                Adjust the measurements and press <strong className="text-foreground">Predict</strong>.
              </div>
            )}
          </Panel>
        </div>
      )}
    </div>
  );
}
