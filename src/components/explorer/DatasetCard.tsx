// Shows the active dataset and lets the user upload their own CSV or restore the default.
import { Download, FileUp, Loader2, RotateCcw } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useIris } from "@/hooks/use-iris";
import { CsvError, MAX_FILE_BYTES, MIN_ROWS, parseIrisCsv } from "@/lib/iris/csv";
import irisCsv from "@/data/iris.csv?raw";
import { Panel } from "@/components/iris/Panel";

export function DatasetCard() {
  const { data, datasetName, isCustomDataset, setDataset, resetDataset, status } = useIris();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; details: string[] } | null>(null);

  async function handleFile(file: File) {
    setError(null);
    if (!/\.(csv|txt)$/i.test(file.name)) {
      setError({ message: "Please choose a .csv file.", details: [] });
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError({ message: "That file is larger than 2 MB.", details: [] });
      return;
    }
    setLoading(true);
    try {
      const rows = parseIrisCsv(await file.text());
      setDataset(rows, file.name);
      toast.success(`Loaded ${rows.length} rows from ${file.name}`);
    } catch (e) {
      if (e instanceof CsvError) setError({ message: e.message, details: e.details });
      else setError({ message: "The file couldn't be read.", details: [] });
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function downloadSample() {
    const url = URL.createObjectURL(new Blob([irisCsv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "iris.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Panel
      title="Dataset"
      description={
        <>
          <span className="font-medium text-foreground">{datasetName}</span> · {data.length} samples
        </>
      }
      action={
        <div className="flex flex-wrap gap-2">
          {isCustomDataset && (
            <Button variant="ghost" size="sm" onClick={resetDataset}>
              <RotateCcw /> Use built-in data
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={downloadSample}>
            <Download /> Sample CSV
          </Button>
          <Button
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={loading || status === "training"}
          >
            {loading ? <Loader2 className="animate-spin" /> : <FileUp />}
            Upload CSV
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            aria-label="Upload a CSV file"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }}
          />
        </div>
      }
    >
      <p className="text-sm text-muted-foreground">
        Your CSV needs the columns{" "}
        <code className="tabular rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
          sepal_length, sepal_width, petal_length, petal_width, species
        </code>{" "}
        (measurements in cm; species = setosa, versicolor or virginica) and at least {MIN_ROWS} rows.
        Uploading replaces the data and clears any trained model.
      </p>
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>{error.message}</AlertTitle>
          {error.details.length > 0 && (
            <AlertDescription>
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs">
                {error.details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </AlertDescription>
          )}
        </Alert>
      )}
    </Panel>
  );
}
