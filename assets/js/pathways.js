export const pathwayHref = (category) => `${category.toLowerCase()}-exams.html`;
export const pathways = {
  Banking: {
    title: "A clear direction for your banking ambitions.",
    intro:
      "Prepare for IBPS and SBI with a connected plan for quantitative aptitude, reasoning, English, and banking awareness.",
    exams: "IBPS • SBI • RBI",
    icon: "bank",
    image: "pathway-banking-new",
    alt: "Banking exam aspirant practicing quantitative aptitude in a library",
    focus: "Accuracy first. Speed follows.",
    practice:
      "Build fluency with calculation drills, data interpretation sets, reasoning puzzles, and a regular current affairs review.",
    routine: [
      "Learn one quantitative or reasoning concept.",
      "Practice a short timed question set.",
      "Review errors and revise banking awareness.",
    ],
  },
  SSC: {
    title: "Build the foundation for your SSC journey.",
    intro:
      "Bring arithmetic, reasoning, English, and general awareness together in a focused preparation plan for SSC CGL and CHSL.",
    exams: "CGL • CHSL • MTS",
    icon: "file",
    image: "pathway-ssc-new",
    alt: "SSC exam aspirant revising reasoning and English in a campus library",
    focus: "Understand the pattern. Strengthen the basics.",
    practice:
      "Connect arithmetic foundations with advanced mathematics, sharpen comprehension, and build a manageable general awareness revision habit.",
    routine: [
      "Work through one arithmetic or English lesson.",
      "Practice reasoning and general awareness questions.",
      "Revisit mistakes and consolidate weekly notes.",
    ],
  },
  Railways: {
    title: "Put your railway preparation on track.",
    intro:
      "Build confidence in mathematics, general intelligence, science, and current affairs for railway recruitment examinations.",
    exams: "NTPC • Group D • ALP",
    icon: "train",
    image: "pathway-railways-new",
    alt: "Railway exam aspirants studying technical diagrams together",
    focus: "Steady practice for every section.",
    practice:
      "Move from basic mathematics to general intelligence and science, with computer-based question practice and deliberate revision.",
    routine: [
      "Refresh a mathematics or science concept.",
      "Practice mixed general intelligence questions.",
      "Review current affairs and your error log.",
    ],
  },
  Engineering: {
    title: "Turn strong concepts into better solutions.",
    intro:
      "Connect physics, chemistry, and mathematics through worked examples and purposeful practice for your JEE preparation.",
    exams: "JEE Main • JEE Advanced",
    icon: "atom",
    image: "pathway-engineering-new",
    alt: "Engineering entrance aspirant studying physics and mathematics with a circuit model",
    focus: "See the concept behind the question.",
    practice:
      "Explore the links between theory and application, work through multi-step problems, and revisit the reasoning behind every solution.",
    routine: [
      "Study one physics, chemistry, or mathematics concept.",
      "Solve worked examples, then practice independently.",
      "Review a mixed question set and revisit weak topics.",
    ],
  },
};
