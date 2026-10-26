/* One consistent, lightweight outline SVG set for public pages and workspaces. */
export const iconPaths = {
  book: "M3 4h7l2 2 2-2h7v15h-7l-2 2-2-2H3zM12 6v15",
  bank: "M3 9l9-6 9 6H3zM5 11v7m5-7v7m4-7v7m5-7v7M3 21h18",
  train: "M6 3h12v14H6zM6 10h12M9 20l-2 2m8-2 2 2M9 14h.01M15 14h.01",
  atom: "M12 3v18M3 12h18M5 5l14 14M5 19L19 5",
  chart: "M4 3v18h17M8 16l4-6 4 3 5-8",
  check: "M5 12l4 4L20 5",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 7v5l3 2",
  people:
    "M16 21v-4a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v4M9 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6M22 21v-4a4 4 0 0 0-3-4M16 3a3 3 0 0 1 0 6",
  arrow: "M5 12h14M14 7l5 5-5 5",
  "arrow-left": "M19 12H5m5-5-5 5 5 5",
  "arrow-up": "M12 19V5m-5 5 5-5 5 5",
  download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
  "arrow-up-right": "M6 18 18 6M6 6h12v12",
  close: "M6 6l12 12M6 18 18 6",
  menu: "M4 6h16M4 12h16M4 18h16",
  sun: "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1 1M18 18l1 1M5 19l1-1M18 6l1-1",
  moon: "M20.5 13.2A8.6 8.6 0 0 1 10.8 3.5a8.7 8.7 0 1 0 9.7 9.7Z",
  direction: "M4 7h16m-4-4 4 4-4 4M20 17H4m4-4-4 4 4 4",
  bell: "M6 8a6 6 0 0 1 12 0v8l2 2H4l2-2V8M10 21h4",
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  file: "M5 3h10l4 4v14H5zM14 3v5h5M8 12h8M8 16h8",
  video: "M3 6h12v12H3zM15 10l6-4v12l-6-4",
  award: "M12 3l3 5 6 1-4 4 1 7-6-3-6 3 1-7-4-4 6-1z",
  star: "m12 3 2.8 5.7 6.3.9-4.6 4.4 1.1 6.3-5.6-3-5.6 3 1.1-6.3L3 9.6l6.2-.9L12 3Z",
};
const socialShapes = {
  linkedin:
    '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 10v7M7 7h.01M11 17v-7m0 3a3 3 0 0 1 6 0v4"/>',
  youtube:
    '<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3V9Z" fill="currentColor" stroke="none"/>',
  instagram:
    '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>',
};
export function icon(name, extraClass = "") {
  return `<svg class="icon ${extraClass}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${socialShapes[name] || `<path d="${iconPaths[name] || iconPaths.book}"/>`}</svg>`;
}
const glyphNames = {
  "→": "arrow",
  "←": "arrow-left",
  "↑": "arrow-up",
  "↓": "download",
  "↗": "arrow-up-right",
  "✓": "check",
  "★": "star",
};
const glyphPattern = /[→←↑↓↗✓★]/g;
export function textWithIcons(text) {
  return text.replace(glyphPattern, (glyph) => icon(glyphNames[glyph], "inline-icon"));
}
export function markupWithIcons(html) {
  return html.replace(/>([^<>]+)</g, (match, text) => `>${textWithIcons(text)}<`);
}
export function refreshActionIcons(root = document) {
  const selector = ".btn, .text-link, .tab, .stars, .profile-circle, .back-top";
  const elements = [
    ...(root.matches?.(selector) ? [root] : []),
    ...(root.querySelectorAll?.(selector) || []),
  ];
  for (const element of elements) {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode())
      if (/[→←↑↓↗✓★]/.test(walker.currentNode.data)) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const template = document.createElement("template");
      const safeText = node.data.replace(
        /[&<>"']/g,
        (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
      );
      template.innerHTML = textWithIcons(safeText);
      node.replaceWith(template.content);
    }
  }
}
