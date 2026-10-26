try {
  const theme = localStorage.getItem("stackly-theme");
  document.documentElement.dataset.theme =
    theme === "dark" || theme === "light"
      ? theme
      : matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
  document.documentElement.dir = localStorage.getItem("stackly-dir") === "rtl" ? "rtl" : "ltr";
} catch {
  document.documentElement.dataset.theme = "light";
}
