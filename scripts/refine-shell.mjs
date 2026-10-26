import fs from "node:fs";
let source = fs.readFileSync("scripts/build.mjs", "utf8");
const start = source.indexOf("const icons = {");
const end = source.indexOf("const brand =", start);
if (start >= 0 && end > start)
  source = source.slice(0, start) + "const icons = iconPaths;\n" + source.slice(end);
if (!source.includes('from "../assets/js/icons.js"'))
  source = source.replace(
    'import fs from "node:fs";',
    'import fs from "node:fs";\nimport {icon, iconPaths, markupWithIcons} from "../assets/js/icons.js";',
  );
source = source.replace(
  '${navLink("Login", "login.html", "btn header-login")}${themeButton()}${directionButton()}',
  '${themeButton()}${directionButton()}${navLink("Login", "login.html", "btn header-login")}',
);
source = source.replace(
  'aria-label="LinkedIn integration information">in</a>',
  'aria-label="LinkedIn integration information">${icon("linkedin")}</a>',
);
source = source.replace(
  'aria-label="YouTube integration information">▶</a>',
  'aria-label="YouTube integration information">${icon("youtube")}</a>',
);
source = source.replace(
  'aria-label="Instagram integration information">◎</a>',
  'aria-label="Instagram integration information">${icon("instagram")}</a>',
);
source = source.replace(
  '<div class="footer-bottom row between"><span>© 2026 Aurevia Academy. Educational website template.</span><div class="row"><a href="privacy.html">Privacy Policy</a><a href="terms.html">Terms & Conditions</a>${directionButton()}</div></div>',
  '<div class="footer-bottom"><span>© 2026 Aurevia Academy. All rights reserved.</span></div>',
);
source = source.replace(
  'data-close-dialog aria-label="Close dialog">×</button>',
  'data-close-dialog aria-label="Close dialog">${icon("close")}</button>',
);
// Render visible text arrows, stars and checks using the same SVG set before writing static HTML.
source = source.replace(
  'documentHTML(title, `${header(slug + ".html")}<main id="main">${content}</main>${footer()}`, {',
  'documentHTML(title, markupWithIcons(`${header(slug + ".html")}<main id="main">${content}</main>${footer()}`), {',
);
source = source.replace(
  'documentHTML(title, body, { root: "../../", dashboard: true, canonical: file })',
  'documentHTML(title, markupWithIcons(body), { root: "../../", dashboard: true, canonical: file })',
);
source = source.replace(
  'data-back-top aria-label="Back to top">↑</button>',
  'data-back-top aria-label="Back to top">${icon("arrow-up")}</button>',
);
fs.writeFileSync("scripts/build.mjs", source);
