// Home-screen install: the manifest must stay valid and every icon it promises must exist.
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

type Manifest = {
  name: string;
  short_name: string;
  start_url: string;
  scope: string;
  display: string;
  background_color: string;
  theme_color: string;
  icons: { src: string; sizes: string; purpose?: string }[];
};

function manifest(): Manifest {
  return JSON.parse(readFileSync(resolve(root, "public/manifest.webmanifest"), "utf8")) as Manifest;
}

describe("Home-screen install support", () => {
  it("installs under the app's own name as a standalone app", () => {
    const m = manifest();
    expect(m.name).toBe("Iris Species Classifier");
    expect(m.short_name).toBe("Iris");
    expect(m.display).toBe("standalone");
    expect(m.start_url).toBe("/");
    expect(m.scope).toBe("/");
  });

  it("ships the paper light and forest dark theme colours", () => {
    const m = manifest();
    expect(m.theme_color).toBe("#faf6ee");
    expect(m.background_color).toBe("#faf6ee");
  });

  it("offers a 192 and a 512 icon plus a maskable one, and all exist on disk", () => {
    const m = manifest();
    const sizes = m.icons.map((i) => `${i.sizes}:${i.purpose ?? "any"}`);
    expect(sizes).toContain("192x192:any");
    expect(sizes).toContain("512x512:any");
    expect(sizes).toContain("512x512:maskable");
    for (const icon of m.icons) {
      expect(existsSync(resolve(root, `public${icon.src}`)), `missing ${icon.src}`).toBe(true);
    }
  });
});
