import fs from "node:fs";
const scenes = {
  "path-banking":
    "A young adult Indian woman in a navy blouse studying banking quantitative aptitude at an oak desk, calculator, notebook and textbooks. Warm bright library, vertical portrait editorial photography.",
  "path-ssc":
    "A young adult Indian man in a cream shirt revising general knowledge with colorful restrained sticky-note tabs in a quiet academic library, vertical editorial photograph.",
  "path-railways":
    "Two young adult Indian students solving a reasoning exercise together with a notebook and geometry sketch at a sunlit campus desk, vertical editorial photograph.",
  "path-engineering":
    "Indian young adult engineering aspirant studying beside a small physics model and mathematics notebook in a modern academic laboratory, vertical editorial photograph.",
  "approach-teaching":
    "An Indian woman academic tutor patiently explaining a mathematical concept to two young adult students at a library table, premium natural editorial photography, landscape.",
  "approach-roadmap":
    "Close editorial view of a young adult student creating a tidy weekly study timetable in a notebook with pencil, open books and laptop nearby, natural daylight, landscape.",
  "approach-analysis":
    "Indian young adult student thoughtfully reviewing a practice answer sheet beside a laptop at a bright oak desk, focused analytical learning mood, landscape editorial photography.",
  "approach-support":
    "Friendly academic mentor and young adult Indian woman learner discussing a notebook at a calm campus library table, supportive education scene, landscape editorial photograph.",
  "program-overview":
    "A young adult Indian student studying a carefully organized mathematics notebook at a bright modern library desk, laptop and textbooks, landscape editorial academic photo.",
  "mentor-community":
    "Three Indian academic tutors in their thirties and forties discussing lesson notes at a sunlit library table, friendly approachable calm scene, landscape editorial photo.",
  "live-learning-room":
    "Young adult Indian woman attending an online exam preparation lesson on her laptop with headphones, taking notes at a tidy cream and oak study desk, landscape editorial photo.",
  "revision-library":
    "Beautiful academic still life of an open mathematics notebook, neatly stacked books, pencil and revision flashcards in a warm quiet library, landscape editorial photo.",
  "preparation-planning":
    "Indian adult student using a calculator and planning a learning budget in a notebook beside course books at an oak desk, calm thoughtful scene, landscape editorial photograph.",
  "campus-community-new":
    "Diverse young adult Indian university students talking with a mentor in a beautiful contemporary campus library, warm academic community, landscape editorial photograph.",
};
const prompts = Object.fromEntries(
  Object.entries(scenes).map(([name, scene], index) => [
    name,
    index < 8
      ? "Use case: photorealistic-natural. Asset type: unique photograph for Stackly academic website. " +
        scene +
        " Warm cream, muted navy and teal academic palette. Realistic anatomy and skin, tasteful uncluttered composition, no legible text, no logos, no watermark."
      : "Use case: photorealistic-natural. Unique new Stackly academic website image. " +
        scene +
        " Muted navy, cream and teal, realistic people and anatomy, natural daylight, no readable text, no logos, no watermark.",
  ]),
);
const base = JSON.parse(fs.readFileSync("documentation/image-inventory.json", "utf8")).filter(
  (x) => !x.name.startsWith("enhancements/"),
);
const placements = JSON.parse(fs.readFileSync("documentation/visual-placements.json", "utf8"));
const additions = placements.map((x) => ({
  name: `enhancements/${x.name}.webp`,
  source: x.source,
  license: x.license,
  prompt: prompts[x.name],
  placement: x.key,
}));
for (const name of Object.keys(scenes).slice(0, 8))
  additions.push({
    name: `enhancements/${name}.webp`,
    source: "Built-in image_gen tool",
    license: "AI-generated original asset",
    prompt: prompts[name],
    placement: name.startsWith("path-")
      ? "Main homepage exam pathway card"
      : "Main homepage Stackly approach card",
  });
for (const image of additions)
  if (!fs.existsSync("assets/images/" + image.name)) throw new Error(`Missing ${image.name}`);
fs.writeFileSync(
  "documentation/image-inventory.json",
  JSON.stringify([...base, ...additions], null, 2),
);
fs.writeFileSync("documentation/visual-refresh-prompts.json", JSON.stringify(prompts, null, 2));
console.log(
  `Inventory updated: ${base.length + additions.length} unique content photographs, ${additions.length} new placements.`,
);
