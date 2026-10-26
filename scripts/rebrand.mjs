import fs from "node:fs";

const file = "scripts/build.mjs";
let source = fs.readFileSync(file, "utf8");
source = source.replaceAll(
  '<button class="icon-button" data-theme-toggle aria-label="Switch color theme">${icon("sun")}</button>',
  "${themeButton()}${directionButton()}",
);
source = source.replaceAll(
  '<button class="tab" data-dir-toggle>RTL demo</button>',
  "${directionButton()}",
);
source = source
  .replaceAll("Stackly", "Aurevia")
  .replaceAll("STACKLY", "AUREVIA")
  .replaceAll("stackly", "aurevia")
  .replaceAll("Aurevia Coaching", "Aurevia Academy");
fs.writeFileSync(file, source);
for (const file of ["assets/js/main.js", "assets/js/dashboard.js"]) {
  let text = fs
    .readFileSync(file, "utf8")
    .replaceAll("Stackly", "Aurevia")
    .replaceAll("STACKLY", "AUREVIA")
    .replaceAll("Aurevia Coaching", "Aurevia Academy");
  if (file.endsWith("dashboard.js"))
    text = text.replace("stackly-fictional-demo-report.csv", "aurevia-fictional-demo-report.csv");
  fs.writeFileSync(file, text);
}
for (const name of fs.readdirSync("assets/downloads")) {
  const file = "assets/downloads/" + name;
  fs.writeFileSync(file, fs.readFileSync(file, "utf8").replaceAll("Stackly", "Aurevia"));
}
console.log("Updated visible branding. Existing browser-local learning data keys are preserved.");
