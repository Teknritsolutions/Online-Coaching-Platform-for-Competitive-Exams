import fs from "node:fs";

const directory = "assets/images/enhancements";
fs.mkdirSync(directory, { recursive: true });
// Public, individually licensed Unsplash photographs. Images are downloaded once and served locally.
const sources = [
  ["collaborative-learning", "learning", "photo-1522071820081-009f0129c71c"],
  ["campus-discussion", "learning", "photo-1521737711867-e3b97375f902"],
  ["group-workshop", "teaching", "photo-1531482615713-2afd69097998"],
  ["classroom-learning", "teaching", "photo-1524178232363-1fb2b075b655"],
  ["classroom-focus", "teaching", "photo-1509062522246-3755977927d7"],
  ["teacher-workshop", "teaching", "photo-1588072432836-e10032774350"],
  ["guided-study", "teaching", "photo-1577896851231-70ef18881754"],
  ["academic-notes", "study", "photo-1488190211105-8b0e65b80b4e"],
  ["writing-practice", "study", "photo-1434524876608-1d93b4c8caac"],
  ["study-review", "study", "photo-1454165804606-c3d57bc86b40"],
  ["mathematics-practice", "study", "photo-1513258496099-48168024aec0"],
  ["learning-session", "learning", "photo-1519452575417-564c1401ecc0"],
  ["university-lecture", "teaching", "photo-1427504494785-3a9ca7044f45"],
  ["academic-books", "library", "photo-1546410531-bb4caa6b424d"],
  ["library-interior", "library", "photo-1507842217343-583bb7270b66"],
  ["reference-books", "library", "photo-1532012197267-da84d127e765"],
  ["reading-time", "library", "photo-1491841550275-ad7854e35ca6"],
  ["quiet-reading", "library", "photo-1519682337058-a94d519337bc"],
  ["campus-milestone", "campus", "photo-1491013516836-7db643ee125a"],
  ["academic-celebration", "campus", "photo-1541339907198-e08756dedf3f"],
  ["notebook-reflection", "study", "photo-1516979187457-637abb4f9353"],
  ["online-study", "learning", "photo-1515378791036-0648a3ef77b2"],
  ["digital-learning", "learning", "photo-1516321497487-e288fb19713f"],
  ["laptop-workspace", "study", "photo-1496181133206-80ce9b88a853"],
  ["weekly-planning", "planning", "photo-1484480974693-6ca0a78fb36b"],
  ["desk-and-notebook", "planning", "photo-1473091534298-04dcbce3278c"],
  ["revision-notebook", "study", "photo-1517842645767-c639042777db"],
  ["study-tools", "study", "photo-1513542789411-b6a5d4f31634"],
  ["library-shelves", "library", "photo-1524995997946-a1c2e315a42f"],
  ["college-community", "campus", "photo-1517486808906-6ca8b3f04846"],
  ["team-discussion", "learning", "photo-1517048676732-d65bc937f952"],
  ["chemistry-notes", "science", "photo-1532094349884-543bc11b234d"],
  ["science-workshop", "science", "photo-1581093458791-9d42e3c9dc50"],
  ["engineering-lab", "science", "photo-1581092921461-eab62e97a780"],
  ["academic-workspace", "study", "photo-1515879218367-8466d910aaa4"],
  ["library-aisle", "library", "photo-1507738978512-35798112892c"],
  ["exam-notebook", "study", "photo-1510936111840-65e151ad71bb"],
  ["book-and-pencil", "study", "photo-1456324504439-367cee3b3c32"],
  ["morning-reading", "library", "photo-1512820790803-83ca734da794"],
  ["study-library", "library", "photo-1521587760476-6c12a4b040da"],
  ["university-students", "campus", "photo-1560785496-3c9d27877182"],
  ["learning-books", "library", "photo-1495446815901-a7297e633e8d"],
  ["science-equipment", "science", "photo-1564325724739-bae0bd08762c"],
  ["research-learning", "science", "photo-1576086213369-97a306d36557"],
  ["creative-planning", "planning", "photo-1450101499163-c8848c66ca85"],
  ["preparation-desk", "planning", "photo-1497215728101-856f4ea42174"],
  ["campus-library", "library", "photo-1481277542470-605612bd2d61"],
  ["reading-break", "library", "photo-1519682577862-22b62b24e493"],
];
let manifest = [];
const rejected = new Set([
  "campus-milestone",
  "classroom-focus",
  "guided-study",
  "teacher-workshop",
  "university-students",
  "campus-library",
  "academic-workspace",
  "science-equipment",
]);
let cursor = 0;
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (cursor < sources.length) {
      const [name, category, id] = sources[cursor++];
      const file = `${directory}/${name}.webp`;
      if (rejected.has(name)) {
        // These newly sourced files were rejected during this revision's image review.
        if (fs.existsSync(file)) fs.unlinkSync(file);
        continue;
      }
      const url = `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1100&q=80&fm=webp`;
      try {
        if (!fs.existsSync(file)) {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const data = Buffer.from(await response.arrayBuffer());
          if (data.length < 5000) throw new Error("Unexpected image size");
          fs.writeFileSync(file, data);
        }
        manifest.push({
          name,
          category,
          file,
          source: url,
          license: "Unsplash License — https://unsplash.com/license",
        });
      } catch (error) {
        console.log(`${name}: ${error.message}`);
      }
    }
  }),
);
manifest.sort(
  (a, b) => sources.findIndex((x) => x[0] === a.name) - sources.findIndex((x) => x[0] === b.name),
);
fs.writeFileSync(`${directory}/manifest.json`, JSON.stringify(manifest, null, 2));
console.log(`Saved ${manifest.length} new unique content photographs.`);
