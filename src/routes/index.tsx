// Data Explorer: dataset, summary statistics, class counts, scatter plot and table.
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import plate from "@/assets/iris-plate.jpg";
import { DataTable } from "@/components/explorer/DataTable";
import { DatasetCard } from "@/components/explorer/DatasetCard";
import { ScatterPlot } from "@/components/explorer/ScatterPlot";
import { ClassCounts, SummaryStats } from "@/components/explorer/SummaryStats";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { useIris } from "@/hooks/use-iris";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Data Explorer — Iris Species Classifier" },
      {
        name: "description",
        content: "Browse the 150-flower Iris dataset: summary statistics, class counts and an interactive scatter plot.",
      },
      { property: "og:title", content: "Data Explorer — Iris Species Classifier" },
      {
        property: "og:description",
        content: "Browse the Iris dataset with statistics, class counts and an interactive scatter plot.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ExplorerPage,
});

function ExplorerPage() {
  const { data } = useIris();
  return (
    <div className="space-y-6">
      <div className="panel animate-rise overflow-hidden">
        <img
          src={plate}
          alt="Botanical plate of Iris setosa, versicolor and virginica"
          width={1600}
          height={640}
          className="h-40 w-full object-cover sm:h-56"
        />
      </div>
      <PageHeader
        eyebrow="01 · Data Explorer"
        title="Three irises, four measurements"
        description="Fisher's classic dataset: sepal and petal sizes for 150 flowers. Petal measurements alone separate setosa almost perfectly."
        actions={
          <Button asChild>
            <Link to="/train">
              Train a model <ArrowRight />
            </Link>
          </Button>
        }
      />
      <DatasetCard />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <ScatterPlot data={data} />
        </div>
        <ClassCounts data={data} />
      </div>
      <SummaryStats data={data} />
      <DataTable data={data} />
    </div>
  );
}
