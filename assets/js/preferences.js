const sunPath =
  "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1 1M18 18l1 1M5 19l1-1M18 6l1-1";
const moonPath = "M20.5 13.2A8.6 8.6 0 0 1 10.8 3.5a8.7 8.7 0 1 0 9.7 9.7Z";

export function syncPreferenceControls() {
  const dark = document.documentElement.dataset.theme === "dark";
  const rtl = document.documentElement.dir === "rtl";
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    const label = dark ? "Switch to light mode" : "Switch to dark mode";
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
    button.setAttribute("aria-pressed", String(dark));
    if (button.classList.contains("icon-button")) {
      button.classList.add("theme-button");
      if (!button.querySelector(".theme-moon"))
        button.innerHTML = `<svg class="icon theme-sun" viewBox="0 0 24 24" aria-hidden="true"><path d="${sunPath}"/></svg><svg class="icon theme-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="${moonPath}"/></svg>`;
    } else
      button.textContent = button.hasAttribute("data-compact-theme")
        ? dark
          ? "Light mode"
          : "Dark mode"
        : label;
  });
  document.querySelectorAll("[data-dir-toggle]").forEach((button) => {
    const label = rtl ? "Switch to left-to-right layout" : "Switch to right-to-left layout";
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
    button.setAttribute("aria-pressed", String(rtl));
    const text = button.querySelector("[data-dir-label]");
    if (text) text.textContent = rtl ? "LTR" : "RTL";
    else button.textContent = rtl ? "Switch to LTR" : "Switch to RTL";
  });
}
