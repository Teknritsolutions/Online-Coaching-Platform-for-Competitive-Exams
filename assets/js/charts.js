import { baselineAttempts, questions, studyActivity } from "./data.js";
import { attempts } from "./store.js";
import { table } from "./ui.js";
const instances = new Map();
export const history = () => [...baselineAttempts, ...attempts()];
export function metrics() {
  const data = history();
  const totalCorrect = data.reduce((s, a) => s + a.correct, 0);
  const totalIncorrect = data.reduce((s, a) => s + a.incorrect, 0);
  const totalUnattempted = data.reduce((s, a) => s + a.unattempted, 0);
  return {
    tests: data.length,
    average: data.reduce((s, a) => s + (100 * a.score) / a.maximum, 0) / data.length,
    accuracy: (100 * totalCorrect) / (totalCorrect + totalIncorrect || 1),
    hours: studyActivity.reduce((s, n) => s + n, 0),
    totalCorrect,
    totalIncorrect,
    totalUnattempted,
  };
}
function subjectData() {
  const saved = attempts();
  const labels = ["Quantitative Aptitude", "Reasoning", "English", "General Awareness"];
  return {
    labels,
    values: labels.map((s) => {
      const entries = saved
        .flatMap((a) => a.details || [])
        .filter((d) => d.subject === s && d.response !== null);
      return entries.length
        ? Math.round((100 * entries.filter((d) => d.isCorrect).length) / entries.length)
        : 0;
    }),
  };
}
export function chartData(key) {
  const m = metrics(),
    data = history();
  const last = attempts().at(-1);
  const details = last?.details || [];
  const subjects = subjectData();
  const topics = [...new Set(questions.map((q) => q.topic))];
  const definitions = {
    score: {
      type: "line",
      labels: data.map((a) => a.label || "New attempt"),
      values: data.map((a) => +((100 * a.score) / a.maximum).toFixed(1)),
      label: "Score (%)",
      max: 100,
    },
    subjects: {
      type: "bar",
      horizontal: true,
      ...subjects,
      label: "Accuracy (%) — saved attempts",
      max: 100,
    },
    accuracy: {
      type: "doughnut",
      labels: ["Correct", "Incorrect", "Unattempted"],
      values: [m.totalCorrect, m.totalIncorrect, m.totalUnattempted],
      label: "Questions",
    },
    activity: {
      type: "bar",
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      values: studyActivity,
      label: "Study hours",
    },
    topics: {
      type: "bar",
      horizontal: true,
      labels: topics,
      values: topics.map((t) => {
        const ds = details.filter((d) => d.topic === t);
        return ds.length ? Math.round((100 * ds.filter((d) => d.isCorrect).length) / ds.length) : 0;
      }),
      label: "Latest attempt accuracy (%)",
      max: 100,
    },
    time: {
      type: "bar",
      labels: ["Quantitative Aptitude", "Reasoning", "English", "General Awareness"],
      values: ["Quantitative Aptitude", "Reasoning", "English", "General Awareness"].map((s) => {
        const ds = details.filter((d) => d.subject === s);
        return ds.length ? Math.round(ds.reduce((n, d) => n + d.seconds, 0) / ds.length) : 0;
      }),
      label: "Latest attempt seconds / question",
    },
    growth: {
      type: "line",
      labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"],
      values: [42, 58, 72, 96, 112, 128],
      label: "Fictional active students",
    },
    enrollment: {
      type: "bar",
      labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"],
      values: [18, 22, 27, 31, 35, 40],
      label: "Demo monthly enrollments",
    },
    revenue: {
      type: "bar",
      labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"],
      values: [36000, 44000, 54000, 62000, 70000, 80000],
      label: "Fictional revenue (₹)",
    },
    popularity: {
      type: "doughnut",
      labels: ["Banking", "SSC", "Railways", "Engineering"],
      values: [48, 36, 24, 20],
      label: "Fictional students",
    },
    participation: {
      type: "line",
      labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"],
      values: [54, 72, 91, 105, 128, 156],
      label: "Demo test attempts",
    },
    averages: {
      type: "bar",
      labels: ["Banking", "SSC", "Railways", "Engineering"],
      values: [74, 71, 68, 77],
      label: "Demo average score (%)",
      max: 100,
    },
    progress: {
      type: "bar",
      labels: ["Aarav", "Diya", "Ishaan", "Kavya", "Rehan"],
      values: [72, 85, 64, 91, 78],
      label: "Fictional course progress (%)",
      max: 100,
    },
  };
  return definitions[key] || definitions.score;
}
export function renderCharts() {
  const color = getComputedStyle(document.documentElement).getPropertyValue("--muted").trim();
  const border = getComputedStyle(document.documentElement).getPropertyValue("--border").trim();
  document.querySelectorAll("canvas[data-chart]").forEach((canvas) => {
    instances.get(canvas)?.destroy();
    const key = canvas.dataset.chart,
      d = chartData(key),
      doughnut = d.type === "doughnut";
    const tableTarget = document.querySelector(`[data-chart-table="${key}"]`);
    if (tableTarget)
      tableTarget.innerHTML = table(
        ["Measure", d.label],
        d.labels.map((l, i) => [l, d.values[i]]),
      );
    if (!window.Chart) {
      canvas.parentElement.innerHTML =
        "<p>Chart library unavailable. Use the data table below.</p>";
      return;
    }
    const chart = new window.Chart(canvas, {
      type: d.type,
      data: {
        labels: d.labels,
        datasets: [
          {
            label: d.label,
            data: d.values,
            backgroundColor: doughnut
              ? ["#0e8f86", "#d08b74", "#a7b3c4"]
              : d.type === "line"
                ? "#0e8f8617"
                : key === "topics"
                  ? d.values.map((v) => (v < 60 ? "#c29247" : "#0e8f86"))
                  : "#0e8f86",
            borderColor: doughnut ? "transparent" : "#0e8f86",
            borderWidth: doughnut ? 0 : d.type === "line" ? 2 : 0,
            borderRadius: d.type === "bar" ? 4 : 0,
            tension: 0.35,
            fill: d.type === "line",
            pointRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: d.horizontal ? "y" : "x",
        animation: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? false
          : { duration: 400 },
        plugins: {
          legend: {
            display: doughnut,
            position: "bottom",
            labels: { color, boxWidth: 10, padding: 18, font: { size: 12 } },
          },
          tooltip: { enabled: true },
        },
        cutout: doughnut ? "74%" : undefined,
        scales: doughnut
          ? {}
          : {
              x: {
                grid: { display: !!d.horizontal, color: border },
                ticks: { color, font: { size: 12 } },
                beginAtZero: true,
                max: d.horizontal ? d.max : undefined,
              },
              y: {
                grid: { display: !d.horizontal, color: border },
                ticks: { color, font: { size: 12 } },
                beginAtZero: true,
                max: !d.horizontal ? d.max : undefined,
              },
            },
      },
    });
    instances.set(canvas, chart);
  });
}
