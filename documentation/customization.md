# Customization

## Content and structure

Edit `scripts/build.mjs` to update navigation, footer, page sections, pricing, and institute content. Run `node scripts/build.mjs`. Both homepages must retain exactly 10 top-level content sections. Standard public pages use 5 or 6. Auth, error, and coming-soon layouts are intentionally single-purpose.

Programs, subject expertise, faculty, article metadata, schedules, tests, questions, and role routes are defined in `assets/js/data.js`. Course detail content is selected through query parameters. Each course uses its own curriculum and price.

## Brand and theme

The original Aurevia Academy book-and-crest mark has primary and dark SVG variants in `assets/images/`; its source lives in `scripts/brand.mjs`. Change design tokens at the start of `assets/css/style.css`. Shared header, footer, supporting-text sizes, and logo styling live in `assets/css/app-shell.css`. Interface icons use the shared SVG library in `assets/js/icons.js`. Dark tokens live under `[data-theme='dark']`. The theme boot script runs before CSS to limit incorrect-theme flashes. Theme choices fall back to system preferences. `assets/js/preferences.js` keeps sun/moon icons, labels, and RTL controls synchronized. The footer contains only copyright below its columns; theme and RTL controls remain in the header. RTL sets `dir` on the root and uses logical layout properties; it demonstrates layout mirroring, not Arabic localization.

## Image handling

Each content photograph has a unique placement. The visual refresh adds photographic category backgrounds, framed approach cards, course imagery, wide inner-page hero photos, and image-backed CTAs. Faculty home portraits are not repeated in the directory. Image filenames, sources, prompts, and licenses are recorded in the inventory. `scripts/visual-library.mjs` allocates one distinct photo per new placement and `documentation/visual-placements.json` records those allocations. When adding photographs, reserve dimensions, include meaningful alt text, and use WebP with lazy loading below the hero.

Paragraphs use the single `--paragraph-size: 16px` token in `assets/css/visual-refresh.css`. Supporting labels, navigation, and metadata spans retain their separate hierarchy. Shared action links use the same bordered button treatment, with teal hover and visible keyboard focus. Adjust the final stylesheet to maintain those rules across both public pages and dashboards.

## Backend integration points

1. Replace open role navigation in `main.js` with authenticated server sessions and server-side authorization.
2. Connect registration, reset, contact, and newsletter forms to validated backend services; use clear error and success responses.
3. Replace local exam storage with a secure assessment service if assessments become consequential.
4. Replace course enrollment dialogs and illustrative fees with a payment provider. Never trust browser prices or payment statuses.
5. Connect class reservations to scheduling and conferencing services.
6. Replace local management records with permission-checked APIs. Editable question records are editorial demos separate from the fixed test engine.
7. Replace fictional identities, institutional history, testimonials, scores, sample contact details, and legal documents with reviewed, verified content.

## Data consistency

Student score/accuracy/count charts and KPIs derive from the same attempt history. Three seeded attempts are displayed separately from user-generated data. Subject charts use saved attempts only; topic and timing charts use the latest attempt. No saved answers means zero data, explicitly labeled.

Administrative and instructor charts are illustrative aggregates. They do not recompute from independently editable local management records; these two demo scopes are visibly disclosed. Replace both with a single backend source before production reporting.
