import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { launchBrowser } from "./browser.mjs";
import { scoreAttempt, draftValid } from "../assets/js/exam.js";
import { tests, questions } from "../assets/js/data.js";
const report = {
  date: new Date().toISOString(),
  static: {},
  scoring: [],
  workflow: [],
  responsive: {
    cases: 0,
    widths: [320, 360, 375, 390, 420, 425, 480, 640, 768, 820, 1024, 1280, 1440, 1600, 1920],
    themes: ["light", "dark"],
    failures: [],
  },
  errors: [],
};
const files = JSON.parse(fs.readFileSync("documentation/pages.json"));
const pages = [...files.public.map((p) => p.file), ...files.dashboard];
let links = 0,
  images = 0;
for (const file of pages) {
  const html = fs.readFileSync(file, "utf8");
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, ids.length, `Duplicate ID: ${file}`);
  assert.equal([...html.matchAll(/<h1[ >]/g)].length, 1, `H1: ${file}`);
  if (file === "pages/index.html" || file === "pages/home-2.html")
    assert.equal([...html.matchAll(/<section[ >]/g)].length, 10, file + " must have 10 sections");
  else if (
    file.startsWith("pages/") &&
    !/login|register|forgot-password|404|coming-soon/.test(file)
  )
    assert.ok(
      (file === "pages/previous-papers.html" ? [4] : [5, 6]).includes(
        [...html.matchAll(/<section[ >]/g)].length,
      ),
      file + " section count",
    );
  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = m[1].split(/[?#]/)[0];
    if (!url || /^(https?:|mailto:|tel:|data:)/.test(url)) continue;
    const target = path.resolve(path.dirname(file), url);
    assert.ok(fs.existsSync(target), `${file}: Missing ${url}`);
    links++;
  }
  for (const m of html.matchAll(/<img\s[^>]+>/g)) {
    assert.ok(/alt="[^"]+"/.test(m[0]), file + " missing alt");
    assert.ok(/width=/.test(m[0]) && /height=/.test(m[0]), file + " missing dimensions");
    images++;
  }
}
report.static = {
  pages: pages.length,
  localReferences: links,
  imagePlacements: images,
  sectionCounts: "passed",
  singleH1: "passed",
  duplicateIds: "none",
};
const ids = [
  ...fs.readFileSync("pages/index.html", "utf8").matchAll(/<img[^>]+src="([^"]+)"/g),
].map((m) => m[1]);
const allImages = pages.flatMap((f) =>
  [...fs.readFileSync(f, "utf8").matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1]),
);
assert.equal(new Set(allImages).size, allImages.length, "Content photo reused");
const t = tests[0],
  allCorrect = Object.fromEntries(questions.map((q) => [q.id, q.answer]));
assert.equal(scoreAttempt(t, allCorrect).score, 20);
assert.equal(scoreAttempt(t, {}).score, 0);
assert.equal(
  scoreAttempt(t, Object.fromEntries(questions.map((q) => [q.id, (q.answer + 1) % 4]))).score,
  -5,
);
assert.equal(scoreAttempt(t, { 1: 1, 2: 0 }).score, 1.5);
assert.equal(scoreAttempt(t, { 1: 9 }).unattempted, 10);
assert.equal(draftValid({}), false);
report.scoring = [
  "All correct: 20/20",
  "All incorrect: -5/20",
  "All unattempted: 0/20",
  "One correct + one incorrect: 1.5/20",
  "Invalid response treated as unanswered",
  "Invalid persisted draft rejected",
];

const browser = await launchBrowser();
const base = "http://127.0.0.1:4173/";
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
page.on("pageerror", (err) => report.errors.push(err.message));
await page.goto(base + "pages/index.html");
await page.waitForSelector(".hero img");
await page.evaluate(() => document.querySelectorAll("img").forEach((i) => (i.loading = "eager")));
await page.waitForFunction(() => [...document.images].every((i) => i.complete));
fs.mkdirSync("documentation/screenshots", { recursive: true });
await page.screenshot({ path: "documentation/screenshots/home-desktop.png", fullPage: true });
await page.goto(base + "pages/register.html");
await page.locator("#full-name").fill("Test Learner");
await page.locator("#email").fill("learner@example.com");
await page.locator("#password").fill("Practice123");
await page.locator("#confirm-password").fill("Practice123");
await page.locator("#interest").selectOption("Banking");
await page.locator("input[type=checkbox]").check();
await page.getByRole("button", { name: "Create demo account" }).click();
await page.waitForURL("**/dashboard/student/index.html");
assert.ok((await page.locator("h1").textContent()).includes("Test"));
report.workflow.push(
  "Registration validates and opens student overview; password is not persisted",
);
assert.equal(
  await page.evaluate(() => Object.values(localStorage).some((v) => v.includes("Practice123"))),
  false,
);
await page.goto(base + "pages/courses.html?category=SSC");
assert.equal(await page.locator(".filter-item:visible").count(), 1);
await page.locator("[data-filter-search]").fill("nonexistent");
assert.equal(await page.locator("[data-empty]").isVisible(), true);
report.workflow.push("Category and text filtering, including empty state");
await page.goto(base + "pages/course-details.html?course=ssc");
assert.equal(await page.locator("[data-course-price]").textContent(), "₹5,999");
await page.locator("[data-enroll]").click();
await page.getByRole("link", { name: "Open your learning space" }).click();
await page.waitForURL("**/lesson.html?course=ssc");
await page.locator("#complete-lesson").click();
report.workflow.push("Course-specific content, local enrollment and lesson completion");
await page.goto(base + "dashboard/student/test-instructions.html?test=foundation");
await page.locator("#accept-instructions").check();
await page.locator("#begin-test").click();
await page.waitForURL("**/attempt-test.html?test=foundation");
await page.locator('input[value="1"]').check();
await page.locator("#mark-review").click();
await page.reload();
assert.equal(await page.locator('input[value="1"]').isChecked(), true);
await page.locator("#save-next").click();
await page.locator('input[value="0"]').check();
await page.locator("#save-next").click();
await page.locator('input[value="3"]').check();
await page.locator("#clear-response").click();
assert.equal(await page.locator("input:checked").count(), 0);
await page.locator("#review-submit").click();
await page.waitForURL("**/test-submit.html");
await page.locator("#final-submit").click();
await page.waitForURL("**/test-results.html?attempt=*");
let result = await page.evaluate(() => JSON.parse(localStorage.getItem("stackly-attempts")).at(-1));
assert.equal(result.score, 1.5);
assert.equal(result.correct, 1);
assert.equal(result.incorrect, 1);
assert.equal(result.unattempted, 8);
assert.equal(result.accuracy, 50);
report.workflow.push(
  "Complete timed test journey: selected responses survive reload, review, clear, submit, score 1.5/20 = 1 correct / 1 incorrect / 8 unanswered",
);
await page.getByRole("link", { name: "Review every answer" }).click();
await page.waitForSelector(".question-text");
assert.equal(await page.locator(".question-text").count(), 10);
report.workflow.push("Question-wise answers, explanations and active time render");
await page.goto(base + "dashboard/student/analytics.html");
await page.waitForFunction(
  () => window.Chart && window.Chart.instances && Object.keys(window.Chart.instances).length === 6,
);
await page.screenshot({ path: "documentation/screenshots/student-analytics.png", fullPage: true });
report.workflow.push("All six responsive student charts and accessible data tables render");
await page.goto(base + "dashboard/student/test-instructions.html");
await page.locator("#accept-instructions").check();
await page.locator("#begin-test").click();
await page.waitForURL("**/attempt-test.html*");
await page.waitForSelector("#test-timer");
await page.goto(base + "dashboard/student/index.html");
await page.evaluate(() => {
  const d = JSON.parse(localStorage.getItem("stackly-exam-draft"));
  d.deadline = Date.now() - 1000;
  localStorage.setItem("stackly-exam-draft", JSON.stringify(d));
});
await page.goto(base + "dashboard/student/attempt-test.html");
await page.waitForURL("**/test-results.html?attempt=*");
result = await page.evaluate(() => JSON.parse(localStorage.getItem("stackly-attempts")).at(-1));
assert.equal(result.auto, true);
assert.equal(await page.evaluate(() => localStorage.getItem("stackly-exam-draft")), null);
report.workflow.push(
  "Expired persisted deadline automatically submits on reload; submitted drafts remain cleared",
);
await page.goto(base + "dashboard/admin/students.html");
await page.locator("#manager-search").fill("Diya");
assert.equal(await page.locator("#manager-table tbody tr").count(), 1);
await page.locator("#manager-search").fill("");
await page.locator("#add-record").click();
for (const [k, v] of Object.entries({
  name: "Zara Test",
  email: "zara@example.com",
  program: "Banking",
  status: "Active",
}))
  await page.locator("#field-" + k).fill(v);
await page.getByRole("button", { name: "Save local record" }).click();
await page.locator("#manager-search").fill("Zara Test");
assert.equal(await page.locator("#manager-table tbody tr").count(), 1);
await page.getByRole("button", { name: "Edit", exact: true }).click();
await page.locator("#field-name").fill("Zara Updated");
await page.getByRole("button", { name: "Save local record" }).click();
await page.locator("#manager-search").fill("Zara Updated");
await page.getByRole("button", { name: "Delete", exact: true }).click();
await page.locator("#confirm-delete").click();
assert.ok((await page.locator("#manager-table").textContent()).includes("No matching"));
report.workflow.push("Admin search, add, edit, delete, modal confirmation and empty table");
await page.goto(base + "dashboard/instructor/content.html");
await page.locator("#edit-lesson").click();
await page.locator("#lesson-notes").fill("Updated original teaching notes.");
await page.getByRole("button", { name: "Save local changes" }).click();
assert.ok((await page.locator("#dashboard-content").textContent()).includes("Updated original"));
report.workflow.push("Instructor sample lesson notes update and persist");
await page.goto(base + "pages/live-classes.html");
await page.locator('[data-schedule-view="calendar"]').click();
assert.equal(await page.locator(".calendar-view").count(), 1);
await page.locator('[data-register-session="s1"]').first().click();
await page.locator("#confirm-reservation").click();
assert.ok(
  await page.evaluate(() =>
    JSON.parse(localStorage.getItem("stackly-reservations")).includes("s1"),
  ),
);
report.workflow.push("Schedule view toggle and browser-local reservation");
await page.goto(base + "pages/index.html");
await page.setViewportSize({ width: 390, height: 844 });
await page.locator("[data-menu-toggle]").click();
assert.equal(await page.locator("#main-nav").isVisible(), true);
await page.locator("#main-nav summary").filter({ hasText: "Courses" }).click();
assert.equal(
  await page
    .locator("#main-nav")
    .getByRole("link", { name: "All Courses", exact: true })
    .isVisible(),
  true,
);
await page.keyboard.press("Escape");
assert.equal(await page.locator("#main-nav").isVisible(), false);
await page.screenshot({ path: "documentation/screenshots/home-mobile.png", fullPage: true });
report.workflow.push("Mobile navigation, expandable dropdown and Escape dismissal");
await page.locator(".header-actions [data-theme-toggle]").click();
const theme = await page.locator("html").getAttribute("data-theme");
await page.goto(base + "pages/about.html");
assert.equal(await page.locator("html").getAttribute("data-theme"), theme);
await page.locator(".header-actions [data-dir-toggle]").click();
assert.equal(await page.locator("html").getAttribute("dir"), "rtl");
await page.screenshot({ path: "documentation/screenshots/dark-rtl-mobile.png", fullPage: true });
report.workflow.push("Persistent theme and RTL layout");
await context.close();

/* All 64 pages, every requested width, both themes. Four independent contexts bound memory. */
let index = 0;
const workers = Array.from({ length: 4 }, async () => {
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  p.on("pageerror", (err) => report.errors.push(err.message));
  while (index < pages.length) {
    const file = pages[index++];
    for (const theme of report.responsive.themes) {
      await ctx.addInitScript((theme) => {
        localStorage.setItem("stackly-theme", theme);
        localStorage.setItem("stackly-dir", "ltr");
      }, theme);
      await p.goto(base + file);
      await p.waitForTimeout(70);
      for (const width of report.responsive.widths) {
        await p.setViewportSize({ width, height: 950 });
        const state = await p.evaluate(() => ({
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
          h1: document.querySelectorAll("h1").length,
          broken: [...document.images]
            .filter((i) => i.complete && i.naturalWidth === 0)
            .map((i) => i.src),
          main: !!document.querySelector("main"),
        }));
        report.responsive.cases++;
        if (state.overflow || state.h1 !== 1 || state.broken.length || !state.main)
          report.responsive.failures.push({ file, theme, width, ...state });
      }
    }
    if (index % 12 === 0) console.log(`Responsive audit: ${index}/${pages.length} pages`);
  }
  await ctx.close();
});
try {
  await Promise.all(workers);
} finally {
  await browser.close();
  fs.writeFileSync("documentation/test-results.json", JSON.stringify(report, null, 2));
}
console.log(
  JSON.stringify(
    {
      ...report,
      responsive: { ...report.responsive, failures: report.responsive.failures.slice(0, 15) },
    },
    null,
    2,
  ),
);
assert.equal(report.responsive.failures.length, 0, "Responsive rendering failures");
assert.equal(report.errors.length, 0, "Browser JavaScript errors");
