// App-wide state: active dataset, training settings, training run and trained model.
// Lives in the root layout so a trained model survives navigation between pages.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { DEFAULT_DATASET_NAME, loadDefaultDataset } from "@/lib/iris/data";
import type { EpochLog } from "@/lib/iris/mlp";
import { loadState, saveState } from "@/lib/iris/storage";
import { DEFAULT_CONFIG, trainModel, type TrainConfig, type TrainedModel } from "@/lib/iris/train";
import type { IrisSample } from "@/lib/iris/types";

type Status = "idle" | "training" | "done" | "error";

interface IrisState {
  data: IrisSample[];
  datasetName: string;
  isCustomDataset: boolean;
  setDataset: (rows: IrisSample[], name: string) => void;
  resetDataset: () => void;
  config: TrainConfig;
  setConfig: (c: TrainConfig) => void;
  status: Status;
  progress: number;
  liveHistory: EpochLog[];
  model: TrainedModel | null;
  error: string | null;
  train: (config?: TrainConfig) => Promise<void>;
  cancel: () => void;
}

const IrisContext = createContext<IrisState | null>(null);

export function IrisProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<IrisSample[]>(() => loadDefaultDataset());
  const [datasetName, setDatasetName] = useState(DEFAULT_DATASET_NAME);
  const [config, setConfig] = useState<TrainConfig>(DEFAULT_CONFIG);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [liveHistory, setLiveHistory] = useState<EpochLog[]>([]);
  const [model, setModel] = useState<TrainedModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Restore the saved dataset, settings and model after hydration (works offline).
  useEffect(() => {
    const saved = loadState();
    if (saved) {
      if (saved.dataset) {
        setData(saved.dataset.rows);
        setDatasetName(saved.dataset.name);
      }
      setConfig(saved.config);
      if (saved.model) {
        setModel(saved.model);
        setLiveHistory(saved.model.history);
        setProgress(1);
        setStatus("done");
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || status === "training") return;
    const custom = datasetName !== DEFAULT_DATASET_NAME;
    saveState({
      ...(custom ? { dataset: { rows: data, name: datasetName } } : {}),
      config,
      model,
    });
  }, [hydrated, status, data, datasetName, config, model]);

  const clearModel = () => {
    abortRef.current?.abort();
    setModel(null);
    setStatus("idle");
    setLiveHistory([]);
    setProgress(0);
    setError(null);
  };

  const setDataset = useCallback((rows: IrisSample[], name: string) => {
    clearModel();
    setData(rows);
    setDatasetName(name);
  }, []);

  const resetDataset = useCallback(() => {
    clearModel();
    setData(loadDefaultDataset());
    setDatasetName(DEFAULT_DATASET_NAME);
  }, []);

  const train = useCallback(
    async (override?: TrainConfig) => {
      const cfg = override ?? config;
      if (override) setConfig(override);
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setStatus("training");
      setError(null);
      setProgress(0);
      setLiveHistory([]);
      // Buffer epoch logs and flush at most once per frame to keep rendering cheap.
      let buffer: EpochLog[] = [];
      let raf = 0;
      try {
        const result = await trainModel(
          data,
          cfg,
          (log, fraction) => {
            buffer.push(log);
            if (!raf) {
              raf = requestAnimationFrame(() => {
                const chunk = buffer;
                buffer = [];
                raf = 0;
                setLiveHistory((h) => [...h, ...chunk]);
                setProgress(fraction);
              });
            }
          },
          controller.signal,
        );
        cancelAnimationFrame(raf);
        if (controller.signal.aborted) return;
        setLiveHistory(result.history);
        setProgress(1);
        setModel(result);
        setStatus("done");
        toast.success(
          `Model trained — ${(result.evaluation.testAccuracy * 100).toFixed(1)}% test accuracy`,
        );
      } catch (e) {
        cancelAnimationFrame(raf);
        if (e instanceof DOMException && e.name === "AbortError") {
          setStatus(model ? "done" : "idle");
          toast("Training cancelled");
          return;
        }
        const msg = e instanceof Error ? e.message : "Training failed for an unknown reason.";
        setError(msg);
        setStatus("error");
        toast.error(msg);
      }
    },
    [config, data, model],
  );

  const cancel = useCallback(() => abortRef.current?.abort(), []);

  const value = useMemo<IrisState>(
    () => ({
      data,
      datasetName,
      isCustomDataset: datasetName !== DEFAULT_DATASET_NAME,
      setDataset,
      resetDataset,
      config,
      setConfig,
      status,
      progress,
      liveHistory,
      model,
      error,
      train,
      cancel,
    }),
    [data, datasetName, setDataset, resetDataset, config, status, progress, liveHistory, model, error, train, cancel],
  );

  return <IrisContext.Provider value={value}>{children}</IrisContext.Provider>;
}

export function useIris(): IrisState {
  const ctx = useContext(IrisContext);
  if (!ctx) throw new Error("useIris must be used inside <IrisProvider>");
  return ctx;
}
