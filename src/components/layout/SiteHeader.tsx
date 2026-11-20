// Top navigation for tablet/desktop, plus a thumb-friendly bottom tab bar on phones.
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
    <>
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link to="/" className="flex min-w-0 flex-1 items-center gap-2 font-display text-lg font-semibold">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
              <Flower2 className="size-4" />
            </span>
            <span className="truncate">
              <span className="hidden sm:inline">Iris Species Classifier</span>
              <span className="sm:hidden">Iris Classifier</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 md:flex sm:gap-1" aria-label="Main">
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
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          {/* Model status is only shown from lg up; phones get a dot on the Predict tab. */}
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

      {/* Phone-only bottom tabs: big tap targets, labels always visible. */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 backdrop-blur-md md:hidden"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-4 pb-[max(0.125rem,env(safe-area-inset-bottom))]">
          {NAV.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <Link
                to={to}
                aria-label={label}
                activeOptions={{ exact: true }}
                className="flex min-h-[3.5rem] flex-col items-center justify-center gap-1 px-1 pt-2 pb-1.5"
              >
                {({ isActive }) => (
                  <span
                    className={cn(
                      "flex flex-col items-center gap-1 text-[11px] transition-colors",
                      isActive ? "font-medium text-primary" : "text-muted-foreground",
                    )}
                  >
                    <span className="relative">
                      <Icon className="size-5" />
                      {/* Green dot once a model is trained and ready to predict with. */}
                      {to === "/predict" && model && status !== "training" && (
                        <span className="absolute -top-0.5 -right-1.5 size-2 rounded-full bg-success" />
                      )}
                    </span>
                    {label}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
