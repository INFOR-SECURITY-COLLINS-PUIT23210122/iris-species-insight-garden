// A slider paired with a number box for one flower measurement.
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { MEASUREMENT_MAX, MEASUREMENT_MIN } from "@/lib/iris/validation";
import { cn } from "@/lib/utils";

export function MeasurementInput({
  id,
  label,
  value,
  onChange,
  error,
  range,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string | undefined;
  range: { min: number; max: number };
}) {
  const num = Number(value);
  const sliderVal =
    value.trim() !== "" && Number.isFinite(num)
      ? Math.min(Math.max(num, MEASUREMENT_MIN), MEASUREMENT_MAX)
      : range.min;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        <div className="flex items-center gap-1.5">
          <Input
            id={id}
            type="number"
            step="0.1"
            inputMode="decimal"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={!!error}
            className={cn("tabular h-8 w-20 text-right", error && "border-destructive")}
          />
          <span className="text-xs text-muted-foreground">cm</span>
        </div>
      </div>
      <Slider
        min={MEASUREMENT_MIN}
        max={MEASUREMENT_MAX}
        step={0.1}
        value={[sliderVal]}
        onValueChange={([v]) => {
          if (v !== undefined) onChange(v.toFixed(1));
        }}
        aria-label={`${label} slider`}
      />
      <p className={cn("text-xs", error ? "text-destructive" : "text-muted-foreground")}>
        {error ?? `Seen in data: ${range.min.toFixed(1)}–${range.max.toFixed(1)} cm`}
      </p>
    </div>
  );
}
