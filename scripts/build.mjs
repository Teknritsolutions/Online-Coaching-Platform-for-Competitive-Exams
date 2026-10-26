import { pathwayHref } from "../assets/js/pathways.js";
import { buildPathwayPages } from "./pathway-pages.mjs";
import { withFormPlaceholders } from "../assets/js/forms.js";
import fs from "node:fs";
import { icon, iconPaths, markupWithIcons } from "../assets/js/icons.js";
import path from "node:path";
import { visualFor, saveVisualPlacements } from "./visual-library.mjs";
import { brandMark } from "./brand.mjs";
import {
  courses,
  categories,
  faculty,
  articles,
  sessions,
  rolePages,
  tests,
} from "../assets/js/data.js";

const publicPages = [];
const allPages = [];
const icons = iconPaths;
const brand = (root = "") =>
  `<a class="brand" href="${root}pages/index.html" aria-label="Aurevia Academy home">${brandMark}<span>Aurevia<small>ACADEMY</small></span></a>`;
const themeButton = () =>
  `<button class="icon-button theme-button" data-theme-toggle aria-label="Switch color theme" aria-pressed="false"><svg class="icon theme-sun" viewBox="0 0 24 24" aria-hidden="true"><path d="${icons.sun}"/></svg><svg class="icon theme-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 13.2A8.6 8.6 0 0 1 10.8 3.5a8.7 8.7 0 1 0 9.7 9.7Z"/></svg></button>`;
const directionButton = () =>
  `<button class="icon-button direction-button" data-dir-toggle aria-label="Switch to right-to-left layout" aria-pressed="false"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16m-4-4 4 4-4 4M20 17H4m4-4-4 4 4 4"/></svg><span data-dir-label>RTL</span></button>`;
const btn = (text, href, kind = "") =>
  `<a class="btn ${kind}" href="${href}">${text} ${icon("arrow")}</a>`;
const link = (text, href) => `<a class="text-link" href="${href}">${text} →</a>`;
const photo = (name, alt, cls = "", eager = false) =>
  `<img src="../assets/images/${name}.webp" alt="${alt}" class="${cls}" width="1000" height="700" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
const head = (eyebrow, title, description = "", action = "") =>
  `<div class="section-head"><div><span class="eyebrow">${eyebrow}</span><h2>${title}</h2></div>${description ? `<p>${description}</p>` : action}</div>`;
const section = (body, cls = "", id = "") =>
  `<section class="section ${cls}" ${id ? `id="${id}"` : ""}><div class="container">${body}</div></section>`;
const notice = (text) => `<div class="notice">${text}</div>`;
const featureImages = {
  "Teachers who simplify": [
    "approach-teaching",
    "A tutor explaining mathematics to adult learners",
  ],
  "A plan with purpose": ["approach-roadmap", "A student organizing a weekly study timetable"],
  "Practice that informs": ["approach-analysis", "A student reviewing a practice answer sheet"],
  "Support at every step": ["approach-support", "A learner discussing study notes with a mentor"],
};
const feature = (title, desc, i = "book") => {
  const image = featureImages[title];
  return `<article class="feature ${image ? "feature-visual" : ""}">
    ${image ? photo(`enhancements/${image[0]}`, image[1], "feature-media") : ""}
    <div class="feature-body"><div class="icon-box">${icon(i)}</div><h3>${title}</h3><p>${desc}</p></div>
  </article>`;
};
const features = () =>
  `<div class="grid four">${feature("Teachers who simplify", "Learn the why behind every concept with focused, step-by-step explanations.", "people")}${feature("A plan with purpose", "Follow a syllabus-aligned roadmap with manageable weekly milestones.", "book")}${feature("Practice that informs", "Understand your mistakes with topic insights and detailed explanations.", "chart")}${feature("Support at every step", "Keep your notes, practice, lessons, and revision in one learning space.", "check")}</div>`;
const checks = (items) =>
  `<ul class="check-list">${items.map((x) => `<li>${x}</li>`).join("")}</ul>`;
const faqs = (
  items = [
    [
      "Can I try the platform before enrolling?",
      "Yes. Explore the free demonstration mock test and role dashboards. All progress is stored on this browser only.",
    ],
    [
      "What is included with a program?",
      "Each sample program includes a structured syllabus, lesson outlines, practice tests, downloadable notes, and scheduled demo classes.",
    ],
    [
      "Can I learn on my phone?",
      "Yes. Lessons, resources, tests, and analytics adapt to mobile, tablet, and desktop screens.",
    ],
    [
      "Are these real exam results?",
      "No. This template uses clearly labeled fictional results and illustrative student stories. Actual results must be verified before publication.",
    ],
  ],
) =>
  items
    .map(([q, a]) => `<details class="accordion"><summary>${q}</summary><p>${a}</p></details>`)
    .join("");
const stats = () =>
  `<div class="stats">${[
    ["4", "Exam pathways"],
    ["120+", "Sample lesson outlines"],
    ["10", "Free practice questions"],
    ["3", "Demo learning roles"],
  ]
    .map(([n, t]) => `<div class="stat"><b>${n}</b><span>${t}</span></div>`)
    .join("")}</div>`;
let categoryGroup = 0;
const categoriesHTML = () => {
  const group = categoryGroup++;
  return `<div class="grid four category-grid">${categories
    .map((c, i) => {
      const image =
        group === 0
          ? {
              image: `enhancements/path-${["banking", "ssc", "railways", "engineering"][i]}`,
              alt: `Adult aspirants preparing for ${c} examinations`,
            }
          : visualFor(
              `pathway-${group}-${c}`,
              i === 3 ? "science" : i === 2 ? "learning" : "study",
            );
      return `<a class="card category-card category-photo" href="${pathwayHref(c)}">
      ${photo(image.image, image.alt, "category-backdrop")}
      <div class="category-content"><span class="icon-box">${icon(["bank", "file", "train", "atom"][i])}</span>
      <h3>${c === "Engineering" ? "Engineering Entrance" : c + " Exams"}</h3>
      <p>${["IBPS • SBI • RBI", "CGL • CHSL • MTS", "NTPC • Group D • ALP", "JEE Main • JEE Advanced"][i]}</p>
      <div class="row between"><span class="category-action">Explore pathway</span>${icon("arrow")}</div></div>
    </a>`;
    })
    .join("")}</div>`;
};
let courseImageIndex = 0;
const courseCard = (c, images = false) => {
  const image = images
    ? { image: c.image, alt: `${c.category} exam aspirant practicing at a study desk` }
    : visualFor(
        `course-card-${courseImageIndex++}-${c.id}`,
        c.id === "engineering" ? "science" : "study",
      );
  return `<article class="card course-card filter-item" data-category="${c.category}" data-search="${c.name.toLowerCase()} ${c.category.toLowerCase()}">
    <div class="course-image-frame">${photo(image.image, image.alt, "card-photo")}</div>
    <div class="card-body"><span class="pill">${c.category.toUpperCase()} · FOUNDATION</span><h3>${c.name}</h3><p>${c.subtitle}</p>
    <div class="card-meta"><span>${c.duration}</span><span>${c.lessons} lessons</span><span>★ ${c.rating} demo</span></div>
    <div class="card-action"><div class="row between"><span class="card-price">₹${c.price.toLocaleString("en-IN")}</span>${link("View course", `course-details.html?course=${c.id}`)}</div></div></div>
  </article>`;
};
const courseGrid = (cover = false) =>
  `<div class="grid four filter-grid">${courses.map((c) => courseCard(c, cover)).join("")}</div><p class="empty" hidden data-empty>No programs match. Try another category or search.</p>`;
const facultyGrid = (portraits = false) =>
  `<div class="grid four filter-grid">${faculty.map((f, i) => `<article class="card filter-item" data-category="${f.subject}" data-search="${f.name.toLowerCase()} ${f.subject.toLowerCase()}">${portraits ? photo(f.image, `Illustrative portrait for fictional faculty ${f.name}`, "portrait") : ""}<div class="card-body"><span class="eyebrow">${f.subject}</span><h3>${f.name}</h3><p>${f.credential}<br>${f.experience} teaching · Demo profile</p><div class="card-action">${link("Meet your mentor", `faculty-details.html?faculty=${f.id}`)}</div></div></article>`).join("")}</div><p class="empty" hidden data-empty>No instructors match this selection.</p>`;
const testimonials = () =>
  `<div class="grid three">${[
    [
      "A clearer plan made my daily preparation feel manageable. The review process helped me see exactly what needed attention.",
      "Priya S.",
      "Banking aspirant",
    ],
    [
      "I stopped rushing through questions and started understanding my mistakes. Each practice session had a purpose.",
      "Karthik R.",
      "SSC aspirant",
    ],
    [
      "Having lessons, notes, and a revision routine together made it easier to stay consistent each week.",
      "Aisha M.",
      "Engineering aspirant",
    ],
  ]
    .map(
      ([q, n, d]) =>
        `<blockquote class="card quote" style="margin:0"><div class="stars" role="img" aria-label="5 out of 5 sample rating">★★★★★</div><p>“${q}”</p><footer><strong>${n}</strong><br>${d} · Fictional demo story</footer></blockquote>`,
    )
    .join("")}</div>`;
const steps = () =>
  `<div class="grid four steps">${[
    ["Choose your goal", "Select your exam and find a preparation path that fits."],
    ["Build your foundation", "Follow structured lessons and make each concept your own."],
    ["Practice with purpose", "Apply what you learn in targeted, timed practice tests."],
    ["Reflect and improve", "Review the details, revisit weak topics, and keep moving."],
  ]
    .map(([t, d]) => `<article class="step"><h3>${t}</h3><p>${d}</p></article>`)
    .join("")}</div>`;
const cta = (title = "Your next chapter starts with one step.", image = false) => {
  const background = visualFor(`cta-${title}`, "campus");
  return section(
    `${photo(background.image, background.alt, "cta-backdrop")}<div class="${image ? "split" : "row between"}"><div><span class="eyebrow">PREPARE WITH PURPOSE</span><h2>${title}</h2><p>Find your direction. Build your confidence. Make progress every day.</p><div class="row">${btn("Start your preparation", "register.html", "light")}${link("Talk to an advisor", "contact.html")}</div></div>${image ? photo("enrollment", "Students collaborating in an open learning space", "cta-supporting") : ""}</div>`,
    "cta cta-photo",
  );
};
const filters = (values, placeholder = "Search programs…") =>
  `<div class="filter-bar"><div class="form-field"><label for="catalog-search">Search</label><input type="search" id="catalog-search" data-filter-search placeholder="${placeholder}"></div><div class="form-field"><label for="catalog-category">Category</label><select id="catalog-category" data-filter-category><option value="All">All categories</option>${values.map((v) => `<option>${v}</option>`).join("")}</select></div></div>`;
const schedule = (root = "") =>
  `<div data-schedule>${sessions.map((s) => `<article class="schedule-row"><div class="row"><div class="date-box">${s.month}<b>${s.day}</b></div><div><h3>${s.title}</h3><p>${s.faculty} · ${s.time} · Demo session</p></div></div><button class="btn secondary small" data-register-session="${s.id}">Reserve a seat</button></article>`).join("")}</div>`;
const table = (headers, rows) =>
  `<div class="table-wrap"><table><thead><tr>${headers.map((h) => `<th scope="col">${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
const testList = (root = "../dashboard/student/") =>
  `<div class="grid three filter-grid">${tests.map((t) => `<article class="card filter-item" data-category="${t.category}" data-search="${t.name.toLowerCase()}"><div class="card-body"><span class="icon-box">${icon("file")}</span><span class="pill">${t.category === "All" ? "FULL-LENGTH DEMO" : t.category.toUpperCase()}</span><h3 style="margin-top:18px">${t.name}</h3><p>${t.questions.length} questions · ${t.minutes} minutes<br>+2 correct · −0.5 incorrect</p><div class="card-action">${btn("View instructions", `${root}test-instructions.html?test=${t.id}`, "secondary")}</div></div></article>`).join("")}</div><p class="empty" hidden data-empty>No tests match this search.</p>`;
const materials = (root = "../") =>
  `<div class="grid three filter-grid">${[
    ["Quantitative Aptitude", "Percentage essentials", "quant-notes.txt"],
    ["Reasoning", "Patterns & logical thinking", "reasoning-notes.txt"],
    ["English", "Grammar revision checklist", "english-notes.txt"],
    ["General Awareness", "Banking fundamentals", "banking-notes.txt"],
  ]
    .map(
      ([c, t, f]) =>
        `<article class="card filter-item" data-category="${c}" data-search="${c.toLowerCase()} ${t.toLowerCase()}"><div class="card-body"><span class="icon-box">${icon("file")}</span><span class="eyebrow">${c}</span><h3>${t}</h3><p>Original sample notes · TXT · Free download</p><div class="card-action"><a class="btn secondary" href="${root}assets/downloads/${f}" download>Download sample ↓</a></div></div></article>`,
    )
    .join("")}</div><p class="empty" hidden data-empty>No resources match your search.</p>`;
const chartCard = (type, title, subtitle = "Illustrative demo data") =>
  `<article class="card chart-card"><h2>${title}</h2><p>${subtitle}</p><div class="chart-box"><canvas data-chart="${type}" role="img" aria-label="${title}. Data table available below."></canvas></div><details><summary>View accessible data table</summary><div data-chart-table="${type}"></div></details></article>`;

function header(active) {
  const navLink = (title, href, cls = "") =>
    `<a class="${cls}" href="${href}" ${href === active || (href === "faculty.html" && active === "faculty-details.html") ? 'aria-current="page"' : ""}>${title}</a>`;
  const dropdown = (title, items, extra = []) => {
    const current =
      items.some(([, href]) => href.split("?")[0] === active) || extra.includes(active);
    return `<details><summary class="${current ? "is-active" : ""}">${title}</summary><div class="dropdown">${items.map(([label, href]) => navLink(label, href)).join("")}</div></details>`;
  };
  return `<div class="announcement">A little progress, every day. Try your first practice test for free. <a href="mock-tests.html">Start practicing →</a></div>
  <header class="site-header"><div class="container header-inner">${brand("../")}
    <button class="drawer-backdrop" data-menu-close aria-label="Close navigation" tabindex="-1" hidden></button><nav class="nav" id="main-nav" aria-label="Main navigation"><div class="drawer-toolbar"><span>Explore Aurevia</span><button class="icon-button" data-menu-close aria-label="Close menu">${icon("close")}</button></div>
      ${dropdown("Home", [
        ["Home Page 1", "index.html"],
        ["Home Page 2", "home-2.html"],
      ])}
      ${navLink("About Us", "about.html")}
      ${dropdown("Courses", [["All Courses", "courses.html"], ...categories.map((c) => [c + " Exams", pathwayHref(c)])], ["course-details.html"])}
      ${navLink("Faculty", "faculty.html")}${navLink("Results", "results.html")}${navLink("Fees", "fees.html")}
      ${dropdown(
        "Resources",
        [
          ["Mock Tests", "mock-tests.html"],
          ["Study Materials", "study-materials.html"],
          ["Previous Year Papers", "previous-papers.html"],
          ["Live Classes", "live-classes.html"],
          ["Blog", "blog.html"],
        ],
        ["blog-details.html"],
      )}
      ${navLink("Contact", "contact.html")}${navLink("Dashboard", "../dashboard/student/index.html", "dashboard-link")}
      ${navLink("Login", "login.html", "btn mobile-login")}
    </nav>
    <div class="header-actions">${themeButton()}${directionButton()}${navLink("Login", "login.html", "btn header-login")}
      <button class="icon-button menu-toggle" aria-label="Toggle navigation" aria-expanded="false" aria-controls="main-nav" data-menu-toggle>${icon("menu")}</button>
    </div>
  </div></header>`;
}
function footer() {
  return `<footer class="site-footer"><div class="container"><div class="footer-grid"><div>${brand("../")}<p>Thoughtful preparation for ambitious minds.<br>One concept, one question, one step forward.</p><div class="socials"><a href="contact.html?channel=linkedin" aria-label="LinkedIn integration information">${icon("linkedin")}</a><a href="contact.html?channel=youtube" aria-label="YouTube integration information">${icon("youtube")}</a><a href="contact.html?channel=instagram" aria-label="Instagram integration information">${icon("instagram")}</a></div></div><div><h3>Find your course</h3><ul>${categories.map((c) => `<li><a href="${pathwayHref(c)}">${c} Exams</a></li>`).join("")}<li><a href="fees.html">Plans & pricing</a></li></ul></div><div><h3>Explore Aurevia</h3><ul>${[
    ["About us", "about.html"],
    ["Our faculty", "faculty.html"],
    ["Mock tests", "mock-tests.html"],
    ["Study materials", "study-materials.html"],
    ["Blog & insights", "blog.html"],
    ["Contact us", "contact.html"],
  ]
    .map(([t, h]) => `<li><a href="${h}">${t}</a></li>`)
    .join(
      "",
    )}</ul></div><div><h3>A little inspiration, in your inbox.</h3><p>Get preparation tips and learning updates.<br>Demo subscription; no email is sent.</p><form data-demo-form="newsletter"><label for="footer-email">Email address</label><div class="form-inline"><input type="email" id="footer-email" placeholder="you@example.com" required><button class="btn" type="submit" aria-label="Subscribe to newsletter">→</button></div><div class="form-status" role="status"></div></form><p>hello@aurevia.example<br>+91 98765 43210 · Contact</p></div></div><div class="footer-bottom"><span>© 2026 Aurevia Academy. All rights reserved.</span></div></div></footer>`;
}
function documentHTML(
  title,
  body,
  { root = "../", dashboard = false, description, canonical } = {},
) {
  body = withFormPlaceholders(body);
  return `<!doctype html>
<html lang="en">
<head>
 <meta charset="UTF-8">
 <meta name="viewport" content="width=device-width, initial-scale=1">
 <title>${title} | Aurevia Academy</title>
 <meta name="description" content="${description || `${title}: explore structured exam preparation, purposeful practice, and thoughtful learning at Aurevia. Front-end demo template.`}">
 <meta property="og:title" content="${title} | Aurevia Academy">
 <meta property="og:description" content="Prepare with purpose. Explore the Aurevia coaching demonstration.">
 <meta property="og:type" content="website">
 <meta property="og:image" content="${root}assets/images/home-one-hero.webp">
 <link rel="canonical" href="https://example.com/aurevia/${canonical || ""}">
 ${dashboard ? '<meta name="robots" content="noindex,nofollow">' : ""}
 <link rel="icon" href="${root}assets/images/favicon.svg" type="image/svg+xml">
 <link rel="apple-touch-icon" href="${root}assets/images/apple-touch-icon.png">
 <script src="${root}assets/js/theme.js"></script>
 <link rel="preload" href="${root}assets/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
 <link rel="stylesheet" href="${root}assets/css/style.css">
 <link rel="stylesheet" href="${root}assets/css/visual-refresh.css">
 <link rel="stylesheet" href="${root}assets/css/app-shell.css">
 <script src="${root}assets/vendor/chart.umd.min.js" defer></script>
 <script type="module" src="${root}assets/js/main.js"></script>
 <script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "WebPage", name: title, description: "Aurevia educational template demonstration" })}</script>
</head>
<body ${dashboard ? 'class="dashboard"' : ""}>
 <a class="skip" href="#main">Skip to main content</a>
 ${body}
 <button class="icon-button back-top" data-back-top aria-label="Back to top">${icon("arrow-up")}</button>
 <div class="toast" role="status" hidden></div>
 <dialog id="app-dialog"><div class="dialog-head"><h2 id="dialog-title">Details</h2><button class="icon-button" data-close-dialog aria-label="Close dialog">${icon("close")}</button></div><div id="dialog-content"></div></dialog>
</body>
</html>`;
}
function writePage(slug, title, content) {
  if (slug === "course-details") {
    const image = visualFor("course-details-hero", "study");
    content = content.replace(
      '<span class="eyebrow" data-course-category>',
      `${photo(image.image, image.alt, "course-detail-photo")}<span class="eyebrow" data-course-category>`,
    );
  }
  const standalone = ["login", "register", "forgot-password", "404", "coming-soon"].includes(slug);
  const shell = standalone
    ? `<div class="standalone-controls" aria-label="Display preferences">${themeButton()}${directionButton()}</div><main id="main" class="standalone-page ${["404", "coming-soon"].includes(slug) ? "status-page" : "account-page"}">${content}</main>`
    : `${header(slug + ".html")}<main id="main">${content}</main>${footer()}`;
  const file = `pages/${slug}.html`;
  fs.writeFileSync(
    file,
    documentHTML(title, markupWithIcons(shell), {
      canonical: file,
    }),
  );
  publicPages.push({ file, title });
  allPages.push(file);
}
const inner = (title, desc, eyebrow = "YOUR NEXT STEP") => {
  const category = /faculty|teaching|mentor/i.test(title + " " + eyebrow)
    ? "teaching"
    : /live|class/i.test(eyebrow)
      ? "learning"
      : /material|paper|journal|legal/i.test(eyebrow)
        ? "library"
        : /pric|plan/i.test(eyebrow)
          ? "planning"
          : "study";
  const preferred = /faculty/i.test(eyebrow)
    ? "mentor-community"
    : /live/i.test(eyebrow)
      ? "live-learning-room"
      : /material/i.test(eyebrow)
        ? "revision-library"
        : /pricing/i.test(eyebrow)
          ? "preparation-planning"
          : /about/i.test(eyebrow)
            ? "campus-community-new"
            : /course catalog/i.test(eyebrow)
              ? "program-overview"
              : "";
  const image = visualFor(`hero-${eyebrow}-${title}`, category, preferred);
  return `<section class="inner-hero inner-hero-visual"><div class="container inner-hero-grid">
    <div class="inner-hero-copy"><div class="breadcrumb"><a href="index.html">Home</a><span>/</span><span>${eyebrow}</span></div>
    <span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p>${desc}</p></div>
    <div class="inner-hero-media">${photo(image.image, image.alt, "", true)}<span class="image-corner">AUREVIA / PREPARE WITH PURPOSE</span></div>
  </div></section>`;
};

/* Home one: exactly ten major content sections. */
writePage(
  "index",
  "Prepare with purpose. Achieve with confidence.",
  `<section class="hero"><div class="container"><div class="split home-hero-grid"><div class="hero-copy inner-hero-copy"><span class="pill">${icon("award")} A BETTER WAY TO PREPARE</span><h1>Big ambitions.<br>Clear direction.<br><em>Your next chapter.</em></h1><p>Expert-led courses, purposeful practice, and a plan that moves you closer to your competitive exam goals.</p><div class="row">${btn("Explore Courses", "courses.html")}${btn("Start a Free Mock Test", "mock-tests.html", "secondary")}</div><div class="row trust"><div class="avatars" aria-hidden="true">${["quant", "reasoning", "english", "physics"].map((subject) => `<span class="avatar-photo" style="background-image:url('../assets/images/faculty-${subject}.webp')"></span>`).join("")}</div><span>Built around your learning journey<br><span class="stars">★★★★★</span> <span>Illustrative student experience</span></span></div></div><div class="hero-image inner-hero-media">${photo("home-one-hero", "Two students preparing competitive examinations together in a bright library", "", true)}<div class="floating-note"><span class="icon-box">${icon("chart")}</span><div><strong>Small steps. Real progress.</strong><span class="muted">Learn → Practice → Improve</span></div></div></div></div><div class="exam-strip"><div class="exam-strip-intro"><span>PREPARATION FOR</span><b>What comes next</b></div><div class="exam-strip-items">${[
    ["bank", "IBPS & SBI"],
    ["file", "SSC CGL & CHSL"],
    ["train", "RRB NTPC"],
    ["atom", "JEE Main & Advanced"],
  ]
    .map(([symbol, label]) => `<div class="exam-strip-item">${icon(symbol)}<b>${label}</b></div>`)
    .join("")}</div></div></div></section>` +
    section(
      head(
        "CHOOSE YOUR DIRECTION",
        "One goal. The right pathway.",
        "Focused preparation for the exam and the future you have in mind.",
      ) + categoriesHTML(),
    ) +
    section(
      head(
        "THE AUREVIA APPROACH",
        "Clarity at every step.",
        "Everything you need to turn good intentions into a consistent preparation routine.",
      ) + features(),
    ) +
    section(
      head(
        "POPULAR PROGRAMS",
        "Your ambition, well supported.",
        "",
        link("Explore all courses", "courses.html"),
      ) + courseGrid(true),
    ) +
    section(
      head(
        "HOW LEARNING HAPPENS",
        "A little better, every day.",
        "A simple, connected process that keeps you moving forward.",
      ) + steps(),
    ) +
    section(
      `<div class="split">${photo("achievement", "Students celebrating a preparation milestone together", "wide-photo")}<div><span class="eyebrow">PROGRESS WORTH CELEBRATING</span><h2>Every milestone begins<br>with showing up.</h2><p>Preparation is personal. We bring structure to the journey so you can focus on the work that matters.</p>${stats()}<span class="demo-label">Platform sample scope. Student results are fictional demonstrations.</span><p style="margin-top:20px">${link("Explore success stories", "results.html")}</p></div></div>`,
    ) +
    section(
      `<div class="split"><div><span class="eyebrow">PRACTICE WITH PERSPECTIVE</span><h2>More than a score.<br>A way forward.</h2><p>Make every mock test a learning opportunity. See what worked, understand what didn’t, and know where to focus next.</p>${checks(["Timed, exam-style practice", "Clear explanations for every answer", "Topic-level insights and progress history"])}${btn("Try the mock test experience", "mock-tests.html")}</div>${photo("mock-experience", "Study notes and focused practice at a desk", "wide-photo")}</div>`,
    ) +
    section(
      head(
        "MEET YOUR MENTORS",
        "Good teachers make a difference.",
        "",
        link("Explore our faculty", "faculty.html"),
      ) + facultyGrid(true),
    ) +
    section(
      head(
        "THE LEARNER PERSPECTIVE",
        "A more confident kind of preparation.",
        "Fictional demo testimonials illustrating the intended learning experience.",
      ) + testimonials(),
    ) +
    cta("A stronger tomorrow starts with today.", true),
);

/* Home two: a different editorial composition and ten sections. */
writePage(
  "home-2",
  "A thoughtful path to your next opportunity",
  `<section class="editorial-hero"><div class="container split home-hero-grid"><div class="inner-hero-copy"><span class="eyebrow">THE PREPARATION JOURNAL / 2026</span><h1>A thoughtful path<br>to your next<br>opportunity.</h1><p>Make room for your ambitions. Discover structured learning, meaningful practice, and the support to keep going.</p>${btn("Find your preparation path", "courses.html")}<hr class="rule"><p class="small">FOUR EXAM PATHWAYS · ONE CONNECTED LEARNING EXPERIENCE</p></div><div class="inner-hero-media">${photo("home-two-hero", "Engineering aspirant working independently in a quiet reading room", "", true)}</div></div></section>` +
    section(head("01 / YOUR DIRECTION", "What are you working toward?") + categoriesHTML()) +
    section(
      head(
        "02 / LEARN TOGETHER",
        "Make space for a live class.",
        "Upcoming illustrative sessions. All times are in India Standard Time.",
      ) + schedule(),
    ) +
    section(
      head("03 / THE PROGRAM EDIT", "Built for the bigger picture.") +
        `<div class="featured-programs">${courses
          .slice(0, 3)
          .map(
            (c, i) =>
              `<article class="program-card"><div class="program-card-top"><span class="icon-box">${icon(["bank", "file", "train"][i])}</span><span class="program-number">0${i + 1}</span></div><span class="eyebrow">${c.category}</span><h3>${c.name}</h3><p>${c.subtitle}</p><div class="program-details"><span>${icon("clock")}${c.duration}</span><span>${icon("book")}${c.lessons} lessons</span></div><div class="program-card-action">${btn("View program", `course-details.html?course=${c.id}`, "secondary")}</div></article>`,
          )
          .join("")}</div>`,
    ) +
    section(
      `<div class="split">${photo("learning-features", "Laptop and notebook for connected online learning", "wide-photo")}<div><span class="eyebrow">04 / A CONNECTED CLASSROOM</span><h2>Learn in a way<br>that stays with you.</h2><p>Pause and reflect. Ask the next question. Turn an explanation into a skill through deliberate practice.</p>${checks(["Lesson notes alongside every concept", "Practice linked to the topics you learn", "An organized space for your preparation"])}${link("Explore the student workspace", "../dashboard/student/index.html")}</div></div>`,
    ) +
    section(
      `<div class="split"><div><span class="eyebrow">05 / YOUR WEEK, CONSIDERED</span><h2>Consistency over intensity.</h2><p>A flexible weekly rhythm gives each part of your preparation the attention it deserves.</p></div><div class="timeline">${[
        ["Monday & Tuesday", "Learn one new concept and work through examples."],
        ["Wednesday & Thursday", "Build fluency with topic-wise practice and notes."],
        ["Friday & Saturday", "Take a timed test and review every response."],
        ["Sunday", "Reflect, revise, and set next week’s priorities."],
      ]
        .map(([t, d]) => `<article><h3>${t}</h3><p>${d}</p></article>`)
        .join("")}</div></div>`,
    ) +
    section(
      head("06 / A CLEARER PICTURE", "Understand your learning patterns.") +
        `<div class="grid two">${chartCard("score", "Your practice, over time")}${chartCard("subjects", "Where your strengths are growing")}</div>`,
    ) +
    section(
      head("07 / PERSONAL MILESTONES", "Progress looks different for everyone.") +
        `<div class="milestone-layout"><article class="quote card milestone-story"><span class="eyebrow">A FICTIONAL LEARNER JOURNEY</span><h3>From scattered notes to a steady routine.</h3><p>Priya built a weekly plan around shorter, focused study sessions and a consistent mock review habit.</p>${link("Read the learning journeys", "results.html")}</article><div class="milestone-scope">${stats()}<p class="demo-label">Sample platform scope; no verified exam outcomes are claimed.</p></div></div>`,
    ) +
    section(
      `<div class="faq-layout"><div class="faq-intro"><span class="eyebrow">08 / GOOD QUESTIONS</span><h2>A few things you might be wondering.</h2><p>Find a little clarity before you take your next step.</p>${link("Talk to our team", "contact.html")}</div><div class="faq-panel">${faqs()}</div></div>`,
    ) +
    section(
      `<div class="learning-cta"><img class="learning-cta-background" src="../assets/images/enhancements/ambition-study.webp" alt="A calm library study desk with books and revision notes" loading="lazy" width="1536" height="1024"><div class="learning-cta-copy"><span class="eyebrow">09 / BEGIN WHERE YOU ARE</span><h2>Give your ambition a little structure.</h2><p>Your goals don’t need to feel far away. Start with one concept and one purposeful step.</p>${btn("Create your learning space", "register.html")}</div></div>`,
    ),
);

writePage(
  "about",
  "A better learning journey, by design",
  inner(
    "A better learning journey, by design.",
    "Aurevia brings thoughtful structure to competitive exam preparation, with clarity at the center of every lesson.",
    "ABOUT AUREVIA",
  ) +
    section(
      `<div class="split">${photo("our-story", "Students learning together on a university campus", "wide-photo")}<div><span class="eyebrow">OUR STORY</span><h2>Good preparation starts with understanding.</h2><p>This demonstration institute was imagined around a simple idea: learners deserve a clear path through a demanding syllabus.</p><div class="timeline"><article><h3>Start with the learner</h3><p>Understand the goal, available time, and starting point.</p></article><article><h3>Build a connected experience</h3><p>Bring teaching, practice, and reflection into one routine.</p></article></div></div></div>`,
    ) +
    section(
      head("OUR COMPASS", "Purpose in everything we do.") +
        `<div class="grid three">${feature("Our mission", "Make structured, understandable exam preparation accessible to every committed learner.", "book")}${feature("Our vision", "A learning experience that builds independence, confidence, and lasting understanding.", "chart")}${feature("Our values", "Clarity in teaching. Honesty in claims. Respect for every learner’s pace.", "people")}</div>`,
    ) +
    section(head("TEACHING METHODOLOGY", "Understanding before memorization.") + steps()) +
    section(
      head("THE TEMPLATE IN NUMBERS", "A foundation for your institution.") +
        stats() +
        notice(
          "Aurevia is a fictional institute in this website template. Replace all sample institute information with your verified history.",
        ),
    ) +
    section(
      head("THE PEOPLE BEHIND THE PURPOSE", "A learning community worth building.") +
        `<div class="grid two">${feature("Academic leadership", "Our demo academic director, Dr. Kavya Rao, coordinates concept-led curricula and consistent assessment. Fictional profile.", "people")}${feature("Join the conversation", "Tell us what you are preparing for and how we can make your journey clearer.", "book")}</div><div class="row section-actions">${btn("Meet our faculty", "faculty.html")}${btn("Contact the team", "contact.html", "secondary")}</div>`,
    ),
);

writePage(
  "courses",
  "Find your preparation program",
  inner(
    "Your goal. Your preparation path.",
    "Explore focused programs designed to bring clarity, structure, and consistency to your exam preparation.",
    "COURSE CATALOG",
  ) +
    section(head("FIND YOUR FOCUS", "Choose an exam pathway.") + categoriesHTML()) +
    section(
      head("EDITOR’S PICK", "A foundation you can build on.") +
        `<div class="split"><div><span class="pill">BANKING FOUNDATION</span><h2 style="margin-top:20px">One complete plan for IBPS & SBI.</h2><p>A six-month journey through quantitative aptitude, reasoning, English, and banking awareness. Start with the basics and build toward timed practice.</p>${btn("Explore Banking Pro", "course-details.html?course=banking")}</div><div class="card panel">${checks(courses[0].syllabus)}<p class="demo-label">Sample curriculum · ₹4,999 demo price</p></div></div>`,
    ) +
    section(
      head("EXPLORE THE CATALOG", "Find what fits your ambition.") +
        filters(categories) +
        courseGrid(),
    ) +
    section(
      head("COMPARE YOUR OPTIONS", "The essentials, side by side.") +
        table(
          ["Program", "Duration", "Lessons", "Demo fee"],
          courses.map((c) => [
            c.name,
            c.duration,
            c.lessons,
            "₹" + c.price.toLocaleString("en-IN"),
          ]),
        ) +
        `<p class="small muted">Each program includes practice tests, sample resources, and progress tracking.</p>`,
    ) +
    cta("A little guidance goes a long way."),
);

buildPathwayPages({ writePage, section, head, icon, btn, checks, feature, courses });

writePage(
  "course-details",
  "Program details & enrollment",
  `<div data-course-details>` +
    section(
      `<div class="breadcrumb"><a href="courses.html">Courses</a><span>/</span><span>Program details</span></div><div class="split"><div><span class="eyebrow" data-course-category>BANKING</span><h1 data-course-name>Banking Pro: IBPS & SBI</h1><p data-course-description>${courses[0].subtitle}</p><p data-course-meta>6 months · 120 lessons · Demo rating 4.8</p></div><aside class="card panel"><span class="eyebrow">YOUR PROGRAM</span><div class="price" data-course-price>₹4,999</div>${checks(["Structured syllabus", "Guided practice & detailed reviews", "Downloadable revision notes"])}<button class="btn" data-enroll>Enroll in this demo course</button><p class="demo-label">No payment is collected. Enrollment is saved on this browser.</p></aside></div>`,
    ) +
    section(
      head("THE LEARNING OUTCOMES", "Understand. Apply. Improve.") +
        `<div class="grid three">${feature("A clear foundation", "Connect core concepts to the question types you will encounter.", "book")}${feature("More deliberate practice", "Build accuracy before increasing your speed under time pressure.", "clock")}${feature("An informed revision plan", "Use your practice results to identify the topics that need another look.", "chart")}</div>`,
    ) +
    section(
      head("THE SYLLABUS", "A roadmap through your preparation.") +
        `<div data-course-syllabus>${faqs(courses[0].syllabus.map((t) => [t, "Concept lessons, worked examples, independent practice, and a focused revision checklist."]))}</div>`,
    ) +
    section(
      head("YOUR ACADEMIC SUPPORT", "Learn from patient, purposeful teachers.") +
        `<div class="grid two">${feature("Concept-led teaching", "Worked examples make the reasoning visible before independent practice begins.", "people")}${feature("A regular review rhythm", "Bring questions to the scheduled demo sessions and revisit lesson summaries.", "check")}</div>${link("Meet the faculty", "faculty.html")}`,
    ) +
    section(
      head("YOUR LEARNING RHYTHM", "A plan that fits your week.") +
        table(
          ["Activity", "Recommended rhythm", "Format"],
          [
            ["Concept lessons", "3 sessions / week", "Lesson outlines"],
            ["Practice", "30 minutes / day", "Timed question sets"],
            ["Revision", "Every Sunday", "Notes & answer analysis"],
          ],
        ),
    ) +
    section(
      head("BEFORE YOU BEGIN", "Make an informed next step.") +
        faqs() +
        notice(
          "Sample learner feedback: “A structured syllabus made my next step clearer.” — Fictional demo learner.",
        ) +
        btn("Create your account", "register.html"),
    ) +
    `</div>`,
);

writePage(
  "faculty",
  "Meet your mentors",
  inner(
    "Good teaching makes room for understanding.",
    "Meet the fictional demo mentors behind our academic approach. Stock portraits illustrate profiles and do not imply endorsement.",
    "OUR FACULTY",
  ) +
    section(
      `<div class="teaching-intro"><div class="teaching-intro-heading"><span class="icon-box">${icon("people")}</span><span class="eyebrow">A SHARED APPROACH</span><h2>Patient explanations. Purposeful practice.</h2></div><div class="teaching-intro-copy"><p>Great teaching helps you understand how an answer is reached. Our sample faculty profiles show how an institute can introduce subject expertise, qualifications, and teaching style with clarity.</p><div class="teaching-signature">${icon("book")} Learn with clarity <span aria-hidden="true">/</span> Practice with purpose</div></div></div>`,
    ) +
    section(
      head("THE FACULTY DIRECTORY", "Find your subject specialist.") +
        filters(
          faculty.map((f) => f.subject),
          "Search a mentor or subject…",
        ) +
        facultyGrid(),
    ) +
    section(
      head("ACROSS THE SYLLABUS", "Depth where it matters.") +
        `<div class="grid four subject-collection">${faculty.map((f, i) => `<article class="subject-card">${photo(`enhancements/subject-${["quantitative", "reasoning", "english", "physics"][i]}-new`, ["Mathematics workbook and calculator for quantitative aptitude", "Geometric puzzle blocks for logical reasoning", "Literature books and fountain pen for English study", "Optics prism and circuit model for physics learning"][i], "subject-card-background")}<div class="subject-card-copy"><span class="subject-icon">${icon(["chart", "grid", "book", "atom"][i])}</span><h3>${f.subject}</h3><p>${f.credential}</p><span class="subject-experience">${f.experience} teaching experience</span><span class="subject-demo">Illustrative faculty profile</span></div></article>`).join("")}</div>`,
    ) +
    section(
      `<div class="split principle-layout"><div class="principle-heading"><span class="icon-box">${icon("book")}</span><span class="eyebrow">OUR TEACHING PHILOSOPHY</span><h2>The best explanation makes the next question easier.</h2></div><div>${checks(["Explain the reasoning, not just the rule", "Use examples that build in difficulty", "Leave room for questions and reflection", "Use assessment to guide the next lesson"])}</div></div>`,
    ) +
    cta("Meet your mentor in a live session."),
);

writePage(
  "faculty-details",
  "Instructor profile",
  inner(
    "Ananya Sharma",
    "A patient, concept-first approach to quantitative aptitude. All faculty identities and credentials are fictional demo content.",
    "FACULTY PROFILE",
  ) +
    section(
      `<div data-faculty-profile><span class="eyebrow" data-faculty-subject>QUANTITATIVE APTITUDE</span><h2 data-faculty-name>Ananya Sharma</h2><p data-faculty-bio>${faculty[0].bio}</p><p data-faculty-credential>${faculty[0].credential} · ${faculty[0].experience} teaching</p></div>`,
    ) +
    section(
      head("THE SUBJECT LENS", "From first principles to fluent practice.") +
        `<div class="grid three">${feature("Conceptual foundations", "Build confidence with a clear explanation and simple examples.", "book")}${feature("Exam applications", "Understand how a concept appears across different question types.", "file")}${feature("Reflective practice", "Use an error log to turn mistakes into useful learning signals.", "chart")}</div>`,
    ) +
    section(
      head("PROGRAMS & CLASSES", "A structured home for your learning.") + courseGrid(false),
    ) +
    section(
      head("LEARN TOGETHER", "Upcoming sessions & learner feedback.") +
        notice(
          "“Clear explanations helped me approach practice more calmly.” — Fictional demo learner.",
        ) +
        schedule(),
    ),
);

writePage(
  "results",
  "Learning journeys & sample results",
  inner(
    "Every journey has its turning points.",
    "Explore illustrative learner journeys and fictional results. These are demonstration profiles, not verified academic outcomes.",
    "SAMPLE RESULTS",
  ) +
    section(
      head("AN HONEST PICTURE", "Illustrative achievements.") +
        notice(
          "All ranks, scores, names, and testimonials below are fictional demo data. No real student achievement is claimed.",
        ) +
        `<div class="stats">${[
          ["86%", "Demo highest score"],
          ["78%", "Demo average accuracy"],
          ["24", "Demo practice attempts"],
          ["12", "Demo weeks of preparation"],
        ]
          .map(([n, t]) => `<div class="stat"><b>${n}</b><span>${t}</span></div>`)
          .join("")}</div>`,
    ) +
    section(
      head("EXAM-WISE JOURNEYS", "Different goals. Shared determination.") + categoriesHTML(),
    ) +
    section(
      head("FICTIONAL STUDENT PROFILES", "The people behind the practice.") +
        table(
          ["Demo learner", "Pathway", "Illustrative result"],
          [
            ["Priya S.", "Banking", "86% practice score"],
            ["Karthik R.", "SSC", "82% practice score"],
            ["Aisha M.", "Engineering", "84% practice score"],
          ],
        ),
    ) +
    section(
      `<div class="split"><div><span class="eyebrow">A FICTIONAL PREPARATION STORY</span><h2>One notebook.<br>A different approach.</h2><p>Karthik began recording why he missed each question. After every mock, he grouped the mistakes by topic and gave the most common ones another focused session.</p></div><div class="timeline"><article><h3>Week 1: Find a starting point</h3><p>A baseline practice test identified the biggest gaps.</p></article><article><h3>Week 6: Build a routine</h3><p>Short daily sessions became easier to maintain.</p></article><article><h3>Week 12: Reflect on progress</h3><p>Consistent review made the next steps clearer.</p></article></div></div>`,
    ) +
    section(
      head("ILLUSTRATIVE LEARNER VOICES", "Confidence grows with understanding.") +
        testimonials() +
        `<div class="row" style="margin-top:30px">${btn("Start your own journey", "register.html")}</div>`,
    ),
);

writePage(
  "fees",
  "Clear plans for purposeful preparation",
  inner(
    "An investment in your next chapter.",
    "Transparent sample pricing. Choose a preparation plan that fits your needs. No real transactions are processed.",
    "PLANS & PRICING",
  ) +
    section(head("CHOOSE YOUR FOCUS", "Four pathways. The same care.") + categoriesHTML()) +
    section(
      head("SIMPLE DEMO PLANS", "Room for every starting point.") +
        `<div class="tabs" aria-label="Pricing period"><button class="tab active" data-price-period="standard" aria-pressed="true">Standard fee</button><button class="tab" data-price-period="scholarship" aria-pressed="false">Demo scholarship · 20% off</button></div><div class="grid three">${[
          ["Essentials", 1999, ["Sample notes library", "Topic-wise practice", "Progress history"]],
          [
            "Complete",
            4999,
            [
              "Everything in Essentials",
              "Complete lesson roadmap",
              "Demo live class reservations",
              "Detailed answer insights",
            ],
          ],
          [
            "Mentored",
            7999,
            [
              "Everything in Complete",
              "Demo mentoring request",
              "Personal study plan outline",
              "Priority demo support",
            ],
          ],
        ]
          .map(
            ([t, p, l], i) =>
              `<article class="card pricing-card ${i === 1 ? "featured" : ""}"><span class="eyebrow">${i === 1 ? "THE COMPLETE EXPERIENCE" : "YOUR PREPARATION"}</span><h3>${t}</h3><div class="price">₹<span data-price="${p}">${p.toLocaleString("en-IN")}</span><small> / program</small></div>${checks(l)}<p class="demo-label">Illustrative fee. No payment collected.</p>${btn("Choose " + t, `register.html?plan=${t}`, i === 1 ? "teal" : "secondary")}</article>`,
          )
          .join("")}</div>`,
    ) +
    section(
      head("THE DETAILS", "Know what your plan includes.") +
        table(
          ["Feature", "Essentials", "Complete", "Mentored"],
          [
            ["Sample study notes", "Included", "Included", "Included"],
            ["Test analytics", "Included", "Included", "Included"],
            ["Lesson roadmap", "—", "Included", "Included"],
            ["Mentoring request", "—", "—", "Demo request"],
          ],
        ),
    ) +
    section(
      `<div class="split"><div><span class="eyebrow">A LITTLE EXTRA SUPPORT</span><h2>Ambition should have room to grow.</h2><p>Use this section to explain your verified scholarship and installment policies. The selector above demonstrates a sample 20% reduction.</p></div><div class="card panel"><h3>Discuss your options</h3><p>Scholarship eligibility and installment terms must be configured by your institution before launch.</p>${btn("Talk to an advisor", "contact.html", "secondary")}</div></div>`,
    ) +
    section(
      `<div class="faq-layout pricing-faq"><div class="pricing-faq-intro"><span class="icon-box">${icon("file")}</span><span class="eyebrow">YOUR PRICING QUESTIONS</span><h2>Make the choice with clarity.</h2><p>Understand the sample plans, scholarship preview, and next steps before choosing your preparation path.</p>${link("Talk to an advisor", "contact.html")}</div><div class="faq-panel">` +
        faqs([
          [
            "Is the fee charged on this website?",
            "No. All prices are illustrative. Checkout and payment processing require a secure provider integration.",
          ],
          [
            "How does the scholarship preview work?",
            "Select the demo scholarship tab to view a sample 20% discount. This is not an offer or eligibility decision.",
          ],
          [
            "Can I upgrade later?",
            "Your institution can define upgrade, cancellation, and refund terms before production deployment.",
          ],
        ]) +
        `</div></div>`,
    ),
);

writePage(
  "mock-tests",
  "Practice with perspective",
  inner(
    "A practice test. A clearer next step.",
    "Try a real front-end demonstration with timed questions, negative marking, answer explanations, and local progress history.",
    "MOCK TESTS",
  ) +
    section(
      head("PRACTICE YOUR WAY", "Focused sets or a complete warm-up.") +
        `<div class="grid three">${feature("Subject-wise sets", "Focus on one area and build fluency with shorter practice sessions.", "book")}${feature("Foundation readiness", "A ten-question demonstration across four core subjects.", "file")}${feature("Reflective review", "Review correct answers, explanations, topics, and time spent.", "chart")}</div>`,
    ) +
    section(
      head("TARGET YOUR PRACTICE", "Choose a subject-wise test.") +
        filters(categories, "Search practice tests…") +
        testList(),
    ) +
    section(
      head("THE COMPLETE DEMO", "Start with a foundation readiness test.") +
        notice(
          "10 questions · 10 minutes · +2 correct · −0.5 incorrect · 0 unattempted. Demo content is not an official exam paper.",
        ) +
        btn(
          "Read test instructions",
          "../dashboard/student/test-instructions.html?test=foundation",
        ),
    ) +
    section(
      `<div class="split"><div><span class="eyebrow">THE REVIEW IS PART OF THE PRACTICE</span><h2>Understand what your score is telling you.</h2>${checks(["See correct, incorrect, and unattempted counts", "Explore topic-level performance", "Review time spent on each question"])}</div>${chartCard("accuracy", "A sample answer breakdown")}</div>`,
    ) +
    section(
      `<div class="faq-layout practice-faq"><div class="practice-faq-intro"><span class="icon-box">${icon("clock")}</span><span class="eyebrow">BEFORE YOU START</span><h2>Make your practice count.</h2><p>Set aside a focused study session, understand how your attempt is saved, and make time to review your answers.</p>${btn("Open your student workspace", "../dashboard/student/index.html")}</div><div class="faq-panel">` +
        faqs([
          [
            "How should I use a mock test?",
            "Choose a quiet time, follow the timer, and reserve time afterward to review every response.",
          ],
          [
            "Where is my attempt stored?",
            "This browser stores demo attempts in localStorage. It is not secure exam storage and is not shared across devices.",
          ],
          [
            "What happens when time runs out?",
            "The test automatically submits your saved responses and calculates the score using the stated negative marking.",
          ],
        ]) +
        `</div></div>`,
    ),
);

writePage(
  "study-materials",
  "Notes for a stronger foundation",
  inner(
    "Keep the essentials close.",
    "Original sample notes and revision checklists for deliberate, focused practice. Free downloads are clearly labeled demonstration files.",
    "STUDY MATERIALS",
  ) +
    section(
      head("FIND YOUR NEXT READ", "Search the resource library.") +
        filters(
          ["Quantitative Aptitude", "Reasoning", "English", "General Awareness"],
          "Search notes or subjects…",
        ),
    ) +
    section(head("THE NOTES SHELF", "Useful ideas, ready to revisit.") + materials()) +
    section(head("MAKE IT YOUR OWN", "A more useful revision routine.") + steps()) +
    section(
      head("KEEP LEARNING", "Connect your notes to practice.") +
        `<div class="grid two">${feature("Test the concept", "Use a short practice set to check what you can recall without the notes.", "file")}${feature("Review the reasoning", "Compare your solution with the explanation and add one useful insight to your error log.", "chart")}</div><div class="row section-actions">${btn("Explore practice tests", "mock-tests.html")}</div>`,
    ),
);

writePage(
  "previous-papers",
  "Previous-year paper resource directory",
  inner(
    "Learn from the shape of the exam.",
    "A demonstration paper directory with original sample questions. Downloads are not official previous-year papers.",
    "PAPER DIRECTORY",
  ) +
    section(
      head("YEAR-WISE DIRECTORY", "A structured place for your papers.") +
        `<div data-paper-directory>${table(
          ["Exam", "Year label", "Resource"],
          categories.flatMap((c) =>
            [2025, 2024].map((y) => [
              c,
              y + " · Demo directory entry",
              `<a class="text-link" href="../assets/downloads/sample-paper.txt" download>Original sample only ↓</a>`,
            ]),
          ),
        )}</div>`,
    ) +
    section(
      head("KNOW WHAT YOU DOWNLOAD", "An honest sample, with worked answers.") +
        notice(
          "The downloadable TXT file contains original educational sample questions and an answer key. It does not reproduce or claim to be an official exam paper.",
        ) +
        btn("Download the original sample", "../assets/downloads/sample-paper.txt", "secondary"),
    ) +
    section(
      head("A BETTER WAY TO REVIEW", "Look for patterns, then practice.") +
        `<div class="grid three">${feature("Map the syllabus", "Group question types by the topics they assess.", "book")}${feature("Notice the balance", "Observe the mix of concepts and the time each needs.", "clock")}${feature("Make a revision list", "Turn recurring mistakes into specific practice goals.", "check")}</div>`,
    ),
);

writePage(
  "live-classes",
  "A classroom wherever you learn",
  inner(
    "Learn together. Move forward.",
    "Explore illustrative live sessions led by fictional faculty. Reservation buttons save a browser-local demo registration.",
    "LIVE CLASSES",
  ) +
    section(
      head("ON THE LEARNING CALENDAR", "Your next live session.") +
        notice(
          "Demo dates: 28–30 October 2026. All times are IST (UTC+05:30). No live meeting service is connected.",
        ) +
        schedule(),
    ) +
    section(
      head("YOUR PREFERRED VIEW", "Plan a little learning time.") +
        `<div class="tabs"><button class="tab active" data-schedule-view="list" aria-pressed="true">List view</button><button class="tab" data-schedule-view="calendar" aria-pressed="false">Date cards</button></div><div class="notice">Switch views to rearrange the session schedule above.</div>`,
    ) +
    section(
      `<div class="split">${photo("live-class", "Collaborative group learning in a modern shared classroom", "wide-photo")}<div><span class="eyebrow">THE SESSION SPOTLIGHT</span><h2>Percentages, from the ground up.</h2><p>Join fictional mentor Ananya Sharma for a concept-first workshop. Work through a question, compare approaches, and take a clear practice task away.</p><button class="btn" data-register-session="s1">Reserve a demo seat</button></div></div>`,
    ) +
    section(head("HOW IT WORKS", "A little preparation goes a long way.") + steps()) +
    cta("Make your next question a good one."),
);

const articleCard = (a, withPhoto = true) =>
  `<article class="card article-card filter-item" data-category="${a.category}" data-search="${a.title.toLowerCase()} ${a.excerpt.toLowerCase()}">${withPhoto ? photo(a.image, a.title, "card-photo") : ""}<div class="card-body"><span class="eyebrow">${a.category} / ${a.minutes} MIN READ</span><h3>${a.title}</h3><p>${a.excerpt}</p><div class="card-action">${link("Read the story", `blog-details.html?article=${a.id}`)}</div></div></article>`;
writePage(
  "blog",
  "The preparation journal",
  inner(
    "Ideas for the way you learn.",
    "Thoughtful reading on study habits, exam strategy, and building a preparation routine that lasts.",
    "THE PREPARATION JOURNAL",
  ) +
    section(
      head("THE FEATURED READ", "A little structure changes a lot.") +
        `<div class="split"><div><span class="eyebrow">STRATEGY / 6 MIN READ</span><h2>${articles[0].title}</h2><p>${articles[0].excerpt}</p>${btn("Read the journal", "blog-details.html?article=study-plan")}</div><div class="timeline"><article><h3>Start with your week</h3><p>Work with the time you have, then build from there.</p></article><article><h3>Leave room for revision</h3><p>A plan is only useful when you can return to it.</p></article></div></div>`,
    ) +
    section(
      head("FIND SOMETHING USEFUL", "Explore by topic.") +
        filters(["Strategy", "Quantitative Aptitude", "General Awareness"], "Search the journal…"),
    ) +
    section(
      head("FROM THE JOURNAL", "Read. Reflect. Try something new.") +
        `<div class="grid four filter-grid">${articles.map((a) => articleCard(a)).join("")}</div><p class="empty" hidden data-empty>No articles match your search.</p>`,
    ) +
    section(
      `<div class="reading"><span class="eyebrow">A NOTE FOR YOUR INBOX</span><h2>A little direction, now and then.</h2><p>Demo newsletter. No messages are sent and your address is not uploaded.</p><form data-demo-form="newsletter"><label for="journal-email">Email address</label><div class="form-inline"><input id="journal-email" type="email" required placeholder="you@example.com"><button class="btn">Subscribe</button></div><div class="form-status" role="status"></div></form></div>`,
    ),
);

writePage(
  "blog-details",
  "A practical preparation journal article",
  inner(
    "A study plan you can actually stay with",
    "A practical guide to making your preparation routine clear, realistic, and repeatable.",
    "STRATEGY / JOURNAL",
  ) +
    section(
      photo("article-feature", "A reader selecting a book from a library shelf", "wide-photo") +
        `<p class="small muted" style="margin-top:16px">Aurevia Editorial · <span data-article-date>22 October 2026</span> · <span data-article-minutes>6</span> minute read</p>`,
    ) +
    section(
      `<article class="reading" data-article-body><span class="eyebrow">PREPARE WITH PURPOSE</span><h2 data-article-heading>Make the plan fit the life you have.</h2><p data-article-intro>A useful study plan begins with an honest look at your week. Before counting chapters, notice when you have time, energy, and a quiet place to work.</p><h2>01. Choose one clear priority</h2><p>Review the syllabus and take a short baseline test. Pick one topic you can improve this week. Write the outcome in practical terms: “I can solve basic percentage questions without notes.”</p><h2>02. Give practice a place</h2><p>Alternate learning with recall. After a lesson, close your notes and try a small question set. Record the reason for each mistake: a concept gap, a calculation, or a missed instruction.</p><h2>03. Make revision part of the plan</h2><p>Leave one session for reviewing earlier work. Revisit the questions you found difficult and explain the solution aloud. Understanding the reasoning is more useful than recognizing the answer.</p><h2>04. Review the routine itself</h2><p>At the end of the week, notice what you completed and what got in the way. Reduce an unrealistic target, protect a useful study slot, and choose the next small priority. A sustainable plan can change with you.</p><blockquote class="notice">A good week of preparation gives you something specific to understand, practice, and revisit.</blockquote></article>`,
    ) +
    section(
      `<div class="reading"><span class="eyebrow">ABOUT THE AUTHOR</span><h2>Aurevia Editorial</h2><p>Original sample educational writing for the Aurevia template. General study guidance, not an official examination announcement.</p><button class="btn secondary" data-share>Copy article link</button></div>`,
    ) +
    section(
      head("KEEP READING", "A few more useful ideas.") +
        `<div class="grid three">${articles
          .slice(1)
          .map((a) => articleCard(a, false))
          .join("")}</div>`,
    ),
);

writePage(
  "contact",
  "Let’s find your next step",
  inner(
    "A good question is a good beginning.",
    "Tell us what you are preparing for. This demonstration form validates your details and displays a local confirmation.",
    "CONTACT AUREVIA",
  ) +
    section(
      `<div class="grid three">${feature("Write to us", "hello@aurevia.example — sample address, not a monitored inbox.", "file")}${feature("Talk it through", "+91 98765 43210 — replace with your institute’s verified number.", "people")}${feature("Find your time", "Demo office hours: Monday–Saturday, 9:00–18:00 IST.", "clock")}</div>`,
    ) +
    section(
      `<div class="split contact-layout"><div class="contact-intro"><span class="icon-box">${icon("people")}</span><span class="eyebrow">LET’S TALK ABOUT YOUR GOALS</span><h2>A little guidance can make the next step clearer.</h2><p>Choose your exam interest and leave a message. Nothing is transmitted; connect a form service before production use.</p><div class="contact-detail"><span class="icon-box">${icon("book")}</span><div><h3>Your next chapter starts with a conversation.</h3><p>Course guidance · Exam pathways · Learning resources</p></div></div></div><form class="contact-form-panel" data-demo-form="contact"><span class="eyebrow">SEND AN ENQUIRY</span><h3>Tell us what you’re preparing for.</h3><div class="grid two"><div class="form-field"><label for="contact-name">Full name</label><input id="contact-name" name="name" required minlength="2" autocomplete="name"></div><div class="form-field"><label for="contact-email">Email address</label><input id="contact-email" name="email" type="email" autocomplete="email" required></div></div><div class="form-field"><label for="contact-interest">Exam interest</label><select id="contact-interest" name="interest" required><option value="" disabled selected>Choose your exam interest</option>${categories.map((c) => `<option>${c}</option>`).join("")}</select></div><div class="form-field"><label for="contact-message">How can we help?</label><textarea id="contact-message" name="message" required minlength="10"></textarea></div><button class="btn">Send demo enquiry</button><div class="form-status" role="status"></div></form></div>`,
    ) +
    section(
      head("OUR LEARNING SPACE", "Put your institute on the map.") +
        `<div class="location-layout"><div class="location-info"><span class="icon-box">${icon("grid")}</span><span class="eyebrow">SAMPLE LOCATION</span><h3>Find us in New Delhi.</h3><address>Connaught Place<br>New Delhi, Delhi 110001<br>India</address><p>This real map shows a sample location for the website, not a verified Aurevia campus.</p><a class="btn secondary" href="https://www.google.com/maps/search/?api=1&amp;query=Connaught+Place+New+Delhi+110001" target="_blank" rel="noopener noreferrer">Open in Google Maps ${icon("arrow-up-right")}</a></div><div class="live-map"><iframe title="Map of the sample location in Connaught Place, New Delhi" src="https://maps.google.com/maps?q=Connaught%20Place%2C%20New%20Delhi%20110001&amp;t=&amp;z=15&amp;ie=UTF8&amp;iwloc=&amp;output=embed" loading="eager" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div></div>`,
    ) +
    section(
      head("A LITTLE MORE INFORMATION", "Before you get in touch.") +
        faqs([
          [
            "Will this form send a message?",
            "No. This front-end demo validates the form and shows a confirmation. Connect a backend or form provider before launch.",
          ],
          [
            "Where can I try the learning experience?",
            "Open the Login page and choose student, instructor, or admin demo access.",
          ],
          [
            "Where are the social profiles?",
            "Social buttons currently route to this integration information page. Replace them with verified profile URLs.",
          ],
        ]),
    ),
);

function authForm(type) {
  const register = type === "register",
    forgot = type === "forgot-password";
  return `<form data-auth="${type}">${register ? '<div class="form-field"><label for="full-name">Full name</label><input id="full-name" name="name" autocomplete="name" required minlength="2"></div>' : ""}<div class="form-field"><label for="email">Email address</label><input id="email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required></div>${!forgot ? `<div class="form-field"><label for="password">Password</label><div class="password-wrap"><input id="password" name="password" type="password" minlength="${register ? 8 : 1}" autocomplete="${register ? "new-password" : "current-password"}" required><button type="button" data-password-toggle="password" aria-label="Show password">Show</button></div></div>` : ""}${register ? `<div class="form-field"><label for="confirm-password">Confirm password</label><input id="confirm-password" name="confirm" type="password" autocomplete="new-password" required></div><div class="form-field"><label for="interest">Exam interest</label><select name="interest" id="interest" required><option value="" disabled selected>Choose your exam interest</option>${categories.map((c) => `<option>${c}</option>`).join("")}</select></div><label class="row"><input type="checkbox" required><span>I accept the <a class="text-link" href="terms.html">sample terms</a>.</span></label>` : !forgot ? `<div class="row between" style="margin-bottom:20px"><label class="row"><input name="remember" type="checkbox"> Remember demo role</label><a class="text-link" href="forgot-password.html">Forgot password?</a></div><div class="form-field"><label for="role">Demo workspace</label><select id="role" name="role"><option value="student">Student</option><option value="instructor">Instructor</option><option value="admin">Admin</option></select></div>` : ""}<button class="btn" type="submit">${register ? "Create demo account" : forgot ? "Request demo reset" : "Enter demo workspace"}</button><div class="form-status" role="status"></div></form>`;
}
for (const [slug, title, desc, img] of [
  ["login", "Welcome back.", "A little progress starts with showing up.", "auth-login"],
  [
    "register",
    "Your next chapter starts here.",
    "Create a local demo profile and explore your learning space.",
    "auth-register",
  ],
  [
    "forgot-password",
    "Let’s get you back on track.",
    "Enter your email to preview the password recovery experience.",
    "auth-recovery",
  ],
]) {
  writePage(
    slug,
    title,
    `<section><div class="container auth-layout"><div class="auth-art">${brand("../")}${photo(img, "Books and a calm academic study environment")}<span class="eyebrow">PREPARE WITH PURPOSE</span><h2>Good things begin<br>with a clear direction.</h2><p>A connected space for your ambition, practice, and progress.</p><div class="auth-benefits">${checks(slug === "register" ? ["Build your personal preparation roadmap", "Keep lessons, notes, and practice together", "Track the small steps that move you forward"] : ["Pick up where your last lesson ended", "Review your practice and topic insights", "Keep your preparation in one place"])}</div><div class="auth-art-note"><span class="eyebrow">LEARN. PRACTICE. REFLECT.</span><p>One concept understood. One question solved. One step closer to your next chapter.</p><strong>Your ambition, with a little more direction.</strong></div></div><div class="auth-panel"><span class="eyebrow">${slug === "login" ? "YOUR LEARNING SPACE" : "A FRESH START"}</span><h1 style="font-size:34px">${title}</h1><p>${desc}</p><p class="demo-label">Demo access only. Passwords are never stored. No real authentication or recovery email service is connected.</p>${authForm(slug)}<hr class="rule"><p class="small">${slug === "register" ? "Already have a profile?" : "New to Aurevia?"} <a class="text-link" href="${slug === "register" ? "login" : "register"}.html">${slug === "register" ? "Log in" : "Create a demo account"}</a></p>${slug === "login" ? `<div class="row">${["student", "instructor", "admin"].map((r) => `<button class="tab" data-demo-role="${r}">${r[0].toUpperCase() + r.slice(1)} demo →</button>`).join("")}</div>` : slug === "register" ? "" : `<a class="text-link" href="login.html">Back to login</a>`}</div></div></section>`,
  );
}
writePage(
  "404",
  "Page not found",
  `<section class="status-split"><div class="status-copy">${brand("../")}<div class="status-code" aria-hidden="true">404</div><h1>A small detour.<br>A clear way back.</h1><p>The page you’re looking for has moved or doesn’t exist. Your next learning step is still within reach.</p><div class="row status-actions">${btn("Go home", "index.html")}${btn("Explore courses", "courses.html", "secondary")}</div>${link("Need a little guidance? Contact us", "contact.html")}</div><div class="status-visual status-error-visual">${photo("enhancements/status-404-new", "An open book in a quiet library with a bright doorway", "status-photo", true)}<div class="status-caption"><span class="icon-box">${icon("book")}</span><h2>Find your next chapter.</h2><p>Return to your learning space and keep moving toward what comes next.</p></div></div></section>`,
);
writePage(
  "coming-soon",
  "A new chapter is on its way",
  `<section class="status-split"><div class="status-copy">${brand("../")}<span class="pill">COMING SOON</span><h1>A new chapter.<br>More possibilities.</h1><p>We’re preparing a thoughtful new learning experience. Make a little room for what comes next.</p><div class="launch-milestones"><div>${icon("book")}<span>Focused lessons</span></div><div>${icon("chart")}<span>Purposeful practice</span></div><div>${icon("people")}<span>Connected support</span></div></div><form data-demo-form="newsletter"><label for="coming-email">Email address</label><div class="form-inline"><input id="coming-email" type="email" required placeholder="you@example.com"><button class="btn">Keep me posted</button></div><div class="form-status" role="status"></div></form><p class="demo-label">Demo interest form. No email is sent.</p>${link("Explore the current learning experience", "index.html")}</div><div class="status-visual status-launch-visual">${photo("enhancements/status-coming-new", "A bright academic learning studio prepared for a new chapter", "status-photo", true)}<div class="status-caption"><span class="eyebrow">SOMETHING GOOD IS TAKING SHAPE</span><h2>A clearer path to your ambitions.</h2><p>Learn at your pace, practice with purpose, and build a routine that stays with you.</p></div></div></section>`,
);
for (const [slug, title, blocks] of [
  [
    "privacy",
    "Privacy Policy",
    [
      [
        "About this sample policy",
        "This document is template content requiring legal customization. Replace it with an accurate policy for your organization, jurisdiction, services, and data practices before production use.",
      ],
      [
        "Information in this demonstration",
        "Profile names, exam interest, local test responses, results, preferences, reservations, and local management edits may be stored in your browser. Passwords are never retained. Forms do not transmit messages.",
      ],
      [
        "Local storage and controls",
        "Theme and layout choices remain on this browser. The student Settings page can clear learning history. Browser settings can remove all local site data. Local storage is not secure or suitable for confidential records.",
      ],
      [
        "Third-party resources",
        "The distributed site includes local fonts, Chart.js, original generated assets, and downloaded illustrative photographs. No analytics or advertising service is configured.",
      ],
      [
        "Production requirements",
        "Document your lawful basis, retention periods, processors, user rights, security controls, children’s data practices, and privacy contact after legal review.",
      ],
    ],
  ],
  [
    "terms",
    "Terms & Conditions",
    [
      [
        "About these sample terms",
        "This is template content requiring legal customization. It is not a complete or jurisdiction-specific agreement. Obtain appropriate review before using it with real learners.",
      ],
      [
        "Demonstration service",
        "Programs, faculty, testimonials, prices, schedules, accounts, transactions, and academic results are illustrative. No real course delivery, payment collection, identity verification, or official assessment is provided.",
      ],
      [
        "Educational use",
        "Original sample questions and notes are supplied for demonstration and practice. They are not official examination materials or a guarantee of selection or academic outcomes.",
      ],
      [
        "Accounts and transactions",
        "Role access is a front-end demonstration. Production authentication, access control, purchases, refunds, and instructor delivery require backend integrations and institution-specific policies.",
      ],
      [
        "Content and acceptable use",
        "Respect source licenses and replace sample claims with verified information. Define your intellectual property terms, conduct standards, limitations, cancellation terms, and dispute process before launch.",
      ],
    ],
  ],
])
  writePage(
    slug,
    title,
    inner(title, "Sample template content requiring legal customization.", "LEGAL / SAMPLE") +
      blocks
        .map(([t, d]) => section(`<div class="reading"><h2>${t}</h2><p>${d}</p></div>`))
        .join(""),
  );

/* Dashboard pages are usable static shells with role-specific content modules. */
for (const [role, items] of Object.entries(rolePages)) {
  for (const [slug, title] of items) {
    const sidebar = `<aside class="sidebar" id="dashboard-nav">${brand("../../")}<div class="sidebar-label">${role} workspace · demo</div><nav aria-label="${role} navigation">${items.map(([s, t], i) => `<a href="${s}.html" ${s === slug ? 'aria-current="page"' : ""}>${icon(["grid", "book", "file", "chart", "clock", "people"][i % 6])}${t}</a>`).join("")}</nav><div class="sidebar-bottom"><nav><a href="../../pages/index.html">${icon("arrow")}Back to website</a><a href="../../pages/login.html" data-logout>${icon("people")}Switch demo role</a></nav></div></aside>`;
    const body = `${sidebar}<div class="dashboard-shell"><header class="dash-top"><div class="row"><button class="icon-button menu-toggle" data-sidebar-toggle aria-label="Toggle dashboard navigation" aria-controls="dashboard-nav" aria-expanded="false">${icon("menu")}</button><span class="small muted">${role[0].toUpperCase() + role.slice(1)} workspace <span class="pill">DEMO</span></span></div><div class="row">${themeButton()}${directionButton()}<a href="${role === "instructor" ? "announcements" : "notifications"}.html" class="icon-button" aria-label="Notifications">${icon("bell")}</a><a href="profile.html" class="row"><span class="profile-circle">${role === "student" ? "AK" : role === "admin" ? "SR" : "AS"}</span><span class="small profile-name" data-profile-name>${role === "student" ? "Alex Kumar" : role === "admin" ? "Sam Rao" : "Ananya Sharma"}</span></a></div></header><main class="dash-main" id="main" data-dashboard-role="${role}" data-dashboard-page="${slug}"><div class="breadcrumb"><a href="index.html">Workspace</a><span>/</span><span>${title}</span></div><div class="dash-heading row between"><div><h1>${title}</h1><p>Make room for progress. Your ${role} workspace, thoughtfully organized.</p></div><span class="pill">BROWSER-LOCAL DEMONSTRATION</span></div><div id="dashboard-content" aria-live="polite"><p>Preparing your demo workspace…</p></div><p class="demo-label">Fictional demo data · Browser-local storage · No real payments, secure authentication, or live class service.</p></main></div>`;
    const file = `dashboard/${role}/${slug}.html`;
    fs.writeFileSync(
      file,
      documentHTML(title, markupWithIcons(body), {
        root: "../../",
        dashboard: true,
        canonical: file,
      }),
    );
    allPages.push(file);
  }
}
fs.writeFileSync(
  "index.html",
  fs.readFileSync("pages/index.html", "utf8").replace(
    /<head>/i,
    '<head>\n    <base href="./pages/" />',
  ),
);
fs.writeFileSync(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${publicPages
    .filter(
      (p) =>
        !["404", "login", "register", "forgot-password"].some((s) => p.file === `pages/${s}.html`),
    )
    .map((p) => `<url><loc>https://example.com/aurevia/${p.file}</loc></url>`)
    .join("")}</urlset>`,
);
fs.writeFileSync(
  "robots.txt",
  "User-agent: *\nAllow: /\nDisallow: /dashboard/\n# Replace the example hostname and repository path before launch.\nSitemap: https://example.com/aurevia/sitemap.xml\n",
);
fs.writeFileSync(
  "documentation/pages.json",
  JSON.stringify(
    { public: publicPages, dashboard: allPages.filter((f) => f.startsWith("dashboard")) },
    null,
    2,
  ),
);
console.log(
  `Built ${publicPages.length} public pages and ${allPages.length - publicPages.length} dashboard pages.`,
);
saveVisualPlacements();
