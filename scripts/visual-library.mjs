import fs from "node:fs";

const excluded = new Set([
  "campus-milestone",
  "classroom-focus",
  "guided-study",
  "teacher-workshop",
  "university-students",
  "campus-library",
  "academic-workspace",
  "science-equipment",
]);
const generated = [
  ["program-overview", "study", "An exam aspirant studying mathematics in a modern library"],
  ["mentor-community", "teaching", "Academic tutors discussing lesson notes together"],
  ["live-learning-room", "learning", "An adult learner attending an online class and taking notes"],
  ["revision-library", "library", "Mathematics notes, books, and revision flashcards"],
  ["preparation-planning", "planning", "A student planning a learning budget beside course books"],
  ["campus-community-new", "campus", "Young adult students talking with a mentor on campus"],
].map(([name, category, alt]) => ({
  name,
  category,
  alt,
  file: `assets/images/enhancements/${name}.webp`,
  source: "Built-in image_gen tool",
  license: "AI-generated original asset",
}));
const stock = JSON.parse(
  fs.readFileSync("assets/images/enhancements/manifest.json", "utf8"),
).filter((x) => !excluded.has(x.name));
const available = [...generated, ...stock];
const placements = [];
const used = new Set();
export function visualFor(key, category = "study", preferred = "") {
  const previous = placements.find((x) => x.key === key);
  if (previous) return previous;
  const asset =
    available.find((x) => x.name === preferred && !used.has(x.name)) ||
    stock.find((x) => x.category === category && !used.has(x.name)) ||
    stock.find((x) => !used.has(x.name)) ||
    available.find((x) => !used.has(x.name));
  if (!asset) throw new Error(`No unique image available for ${key}.`);
  used.add(asset.name);
  const entry = {
    ...asset,
    key,
    image: `enhancements/${asset.name}`,
    alt: asset.alt || "Illustrative academic study and learning setting",
  };
  placements.push(entry);
  return entry;
}
export function saveVisualPlacements() {
  fs.writeFileSync("documentation/visual-placements.json", JSON.stringify(placements, null, 2));
}
