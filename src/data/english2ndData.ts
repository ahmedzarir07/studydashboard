import { SubjectData } from "@/types/tracker";

// Grammar activities (for chapters 1-12)
const GRAMMAR_ACTIVITIES = [
  "Practice",
  "Rules Summary",
  "Mock Test",
  "Revision",
];

// Composition activities (for chapters 13-16)
const COMPOSITION_ACTIVITIES = [
  "Practice",
  "Draft Writing",
  "Final Copy",
  "Revision",
];

export const english2ndData: SubjectData = {
  id: "english2nd",
  name: "English 2nd Paper",
  activities: [...GRAMMAR_ACTIVITIES, ...COMPOSITION_ACTIVITIES.filter(a => !GRAMMAR_ACTIVITIES.includes(a))],
  chapters: [
    // Part A: Grammar (60 Marks) - 12 chapters × 5 marks each
    {
      id: 1,
      name: "01. Article (5 marks)",
      activities: GRAMMAR_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 2,
      name: "02. Preposition (5 marks)",
      activities: GRAMMAR_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 3,
      name: "03. Phrase / Words (5 marks)",
      activities: GRAMMAR_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 4,
      name: "04. Completing Sentence with Clause (5 marks)",
      activities: GRAMMAR_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 5,
      name: "05. Right Form of Verbs (5 marks)",
      activities: GRAMMAR_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 6,
      name: "06. Change the Sentences (5 marks)",
      activities: GRAMMAR_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 7,
      name: "07. Narration (5 marks)",
      activities: GRAMMAR_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 8,
      name: "08. Unclear Pronoun & Rewrite (5 marks)",
      activities: GRAMMAR_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 9,
      name: "09. Use of Modifiers (5 marks)",
      activities: GRAMMAR_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 10,
      name: "10. Sentence Connector (5 marks)",
      activities: GRAMMAR_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 11,
      name: "11. Synonym / Antonym (5 marks)",
      activities: GRAMMAR_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 12,
      name: "12. Punctuation (5 marks)",
      activities: GRAMMAR_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    // Part B: Composition (40 Marks) - 4 chapters with varying marks
    {
      id: 13,
      name: "13. Application Writing (8 marks)",
      activities: COMPOSITION_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 14,
      name: "14. Report Writing (8 marks)",
      activities: COMPOSITION_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 15,
      name: "15. Paragraph (10 marks)",
      activities: COMPOSITION_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 16,
      name: "16. Short Essay (14 marks)",
      activities: COMPOSITION_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
  ],
};
