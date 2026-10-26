import assert from "node:assert/strict";
import { launchBrowser } from "./browser.mjs";
const b = await launchBrowser();
const p = await b.newPage();
for (const name of ["login", "register", "404", "coming-soon"]) {
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto(`http://127.0.0.1:4173/pages/${name}.html`);
  await p.waitForTimeout(350);
  const r = await p.evaluate(() => ({
    height: document.documentElement.scrollHeight,
    viewport: innerHeight,
    overflow: document.documentElement.scrollWidth > innerWidth,
  }));
  console.log(name, r);
  assert.equal(r.overflow, false);
  assert.ok(r.height <= r.viewport, `${name} should fit 900px desktop height`);
  await p.screenshot({ path: `documentation/screenshots/final-${name}-900.png`, fullPage: true });
}
await b.close();
