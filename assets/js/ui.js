import { escapeHTML } from "./store.js";
import { icon } from "./icons.js";
let toastTimer;
export function toast(message) {
  const target = document.querySelector(".toast");
  if (!target) return;
  target.textContent = message;
  target.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    target.hidden = true;
  }, 5500);
}
export function modal(title, html) {
  const dialog = document.querySelector("#app-dialog");
  if (!dialog) return;
  document.querySelector("#dialog-title").textContent = title;
  document.querySelector("#dialog-content").innerHTML = html;
  if (!dialog.open) dialog.showModal();
  return dialog;
}
export const e = escapeHTML;
export const button = (text, href, cls = "") =>
  `<a class="btn ${cls}" href="${href}">${text} ${icon("arrow")}</a>`;
export const panel = (title, body) =>
  `<section class="card panel"><h2>${title}</h2>${body}</section>`;
export const table = (headers, rows) =>
  `<div class="table-wrap"><table><thead><tr>${headers.map((h) => `<th scope="col">${h}</th>`).join("")}</tr></thead><tbody>${rows.length ? rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("") : `<tr><td colspan="${headers.length}">No matching records. Adjust your search or add a new record.</td></tr>`}</tbody></table></div>`;
export const chartCard = (key, title, sub = "Illustrative demo data") =>
  `<article class="card chart-card"><h2>${title}</h2><p>${sub}</p><div class="chart-box"><canvas data-chart="${key}" role="img" aria-label="${title}. Accessible data table follows."></canvas></div><details><summary>View accessible data table</summary><div data-chart-table="${key}"></div></details></article>`;
export const field = (label, name, value = "", type = "text", required = true) =>
  `<div class="form-field"><label for="field-${name}">${label}</label><input type="${type}" name="${name}" id="field-${name}" value="${e(value)}" ${required ? "required" : ""}></div>`;
export const checkList = (values) =>
  `<ul class="check-list">${values.map((v) => `<li>${v}</li>`).join("")}</ul>`;
