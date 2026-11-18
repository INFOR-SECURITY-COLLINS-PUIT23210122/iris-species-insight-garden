// About: the dataset, the models and their limitations.
import { createFileRoute } from "@tanstack/react-router";

import { Panel } from "@/components/iris/Panel";
import { PageHeader } from "@/components/layout/PageHeader";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Iris Species Classifier" },
      {
        name: "description",
        content: "About the Iris dataset, the KNN and neural network models used in this app, and their limitations.",
      },
      { property: "og:title", content: "About — Iris Species Classifier" },
      {
        property: "og:description",
        content: "How the Iris classifier works, the dataset behind it and what it can't do.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="04 · About" title="How this works" />
      <div className="grid gap-6 md:grid-cols-2">
        <Panel title="The dataset">
          <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              The Iris dataset was published by statistician Ronald Fisher in 1936, using flowers measured by botanist Edgar Anderson.
              It has 150 flowers — 50 each of <em>Iris setosa</em>, <em>versicolor</em> and <em>virginica</em> — with four
              measurements in centimetres: sepal length and width, petal length and width.
            </p>
            <p>
              Setosa is easy to tell apart from petal size alone. Versicolor and virginica overlap, which is where models make
              their mistakes.
            </p>
          </div>
        </Panel>
        <Panel title="How training works">
          <ul className="list-disc space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
            <li>The data is shuffled with a fixed seed and split 80% train / 20% test, so results are repeatable.</li>
            <li>
              Each measurement is standardised (mean 0, standard deviation 1). The scaling is learned from the training rows only,
              so the test set stays truly unseen.
            </li>
            <li>
              <strong className="text-foreground">K-nearest neighbours</strong> finds the k most similar training flowers and lets
              them vote. Probabilities are the share of votes.
            </li>
            <li>
              <strong className="text-foreground">Neural network</strong>: 4 inputs → one hidden layer (ReLU) → 3 softmax outputs,
              trained with the Adam optimiser and cross-entropy loss.
            </li>
            <li>Everything runs in your browser — nothing is uploaded anywhere.</li>
          </ul>
        </Panel>
        <Panel title="Limitations" className="md:col-span-2">
          <ul className="grid list-disc gap-x-8 gap-y-2 pl-4 text-sm leading-relaxed text-muted-foreground md:grid-cols-2">
            <li>150 flowers is tiny. With only 30 test flowers, one mistake moves accuracy by about 3%.</li>
            <li>A different seed gives a different split and can noticeably change the scores.</li>
            <li>The model only knows these three species. Any other flower will still be labelled as one of them.</li>
            <li>Measurements far outside the training range give unreliable — often overconfident — predictions.</li>
            <li>The test accuracy curve is shown during training for learning purposes; settings tuned on it will look slightly better than they really are.</li>
            <li>All flowers came from a few locations, so they may not represent irises growing elsewhere.</li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}
