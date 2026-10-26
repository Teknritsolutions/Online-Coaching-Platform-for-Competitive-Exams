import {
  courses,
  categories,
  sessions,
  rolePages,
  questions,
  faculty,
  tests,
  studyActivity,
} from "./data.js";
import { read, save, remove, attempts, userProfile } from "./store.js";
import { e, button, panel, table, chartCard, field, modal, toast, checkList } from "./ui.js";
import { metrics, history, renderCharts } from "./charts.js";
import { instructions, attemptTest, submitConfirmation, results, analysis } from "./exam.js";

const money = (n) => "₹" + n.toLocaleString("en-IN");
const kpi = (label, value, note) =>
  `<article class="card kpi"><div class="row"><p>${label}</p><span class="profile-circle">↗</span></div><strong>${value}</strong><small>${note}</small></article>`;
const heading = (title, action = "") =>
  `<div class="section-head"><h2>${title}</h2>${action}</div>`;
const progress = (name, value) =>
  `<div><div class="row between"><strong class="small">${name}</strong><span class="small muted">${value}%</span></div><div class="progress" role="progressbar" aria-label="${name}" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="100"><span style="width:${value}%"></span></div></div>`;

function classSchedule(target) {
  const reserved = read(
    "reservations",
    [],
    (v) => Array.isArray(v) && v.every((x) => typeof x === "string"),
  );
  target.innerHTML = `<div class="card panel"><div class="section-head"><div><h2>Your learning calendar</h2><p class="small muted">28–30 October 2026 · IST (UTC+05:30) · Fictional demo sessions</p></div><div class="tabs"><button class="tab active" data-schedule-view="list" aria-pressed="true">List</button><button class="tab" data-schedule-view="calendar" aria-pressed="false">Date cards</button></div></div><div data-schedule>${sessions.map((s) => `<article class="schedule-row"><div class="row"><div class="date-box">OCT<b>${s.day}</b></div><div><h3>${s.title}</h3><p>${s.faculty} · ${s.time}</p></div></div><button class="btn secondary small" data-register-session="${s.id}">${reserved.includes(s.id) ? "View demo reservation" : "Reserve a seat"}</button></article>`).join("")}</div><p class="demo-label">Reservations are stored locally. No meeting link or streaming platform is connected.</p></div>`;
}
function studentOverview(target) {
  const m = metrics(),
    saved = attempts(),
    enrolled = read(
      "enrolled",
      ["banking"],
      (v) => Array.isArray(v) && v.every((x) => courses.some((c) => c.id === x)),
    );
  const complete = read("completed-lessons", [], Array.isArray);
  const profile = userProfile();
  document.querySelector("h1").textContent = `Welcome back, ${profile.name.split(" ")[0]}.`;
  target.innerHTML = `<div class="notice row between"><div><strong>Your next small step is waiting.</strong><br><span class="small">Continue your learning, or give a new practice set your full attention.</span></div>${button("Continue learning", "lesson.html", "small")}</div><div class="grid four">${kpi("Tests attempted", m.tests, "3 seeded demo + " + saved.length + " saved")}${kpi("Average test score", m.average.toFixed(1) + "%", "Mean of normalized attempt scores")}${kpi("Overall accuracy", m.accuracy.toFixed(1) + "%", "Correct ÷ answered questions")}${kpi("Weekly study time", m.hours + "h", "Sample activity · 7-day streak")}</div><div class="grid two">${chartCard("score", "Score progress", "Seeded demo history + your saved attempts")}${chartCard("subjects", "Subject-wise performance", "Your saved attempts only; 0 means no answers yet")}</div><div class="grid two"><section class="card panel">${heading("Your learning, in motion", button("All courses", "my-courses.html", "secondary small"))}${
    courses
      .filter((c) => enrolled.includes(c.id))
      .map(
        (c) =>
          `<div class="schedule-row" style="display:block"><span class="eyebrow">${c.category}</span><h3>${c.name}</h3>${progress("Demo lesson progress", complete.length ? Math.min(100, Math.round((100 * complete.length) / 4)) : 0)}${button("Continue learning", `lesson.html?course=${c.id}`, "secondary small")}</div>`,
      )
      .join("") || "<p>No enrolled courses. Explore the course catalog to begin.</p>"
  }</section><section class="card panel">${heading("Upcoming live learning", button("View schedule", "live-classes.html", "secondary small"))}${sessions
    .slice(0, 2)
    .map(
      (s) =>
        `<div class="schedule-row"><div><span class="pill">${s.day} OCT · DEMO</span><h3 style="margin-top:12px">${s.title}</h3><p>${s.time}</p></div></div>`,
    )
    .join(
      "",
    )}</section></div><div class="grid two">${chartCard("accuracy", "Answer accuracy", "All seeded + saved question counts")}${chartCard("activity", "Weekly study activity", "Sample weekly total: " + m.hours + " hours")}</div><section class="card panel" style="margin-bottom:24px">${heading("Recent test history", button("Open test library", "mock-tests.html", "secondary small"))}${table(
    ["Test", "Score", "Correct", "Incorrect", "Unattempted"],
    history()
      .slice()
      .reverse()
      .slice(0, 5)
      .map((a) => [e(a.label), `${a.score} / ${a.maximum}`, a.correct, a.incorrect, a.unattempted]),
  )}</section><section class="card panel"><h2>Where to focus next</h2><p>${saved.length ? "Open topic-wise analytics to identify areas below 60% in your latest attempt." : "Start a practice attempt to unlock personal topic recommendations. Until then, try percentages, ratios, and series as a foundation."}</p>${button("See topic insights", "analytics.html", "secondary")}</section>`;
}
function courseLibrary(target, role) {
  const enrolled = read(
    "enrolled",
    ["banking"],
    (v) => Array.isArray(v) && v.every((x) => courses.some((c) => c.id === x)),
  );
  target.innerHTML = `<div class="notice">${role === "student" ? "Your enrolled programs appear first. Add a demo program to explore its lesson roadmap." : "Assigned teaching programs. Open a curriculum to manage the sample lesson content."}</div><div class="grid two">${courses.map((c) => `<article class="card panel"><span class="eyebrow">${c.category} / ${c.duration}</span><h2>${c.name}</h2><p>${c.subtitle}</p><p class="small muted">${c.lessons} sample lesson outlines · ${money(c.price)} demo fee</p><div class="row">${button(role === "student" ? "Open learning" : "Open curriculum", `${role === "student" ? "lesson" : "content"}.html?course=${c.id}`, "secondary")}${role === "student" ? `<button class="btn small" data-add-course="${c.id}">${enrolled.includes(c.id) ? "Enrolled ✓" : "Add demo course"}</button>` : ""}</div></article>`).join("")}</div>`;
  target.querySelectorAll("[data-add-course]").forEach(
    (b) =>
      (b.onclick = () => {
        if (!enrolled.includes(b.dataset.addCourse)) enrolled.push(b.dataset.addCourse);
        if (save("enrolled", enrolled)) {
          b.textContent = "Enrolled ✓";
          toast("Demo course added to this browser.");
        } else toast("Browser storage is unavailable.");
      }),
  );
}
function learning(target, role) {
  const course =
    courses.find((c) => c.id === new URLSearchParams(location.search).get("course")) || courses[0];
  const lessons = [
    "Understanding a percentage",
    "Converting fractions & percentages",
    "Percentage increase & decrease",
    "Practice and reflection",
  ];
  const lessonBodies = [
    [
      "Understanding a percentage",
      "A percentage expresses a quantity as a number out of 100. 20% means 20 out of every 100, or 20/100 = 1/5.",
      "Example: 20% of 250 = 0.20 × 250 = 50. Start by writing the percentage as a fraction, then multiply by the total.",
    ],
    [
      "Converting fractions & percentages",
      "To turn a fraction into a percentage, divide the numerator by the denominator and multiply by 100.",
      "Example: 3/8 = 0.375 = 37.5%. Useful pairs: 1/2 = 50%, 1/4 = 25%, and 1/5 = 20%.",
    ],
    [
      "Percentage increase & decrease",
      "A percentage change compares the difference to the original value, not the new value.",
      "Example: a price rises from 200 to 240. The increase is 40, so the percentage increase is 40/200 × 100 = 20%.",
    ],
    [
      "Practice and reflection",
      "A number becomes 180 after a 10% decrease. Find the original value before checking the answer.",
      "Answer: original × 0.9 = 180, so the original is 200. Reflection: dividing by 0.9 reverses the reduction; adding 10% to 180 does not.",
    ],
  ];
  let current = 0;
  const done = read("completed-lessons", [], (v) => Array.isArray(v) && v.every(Number.isInteger));
  const draw = () => {
    const [title, concept, example] = lessonBodies[current];
    const override = read("lesson-content", {}, (v) => v && typeof v === "object");
    target.innerHTML = `<div class="notice">${course.name} · Original sample text lessons. Video streaming is an integration placeholder.</div><div class="test-layout"><div class="stack"><section class="lesson-player"><span class="eyebrow" style="color:#9cd2cb">LESSON ${current + 1} / 4</span><h2>${title}</h2><p>${concept}</p></section><section class="card panel"><h2>Work through the idea.</h2><p>${e(override[current] || example)}</p><div class="row"><button class="btn" id="complete-lesson">${done.includes(current) ? "Completed ✓" : "Mark lesson complete"}</button><a href="${role === "student" ? "test-instructions" : "questions"}.html" class="btn secondary">${role === "student" ? "Try a practice test" : "Open question bank"}</a></div>${role === "instructor" ? '<button class="btn secondary" id="edit-lesson" style="margin-top:18px">Edit sample lesson notes</button>' : ""}</section></div><aside class="card panel"><h2>Your lesson roadmap</h2><div class="stack" style="margin-top:20px">${lessons.map((l, i) => `<button class="tab ${current === i ? "active" : ""}" data-lesson-index="${i}">${done.includes(i) ? "✓ " : ""}${i + 1}. ${l}</button>`).join("")}</div>${progress("Curriculum progress", Math.round((done.length / 4) * 100))}</aside></div>`;
    target.querySelectorAll("[data-lesson-index]").forEach(
      (b) =>
        (b.onclick = () => {
          current = Number(b.dataset.lessonIndex);
          draw();
        }),
    );
    target.querySelector("#complete-lesson").onclick = () => {
      if (!done.includes(current)) done.push(current);
      save("completed-lessons", done);
      draw();
      toast("Lesson completion saved locally.");
    };
    if (role === "instructor")
      target.querySelector("#edit-lesson").onclick = () => {
        modal(
          "Edit lesson notes",
          `<form id="lesson-edit"><label for="lesson-notes">Notes</label><textarea id="lesson-notes" required>${e(override[current] || example)}</textarea><button class="btn" style="margin-top:18px">Save local changes</button></form>`,
        );
        document.querySelector("#lesson-edit").onsubmit = (event) => {
          event.preventDefault();
          override[current] = document.querySelector("#lesson-notes").value;
          save("lesson-content", override);
          document.querySelector("dialog").close();
          draw();
          toast("Sample lesson notes updated.");
        };
      };
  };
  draw();
}
function mockLibrary(target) {
  target.innerHTML = `<div class="filter-bar"><div class="form-field"><label for="test-search">Search tests</label><input type="search" id="test-search" data-filter-search placeholder="Find your next practice set…"></div><div class="form-field"><label for="test-category">Exam pathway</label><select id="test-category" data-filter-category><option>All</option>${categories.map((c) => `<option>${c}</option>`).join("")}</select></div></div><div class="grid three filter-grid">${tests.map((t) => `<article class="card filter-item" data-category="${t.category}" data-search="${t.name.toLowerCase()}"><div class="card-body"><span class="eyebrow">${t.category === "All" ? "FOUNDATION" : t.category}</span><h3>${t.name}</h3><p>${t.questions.length} questions · ${t.minutes} minutes<br>+2 correct · −0.5 incorrect</p><div class="card-action">${button("Start with instructions", `test-instructions.html?test=${t.id}`, "secondary")}</div></div></article>`).join("")}</div><p class="empty" hidden data-empty>No matching tests found.</p>`;
}
function analytics(target) {
  const m = metrics(),
    last = attempts().at(-1);
  target.innerHTML = `<div class="notice">Score and answer totals include 3 seeded demo attempts plus your saved tests. Subject, topic, and time charts use your completed attempts only.${!last ? " Complete a test to populate those charts." : ""}</div><div class="grid four">${kpi("Tests attempted", m.tests, "Includes seeded demo history")}${kpi("Average score", m.average.toFixed(1) + "%", "Average normalized scores")}${kpi("Answer accuracy", m.accuracy.toFixed(1) + "%", "Correct / answered")}${kpi("Weekly study hours", m.hours + "h", "Sample activity total")}</div><div class="grid two">${chartCard("score", "Score progress")}${chartCard("subjects", "Subject-wise performance", "Accuracy across your saved answers")}${chartCard("accuracy", "Answer accuracy", "Aggregated correct, incorrect & unattempted")}${chartCard("activity", "Weekly study activity", "Sample hours by weekday")}${chartCard("topics", "Topic-wise strength analysis", "Latest saved test; gold marks areas below 60%")}${chartCard("time", "Time management", "Latest saved test; mean active seconds per question")}</div>`;
}
function resources(target, papers = false) {
  const data = papers
    ? categories.map((c) => ({
        category: c,
        title: c + " sample question paper",
        file: "sample-paper.txt",
      }))
    : [
        ["Quantitative Aptitude", "Percentage essentials", "quant-notes.txt"],
        ["Reasoning", "Logical thinking notes", "reasoning-notes.txt"],
        ["English", "Grammar checklist", "english-notes.txt"],
        ["General Awareness", "Banking fundamentals", "banking-notes.txt"],
      ].map(([category, title, file]) => ({ category, title, file }));
  target.innerHTML = `<div class="notice">Original downloadable demonstration TXT files. ${papers ? "These are not official previous-year examination papers." : "Use these short notes alongside practice and reflection."}</div><div class="filter-bar"><div class="form-field"><label for="resource-search">Search resources</label><input type="search" id="resource-search" data-filter-search></div><div class="form-field"><label for="resource-category">Subject / exam</label><select id="resource-category" data-filter-category><option>All</option>${data.map((d) => `<option>${d.category}</option>`).join("")}</select></div></div><div class="grid two filter-grid">${data.map((d) => `<article class="card panel filter-item" data-category="${d.category}" data-search="${d.title.toLowerCase()}"><span class="eyebrow">${d.category}</span><h2>${d.title}</h2><p>Original sample · TXT download</p><a class="btn secondary" href="../../assets/downloads/${d.file}" download>Download sample ↓</a></article>`).join("")}</div><p class="empty" hidden data-empty>No matching resources found.</p>`;
}
function profile(target, role) {
  const profileKey = role === "student" ? "profile" : role + "-profile";
  const p =
    role === "student"
      ? userProfile()
      : read(
          profileKey,
          {
            name: role === "admin" ? "Sam Rao" : "Ananya Sharma",
            email: role + "@example.com",
            interest: "Banking",
          },
          (v) => v && typeof v.name === "string" && typeof v.email === "string",
        );
  target.innerHTML = `<div class="grid two"><section class="card panel"><span class="eyebrow">YOUR DEMO PROFILE</span><h2>A learning space that feels like yours.</h2><p>Changes are saved on this browser only. Avoid entering sensitive personal information.</p><form id="profile-form">${field("Full name", "name", p.name)}${field("Email address", "email", p.email, "email")}<div class="form-field"><label for="profile-interest">Exam interest</label><select id="profile-interest" name="interest">${categories.map((c) => `<option ${c === p.interest ? "selected" : ""}>${c}</option>`).join("")}</select></div><button class="btn">Save profile</button><p class="form-status" role="status"></p></form></section><section class="card panel"><h2>Your workspace</h2>${checkList(["Browser-local demo profile", "No password stored", "No secure identity verification", "Production accounts require a backend"])}${button("Switch demo role", "../../pages/login.html", "secondary")}</section></div>`;
  target.querySelector("form").onsubmit = (ev) => {
    ev.preventDefault();
    const form = ev.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    if (save(profileKey, values)) {
      form.querySelector(".form-status").textContent = "Your demo profile has been saved.";
      document
        .querySelectorAll("[data-profile-name]")
        .forEach((el) => (el.textContent = values.name));
    } else toast("Browser storage is unavailable.");
  };
}
function settings(target, role) {
  const settings = read("preferences", {}, (v) => v && typeof v === "object");
  target.innerHTML = `<div class="grid two"><section class="card panel"><h2>Make yourself comfortable.</h2><p>Theme and direction preferences persist across pages.</p><div class="row"><button class="btn secondary" data-theme-toggle>Switch light / dark</button><button class="btn secondary" data-dir-toggle>Toggle RTL demonstration</button></div><hr class="rule"><form id="preferences-form"><label class="row"><input type="checkbox" name="reminders" ${settings.reminders ? "checked" : ""}> Show local study reminder preference</label><label class="row" style="margin-top:16px"><input type="checkbox" name="digest" ${settings.digest ? "checked" : ""}> Weekly digest preference (no emails sent)</label><button class="btn" style="margin-top:24px">Save preferences</button><p class="form-status" role="status"></p></form></section><section class="card panel"><h2>Your browser-local data</h2><p>Clear your personal test history, unfinished attempt, enrollments, and completed lessons. Seeded demonstration history remains.</p><button class="btn secondary" id="clear-learning">Clear demo learning data</button><hr class="rule"><h3>Production integration</h3><p>No real authentication, email delivery, payment, or live meeting service is configured. Role selection is open demonstration navigation.</p></section></div>`;
  target.querySelector("#preferences-form").onsubmit = (ev) => {
    ev.preventDefault();
    const f = ev.currentTarget;
    save("preferences", { reminders: f.reminders.checked, digest: f.digest.checked });
    f.querySelector(".form-status").textContent = "Preferences saved on this browser.";
  };
  target.querySelector("#clear-learning").onclick = () => {
    modal(
      "Clear local learning data?",
      `<p>This removes completed attempts, the unfinished test, enrollments, and lesson progress from this browser.</p><div class="row"><button class="btn" id="confirm-clear">Clear learning data</button><button class="btn secondary" data-close-dialog>Keep my data</button></div>`,
    );
    document.querySelector("#confirm-clear").onclick = () => {
      ["attempts", "exam-draft", "enrolled", "completed-lessons"].forEach(remove);
      document.querySelector("dialog").close();
      toast("Local learning data cleared. Seeded examples remain.");
    };
  };
}

const managerDefinitions = {
  students: {
    label: "student",
    headers: ["Name", "Email", "Program", "Status"],
    keys: ["name", "email", "program", "status"],
    fields: ["Full name", "Email", "Program", "Status"],
    rows: [
      ["Aarav Singh", "aarav@example.com", "Banking", "Active"],
      ["Diya Nair", "diya@example.com", "SSC", "Active"],
      ["Ishaan Patel", "ishaan@example.com", "Engineering", "Paused"],
      ["Kavya Rao", "kavya@example.com", "Banking", "Active"],
      ["Rehan Ali", "rehan@example.com", "Railways", "Active"],
      ["Sana Das", "sana@example.com", "SSC", "Active"],
      ["Nikhil Shah", "nikhil@example.com", "Engineering", "Paused"],
      ["Maya Sen", "maya@example.com", "Banking", "Active"],
    ],
  },
  faculty: {
    label: "faculty member",
    headers: ["Name", "Subject", "Qualification", "Status"],
    keys: ["name", "subject", "qualification", "status"],
    fields: ["Full name", "Subject", "Qualification", "Status"],
    rows: faculty.map((f) => [f.name, f.subject, f.credential, "Active"]),
  },
  courses: {
    label: "course",
    headers: ["Program", "Category", "Duration", "Status"],
    keys: ["name", "category", "duration", "status"],
    fields: ["Program name", "Category", "Duration", "Status"],
    rows: courses.map((c) => [c.name, c.category, c.duration, "Published"]),
  },
  questions: {
    label: "question",
    headers: ["Question", "Subject", "Topic", "Status"],
    keys: ["name", "subject", "topic", "status"],
    fields: ["Question text", "Subject", "Topic", "Status"],
    rows: questions.map((q) => [q.text, q.subject, q.topic, "Published"]),
  },
  "mock-tests": {
    label: "test",
    headers: ["Test", "Category", "Duration", "Status"],
    keys: ["name", "category", "duration", "status"],
    fields: ["Test name", "Category", "Duration", "Status"],
    rows: tests.map((t) => [t.name, t.category, t.minutes + " minutes", "Published"]),
  },
  "live-classes": {
    label: "session",
    headers: ["Session", "Instructor", "Date / time (IST)", "Status"],
    keys: ["name", "instructor", "date", "status"],
    fields: ["Session title", "Instructor", "Date / time (IST)", "Status"],
    rows: sessions.map((s) => [s.title, s.faculty, `${s.date} ${s.time}`, "Scheduled"]),
  },
  materials: {
    label: "resource",
    headers: ["Resource", "Subject", "Format", "Status"],
    keys: ["name", "subject", "format", "status"],
    fields: ["Resource title", "Subject", "Format", "Status"],
    rows: [
      ["Percentage essentials", "Quantitative Aptitude", "TXT", "Published"],
      ["Grammar checklist", "English", "TXT", "Published"],
      ["Reasoning guide", "Reasoning", "TXT", "Draft"],
    ],
  },
  payments: {
    label: "demo transaction",
    headers: ["Reference", "Student", "Amount (₹)", "Status"],
    keys: ["name", "student", "amount", "status"],
    fields: ["Reference", "Student name", "Illustrative amount", "Status"],
    rows: [
      ["DEMO-001", "Aarav Singh", "4999", "Simulated paid"],
      ["DEMO-002", "Diya Nair", "5999", "Simulated pending"],
      ["DEMO-003", "Rehan Ali", "3499", "Simulated paid"],
    ],
  },
  messages: {
    label: "demo message",
    headers: ["Subject", "From", "Received", "Status"],
    keys: ["name", "from", "date", "status"],
    fields: ["Subject", "From", "Received date", "Status"],
    rows: [
      ["Course guidance", "priya@example.com", "2026-10-25", "Unread"],
      ["Schedule question", "arjun@example.com", "2026-10-24", "Read"],
      ["Sample resource request", "meera@example.com", "2026-10-23", "Unread"],
    ],
  },
  notifications: {
    label: "notification",
    headers: ["Title", "Audience", "Date", "Status"],
    keys: ["name", "audience", "date", "status"],
    fields: ["Title", "Audience", "Date", "Status"],
    rows: [
      ["October practice workshop", "All learners", "2026-10-26", "Published"],
      ["New revision notes", "Banking", "2026-10-24", "Draft"],
    ],
  },
  announcements: {
    label: "announcement",
    headers: ["Title", "Audience", "Date", "Status"],
    keys: ["name", "audience", "date", "status"],
    fields: ["Title", "Audience", "Date", "Status"],
    rows: [
      ["Bring your percentage questions", "Banking learners", "2026-10-26", "Published"],
      ["Weekly revision checklist", "All assigned courses", "2026-10-25", "Draft"],
    ],
  },
};
function manager(target, kind, role) {
  const def = managerDefinitions[kind];
  const key = `${role}-${kind}-records`;
  const seed = def.rows.map((values, i) => ({
    id: "demo-" + i,
    ...Object.fromEntries(def.keys.map((k, n) => [k, values[n]])),
  }));
  let rows = read(
    key,
    seed,
    (v) =>
      Array.isArray(v) &&
      v.every(
        (r) => r && typeof r.id === "string" && def.keys.every((k) => typeof r[k] === "string"),
      ),
  );
  let search = "",
    filter = "All",
    sort = "asc",
    page = 1;
  const size = 5;
  target.innerHTML = `<section class="card panel"><div class="section-head"><div><h2>${role === "admin" ? "Manage" : "Your"} ${kind.replaceAll("-", " ")}</h2><p class="small muted">Fictional local records. ${kind === "payments" ? "Simulated transactions only. No real payment is processed." : kind === "questions" ? "Editorial question records are separate from the fixed, validated demo test set." : "Edits do not publish to a live service."}</p></div><button class="btn small" id="add-record">Add ${def.label}</button></div><div class="filter-bar"><div class="form-field"><label for="manager-search">Search records</label><input type="search" id="manager-search" placeholder="Search all fields…"></div><div class="form-field"><label for="manager-filter">Status</label><select id="manager-filter"><option>All</option>${[...new Set(rows.map((r) => r.status))].map((s) => `<option>${e(s)}</option>`).join("")}</select></div><div class="form-field"><label for="manager-sort">Sort by ${def.headers[0].toLowerCase()}</label><select id="manager-sort"><option value="asc">A to Z</option><option value="desc">Z to A</option></select></div></div><div id="manager-table"></div><div class="row between" style="margin-top:20px"><span class="small muted" id="manager-count"></span><div class="row"><button class="tab" id="previous-page">← Previous</button><span class="small" id="manager-page"></span><button class="tab" id="next-page">Next →</button></div></div></section>`;
  const persist = () => {
    if (!save(key, rows)) toast("Browser storage is unavailable. Changes cannot persist.");
  };
  const filtered = () =>
    rows
      .filter(
        (r) =>
          (filter === "All" || r.status === filter) &&
          def.keys.some((k) => r[k].toLowerCase().includes(search.toLowerCase())),
      )
      .sort((a, b) => a[def.keys[0]].localeCompare(b[def.keys[0]]) * (sort === "asc" ? 1 : -1));
  function draw() {
    const found = filtered(),
      pages = Math.max(1, Math.ceil(found.length / size));
    page = Math.min(page, pages);
    target.querySelector("#manager-table").innerHTML = table(
      [...def.headers, "Actions"],
      found
        .slice((page - 1) * size, page * size)
        .map((r) => [
          ...def.keys.map((k) => e(r[k])),
          `<div class="row"><button class="btn secondary small" data-edit-record="${e(r.id)}">${kind === "messages" ? "Read / edit" : "Edit"}</button><button class="btn secondary small" data-delete-record="${e(r.id)}">Delete</button></div>`,
        ]),
    );
    target.querySelector("#manager-count").textContent = `${found.length} matching records`;
    target.querySelector("#manager-page").textContent = `${page} / ${pages}`;
    target.querySelector("#previous-page").disabled = page <= 1;
    target.querySelector("#next-page").disabled = page >= pages;
    target
      .querySelectorAll("[data-edit-record]")
      .forEach((b) => (b.onclick = () => edit(rows.find((r) => r.id === b.dataset.editRecord))));
    target.querySelectorAll("[data-delete-record]").forEach(
      (b) =>
        (b.onclick = () => {
          const r = rows.find((x) => x.id === b.dataset.deleteRecord);
          modal(
            "Delete local record?",
            `<p>Remove “${e(r[def.keys[0]])}” from this browser’s demo data?</p><div class="row"><button class="btn" id="confirm-delete">Delete record</button><button class="btn secondary" data-close-dialog>Cancel</button></div>`,
          );
          document.querySelector("#confirm-delete").onclick = () => {
            rows = rows.filter((x) => x.id !== r.id);
            persist();
            draw();
            document.querySelector("dialog").close();
            toast("Local record deleted.");
          };
        }),
    );
  }
  function edit(record) {
    modal(
      record ? "Edit " + def.label : "Add " + def.label,
      `<form id="record-form">${def.keys.map((k, i) => field(def.fields[i], k, record?.[k] || "", k === "email" ? "email" : kind === "payments" && k === "amount" ? "number" : "text")).join("")}<button class="btn">Save local record</button><p class="demo-label" style="margin-top:18px">${kind === "messages" ? "Demo editing only. No reply or message is sent." : "Browser-local data only."}</p></form>`,
    );
    document.querySelector("#record-form").onsubmit = (ev) => {
      ev.preventDefault();
      const values = Object.fromEntries(new FormData(ev.currentTarget));
      if (kind === "payments" && Number(values.amount) < 0) {
        toast("Enter a nonnegative illustrative amount.");
        return;
      }
      if (record) rows = rows.map((r) => (r.id === record.id ? { ...record, ...values } : r));
      else rows.push({ id: "local-" + Date.now(), ...values });
      persist();
      document.querySelector("dialog").close();
      draw();
      toast("Demo record saved on this browser.");
    };
  }
  target.querySelector("#add-record").onclick = () => edit();
  target.querySelector("#manager-search").oninput = (ev) => {
    search = ev.target.value;
    page = 1;
    draw();
  };
  target.querySelector("#manager-filter").onchange = (ev) => {
    filter = ev.target.value;
    page = 1;
    draw();
  };
  target.querySelector("#manager-sort").onchange = (ev) => {
    sort = ev.target.value;
    draw();
  };
  target.querySelector("#previous-page").onclick = () => {
    page--;
    draw();
  };
  target.querySelector("#next-page").onclick = () => {
    page++;
    draw();
  };
  draw();
}
function adminOverview(target) {
  target.innerHTML = `<div class="grid four">${kpi("Active students", "128", "Fictional October enrollment")}${kpi("Monthly enrollments", "40", "Fictional October total")}${kpi("October demo revenue", "₹80,000", "Simulated · no real payments")}${kpi("October test attempts", "156", "Illustrative participation")}</div><div class="grid two">${chartCard("growth", "Student enrollment growth", "Fictional active students by month")}${chartCard("enrollment", "Monthly course enrollments", "Fictional new enrollments")}${chartCard("revenue", "Revenue overview", "Illustrative monthly rupees; not real payments")}${chartCard("popularity", "Exam category popularity", "48 + 36 + 24 + 20 = 128 demo students")}${chartCard("participation", "Mock test participation", "Monthly illustrative attempts")}${chartCard("averages", "Average test scores", "Fictional category averages")}</div><section class="card panel"><h2>A clear view of your institution.</h2><p>Use the management pages to search, sort, add, edit, and delete local records. Overview charts are explicitly seeded examples and do not aggregate the editable sample tables.</p><div class="row">${button("Manage students", "students.html", "secondary")}${button("Open reports", "reports.html", "secondary")}</div></section>`;
}
function instructorOverview(target) {
  target.innerHTML = `<div class="grid four">${kpi("Assigned programs", "4", "Fictional teaching allocation")}${kpi("Sample students", "5", "Progress chart below")}${kpi("Mean course progress", "78%", "(72 + 85 + 64 + 91 + 78) / 5")}${kpi("Upcoming classes", "3", "28–30 October · demo")}</div><div class="grid two">${chartCard("progress", "Student progress", "Fictional learner completion percentages")}${chartCard("averages", "Mock test scores", "Illustrative category averages")}</div><div class="grid two"><section class="card panel"><h2>Keep the next lesson clear.</h2><p>Review the curriculum, edit the sample lesson notes, and organize your teaching resources.</p>${button("Open course content", "content.html")}</section><section class="card panel"><h2>A note for your learners</h2><p>Create a browser-local demo announcement for your assigned program.</p>${button("Manage announcements", "announcements.html", "secondary")}</section></div>`;
}
function notifications(target) {
  const readIds = read(
    "read-notifications",
    [],
    (v) => Array.isArray(v) && v.every(Number.isInteger),
  );
  const data = [
    [
      "Your next practice session is waiting",
      "A ten-question foundation test is ready when you are.",
    ],
    ["A new week, a little structure", "Set one learning priority and leave room for revision."],
    ["Upcoming demo workshop", "28 October 2026 · Percentages without shortcuts · 10:00 IST."],
  ];
  target.innerHTML = `<div class="stack">${data.map(([t, d], i) => `<article class="card panel"><div class="row between"><h2>${t}</h2><button class="tab" data-notification="${i}">${readIds.includes(i) ? "Read ✓" : "Mark as read"}</button></div><p>${d}</p></article>`).join("")}</div>`;
  target.querySelectorAll("[data-notification]").forEach(
    (b) =>
      (b.onclick = () => {
        const id = Number(b.dataset.notification);
        if (!readIds.includes(id)) readIds.push(id);
        save("read-notifications", readIds);
        b.textContent = "Read ✓";
      }),
  );
}
export function initDashboard() {
  const main = document.querySelector("[data-dashboard-role]");
  if (!main) return;
  const role = main.dataset.dashboardRole,
    page = main.dataset.dashboardPage,
    target = document.querySelector("#dashboard-content");
  if (page === "profile") profile(target, role);
  else if (page === "settings") settings(target, role);
  else if (role === "student") {
    const views = {
      index: studentOverview,
      "my-courses": (t) => courseLibrary(t, role),
      lesson: (t) => learning(t, role),
      "mock-tests": mockLibrary,
      "test-instructions": instructions,
      "attempt-test": attemptTest,
      "test-submit": submitConfirmation,
      "test-results": results,
      "answer-analysis": analysis,
      analytics,
      "study-materials": (t) => resources(t),
      "previous-papers": (t) => resources(t, true),
      "live-classes": classSchedule,
      notifications,
    };
    views[page]?.(target);
  } else if (page === "index") (role === "admin" ? adminOverview : instructorOverview)(target);
  else if (role === "instructor" && page === "courses") courseLibrary(target, role);
  else if (role === "instructor" && page === "content") learning(target, role);
  else if (role === "instructor" && page === "students")
    target.innerHTML = `<div class="grid two">${chartCard("progress", "Individual learner progress")}${chartCard("averages", "Practice score averages")}</div><div class="card panel" style="margin-top:24px">${table(
      ["Fictional learner", "Completion", "Next focus"],
      [
        ["Aarav", "72%", "Percentages"],
        ["Diya", "85%", "Time management"],
        ["Ishaan", "64%", "Revision routine"],
        ["Kavya", "91%", "Advanced practice"],
        ["Rehan", "78%", "Reasoning"],
      ],
    )}</div>`;
  else if (page === "results")
    target.innerHTML = `<div class="grid two">${chartCard("averages", "Demo test averages")}${chartCard("participation", "Demo test participation")}</div><div class="card panel" style="margin-top:24px"><h2>Fictional category result summary</h2>${table(
      ["Category", "Average score"],
      [
        ["Banking", "74%"],
        ["SSC", "71%"],
        ["Railways", "68%"],
        ["Engineering", "77%"],
      ],
    )}<p class="demo-label">Your personal local attempts are available in the student role. These category values are fixed illustrative data.</p></div>`;
  else if (page === "reports") {
    target.innerHTML = `<div class="row" style="margin-bottom:24px"><button class="btn" id="export-report">Download demo report CSV</button></div><div class="grid two">${chartCard("growth", "Student enrollment growth")}${chartCard("revenue", "Fictional revenue")}${chartCard("popularity", "Exam category breakdown")}${chartCard("participation", "Mock test participation")}</div>`;
    target.querySelector("#export-report").onclick = () => {
      const csv =
        "Month,Active students,New enrollments,Fictional revenue INR,Test attempts\nMay,42,18,36000,54\nJune,58,22,44000,72\nJuly,72,27,54000,91\nAugust,96,31,62000,105\nSeptember,112,35,70000,128\nOctober,128,40,80000,156\n";
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = "aurevia-fictional-demo-report.csv";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
  } else if (managerDefinitions[page]) manager(target, page, role);
  renderCharts();
}
