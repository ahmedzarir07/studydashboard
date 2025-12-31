import { SubjectData } from "@/types/tracker";

// Group 1: Reading Units (1-12) - Content-heavy, lecture important
const READING_UNIT_ACTIVITIES = [
  "Lecture",
  "MCQ Practice",
  "SQ",
  "Info Transfer",
  "Vocabulary",
  "Revision",
];

// Group 2: Grammar & Mechanics (13-16) - Practice-focused
const GRAMMAR_ACTIVITIES = [
  "Lecture",
  "Practice",
  "Model Answers",
  "Error Analysis",
  "Revision",
  "Mock Practice",
];

// Group 3: Writing Section (17-21) - Draft-focused
const WRITING_ACTIVITIES = [
  "Lecture",
  "Practice Drafts",
  "Model Review",
  "Final Draft",
  "Vocabulary",
  "Revision",
];

export const english1stData: SubjectData = {
  id: "english1st",
  name: "English 1st Paper",
  activities: [...new Set([...READING_UNIT_ACTIVITIES, ...GRAMMAR_ACTIVITIES, ...WRITING_ACTIVITIES])],
  chapters: [
    // Part A: Reading Section (60 Marks) - 12 Units
    {
      id: 1,
      name: "Unit 01 - Education & Life",
      activities: READING_UNIT_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 2,
      name: "Unit 02 - Art and Craft",
      activities: READING_UNIT_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 3,
      name: "Unit 03 - Myths and Literature",
      activities: READING_UNIT_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 4,
      name: "Unit 04 - History",
      activities: READING_UNIT_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 5,
      name: "Unit 05 - Human Rights",
      activities: READING_UNIT_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 6,
      name: "Unit 06 - Dreams",
      activities: READING_UNIT_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 7,
      name: "Unit 07 - Youthful Achievers",
      activities: READING_UNIT_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 8,
      name: "Unit 08 - Relationships",
      activities: READING_UNIT_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 9,
      name: "Unit 09 - Adolescence",
      activities: READING_UNIT_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 10,
      name: "Unit 10 - Lifestyle",
      activities: READING_UNIT_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 11,
      name: "Unit 11 - Peace and Conflict",
      activities: READING_UNIT_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 12,
      name: "Unit 12 - Environment and Nature",
      activities: READING_UNIT_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    // Group 2: Grammar & Mechanics Chapters (13-16)
    {
      id: 13,
      name: "13. Summarizing (5 marks)",
      activities: GRAMMAR_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 14,
      name: "14. Cloze with Clues (10 marks)",
      activities: GRAMMAR_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 15,
      name: "15. Cloze without Clues (10 marks)",
      activities: GRAMMAR_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 16,
      name: "16. Rearranging (10 marks)",
      activities: GRAMMAR_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    // Group 3: Writing Section (17-21)
    {
      id: 17,
      name: "17. Paragraph (10 marks)",
      activities: WRITING_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 18,
      name: "18. Story / Completing Story (10 marks)",
      activities: WRITING_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 19,
      name: "19. Letter / Email (5 marks)",
      activities: WRITING_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 20,
      name: "20. Graph / Chart (10 marks)",
      activities: WRITING_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 21,
      name: "21. Theme Writing (8 marks)",
      activities: WRITING_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
  ],
};
