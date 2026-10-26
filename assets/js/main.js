import { pathwayHref } from "./pathways.js";
import { refreshFormPlaceholders } from "./forms.js";
import { courses, categories, faculty, articles, sessions } from "./data.js";
import { read, save, userProfile } from "./store.js";
import { e, toast, modal, button } from "./ui.js";
import { renderCharts } from "./charts.js";
import { initDashboard } from "./dashboard.js";
import { syncPreferenceControls } from "./preferences.js";
import { refreshActionIcons } from "./icons.js";

const params = new URLSearchParams(location.search);
const isDashboard = !!document.querySelector("[data-dashboard-role]");

function syncNavigation() {
  const nav = document.querySelector(".site-header .nav");
  if (!nav) return;
  let file = location.pathname.split("/").pop() || "index.html";
  if (file === "courses.html" && categories.includes(params.get("category")))
    file = pathwayHref(params.get("category"));
  if (file === "course-details.html") {
    const course = courses.find((c) => c.id === params.get("course")) || courses[0];
    file = pathwayHref(course.category);
  }
  if (file === "faculty-details.html") file = "faculty.html";
  if (file === "blog-details.html") file = "blog.html";
  for (const a of nav.querySelectorAll("a")) {
    const match = new URL(a.href).pathname === new URL(file, location.href).pathname;
    if (match) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  }
  for (const menu of nav.querySelectorAll("details"))
    menu
      .querySelector("summary")
      .classList.toggle("is-active", !!menu.querySelector('[aria-current="page"]'));
}
syncNavigation();

function setMenuOpen(open, restoreFocus = true) {
  const nav = document.querySelector("#main-nav");
  if (!nav) return;
  const wasOpen = nav.classList.contains("open");
  nav.classList.toggle("open", open);
  document.body.classList.toggle("menu-open", open);
  const backdrop = document.querySelector(".drawer-backdrop");
  if (backdrop) backdrop.hidden = !open;
  const trigger = document.querySelector("[data-menu-toggle]");
  trigger?.setAttribute("aria-expanded", String(open));
  if (open) {
    nav.setAttribute("role", "dialog");
    nav.setAttribute("aria-modal", "true");
    nav.querySelector("[data-menu-close]")?.focus();
  } else {
    nav.removeAttribute("role");
    nav.removeAttribute("aria-modal");
    if (wasOpen && restoreFocus) trigger?.focus();
  }
}
matchMedia("(min-width:1280px)").addEventListener("change", (event) => {
  if (event.matches) setMenuOpen(false, false);
});

/* Shared controls use one delegated listener, including dynamically rendered dashboard content. */
document.addEventListener("click", async (event) => {
  const target = event.target.closest("button, a");
  if (!target) return;
  if (target.matches("[data-theme-toggle]")) {
    const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("stackly-theme", theme);
    } catch {
      toast("Theme changed for this page. Browser storage is unavailable.");
    }
    syncPreferenceControls();
    renderCharts();
  }
  if (target.matches("[data-dir-toggle]")) {
    const dir = document.documentElement.dir === "rtl" ? "ltr" : "rtl";
    document.documentElement.dir = dir;
    try {
      localStorage.setItem("stackly-dir", dir);
    } catch {
      /* Current page remains usable. */
    }
    syncPreferenceControls();
  }
  if (target.matches("[data-menu-toggle]")) {
    setMenuOpen(!document.querySelector(".nav").classList.contains("open"));
  }
  if (target.matches("[data-menu-close]")) setMenuOpen(false);
  if (target.matches("[data-sidebar-toggle]")) {
    const open = document.querySelector(".sidebar").classList.toggle("open");
    target.setAttribute("aria-expanded", String(open));
  }
  if (target.matches("[data-close-dialog]")) document.querySelector("dialog").close();
  if (target.matches("[data-back-top]"))
    window.scrollTo({
      top: 0,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  if (target.matches("[data-password-toggle]")) {
    const input = document.getElementById(target.dataset.passwordToggle);
    input.type = input.type === "password" ? "text" : "password";
    target.textContent = input.type === "password" ? "Show" : "Hide";
    target.setAttribute("aria-label", `${input.type === "password" ? "Show" : "Hide"} password`);
  }
  if (target.matches("[data-demo-role]")) {
    const role = target.dataset.demoRole;
    save("demo-role", role);
    location.href = `../dashboard/${role}/index.html`;
  }
  if (target.matches("[data-register-session]")) {
    const s = sessions.find((x) => x.id === target.dataset.registerSession);
    if (!s) return;
    const reserved = read(
      "reservations",
      [],
      (v) => Array.isArray(v) && v.every((x) => typeof x === "string"),
    );
    modal(
      "Your demo class reservation",
      `<span class="pill">ILLUSTRATIVE SESSION</span><h3 style="margin-top:20px">${s.title}</h3><p>${s.faculty}<br>${s.date} · ${s.time}</p><p>No live meeting service is connected. A reservation is stored only on this browser.</p><button class="btn" id="confirm-reservation">${reserved.includes(s.id) ? "Remove local reservation" : "Save demo reservation"}</button>`,
    );
    document.querySelector("#confirm-reservation").onclick = () => {
      const next = reserved.includes(s.id)
        ? reserved.filter((id) => id !== s.id)
        : [...reserved, s.id];
      if (save("reservations", next)) {
        document.querySelector("dialog").close();
        toast(
          next.includes(s.id)
            ? "Demo seat reserved on this browser. No meeting invitation is sent."
            : "Local reservation removed.",
        );
        target.textContent = next.includes(s.id) ? "View demo reservation" : "Reserve a seat";
      } else toast("Browser storage is unavailable.");
    };
  }
  if (target.matches("[data-schedule-view]")) {
    document
      .querySelectorAll("[data-schedule]")
      .forEach((el) =>
        el.classList.toggle("calendar-view", target.dataset.scheduleView === "calendar"),
      );
    document.querySelectorAll("[data-schedule-view]").forEach((b) => {
      const active = b.dataset.scheduleView === target.dataset.scheduleView;
      b.classList.toggle("active", active);
      b.setAttribute("aria-pressed", String(active));
    });
  }
  if (target.matches("[data-share]")) {
    try {
      await navigator.clipboard.writeText(location.href);
      toast("Article link copied.");
    } catch {
      modal(
        "Share this article",
        `<label for="share-link">Copy this URL</label><input id="share-link" readonly value="${e(location.href)}">`,
      );
    }
  }
  if (target.matches("[data-price-period]")) {
    const discounted = target.dataset.pricePeriod === "scholarship";
    document
      .querySelectorAll("[data-price]")
      .forEach(
        (el) =>
          (el.textContent = Math.round(
            Number(el.dataset.price) * (discounted ? 0.8 : 1),
          ).toLocaleString("en-IN")),
      );
    document.querySelectorAll("[data-price-period]").forEach((b) => {
      const active = b === target;
      b.classList.toggle("active", active);
      b.setAttribute("aria-pressed", String(active));
    });
  }
  if (target.matches("[data-paper-category]")) {
    const category = target.dataset.paperCategory;
    document
      .querySelectorAll("[data-paper-directory] tbody tr")
      .forEach((tr) => (tr.hidden = category !== "All" && tr.cells[0].textContent !== category));
    document.querySelectorAll("[data-paper-category]").forEach((b) => {
      const active = b === target;
      b.classList.toggle("active", active);
      b.setAttribute("aria-pressed", String(active));
    });
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Tab" && document.querySelector("#main-nav.open")) {
    const nav = document.querySelector("#main-nav");
    const items = [...nav.querySelectorAll('a,button,summary,[tabindex="0"]')].filter(
      (el) => el.getBoundingClientRect().height > 0 && !el.disabled,
    );
    const first = items[0],
      last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }
  if (event.key === "Escape") {
    setMenuOpen(false);
    document
      .querySelectorAll(".nav.open,.sidebar.open")
      .forEach((el) => el.classList.remove("open"));
    document
      .querySelectorAll("[data-menu-toggle],[data-sidebar-toggle]")
      .forEach((el) => el.setAttribute("aria-expanded", "false"));
    document.querySelectorAll(".nav details[open]").forEach((el) => (el.open = false));
  }
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".nav"))
    document.querySelectorAll(".nav details[open]").forEach((el) => (el.open = false));
  const sidebar = document.querySelector(".sidebar");
  if (
    sidebar?.classList.contains("open") &&
    !event.target.closest(".sidebar,[data-sidebar-toggle]")
  ) {
    sidebar.classList.remove("open");
    document.querySelector("[data-sidebar-toggle]")?.setAttribute("aria-expanded", "false");
  }
});
document.querySelectorAll(".nav details").forEach((d) =>
  d.addEventListener("toggle", () => {
    if (d.open)
      document.querySelectorAll(".nav details").forEach((other) => {
        if (other !== d) other.open = false;
      });
  }),
);

// Native details retain keyboard and touch behavior; desktop pointers also open them on hover.
document.querySelectorAll(".nav details").forEach((details) => {
  let closeTimer;
  const desktopHover = () => matchMedia("(hover: hover) and (min-width: 1280px)").matches;
  details.addEventListener("pointerenter", () => {
    clearTimeout(closeTimer);
    if (desktopHover()) details.open = true;
  });
  details.addEventListener("pointerleave", () => {
    if (desktopHover())
      closeTimer = setTimeout(() => {
        if (!details.matches(":focus-within")) details.open = false;
      }, 180);
  });
  details.addEventListener("focusout", () => {
    closeTimer = setTimeout(() => {
      if (!details.matches(":focus-within") && !details.matches(":hover")) details.open = false;
    }, 180);
  });
});

document.addEventListener("submit", (event) => {
  const form = event.target;
  if (form.matches("[data-demo-form]")) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const status = form.querySelector(".form-status");
    status.textContent =
      form.dataset.demoForm === "contact"
        ? "Your enquiry passed validation. Demo only: no message has been sent."
        : "Your email passed validation. Demo only: no subscription or email delivery service is connected.";
    form.reset();
  }
  if (form.matches("[data-auth]")) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form));
    const status = form.querySelector(".form-status");
    if (form.dataset.auth === "register") {
      if (
        !/[a-z]/i.test(data.password) ||
        !/[0-9]/.test(data.password) ||
        data.password.length < 8
      ) {
        status.textContent = "Use at least 8 characters, including a letter and a number.";
        form.querySelector("#password").focus();
        return;
      }
      if (data.password !== data.confirm) {
        status.textContent = "The passwords do not match.";
        form.querySelector("#confirm-password").focus();
        return;
      }
      if (!save("profile", { name: data.name, email: data.email, interest: data.interest })) {
        status.textContent =
          "Browser storage is unavailable. Enable it to create a local demo profile.";
        return;
      }
      save("demo-role", "student");
      location.href = "../dashboard/student/index.html";
    } else if (form.dataset.auth === "forgot-password") {
      status.textContent =
        "Demo request confirmed. No email was sent. In production, your identity provider would handle a password reset.";
      form.reset();
    } else {
      if (data.remember) save("demo-role", data.role);
      location.href = `../dashboard/${data.role}/index.html`;
    }
  }
});

/* Search scopes the shared catalog and its category selector, even when controls are in another section. */
function setupFilters() {
  const search = document.querySelector("[data-filter-search]"),
    category = document.querySelector("[data-filter-category]");
  if (!search && !category) return;
  if (
    category &&
    params.has("category") &&
    [...category.options].some((o) => o.value === params.get("category"))
  )
    category.value = params.get("category");
  const filter = () => {
    let visible = 0;
    const query = search?.value.trim().toLowerCase() || "",
      selected = category?.value || "All";
    document.querySelectorAll(".filter-item").forEach((item) => {
      const show =
        (!query || (item.dataset.search || item.textContent.toLowerCase()).includes(query)) &&
        (selected === "All" ||
          item.dataset.category === selected ||
          item.dataset.category === "All");
      item.hidden = !show;
      if (show) visible++;
    });
    document.querySelectorAll("[data-empty]").forEach((el) => (el.hidden = visible > 0));
  };
  search?.addEventListener("input", filter);
  category?.addEventListener("change", filter);
  filter();
}

const courseDetails = document.querySelector("[data-course-details]");
if (courseDetails) {
  const c = courses.find((x) => x.id === params.get("course")) || courses[0];
  document.querySelector("h1").textContent = c.name;
  document.title = c.name + " | Aurevia Academy";
  document.querySelector("[data-course-category]").textContent = c.category.toUpperCase();
  document.querySelector("[data-course-name]").textContent = c.name;
  document.querySelector("[data-course-description]").textContent = c.subtitle;
  document.querySelector("[data-course-meta]").textContent =
    `${c.duration} · ${c.lessons} sample lesson outlines · ${c.rating} illustrative rating`;
  document.querySelector("[data-course-price]").textContent = "₹" + c.price.toLocaleString("en-IN");
  document.querySelector("[data-course-syllabus]").innerHTML = c.syllabus
    .map(
      (s, i) =>
        `<details class="accordion"><summary>Module ${i + 1}: ${s}</summary><p>Concept lessons, worked examples, independent practice, and a focused revision checklist for ${s.toLowerCase()}.</p></details>`,
    )
    .join("");
  document.querySelector("[data-enroll]").onclick = () => {
    const enrolled = read(
      "enrolled",
      ["banking"],
      (v) => Array.isArray(v) && v.every((id) => courses.some((x) => x.id === id)),
    );
    if (!enrolled.includes(c.id)) enrolled.push(c.id);
    if (save("enrolled", enrolled))
      modal(
        "You’re enrolled in the demo",
        `<h3>${c.name}</h3><p>This browser-local enrollment does not charge a fee or purchase a real program.</p>${button("Open your learning space", `../dashboard/student/lesson.html?course=${c.id}`)}`,
      );
    else toast("Browser storage is unavailable.");
  };
}
const facultyDetails = document.querySelector("[data-faculty-profile]");
if (facultyDetails) {
  const f = faculty.find((x) => x.id === params.get("faculty")) || faculty[0];
  document.querySelector("h1").textContent = f.name;
  document.title = f.name + " — Demo Faculty | Aurevia Academy";
  document.querySelector("[data-faculty-name]").textContent = f.name;
  document.querySelector("[data-faculty-subject]").textContent = f.subject;
  document.querySelector("[data-faculty-bio]").textContent = f.bio;
  document.querySelector("[data-faculty-credential]").textContent =
    `${f.credential} · ${f.experience} teaching · Fictional demo profile`;
}
if (document.querySelector("[data-article-body]")) {
  const a = articles.find((x) => x.id === params.get("article")) || articles[0];
  document.querySelector("h1").textContent = a.title;
  document.title = a.title + " | Aurevia Academy";
  document.querySelector("[data-article-date]").textContent = a.date;
  document.querySelector("[data-article-minutes]").textContent = a.minutes;
  const body = document.querySelector("[data-article-body]");
  if (a.id !== "study-plan") {
    const content = {
      "quant-speed": [
        [
          "Build an accurate method before adding the timer.",
          "When you rush an unfamiliar calculation, you practice guessing. Work through a small group of questions without a clock first. Write the method clearly enough that you could explain it to someone else.",
        ],
        [
          "01. Separate the concept from the calculation",
          "If an answer is wrong, decide whether the issue was the idea, the setup, or the arithmetic. Practice that specific step rather than repeating the entire syllabus.",
        ],
        [
          "02. Use friendly numbers to check the result",
          "Estimate the order of magnitude before calculating. For example, 19% of 205 should be close to 20% of 200, which is 40.",
        ],
        [
          "03. Add short timed sets",
          "Once the method is reliable, try five questions with a modest time limit. Track accuracy as well as completion time.",
        ],
        [
          "04. Keep useful shortcuts connected to meaning",
          "A shortcut is most reliable when you understand why it works. Revisit its assumptions before applying it to a new question.",
        ],
      ],
      "mock-review": [
        [
          "The review turns a score into a plan.",
          "Reserve a quiet hour after your mock test. Begin with the questions you left unanswered, then return to mistakes and the correct answers you were uncertain about.",
        ],
        [
          "01. Reattempt before reading the explanation",
          "Try the question again without time pressure. This helps distinguish a concept gap from a rushed decision.",
        ],
        [
          "02. Label the cause",
          "Use a few practical categories: concept, calculation, reading, or time. A specific reason points to a specific next action.",
        ],
        [
          "03. Make a small revision queue",
          "Choose two or three topics that appeared repeatedly. Schedule a short learning session and a fresh question set for each.",
        ],
        [
          "04. Close the loop",
          "Revisit the difficult question a few days later. The goal is to recreate the reasoning, not to remember which option was correct.",
        ],
      ],
      "current-affairs": [
        [
          "Read with a question in mind.",
          "A daily reading habit becomes more useful when you connect new information to a larger topic: institutions, economic ideas, geography, or public policy.",
        ],
        [
          "01. Keep the daily session manageable",
          "Choose a consistent, short reading window. A focused routine is easier to sustain than an occasional long collection of headlines.",
        ],
        [
          "02. Write one clear explanation",
          "Summarize an event in your own words: what happened, who was involved, and why it matters for the topic you are studying.",
        ],
        [
          "03. Verify before recording",
          "Use official announcements and reliable reporting. Check the publication date and distinguish a proposal from a rule already in effect.",
        ],
        [
          "04. Revisit and recall",
          "At the end of the week, cover your notes and explain the main ideas aloud. Organize them by theme so new developments have a place to fit.",
        ],
      ],
    };
    body.innerHTML =
      '<span class="eyebrow">' +
      a.category +
      "</span>" +
      content[a.id].map(([h, p]) => `<h2>${h}</h2><p>${p}</p>`).join("");
  }
}
if (isDashboard) initDashboard();
else renderCharts();
syncPreferenceControls();
refreshActionIcons();
refreshFormPlaceholders();
setupFilters();

// Keep locally rendered dashboard actions on the same icon system after edits and navigation.
const iconObserver = new MutationObserver((records) => {
  const roots = new Set();
  for (const record of records) {
    for (const node of record.type === "characterData" ? [record.target] : record.addedNodes) {
      const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
      if (element && !element.closest("svg,script,style"))
        roots.add(
          element.closest(".btn,.text-link,.tab,.stars,.profile-circle,.back-top") || element,
        );
    }
  }
  roots.forEach((root) => {
    refreshActionIcons(root);
    refreshFormPlaceholders(root);
  });
});
iconObserver.observe(document.body, { childList: true, subtree: true, characterData: true });

matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
  try {
    if (localStorage.getItem("stackly-theme")) return;
  } catch {
    /* System preference still applies. */
  }
  document.documentElement.dataset.theme = event.matches ? "dark" : "light";
  syncPreferenceControls();
  renderCharts();
});
