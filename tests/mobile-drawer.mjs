import assert from "node:assert/strict";
import { launchBrowser } from "./browser.mjs";
const b = await launchBrowser();
const p = await b.newPage();
for (const width of [320, 390, 768, 1024]) {
  await p.setViewportSize({ width, height: 900 });
  await p.goto("http://127.0.0.1:4173/pages/index.html");
  await p.locator("[data-menu-toggle]").click();
  const nav = p.locator("#main-nav");
  assert.equal(await nav.getAttribute("aria-modal"), "true");
  const r = await nav.boundingBox();
  assert.ok(r.height === 900 && r.x >= 0);
  assert.equal(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  assert.equal(await p.evaluate(() => getComputedStyle(document.body).overflow), "hidden");
  const close = nav.locator("[data-menu-close]");
  await close.focus();
  await p.keyboard.press("Shift+Tab");
  assert.equal(
    await p.evaluate(() => document.activeElement.classList.contains("mobile-login")),
    true,
  );
  assert.equal(await nav.locator("[data-theme-toggle],[data-dir-toggle]").count(), 0);
  assert.equal(await p.locator(".header-actions [data-theme-toggle]").count(), 1);
  assert.equal(await p.locator(".header-actions [data-dir-toggle]").count(), 1);
  await p.evaluate(() => (document.documentElement.dataset.theme = "light"));
  await p.waitForTimeout(350);
  await p.screenshot({ path: `documentation/screenshots/mobile-drawer-${width}.png` });
  await close.click();
  assert.equal(await p.locator("[data-menu-toggle]").getAttribute("aria-expanded"), "false");
  await p.locator("[data-menu-toggle]").click();
  await p.keyboard.press("Escape");
  assert.equal(await nav.getAttribute("aria-modal"), null);
  await p.locator("[data-menu-toggle]").click();
  await p.locator(".drawer-backdrop").click({ position: { x: 4, y: 400 } });
  assert.equal(await p.locator("[data-menu-toggle]").getAttribute("aria-expanded"), "false");
  await p.locator("[data-menu-toggle]").click();
  await nav.locator("summary").filter({ hasText: "Courses" }).click();
  await nav.locator('a[href="ssc-exams.html"]').click();
  await p.waitForURL("**/ssc-exams.html");
}
await p.setViewportSize({ width: 1440, height: 900 });
await p.goto("http://127.0.0.1:4173/pages/index.html");
assert.equal(await p.locator(".drawer-toolbar").isVisible(), false);
assert.equal(await p.locator(".drawer-preferences").count(), 0);
assert.equal(await p.locator("#main-nav").isVisible(), true);
await b.close();
console.log(
  "Drawer layout, close/backdrop/Escape, focus loop, preferences and navigation passed at four mobile/tablet widths; desktop menu unchanged.",
);
