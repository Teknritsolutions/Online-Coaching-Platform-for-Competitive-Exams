import assert from "node:assert/strict";
import { launchBrowser } from "./browser.mjs";
const b = await launchBrowser();
const p = await b.newPage();
for (const width of [390, 900, 1440]) {
  await p.setViewportSize({ width, height: 1000 });
  await p.goto("http://127.0.0.1:4173/dashboard/student/test-instructions.html");
  const r = await p.locator(".instruction-layout > .panel").evaluateAll((els) =>
    els.map((el) => {
      const r = el.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, width: r.width };
    }),
  );
  assert.ok(r[1].top - r[0].bottom >= 23);
  assert.ok(Math.abs(r[0].width - r[1].width) < 1);
  assert.equal(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await p.screenshot({
    path: `documentation/screenshots/compact-test-instructions-${width}.png`,
    fullPage: true,
  });
}
await p.locator("#accept-instructions").check();
await p.locator("#begin-test").click();
await p.waitForURL("**/attempt-test.html*");
assert.ok(await p.locator("#test-timer").isVisible());
await b.close();
console.log("Instruction layout alignment passed at three widths; test starts correctly.");
