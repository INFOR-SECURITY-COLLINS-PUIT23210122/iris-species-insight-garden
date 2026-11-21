// The only place the offline service worker is registered. Refuses (and cleans up)
// in dev, iframes and Lovable preview hosts so previews never serve stale files.
const PREVIEW_LABEL = /^(?:id-preview|preview)(?:-[a-z0-9]+)?--.+$/;
const LOVABLE_SUFFIXES = [".lovable.app", ".gpt-eng.com", ".gptengineer.run"];

function isRefusedHost(host: string): boolean {
  const label = host.split(".")[0] ?? "";
  if (LOVABLE_SUFFIXES.some((s) => host.endsWith(s))) {
    if (PREVIEW_LABEL.test(label)) return true;
    if (/^project--[a-z0-9-]+-dev$/.test(label)) return true;
  }
  return ["lovableproject.com", "lovableproject-dev.com", "beta.lovable.dev"].some(
    (d) => host === d || host.endsWith(`.${d}`),
  );
}

export function shouldRegisterSW(opts: { prod: boolean; inIframe: boolean; host: string; search: string }) {
  if (!opts.prod || opts.inIframe) return false;
  if (new URLSearchParams(opts.search).get("sw") === "off") return false;
  return !isRefusedHost(opts.host.toLowerCase());
}

async function unregisterAppSW() {
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    regs.filter((r) => r.active?.scriptURL.endsWith("/sw.js")).map((r) => r.unregister()),
  );
}

export function registerAppSW() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  let inIframe = true;
  try {
    inIframe = window.self !== window.top;
  } catch {
    /* cross-origin parent */
  }
  const ok = shouldRegisterSW({
    prod: import.meta.env.PROD,
    inIframe,
    host: window.location.hostname,
    search: window.location.search,
  });
  if (!ok) {
    void unregisterAppSW().catch(() => {});
    return;
  }
  navigator.serviceWorker
    .register("/sw.js", { scope: "/" })
    .then(() => navigator.serviceWorker.ready)
    .then(() => {
      // Warm the page cache so every page opens offline, even ones not visited yet.
      for (const path of ["/", "/train", "/predict", "/about"]) void fetch(path).catch(() => {});
    })
    .catch(() => {});
}
