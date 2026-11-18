// Top navigation shared by all pages.
import { Link } from "@tanstack/react-router";
import { BarChart3, BookOpen, BrainCircuit, Flower2, Wand2 } from "lucide-react";

import { useIris } from "@/hooks/use-iris";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { to: "/", label: "Data", icon: BarChart3 },
  { to: "/train", label: "Train", icon: BrainCircuit },
  { to: "/predict", label: "Predict", icon: Wand2 },
  { to: "/about", label: "About", icon: BookOpen },
] as const;

export function SiteHeader() {
  const { status, model, progress } = useIris();
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground">
            <Flower2 className="size-4" />
          </span>
          <span className="hidden sm:inline">Iris Species Classifier</span>
          <span className="sm:hidden">Iris</span>
        </Link>

        <nav className="ml-auto flex items-center gap-0.5 sm:gap-1" aria-label="Main">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              aria-label={label}
              activeOptions={{ exact: true }}
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground sm:px-3"
              activeProps={{ className: "bg-secondary text-secondary-foreground font-medium" }}
            >
              <Icon className="size-4" />
              <span className="hidden md:inline">{label}</span>
            </Link>
          ))}
        </nav>

        <div
          className={cn(
            "hidden items-center gap-2 rounded-full border px-3 py-1 text-xs lg:flex",
            status === "training" && "border-primary/40",
          )}
          aria-live="polite"
        >
          <span
            className={cn(
              "size-2 rounded-full bg-muted-foreground/40",
              status === "training" && "animate-pulse bg-primary",
              model && status !== "training" && "bg-success",
            )}
          />
          <span className="tabular text-muted-foreground">
            {status === "training"
              ? `Training ${Math.round(progress * 100)}%`
              : model
                ? `${model.config.model === "knn" ? "KNN" : "Neural net"} ready`
                : "No model yet"}
          </span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
