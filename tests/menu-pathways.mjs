import assert from "node:assert/strict";
import fs from "node:fs";
import { launchBrowser } from "./browser.mjs";
const b = await launchBrowser();
const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
const base = "http://127.0.0.1:4173/pages/";
await p.goto(base + "index.html");
const links = await p
  .locator(".site-header nav a")
  .evaluateAll((els) =>
    els
      .filter(
        (a) => !a.classList.contains("mobile-login") && !a.classList.contains("dashboard-link"),
      )
      .map((a) => ({ text: a.textContent.trim(), href: a.getAttribute("href") })),
  );
for (const link of links) {
  await p.goto(base + "index.html");
  const a = p
    .locator(".site-header nav a")
    .filter({ hasText: new RegExp("^" + link.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$") })
    .first();
  const menu = a.locator("xpath=ancestor::details");
  if (await menu.count()) await menu.locator("summary").hover();
  await a.click();
  await p.waitForURL(base + link.href);
  assert.equal(await p.locator("h1").count(), 1, link.href);
  const current = p.locator('.site-header nav a[aria-current="page"]');
  assert.equal(await current.count(), 1, link.href);
  assert.equal(await current.getAttribute("href"), link.href);
}
for (const width of [390, 900, 1440]) {
  await p.setViewportSize({ width, height: 1000 });
  for (const name of ["banking", "ssc", "railways", "engineering"]) {
    await p.goto(base + name + "-exams.html");
    const option = p.locator(`.site-header .dropdown a[href="${name}-exams.html"]`);
    assert.equal(await option.getAttribute("aria-current"), "page");
    const active = p.locator('.pathway-tabs [aria-current="page"]');
    assert.equal(await active.count(), 1);
    assert.equal(await active.getAttribute("href"), name + "-exams.html");
    for (const theme of ["light", "dark"]) {
      await p.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
      assert.equal(
        await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
    }
    if (width === 1440) {
      await p.evaluate(() => (document.documentElement.dataset.theme = "light"));
      await p.locator(".inner-hero img").evaluate(async (img) => {
        await img.decode();
      });
      await p
        .locator(".inner-hero")
        .screenshot({ path: `documentation/screenshots/${name}-pathway-hero.png` });
    }
  }
}
await p.setViewportSize({ width: 390, height: 844 });
await p.goto(base + "index.html");
await p.locator("[data-menu-toggle]").click();
await p.locator("#main-nav summary").filter({ hasText: "Courses" }).click();
await p.locator('#main-nav .dropdown a[href="ssc-exams.html"]').click();
await p.waitForURL(base + "ssc-exams.html");
assert.equal(
  await p.locator('#main-nav a[aria-current="page"]').getAttribute("href"),
  "ssc-exams.html",
);
await p.goto(base + "course-details.html?course=engineering");
assert.equal(
  await p.locator('#main-nav a[aria-current="page"]').getAttribute("href"),
  "engineering-exams.html",
);
await b.close();
console.log(
  `${links.length} menu destinations passed; four unique pathway pages, active states, mobile clicks, light/dark and responsive layouts passed.`,
);
