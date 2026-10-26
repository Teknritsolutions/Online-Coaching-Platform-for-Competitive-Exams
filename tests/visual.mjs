import fs from "node:fs";
import { launchBrowser } from "./browser.mjs";
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const refs = JSON.parse(fs.readFileSync("documentation/reference-inspection.json"));
for (let i = 0; !process.argv.includes("--local-only") && i < refs.length; i++) {
  try {
    await page.goto(refs[i].url, { timeout: 30000, waitUntil: "domcontentloaded" });
    await page.waitForTimeout(700);
    await page.screenshot({ path: `documentation/screenshots/reference-${i + 1}.png` });
    refs[i].renderedMetrics = await page.evaluate(() => ({
      header: [...document.querySelectorAll("header,nav")].slice(0, 2).map((el) => ({
        height: Math.round(el.getBoundingClientRect().height),
        font: getComputedStyle(el).fontSize,
      })),
      h1: [...document.querySelectorAll("h1")].map((el) => ({
        size: getComputedStyle(el).fontSize,
        weight: getComputedStyle(el).fontWeight,
        lineHeight: getComputedStyle(el).lineHeight,
      })),
      container: [...document.querySelectorAll(".container")]
        .slice(0, 3)
        .map((el) => Math.round(el.getBoundingClientRect().width)),
      dropdowns: document.querySelectorAll(".dropdown,details").length,
    }));
  } catch (err) {
    refs[i].renderError = err.message;
  }
}
fs.writeFileSync("documentation/reference-inspection.json", JSON.stringify(refs, null, 2));
for (const [file, width, theme, name] of [
  ["pages/index.html", 1440, "light", "home-desktop"],
  ["pages/index.html", 390, "light", "home-mobile"],
  ["pages/home-2.html", 1440, "light", "home-two"],
  ["dashboard/student/index.html", 1440, "light", "student-overview"],
  ["dashboard/admin/index.html", 1440, "dark", "admin-dark"],
  ["pages/courses.html", 390, "dark", "courses-dark-mobile"],
]) {
  await page.setViewportSize({ width, height: 1000 });
  await page.addInitScript((t) => {
    localStorage.setItem("stackly-theme", t);
    localStorage.setItem("stackly-dir", "ltr");
  }, theme);
  await page.goto("http://127.0.0.1:4173/" + file);
  await page.evaluate(async () => {
    await Promise.all(
      [...document.images].map((i) => {
        i.loading = "eager";
        return i.decode().catch(() => {});
      }),
    );
  });
  // Bring below-fold lazy images into the rendered document before a full-page capture.
  for (
    let y = 0;
    y < (await page.evaluate(() => document.documentElement.scrollHeight));
    y += 700
  ) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(35);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(700);
  await page.screenshot({ path: `documentation/screenshots/${name}.png`, fullPage: true });
}
await browser.close();
console.log("Reference metrics and final representative screenshots saved.");
