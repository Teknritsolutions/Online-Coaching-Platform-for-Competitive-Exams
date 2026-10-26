import assert from "node:assert/strict";
import fs from "node:fs";
import { launchBrowser } from "./browser.mjs";
const b = await launchBrowser();
const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
const pages = JSON.parse(fs.readFileSync("documentation/pages.json", "utf8"));
let fields = 0;
for (const file of [...pages.public.map((x) => x.file), ...pages.dashboard]) {
  await p.goto(`http://127.0.0.1:4173/${file}`);
  if (file.startsWith("dashboard"))
    await p.waitForFunction(
      () =>
        !document
          .querySelector("#dashboard-content")
          ?.textContent.includes("Preparing your demo workspace"),
    );
  const r = await p
    .locator("input,textarea")
    .evaluateAll((els) =>
      els
        .filter(
          (x) =>
            x.tagName === "TEXTAREA" ||
            ["text", "email", "tel", "url", "password", "search", "number"].includes(x.type),
        )
        .map((x) => ({ id: x.id, placeholder: x.placeholder })),
    );
  for (const f of r) assert.ok(f.placeholder, `${file} ${f.id}`);
  fields += r.length;
}
await p.goto("http://127.0.0.1:4173/pages/courses.html");
assert.ok(await p.evaluate(() => CSS.supports("appearance", "base-select")));
const select = p.locator("#catalog-category");
await select.click();
const option = select.locator("option").nth(2);
const initial = await option.evaluate((el) => getComputedStyle(el).backgroundColor);
await option.hover();
const hovered = await option.evaluate((el) => getComputedStyle(el).backgroundColor);
assert.notEqual(initial, hovered);
await p.screenshot({ path: "documentation/screenshots/refined-category-dropdown.png" });
await option.click();
assert.equal(await select.inputValue(), "SSC");
assert.equal(await p.locator(".filter-item:visible").count(), 1);
await p.goto("http://127.0.0.1:4173/pages/contact.html");
assert.equal(await p.locator("#contact-interest").inputValue(), "");
await p.locator("#contact-interest").selectOption("Banking");
assert.equal(await p.locator("#contact-interest").inputValue(), "Banking");
await p
  .locator('form[data-demo-form="contact"]')
  .screenshot({ path: "documentation/screenshots/form-placeholders.png" });
await b.close();
console.log(
  `All 64 pages checked; ${fields} text fields have placeholders. Dropdown neutrality, hover and filtering passed.`,
);
