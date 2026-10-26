import fs from "node:fs";
import assert from "node:assert/strict";
import { launchBrowser } from "./browser.mjs";

const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const pages = JSON.parse(fs.readFileSync("documentation/pages.json", "utf8"));
const files = [...pages.public.map((x) => x.file), ...pages.dashboard];
const report = {
  paragraphSize: "16px",
  pagesChecked: 0,
  paragraphsChecked: 0,
  mismatches: [],
  hover: "pending",
  cardAlignment: "pending",
};
for (const file of files) {
  await page.goto(`http://127.0.0.1:4173/${file}`);
  if (file.startsWith("dashboard"))
    await page.waitForFunction(
      () =>
        !document
          .querySelector("#dashboard-content")
          ?.textContent.includes("Preparing your demo workspace"),
    );
  const result = await page.evaluate(() => ({
    count: document.querySelectorAll("p").length,
    bad: [...document.querySelectorAll("p")]
      .filter((p) => getComputedStyle(p).fontSize !== "16px")
      .map((p) => ({ text: p.textContent.slice(0, 60), size: getComputedStyle(p).fontSize })),
  }));
  report.pagesChecked++;
  report.paragraphsChecked += result.count;
  if (result.bad.length) report.mismatches.push({ file, ...result });
}
await page.goto("http://127.0.0.1:4173/pages/index.html");
await page.evaluate(async () => {
  await Promise.all(
    [...document.images].map((img) => {
      img.loading = "eager";
      return img.decode().catch(() => {});
    }),
  );
});
const approach = page
  .locator("section")
  .filter({ has: page.getByRole("heading", { name: "Clarity at every step.", exact: true }) });
const pathways = page.locator("section").filter({
  has: page.getByRole("heading", { name: "One goal. The right pathway.", exact: true }),
});
const courses = page.locator("section").filter({
  has: page.getByRole("heading", { name: "Your ambition, well supported.", exact: true }),
});
await approach.screenshot({ path: "documentation/screenshots/refreshed-approach-desktop.png" });
await pathways.screenshot({ path: "documentation/screenshots/refreshed-pathways-desktop.png" });
const action = page.locator(".course-card .text-link").first();
const before = await action.evaluate((el) => getComputedStyle(el).backgroundColor);
await action.hover();
await page.waitForTimeout(300);
const after = await action.evaluate((el) => getComputedStyle(el).backgroundColor);
assert.notEqual(before, after);
report.hover = { before, after };
await courses.screenshot({ path: "documentation/screenshots/refreshed-course-buttons.png" });
const heights = await page
  .locator(".feature-visual")
  .evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().height)));
assert.equal(new Set(heights).size, 1);
report.cardAlignment = { featureHeights: heights };
await page.setViewportSize({ width: 390, height: 844 });
await approach.screenshot({ path: "documentation/screenshots/refreshed-approach-mobile.png" });
await page.locator("[data-theme-toggle]").click();
await page.waitForTimeout(300);
await pathways.screenshot({ path: "documentation/screenshots/refreshed-pathways-dark-mobile.png" });
await browser.close();
fs.writeFileSync("documentation/design-review-results.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
assert.equal(report.mismatches.length, 0, "Every paragraph must use the shared 16px size.");
