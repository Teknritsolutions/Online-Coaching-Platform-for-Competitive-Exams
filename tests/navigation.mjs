import fs from "node:fs";
import assert from "node:assert/strict";
import { launchBrowser } from "./browser.mjs";

const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto("http://127.0.0.1:4173/pages/index.html");
await page.waitForFunction(() => document.querySelector("[data-theme-toggle]")?.title);
assert.equal(await page.getByRole("link", { name: "Aurevia Academy home" }).count(), 2);
assert.equal(await page.locator("body").evaluate((el) => /stackly/i.test(el.innerText)), false);
const nav = page.locator("#main-nav");
assert.deepEqual(
  await nav.locator(":scope > a:not(.btn), :scope > details > summary").allTextContents(),
  [
    "Home",
    "About Us",
    "Courses",
    "Faculty",
    "Results",
    "Fees",
    "Resources",
    "Contact",
    "Dashboard",
  ],
);
const home = nav.locator("details").first();
await home.locator("summary").hover();
await page.waitForFunction(() => document.querySelector("#main-nav details").open);
assert.equal(await home.getByRole("link", { name: "Home Page 1" }).isVisible(), true);
assert.equal(await home.getByRole("link", { name: "Home Page 2" }).isVisible(), true);
assert.equal(
  await home.getByRole("link", { name: "Home Page 1" }).getAttribute("aria-current"),
  "page",
);
assert.equal(
  await home.locator("summary").evaluate((el) => getComputedStyle(el, "::before").transform),
  "matrix(1, 0, 0, 1, 0, 0)",
);
await home.getByRole("link", { name: "Home Page 2" }).click();
await page.waitForURL("**/home-2.html");
await page.waitForFunction(() => document.querySelector("[data-theme-toggle]")?.title);
const theme = page.locator(".header-actions [data-theme-toggle]");
const before = await page.locator("html").getAttribute("data-theme");
await theme.click();
const after = await page.locator("html").getAttribute("data-theme");
assert.notEqual(after, before);
assert.equal(
  await theme.locator(after === "dark" ? ".theme-moon" : ".theme-sun").isVisible(),
  true,
);
assert.equal(
  await theme.locator(after === "dark" ? ".theme-sun" : ".theme-moon").isVisible(),
  false,
);
await page.reload();
await page.waitForFunction(() => document.querySelector("[data-theme-toggle]")?.title);
assert.equal(await page.locator("html").getAttribute("data-theme"), after);
const dir = page.locator(".header-actions [data-dir-toggle]");
await dir.click();
assert.equal(await page.locator("html").getAttribute("dir"), "rtl");
assert.equal(await dir.locator("[data-dir-label]").textContent(), "LTR");
assert.equal(await page.locator("footer [data-dir-label]").count(), 0);
assert.equal(await page.locator(".footer-bottom a,.footer-bottom button").count(), 0);
assert.equal(
  (await page.locator(".footer-bottom").textContent()).includes("Educational website template"),
  false,
);
assert.equal(await page.locator(".socials a > svg").count(), 3);
assert.equal(
  await page
    .locator(".socials a")
    .evaluateAll((els) => els.every((el) => el.textContent.trim() === "")),
  true,
);
assert.equal(
  await page.locator(".header-actions").evaluate((el) =>
    [...el.children]
      .filter((child) => getComputedStyle(child).display !== "none")
      .at(-1)
      .classList.contains("header-login"),
  ),
  true,
);
assert.ok(
  await page.evaluate(
    () =>
      document.querySelector("#main-nav").getBoundingClientRect().left -
        document.querySelector(".site-header .brand").getBoundingClientRect().right <
      75,
  ),
);
await dir.click();
assert.equal(await page.locator("html").getAttribute("dir"), "ltr");
await page.goto("http://127.0.0.1:4173/pages/about.html");
assert.equal(await page.locator("#main-nav > a[aria-current=page]").textContent(), "About Us");
assert.equal(
  await page
    .locator("footer li")
    .first()
    .evaluate((el) => getComputedStyle(el).fontSize),
  "15px",
);
assert.equal(
  await page.locator(".footer-bottom").evaluate((el) => getComputedStyle(el).fontSize),
  "14px",
);
await page.locator(".header-actions [data-theme-toggle]").click();
await page.mouse.move(700, 350);
await page.waitForTimeout(350);
await page.screenshot({ path: "documentation/screenshots/aurevia-header-desktop.png" });
await page
  .locator(".site-footer")
  .screenshot({ path: "documentation/screenshots/aurevia-footer-desktop.png" });
for (const width of [320, 360, 390, 560, 768, 1024, 1280, 1440, 1920]) {
  await page.setViewportSize({ width, height: 900 });
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
    false,
    "Header/page overflow at " + width,
  );
}
await page.setViewportSize({ width: 390, height: 844 });
await page.locator("[data-menu-toggle]").click();
assert.equal(await nav.isVisible(), true);
await nav.locator("details summary").first().click();
assert.equal(await nav.getByRole("link", { name: "Home Page 2" }).isVisible(), true);
assert.equal(await nav.getByRole("link", { name: "Login", exact: true }).isVisible(), true);
await page.screenshot({ path: "documentation/screenshots/aurevia-navigation-mobile.png" });
await page.keyboard.press("Escape");
assert.equal(await nav.isVisible(), false);
await browser.close();
fs.writeFileSync(
  "documentation/navigation-results.json",
  JSON.stringify(
    {
      brand: "Aurevia Academy",
      navigationOrder: "passed",
      homeHover: "passed",
      activeUnderlines: "passed",
      themeIconsAndPersistence: "passed",
      rtlControls: "passed",
      footerType: "passed",
      responsiveHeader: "passed",
      mobileNavigation: "passed",
    },
    null,
    2,
  ),
);
console.log(
  "Brand, navigation, hover, active underline, theme icons, RTL, footer type, and responsive header passed.",
);
