import fs from "node:fs";
const file = "assets/css/style.css";
const css = fs
  .readFileSync(file, "utf8")
  .replace(/([^{}]+)\{([^{}]*)\}/g, (block, selector, body) => {
    const selectors = selector.trim().split(",");
    // Paragraph sizes have a single source of truth; headings, labels and metadata spans retain their hierarchy.
    if (selectors.some((s) => /(?:^|[\s>])p(?:\s|$|[.:#])/.test(s)))
      body = body.replace(/\s*font-size\s*:[^;]+;/g, "");
    return `${selector}{${body}}`;
  });
fs.writeFileSync(file, css);
