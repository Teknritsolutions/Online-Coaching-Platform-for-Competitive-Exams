import fs from "node:fs";
import { launchBrowser } from "./browser.mjs";
const browser = await launchBrowser();
const context = await browser.newContext();
const page = await context.newPage();
const results = [];
for (const theme of ["light", "dark"])
  for (const file of [
    "pages/index.html",
    "pages/register.html",
    "pages/courses.html",
    "pages/contact.html",
    "dashboard/student/index.html",
    "dashboard/admin/students.html",
    "dashboard/student/test-instructions.html",
  ]) {
    await page.addInitScript((theme) => localStorage.setItem("stackly-theme", theme), theme);
    await page.goto("http://127.0.0.1:4173/" + file);
    await page.waitForTimeout(200);
    await page.addScriptTag({ path: "tests/axe.min.js" });
    const run = await page.evaluate(() =>
      axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } }),
    );
    results.push({
      file,
      theme,
      violations: run.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.map((n) => ({ html: n.html, summary: n.failureSummary })),
      })),
      passes: run.passes.length,
      incomplete: run.incomplete.length,
    });
  }
await browser.close();
fs.writeFileSync("documentation/accessibility-results.json", JSON.stringify(results, null, 2));
console.log(
  JSON.stringify(
    results.map(({ file, theme, violations, passes }) => ({ file, theme, violations, passes })),
    null,
    2,
  ),
);
