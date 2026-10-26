import fs from "node:fs";
const urls = [
  "https://teknritsolutions-2.github.io/Local-Farm-or-Community-Supported-Agriculture-CSA-/pages/public/index.html",
  "https://teknrit-maker.github.io/High-End-Event-Planning/pages/index.html",
  "https://teknrit-maker.github.io/Local-Indie-Bookstore/pages/index.html",
  "https://teknrit-maker.github.io/FoodTruck/Pages/menu.html",
  "https://ravivarmaadepu123.github.io/boutique-yarn-and-craft-supply/pages/",
];
const results = await Promise.all(
  urls.map(async (url) => {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const links = [...html.matchAll(/href=["']([^"']+)["']/g)]
        .map((m) => m[1])
        .filter((s) => !s.startsWith("#"));
      const css = [...html.matchAll(/href=["']([^"']+\.css)["']/g)].map(
        (m) => new URL(m[1], url).href,
      );
      const styles = await Promise.all(css.slice(0, 3).map(async (u) => (await fetch(u)).text()));
      const children = await Promise.all(
        [...new Set(links.filter((s) => s.includes(".html")))].slice(0, 4).map(async (path) => {
          try {
            const r = await fetch(new URL(path, url));
            const h = await r.text();
            return {
              url: new URL(path, url).href,
              status: r.status,
              title: h.match(/<title>(.*?)<\/title>/s)?.[1],
              headings: [...h.matchAll(/<h[12][^>]*>(.*?)<\/h[12]>/gs)].map((m) =>
                m[1].replace(/<[^>]*>/g, ""),
              ),
            };
          } catch {
            return { path, error: "Unavailable" };
          }
        }),
      );
      return {
        url,
        status: response.status,
        title: html.match(/<title>(.*?)<\/title>/s)?.[1],
        links,
        children,
        styleSample: styles.join("\n").slice(0, 18000),
        headings: [...html.matchAll(/<h[12][^>]*>(.*?)<\/h[12]>/gs)].map((m) =>
          m[1].replace(/<[^>]*>/g, ""),
        ),
      };
    } catch (e) {
      return { url, error: e.message };
    }
  }),
);
fs.writeFileSync("documentation/reference-inspection.json", JSON.stringify(results, null, 2));
console.log(
  results.map(({ url, status, title, error, children }) => ({
    url,
    status,
    title,
    error,
    children,
  })),
);
