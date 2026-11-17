import { createFileRoute } from "@tanstack/react-router";

// Placeholder page: the full Train & Evaluate section is not wired up yet.
export const Route = createFileRoute("/train")({
  head: () => ({
    meta: [
      { title: "Train & Evaluate — Iris Species Classifier" },
      { name: "description", content: "Train & Evaluate section of the Iris Species Classifier." },
      { property: "og:title", content: "Train & Evaluate — Iris Species Classifier" },
      { property: "og:description", content: "Train & Evaluate section of the Iris Species Classifier." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-semibold">Train & Evaluate</h1>
      <p className="mt-2 text-muted-foreground">This section isn't finished yet.</p>
    </main>
  );
}
