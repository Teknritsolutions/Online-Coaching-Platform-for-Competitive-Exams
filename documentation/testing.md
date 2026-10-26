# Verification scope

The exact machine-readable results are in `test-results.json`.

## Automated checks

- 64 generated pages: 23 public + 16 student + 15 admin + 10 instructor.
- Public section counts: both homepages 10, remaining standard pages 5 or 6.
- One H1 per document, no duplicate IDs, all static relative file references resolve, image alt text and dimensions present.
- Unique content image references, favicon, local dependencies, downloadable files.
- All-correct, all-incorrect, all-unanswered, mixed, and invalid-response scoring cases.
- Registration and password non-persistence, course filtering and empty states, course data loading and enrollment.
- Lesson completion, test instructions, answers, reload persistence, review marker, response clearing, submission, score/count consistency, answer explanations, saved history.
- Expired persisted deadlines automatically submit and completed drafts remain cleared.
- Six student Chart.js charts and accessible data alternatives.
- Admin add/edit/delete/search, modal confirmation, and empty tables.
- Instructor lesson editing, schedule views and local reservations.
- Mobile navigation, dropdown expansion, Escape dismissal, theme persistence, RTL demonstration.

## Responsive rendering matrix

Chromium headless renders every page at 320, 360, 375, 390, 420, 425, 480, 640, 768, 820, 1024, 1280, 1440, 1600, and 1920 CSS pixels in light and dark themes: 1,920 page/theme/width combinations. Automated checks detect document overflow, missing H1/main, and broken loaded images. Wide tables deliberately scroll in their own containers.

Representative full-page desktop/mobile screenshots support visual review. This matrix does not establish that every pixel or every possible interaction on every page has been manually inspected. RTL is separately demonstrated on representative mobile/desktop content, not part of the full 1,920-case matrix.

## Visual refresh verification

`tests/design-review.mjs` verified all 541 rendered paragraphs across all 64 pages use exactly 16px. It also checked matching heights for the four approach cards and a visible background-color change on button hover. Component screenshots are saved as `refreshed-approach-*`, `refreshed-pathways-*`, and `refreshed-course-buttons.png`. The refresh uses 76 unique content photo references, including 52 new placements; inventories and generation briefs are recorded in `image-inventory.json`, `visual-placements.json`, and `visual-refresh-prompts.json`.

## Accessibility results

Semantic structure, visible focus, skip links, labels, native dialog focus handling, native details/summary controls, keyboard dismissal, reduced motion, chart data tables, and responsive table scrolling are implemented. These checks do not constitute a full manual WCAG conformance assessment or assistive-technology certification.

axe-core 4.10.3 checked seven representative pages (homepage, registration, catalog, contact, student overview, admin student management, and test instructions) in both themes. The final 14 runs reported zero WCAG 2 A/AA and WCAG 2.1 AA rule violations. See `accessibility-results.json`. Incomplete/manual-review items remain outside that automated result. An announcement link initially relied only on color; it now has a persistent underline.

## Limits

The browser used was Chromium. Safari, Firefox, real iOS/Android hardware, slow-network performance, screen-reader behavior, and production hosting are not covered by this run. Lighthouse performance/Core Web Vitals targets have not been measured; no 90+ score is claimed.
