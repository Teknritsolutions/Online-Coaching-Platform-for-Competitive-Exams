import { pathways, pathwayHref } from "../assets/js/pathways.js";
export function buildPathwayPages({
  writePage,
  section,
  head,
  icon,
  btn,
  checks,
  feature,
  courses,
}) {
  for (const [category, p] of Object.entries(pathways)) {
    const c = courses.find((c) => c.category === category);
    const navigation = `<nav class="pathway-tabs" aria-label="Exam pathways"><a href="courses.html">All courses</a>${Object.keys(
      pathways,
    )
      .map(
        (label) =>
          `<a href="${pathwayHref(label)}" ${label === category ? 'aria-current="page"' : ""}>${label} Exams</a>`,
      )
      .join("")}</nav>`;
    const hero = `<section class="inner-hero inner-hero-visual"><div class="container inner-hero-grid"><div class="inner-hero-copy"><div class="breadcrumb"><a href="index.html">Home</a><span>/</span><a href="courses.html">Courses</a><span>/</span><span>${category}</span></div><span class="eyebrow">${category.toUpperCase()} EXAMS</span><h1>${p.title}</h1><p>${p.intro}</p></div><div class="inner-hero-media"><img src="../assets/images/enhancements/${p.image}.webp" alt="${p.alt}" width="1536" height="1024" fetchpriority="high"><span class="image-corner">${p.exams}</span></div></div></section>`;
    writePage(
      pathwayHref(category).replace(".html", ""),
      `${category} exam preparation`,
      hero +
        section(
          navigation +
            head("YOUR PREPARATION PROGRAM", c.name) +
            `<div class="split pathway-program-grid"><div class="card panel"><span class="icon-box">${icon(p.icon)}</span><h3>${p.focus}</h3><p>${p.practice}</p><div class="program-details"><span>${icon("clock")}${c.duration}</span><span>${icon("book")}${c.lessons} lessons</span></div><div class="section-actions">${btn("View full program", `course-details.html?course=${c.id}`)}</div></div><div class="card panel"><span class="eyebrow">YOUR SYLLABUS</span><h3>A connected path through the essentials.</h3>${checks(c.syllabus)}</div></div>`,
        ) +
        section(
          head("A SUSTAINABLE ROUTINE", "Make each study session count.") +
            `<div class="grid three">${p.routine.map((text, i) => feature(["Learn with clarity", "Practice with purpose", "Review and improve"][i], text, ["book", "clock", "chart"][i])).join("")}</div>`,
        ) +
        section(
          head("SUPPORT FOR YOUR NEXT STEP", "Keep your preparation connected.") +
            `<div class="grid three">${feature("Practice and review", "Try the demonstration test and explore question explanations.", "file")}${feature("Notes within reach", "Use short revision resources alongside your lessons.", "book")}${feature("Guidance when you need it", "Explore the faculty and bring your preparation questions.", "people")}</div><div class="row section-actions">${btn("Try a free mock test", "mock-tests.html")}${btn("Explore resources", "study-materials.html", "secondary")}</div>`,
        ) +
        section(
          `<div class="card panel pathway-invitation"><span class="eyebrow">YOUR ${category.toUpperCase()} JOURNEY</span><h2>Start with one clear step.</h2><p>Explore the ${c.duration.toLowerCase()} demonstration program, with ${c.lessons} sample lesson outlines and a structured syllabus.</p><p class="price">₹${c.price.toLocaleString("en-IN")} <span class="small muted">demo program fee</span></p><div class="row section-actions">${btn("Explore this program", `course-details.html?course=${c.id}`)}${btn("Ask about preparation", "contact.html", "secondary")}</div></div>`,
        ),
    );
  }
}
