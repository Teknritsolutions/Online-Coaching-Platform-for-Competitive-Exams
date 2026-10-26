import { questions, tests, scoring } from "./data.js";
import { read, save, remove, attempts } from "./store.js";
import { e, button, modal, toast, table, checkList } from "./ui.js";

export function getTest() {
  const id = new URLSearchParams(location.search).get("test") || "foundation";
  return tests.find((t) => t.id === id) || tests[0];
}
export const testQuestions = (test) =>
  test.questions.map((id) => questions.find((q) => q.id === id));
export function scoreAttempt(test, responses, times = {}) {
  const details = testQuestions(test).map((q) => {
    const response =
      Number.isInteger(responses[q.id]) &&
      responses[q.id] >= 0 &&
      responses[q.id] < q.options.length
        ? responses[q.id]
        : null;
    return {
      questionId: q.id,
      subject: q.subject,
      topic: q.topic,
      response,
      isCorrect: response === q.answer,
      seconds: Math.max(0, Number(times[q.id]) || 0),
    };
  });
  const correct = details.filter((d) => d.isCorrect).length,
    incorrect = details.filter((d) => d.response !== null && !d.isCorrect).length,
    unattempted = details.length - correct - incorrect;
  return {
    correct,
    incorrect,
    unattempted,
    score: correct * scoring.correct + incorrect * scoring.incorrect,
    maximum: details.length * scoring.correct,
    accuracy: correct + incorrect ? (100 * correct) / (correct + incorrect) : 0,
    details,
  };
}
export function draftValid(v) {
  return (
    v &&
    tests.some((t) => t.id === v.testId) &&
    Number.isFinite(v.deadline) &&
    Number.isFinite(v.started) &&
    v.responses &&
    typeof v.responses === "object" &&
    !Array.isArray(v.responses) &&
    v.times &&
    typeof v.times === "object" &&
    Object.values(v.responses).every((x) => Number.isInteger(x) && x >= 0 && x < 4) &&
    Object.values(v.times).every((x) => Number.isFinite(x) && x >= 0) &&
    Array.isArray(v.reviewed) &&
    v.reviewed.every(Number.isInteger) &&
    Number.isInteger(v.index) &&
    v.index >= 0
  );
}
export const draft = () => read("exam-draft", null, draftValid);
const resultURL = (id) => `test-results.html?attempt=${encodeURIComponent(id)}`;

export function instructions(target) {
  const t = getTest(),
    existing = draft();
  target.innerHTML = `<div class="instruction-layout"><section class="card panel"><span class="eyebrow">BEFORE YOU BEGIN</span><h2>${t.name}</h2><p>${t.questions.length} questions · ${t.minutes} minutes · Front-end demo</p>${checkList(["Each correct answer earns 2 marks.", "Each incorrect answer deducts 0.5 marks.", "Unattempted questions receive 0 marks.", "Save and Next records your selection automatically.", "Mark for Review keeps the selected answer and flags the question.", "Time continues across navigation and reloads.", "Your saved answers submit automatically when time expires."])}<label class="row"><input type="checkbox" id="accept-instructions"> I understand the demo test instructions.</label><button class="btn" id="begin-test" style="margin-top:20px">Start ${t.minutes}-minute test</button><p id="instruction-status" class="form-status" role="status"></p></section><aside class="card panel"><h2>Practice with perspective.</h2><p>This is a small original sample question set, not a full official examination. Local storage is not secure exam storage.</p>${existing ? `<div class="notice">A saved ${e(tests.find((x) => x.id === existing.testId)?.name)} attempt is available.</div>${button("Resume saved attempt", `attempt-test.html?test=${existing.testId}`, "secondary")}` : ""}<hr class="rule"><p>Keep this tab open while taking the demo test. Time is calculated from a persisted deadline.</p></aside></div>`;
  target.querySelector("#begin-test").addEventListener("click", () => {
    if (!target.querySelector("#accept-instructions").checked) {
      target.querySelector("#instruction-status").textContent =
        "Please confirm that you have read the instructions.";
      return;
    }
    const start = () => {
      const now = Date.now();
      const ok = save("exam-draft", {
        testId: t.id,
        started: now,
        deadline: now + t.minutes * 60000,
        responses: {},
        reviewed: [],
        times: {},
        index: 0,
      });
      if (!ok) {
        toast("Browser storage is unavailable. Enable local storage to start the demo test.");
        return;
      }
      location.href = `attempt-test.html?test=${t.id}`;
    };
    if (existing) {
      const dialog = modal(
        "Replace the saved attempt?",
        `<p>Starting a new test will replace your unfinished attempt. Completed results will remain.</p><div class="row"><button class="btn" id="replace-attempt">Start new attempt</button><button class="btn secondary" data-close-dialog>Keep saved attempt</button></div>`,
      );
      dialog.querySelector("#replace-attempt").onclick = start;
    } else start();
  });
}
export function submitDraft(state, auto = false) {
  const t = tests.find((x) => x.id === state.testId);
  const score = scoreAttempt(t, state.responses, state.times);
  const all = attempts();
  const id = `attempt-${state.started}`;
  if (all.some((a) => a.id === id)) {
    remove("exam-draft");
    location.href = resultURL(id);
    return;
  }
  const result = {
    id,
    testId: t.id,
    label: t.name,
    date: new Date().toISOString(),
    ...score,
    seconds: Math.min(t.minutes * 60, Math.max(0, Math.round((Date.now() - state.started) / 1000))),
    auto,
  };
  if (!save("attempts", [...all, result].slice(-100))) {
    toast("Could not save this result. Free browser storage and try submitting again.");
    return;
  }
  remove("exam-draft");
  location.href = resultURL(id);
}
export function attemptTest(target) {
  let state = draft();
  if (!state) {
    target.innerHTML = `<div class="card panel"><h2>Ready for purposeful practice?</h2><p>Read the instructions before starting a new timed test.</p>${button("Read test instructions", "test-instructions.html")}</div>`;
    return;
  }
  const t = tests.find((x) => x.id === state.testId),
    qs = testQuestions(t);
  state.index = Math.min(state.index, qs.length - 1);
  let activeSince = Date.now();
  const recordTime = () => {
    const now = Date.now();
    state.times[qs[state.index].id] =
      (state.times[qs[state.index].id] || 0) + (now - activeSince) / 1000;
    activeSince = now;
  };
  const persist = () => save("exam-draft", state);
  const render = () => {
    const q = qs[state.index];
    target.innerHTML = `<div class="row between" style="margin-bottom:24px"><div><span class="eyebrow">${t.name}</span><span class="small">+2 correct · −0.5 incorrect · 0 unattempted</span></div><div><span class="small muted">Time remaining</span><div class="timer" role="timer" id="test-timer"></div></div></div><div class="test-layout"><section class="card panel"><div class="row between"><span class="pill">${q.subject}</span><span class="small muted">Question ${state.index + 1} of ${qs.length}</span></div><h2 class="question-text">${q.text}</h2><div>${q.options.map((o, i) => `<label class="option"><input type="radio" name="answer" value="${i}" ${state.responses[q.id] === i ? "checked" : ""}><span>${String.fromCharCode(65 + i)}. ${o}</span></label>`).join("")}</div><hr class="rule"><div class="row between"><div class="row"><button class="btn secondary small" id="clear-response">Clear Response</button><button class="btn secondary small" id="mark-review">${state.reviewed.includes(q.id) ? "Unmark Review" : "Mark for Review"}</button></div><button class="btn small" id="save-next">${state.index === qs.length - 1 ? "Save & Review" : "Save & Next"} →</button></div></section><aside class="card panel"><h2>Question palette</h2><p class="small">Choose a question to revisit.</p><div class="palette">${qs.map((x, i) => `<button class="${state.responses[x.id] !== undefined ? "answered " : ""}${state.reviewed.includes(x.id) ? "reviewed " : ""}${state.index === i ? "current" : ""}" data-question-index="${i}" aria-label="Question ${i + 1}${state.responses[x.id] !== undefined ? ", answered" : ""}${state.reviewed.includes(x.id) ? ", marked for review" : ""}" ${state.index === i ? 'aria-current="step"' : ""}>${i + 1}</button>`).join("")}</div><p class="small">Teal: answered · Purple: review<br>Outline: current · Plain: unanswered</p><p class="small"><strong>${Object.keys(state.responses).length}</strong> / ${qs.length} answered</p><button class="btn" id="review-submit">Review & Submit</button><p class="demo-label" style="margin-top:20px">Answers save on selection. Timer continues after reload.</p></aside></div>`;
    target.querySelectorAll('[name="answer"]').forEach(
      (input) =>
        (input.onchange = () => {
          state.responses[q.id] = Number(input.value);
          persist();
        }),
    );
    target
      .querySelectorAll("[data-question-index]")
      .forEach((b) => (b.onclick = () => navigate(Number(b.dataset.questionIndex))));
    target.querySelector("#clear-response").onclick = () => {
      recordTime();
      delete state.responses[q.id];
      persist();
      render();
    };
    target.querySelector("#mark-review").onclick = () => {
      recordTime();
      state.reviewed = state.reviewed.includes(q.id)
        ? state.reviewed.filter((id) => id !== q.id)
        : [...state.reviewed, q.id];
      persist();
      render();
    };
    target.querySelector("#save-next").onclick = () =>
      state.index < qs.length - 1 ? navigate(state.index + 1) : review();
    target.querySelector("#review-submit").onclick = review;
    updateTimer();
  };
  const navigate = (i) => {
    recordTime();
    state.index = i;
    persist();
    render();
  };
  const review = () => {
    recordTime();
    persist();
    location.href = "test-submit.html";
  };
  const updateTimer = () => {
    const remaining = Math.max(0, Math.ceil((state.deadline - Date.now()) / 1000));
    const timer = target.querySelector("#test-timer");
    if (timer)
      timer.textContent = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;
  };
  render();
  const interval = setInterval(() => {
    recordTime();
    persist();
    updateTimer();
    if (Date.now() >= state.deadline) {
      clearInterval(interval);
      submitDraft(state, true);
    }
  }, 1000);
  window.addEventListener(
    "pagehide",
    () => {
      recordTime();
      if (draft()?.started === state.started) persist();
      clearInterval(interval);
    },
    { once: true },
  );
  if (Date.now() >= state.deadline) {
    clearInterval(interval);
    submitDraft(state, true);
  }
}
export function submitConfirmation(target) {
  const state = draft();
  if (!state) {
    target.innerHTML = `<div class="card panel"><h2>No unfinished attempt</h2><p>Start a new test or review your latest result.</p><div class="row">${button("Open mock tests", "mock-tests.html")}${button("View results", "test-results.html", "secondary")}</div></div>`;
    return;
  }
  const t = tests.find((x) => x.id === state.testId),
    answered = Object.keys(state.responses).length;
  target.innerHTML = `<div class="card panel reading"><span class="eyebrow">ONE LAST LOOK</span><h2>Ready to submit ${t.name}?</h2><p>${answered} answered · ${t.questions.length - answered} unanswered · ${state.reviewed.length} marked for review.</p><div class="notice">Submission ends this attempt. You will receive a score, answer explanations, and a question-by-question time breakdown.</div><div class="row"><button class="btn" id="final-submit">Submit test & view results</button>${button("Return to questions", `attempt-test.html?test=${t.id}`, "secondary")}</div><p class="small muted" style="margin-top:20px">The timer continues while you review this confirmation.</p></div>`;
  target.querySelector("#final-submit").onclick = () => submitDraft(state);
  const interval = setInterval(() => {
    if (Date.now() >= state.deadline) {
      clearInterval(interval);
      submitDraft(state, true);
    }
  }, 500);
  window.addEventListener("pagehide", () => clearInterval(interval), { once: true });
}
export function selectedResult() {
  const id = new URLSearchParams(location.search).get("attempt");
  const all = attempts();
  return all.find((a) => a.id === id) || all.at(-1);
}
export function results(target) {
  const a = selectedResult();
  if (!a) {
    target.innerHTML = `<div class="card panel"><h2>Your next insight starts with practice.</h2><p>Complete a demo mock test to see your score and detailed answer analysis.</p>${button("Choose a test", "mock-tests.html")}</div>`;
    return;
  }
  target.innerHTML = `<div class="grid two"><section class="card panel"><span class="eyebrow">${e(a.label)}</span><div class="result-score"><strong>${a.score}</strong><small>out of ${a.maximum} marks</small></div><h2 style="text-align:center">A clearer picture of your preparation.</h2><p style="text-align:center">${a.auto ? "Automatically submitted when time expired." : "Submitted successfully."} Review the details and choose your next focus.</p><div class="row" style="justify-content:center">${button("Review every answer", `answer-analysis.html?attempt=${a.id}`)}${button("View analytics", "analytics.html", "secondary")}</div></section><section class="card panel"><h2>Your attempt at a glance</h2>${table(
    ["Measure", "Value"],
    [
      ["Correct answers", a.correct],
      ["Incorrect answers", a.incorrect],
      ["Unattempted", a.unattempted],
      ["Accuracy (correct / answered)", a.accuracy.toFixed(1) + "%"],
      ["Time elapsed", `${Math.floor(a.seconds / 60)}m ${a.seconds % 60}s`],
      ["Scoring", "+2 correct / −0.5 incorrect"],
    ],
  )}<p class="demo-label" style="margin-top:20px">Score = ${a.correct} × 2 − ${a.incorrect} × 0.5 = ${a.score}. Unanswered questions contribute zero.</p></section></div><section class="card panel" style="margin-top:24px"><h2>Saved attempt history</h2>${table(
    ["Test", "Date", "Score", "Accuracy", "Review"],
    attempts()
      .slice()
      .reverse()
      .map((x) => [
        e(x.label),
        new Date(x.date).toLocaleDateString(),
        `${x.score} / ${x.maximum}`,
        x.accuracy.toFixed(1) + "%",
        button("Open", resultURL(x.id), "secondary small"),
      ]),
  )}</section>`;
}
export function analysis(target) {
  const a = selectedResult();
  if (!a) {
    results(target);
    return;
  }
  target.innerHTML = `<div class="notice">${e(a.label)} · ${a.correct} correct · ${a.incorrect} incorrect · ${a.unattempted} unattempted. Time is recorded while each question is active.</div><div class="stack">${(
    a.details || []
  )
    .map((d, i) => {
      const q = questions.find((x) => x.id === d.questionId);
      if (!q) return "";
      return `<article class="card panel"><div class="row between"><span class="pill">${q.subject} / ${q.topic}</span><span class="${d.isCorrect ? "correct" : d.response === null ? "muted" : "incorrect"}">${d.isCorrect ? "Correct" : d.response === null ? "Unattempted" : "Incorrect"} · ${Math.round(d.seconds)} seconds</span></div><h2 class="question-text">${i + 1}. ${q.text}</h2><p>Your answer: <strong>${d.response === null ? "Not answered" : q.options[d.response]}</strong><br>Correct answer: <strong class="correct">${q.options[q.answer]}</strong></p><div class="notice" style="margin-bottom:0">${q.explanation}</div></article>`;
    })
    .join(
      "",
    )}</div><div class="row" style="margin-top:24px">${button("Return to result", resultURL(a.id))}${button("Choose another test", "mock-tests.html", "secondary")}</div>`;
}
