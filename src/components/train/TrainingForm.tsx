// Model selection + hyperparameters, validated with zod before training starts.
import { BrainCircuit, Loader2, Network, Square, Sparkles } from "lucide-react";
import { useState } from "react";

import { Panel } from "@/components/iris/Panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useIris } from "@/hooks/use-iris";
import { DEFAULT_CONFIG, type ModelType, type TrainConfig } from "@/lib/iris/train";
import { trainConfigSchema } from "@/lib/iris/validation";
import { cn } from "@/lib/utils";

type NumericField = "seed" | "k" | "hidden" | "epochs" | "learningRate" | "batchSize";

function Field({
  id,
  label,
  hint,
  value,
  error,
  onChange,
  step,
  disabled,
}: {
  id: NumericField;
  label: string;
  hint: string;
  value: string;
  error?: string | undefined;
  onChange: (v: string) => void;
  step?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        inputMode="decimal"
        type="number"
        step={step ?? "1"}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={`${id}-hint`}
        className={cn("tabular", error && "border-destructive focus-visible:ring-destructive")}
      />
      <p id={`${id}-hint`} className={cn("text-xs", error ? "text-destructive" : "text-muted-foreground")}>
        {error ?? hint}
      </p>
    </div>
  );
}

const MODEL_OPTIONS: { value: ModelType; label: string; blurb: string; icon: typeof Network }[] = [
  { value: "mlp", label: "Neural network", blurb: "4 → hidden (ReLU) → 3 softmax, Adam", icon: BrainCircuit },
  { value: "knn", label: "K-nearest neighbours", blurb: "Majority vote of the k closest flowers", icon: Network },
];

export function TrainingForm() {
  const { config, train, status, cancel, data } = useIris();
  const training = status === "training";
  const [model, setModel] = useState<ModelType>(config.model);
  const [weighted, setWeighted] = useState(config.weighted);
  const [values, setValues] = useState<Record<NumericField, string>>({
    seed: String(config.seed),
    k: String(config.k),
    hidden: String(config.hidden),
    epochs: String(config.epochs),
    learningRate: String(config.learningRate),
    batchSize: String(config.batchSize),
  });
  const [errors, setErrors] = useState<Partial<Record<NumericField, string>>>({});

  const set = (f: NumericField) => (v: string) => {
    setValues((s) => ({ ...s, [f]: v }));
    setErrors((e) => ({ ...e, [f]: undefined }));
  };

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const result = trainConfigSchema.safeParse({
      model,
      weighted,
      ...Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.trim() === "" ? NaN : v])),
    });
    if (!result.success) {
      const next: Partial<Record<NumericField, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as NumericField;
        // Only surface errors for fields visible for the chosen model.
        const relevant = key === "seed" || (model === "knn" ? key === "k" : key !== "k");
        if (relevant && !next[key]) next[key] = issue.message.includes("NaN") || issue.message.startsWith("Expected number") ? "Enter a number" : issue.message;
      }
      if (Object.keys(next).length) {
        setErrors(next);
        return;
      }
    }
    const parsed = (result.success ? result.data : { ...DEFAULT_CONFIG, ...config, model, weighted }) as TrainConfig;
    const trainSize = data.length - Math.round(data.length * 0.2);
    if (model === "knn" && parsed.k > trainSize) {
      setErrors({ k: `k can't exceed the ${trainSize} training samples` });
      return;
    }
    void train(parsed);
  }

  return (
    <Panel title="Model settings" description="Features are standardised and split 80/20 using the seed.">
      <form onSubmit={submit} className="space-y-5" noValidate>
        <div className="grid gap-2" role="radiogroup" aria-label="Model type">
          {MODEL_OPTIONS.map(({ value, label, blurb, icon: Icon }) => (
            <button
              type="button"
              role="radio"
              aria-checked={model === value}
              key={value}
              disabled={training}
              onClick={() => setModel(value)}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3 text-left transition-all disabled:opacity-60",
                model === value ? "border-primary bg-accent/60 ring-1 ring-primary" : "hover:bg-muted",
              )}
            >
              <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
              <span>
                <span className="block text-sm font-medium">{label}</span>
                <span className="block text-xs text-muted-foreground">{blurb}</span>
              </span>
            </button>
          ))}
        </div>

        {model === "knn" ? (
          <div className="grid gap-4">
            <Field id="k" label="k (neighbours)" hint="Odd values avoid ties. 1–50." value={values.k} error={errors.k} onChange={set("k")} disabled={training} />
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="weighted">Distance-weighted votes</Label>
                <p className="text-xs text-muted-foreground">Closer neighbours count more.</p>
              </div>
              <Switch id="weighted" checked={weighted} onCheckedChange={setWeighted} disabled={training} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="epochs" label="Epochs" hint="1–1000" value={values.epochs} error={errors.epochs} onChange={set("epochs")} disabled={training} />
            <Field id="learningRate" label="Learning rate" hint="e.g. 0.01" step="0.001" value={values.learningRate} error={errors.learningRate} onChange={set("learningRate")} disabled={training} />
            <Field id="hidden" label="Hidden units" hint="2–64" value={values.hidden} error={errors.hidden} onChange={set("hidden")} disabled={training} />
            <Field id="batchSize" label="Batch size" hint="1–120" value={values.batchSize} error={errors.batchSize} onChange={set("batchSize")} disabled={training} />
          </div>
        )}

        <Field id="seed" label="Random seed" hint="Same seed → same split and weights." value={values.seed} error={errors.seed} onChange={set("seed")} disabled={training} />

        {training ? (
          <div className="flex gap-2">
            <Button type="button" className="flex-1" disabled>
              <Loader2 className="animate-spin" /> Training…
            </Button>
            <Button type="button" variant="outline" onClick={cancel}>
              <Square /> Stop
            </Button>
          </div>
        ) : (
          <Button type="submit" className="w-full" size="lg">
            <Sparkles /> Train Model
          </Button>
        )}
      </form>
    </Panel>
  );
}
