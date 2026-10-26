import assert from "node:assert/strict";
import { launchBrowser } from "./browser.mjs";
const b = await launchBrowser();
const p = await b.newPage();
for (const width of [390, 900, 1440]) {
  await p.setViewportSize({ width, height: 1000 });
  for (const name of ["login", "register", "forgot-password", "404", "coming-soon"]) {
    await p.goto(`http://127.0.0.1:4173/pages/${name}.html`);
    assert.equal(await p.locator(".site-header,.site-footer,.announcement").count(), 0);
    assert.equal(await p.locator(".standalone-controls [data-theme-toggle]").count(), 1);
    assert.equal(await p.locator(".standalone-controls [data-dir-toggle]").count(), 1);
    for (const theme of ["light", "dark"]) {
      await p.evaluate((t) => {
        document.documentElement.dataset.theme = t;
        document.documentElement.dir = "ltr";
      }, theme);
      assert.equal(
        await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
        `${name} ${width}`,
      );
    }
    await p.locator("[data-dir-toggle]").click();
    assert.equal(await p.locator("html").getAttribute("dir"), "rtl");
    assert.equal(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await p.locator("[data-dir-toggle]").click();
    const before = await p.locator("html").getAttribute("data-theme");
    await p.locator("[data-theme-toggle]").click();
    assert.notEqual(await p.locator("html").getAttribute("data-theme"), before);
    if (width === 1440 && name !== "forgot-password") {
      await p.evaluate(() => (document.documentElement.dataset.theme = "light"));
      await p.screenshot({
        path: `documentation/screenshots/standalone-${name}.png`,
        fullPage: true,
      });
    }
  }
}
await p.goto("http://127.0.0.1:4173/pages/register.html");
await p.locator("#full-name").fill("Sample Learner");
await p.locator("#email").fill("learner@example.com");
await p.locator("#password").fill("Practice123");
await p.locator("#confirm-password").fill("Practice123");
await p.locator("#interest").selectOption("Banking");
await p.locator("input[type=checkbox]").check();
await p.locator("button[type=submit]").click();
await p.waitForURL("**/dashboard/student/index.html");
await b.close();
console.log(
  "Five standalone pages passed mobile/desktop, light/dark, RTL, controls and registration checks.",
);
