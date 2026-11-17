import { createFileRoute } from "@tanstack/react-router";

// Placeholder page: the full About section is not wired up yet.
export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Iris Species Classifier" },
      { name: "description", content: "About section of the Iris Species Classifier." },
      { property: "og:title", content: "About — Iris Species Classifier" },
      { property: "og:description", content: "About section of the Iris Species Classifier." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-semibold">About</h1>
      <p className="mt-2 text-muted-foreground">This section isn't finished yet.</p>
    </main>
  );
}
