// Train & Evaluate: settings form, live learning curves and test-set evaluation.
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, ArrowRight, BrainCircuit } from "lucide-react";

import { Panel } from "@/components/iris/Panel";
import { PageHeader } from "@/components/layout/PageHeader";
import { ClassReportTable, ConfusionMatrix, MetricTile } from "@/components/train/Evaluation";
import { AccuracyChart, KSweepChart, LossChart } from "@/components/train/TrainingCharts";
import { TrainingForm } from "@/components/train/TrainingForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useIris } from "@/hooks/use-iris";

export const Route = createFileRoute("/train")({
  head: () => ({
    meta: [
      { title: "Train & Evaluate — Iris Species Classifier" },
      {
        name: "description",
        content: "Train a KNN or small neural network on the Iris data in your browser and see accuracy, a confusion matrix and F1 scores.",
      },
      { property: "og:title", content: "Train & Evaluate — Iris Species Classifier" },
      {
        property: "og:description",
        content: "Train a KNN or neural network in the browser and evaluate it on a held-out test set.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrainPage,
});

function TrainPage() {
  const { status, progress, liveHistory, model, error, config, data } = useIris();
  const training = status === "training";
  const isMlp = training ? config.model === "mlp" : (model?.config.model ?? config.model) === "mlp";
  const last = liveHistory.at(-1);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="02 · Train & Evaluate"
        title="Teach the model, then test it"
        description={`Training on ${data.length} samples: 80% to learn from, 20% held back to measure accuracy honestly.`}
      />
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <TrainingForm />
        </div>

        <div className="min-w-0 space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>Training failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {status === "idle" && !model && (
            <Panel>
              <div className="flex flex-col items-center py-12 text-center">
                <span className="grid size-14 place-items-center rounded-full bg-accent text-accent-foreground">
                  <BrainCircuit className="size-6" />
                </span>
                <h2 className="mt-4 text-xl font-semibold">No model trained yet</h2>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Pick a model and settings, then press <strong>Train Model</strong>. Results appear here.
                </p>
              </div>
            </Panel>
          )}

          {training && (
            <Panel title={isMlp ? "Training…" : "Fitting KNN…"}>
              <Progress value={progress * 100} className="h-2" />
              <p className="tabular mt-2 text-xs text-muted-foreground">
                {isMlp && last
                  ? `Epoch ${last.epoch}/${config.epochs} · loss ${last.loss.toFixed(4)} · train acc ${(last.trainAccuracy * 100).toFixed(1)}%`
                  : "Comparing different k values…"}
              </p>
            </Panel>
          )}

          {isMlp && (training || (model && model.config.model === "mlp")) && (
            <div className="grid gap-6 xl:grid-cols-2">
              <Panel title="Loss" description="Cross-entropy on the training set, per epoch.">
                {liveHistory.length ? <LossChart history={liveHistory} /> : <Skeleton className="h-[240px]" />}
              </Panel>
              <Panel title="Accuracy" description="Train vs. held-out test accuracy, per epoch.">
                {liveHistory.length ? <AccuracyChart history={liveHistory} /> : <Skeleton className="h-[240px]" />}
              </Panel>
            </div>
          )}

          {training && !isMlp && <Skeleton className="h-[320px] rounded-xl" />}

          {model && !training && (
            <>
              {model.config.model === "knn" && (
                <Panel title="Accuracy vs. k" description="KNN has no training epochs — this shows how the choice of k affects accuracy.">
                  <KSweepChart data={model.kSweep} k={model.config.k} />
                </Panel>
              )}

              <div className="grid gap-4 sm:grid-cols-3">
                <MetricTile
                  label="Test accuracy"
                  value={`${(model.evaluation.testAccuracy * 100).toFixed(1)}%`}
                  sub={`${Math.round(model.evaluation.testAccuracy * model.evaluation.nTest)} of ${model.evaluation.nTest} correct`}
                />
                <MetricTile
                  label="Model"
                  value={model.config.model === "knn" ? `KNN, k=${model.config.k}` : `NN, ${model.config.hidden} units`}
                  sub={model.config.model === "knn" ? (model.config.weighted ? "distance-weighted" : "uniform votes") : `${model.config.epochs} epochs · lr ${model.config.learningRate}`}
                />
                <MetricTile
                  label="Split"
                  value={`${model.evaluation.nTrain} / ${model.evaluation.nTest}`}
                  sub={`seed ${model.config.seed} · ${Math.round(model.durationMs)} ms`}
                />
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <Panel title="Confusion matrix" description="Rows are the true species, columns the prediction.">
                  <ConfusionMatrix matrix={model.evaluation.matrix} />
                </Panel>
                <Panel title="Per-class scores" description="Measured on the test set.">
                  <ClassReportTable report={model.evaluation.report} />
                </Panel>
              </div>

              <div className="flex justify-end">
                <Button asChild>
                  <Link to="/predict">
                    Try a prediction <ArrowRight />
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
