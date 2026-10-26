import fs from "node:fs";

export const brandMark = `<svg class="brand-mark" viewBox="0 0 48 48" fill="none" aria-hidden="true">
  <path d="M24 3 43 10v14c0 11-9 17-19 21C14 41 5 35 5 24V10L24 3Z" fill="#142D4E" stroke="#C59B53" stroke-width="1.8"/>
  <path d="M13 16c4-1 8 0 11 3 3-3 7-4 11-3v15c-4-1-8 0-11 3-3-3-7-4-11-3V16Z" stroke="#F2D59C" stroke-width="1.7" stroke-linejoin="round"/>
  <path d="M24 19v15M17 21l3 1M17 25l3 1M28 22l3-1M28 26l3-1" stroke="#F2D59C" stroke-width="1.5" stroke-linecap="round"/>
</svg>`;

const logo = (
  dark,
) => `<svg xmlns="http://www.w3.org/2000/svg" width="250" height="64" viewBox="0 0 250 64">
  <g transform="translate(0 7)">${brandMark.replace(/<svg[^>]*>/, "").replace("</svg>", "")}</g>
  <text x="62" y="35" fill="${dark ? "#F0F4FA" : "#142D4E"}" font-family="Georgia,serif" font-size="32" font-weight="600">Aurevia</text>
  <text x="65" y="53" fill="${dark ? "#E3C88E" : "#796139"}" font-family="Arial,sans-serif" font-size="12" letter-spacing="3">ACADEMY</text>
</svg>`;
fs.writeFileSync("assets/images/logo.svg", logo(false));
fs.writeFileSync("assets/images/logo-dark.svg", logo(true));
fs.writeFileSync(
  "assets/images/favicon.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#142D4E"/><g transform="translate(8 8)">${brandMark.replace(/<svg[^>]*>/, "").replace("</svg>", "")}</g></svg>`,
);
