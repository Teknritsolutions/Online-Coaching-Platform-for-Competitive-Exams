# Aurevia Academy — Online Coaching Platform

A complete static HTML5 education template with 27 public pages and 41 role dashboard pages. All data, identities, results, prices, and transactions are demonstration content.

## Run locally

Requires Node.js 20 or later. No install or build is required to view the site.

```sh
npm start
```

Open **http://127.0.0.1:4173/**. On Windows with blocked PowerShell scripts, use `npm.cmd start` or `node scripts/serve.mjs`.

The root index redirects to `pages/index.html`. Use an HTTP server; JavaScript modules are not supported by most browsers under `file://`.

## Explore

- Public website: `pages/index.html`; alternative: `pages/home-2.html`.
- Exam pathways: `pages/banking-exams.html`, `pages/ssc-exams.html`, `pages/railways-exams.html`, and `pages/engineering-exams.html`.
- Login: `pages/login.html`. Choose a role using the demo buttons; no credentials are required.
- Student: `dashboard/student/index.html`.
- Admin: `dashboard/admin/index.html`.
- Instructor: `dashboard/instructor/index.html`.
- Course variants: `pages/course-details.html?course=banking|ssc|railways|engineering`.
- Faculty variants use `?faculty=ananya|arjun|meera|rohan`.
- Article variants use `?article=study-plan|quant-speed|mock-review|current-affairs`.

## Edit and rebuild

`scripts/build.mjs` is the source for reusable HTML components and page compositions. `assets/js/data.js` holds programs, faculty, articles, sessions, tests, and questions. Shared browser behavior lives in focused modules under `assets/js/`.

```sh
npm run build
```

This regenerates all 64 page HTML files, the root redirect, sitemap, robots file, and page manifest. The delivered HTML is already generated and can be uploaded directly. Edit the generator for changes that should survive rebuilding; edit CSS and JavaScript modules directly.

## Static hosting / GitHub Pages

Deploy the contents of this directory to your repository or static host. All internal paths are relative and work within a repository subdirectory. Configure your host to serve `pages/404.html` for missing routes; the included local server already does this. Replace `https://example.com/aurevia/` canonical and sitemap placeholders with your production hostname and repository path before publishing.

## Demo boundaries

Local storage persists theme, direction, learner profile, enrollment, lesson completion, reservations, test drafts, attempts, preferences, and management records. Passwords are never stored. Data stays in the current browser. Local storage is not secure exam storage or an authentication boundary. Role pages are intentionally accessible.

The timer is deadline-based and survives reloads. If the browser is closed or JavaScript is suspended, expiry is processed when the test or submission page next runs. Scores use +2 correct, −0.5 incorrect, 0 unanswered. Accuracy means correct / answered; score percentage is score / maximum, so they differ and a score can be negative.

## Verification

The delivered `documentation/test-results.json` records the browser and static checks. Screenshots are under `documentation/screenshots/`. See `documentation/testing.md` for exact scope and `documentation/implementation-report.md` for limitations.

To rerun browser tests, install Playwright as a development tool and its Chromium browser, then run the server and `npm test`. The QA helper also supports `STACKLY_PLAYWRIGHT_MODULE` and `STACKLY_CHROMIUM` for existing local installations. The website itself has no npm dependencies.

## Credits

Original brand SVGs, original lesson notes and questions, built-in imagegen original photographs, and downloaded illustrative Unsplash photographs. Per-file sources, licenses, and generation prompts are in `documentation/image-inventory.json` and `documentation/credits.md`. Chart.js is vendored locally under its MIT license; Inter is included under the SIL Open Font License.
