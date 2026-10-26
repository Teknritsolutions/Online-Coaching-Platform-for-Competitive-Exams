export function read(key, fallback, validate = () => true) {
  try {
    const value = JSON.parse(localStorage.getItem("stackly-" + key));
    return value !== null && validate(value) ? value : fallback;
  } catch {
    return fallback;
  }
}
export function save(key, value) {
  try {
    localStorage.setItem("stackly-" + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
export function remove(key) {
  try {
    localStorage.removeItem("stackly-" + key);
  } catch {
    /* Storage may be disabled. */
  }
}
export const escapeHTML = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
export const attemptValid = (a) =>
  a &&
  typeof a.id === "string" &&
  Number.isFinite(a.score) &&
  Number.isFinite(a.maximum) &&
  a.maximum > 0 &&
  a.score >= -a.maximum &&
  a.score <= a.maximum &&
  ["correct", "incorrect", "unattempted", "seconds"].every(
    (k) => Number.isFinite(a[k]) && a[k] >= 0,
  ) &&
  Number.isFinite(a.accuracy);
export const attempts = () =>
  read("attempts", [], (v) => Array.isArray(v) && v.every(attemptValid));
export const userProfile = () =>
  read(
    "profile",
    { name: "Alex Kumar", email: "alex@example.com", interest: "Banking" },
    (v) =>
      v &&
      typeof v.name === "string" &&
      typeof v.email === "string" &&
      typeof v.interest === "string",
  );
