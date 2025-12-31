import { SubjectData } from "@/types/tracker";

// Reading Section activities (for Units 1-12) - Only core activities
const UNIT_ACTIVITIES = [
  "MCQ",
  "Open-ended",
  "Info Transfer",
];

// Separate chapter activities (each has Practice and Revision)
const CHAPTER_ACTIVITIES = [
  "Practice",
  "Revision",
];

// Writing Section activities (for chapters 17-21)
const WRITING_ACTIVITIES = [
  "Practice",
  "Summary",
  "Final Draft",
  "Revision",
];

export const english1stData: SubjectData = {
  id: "english1st",
  name: "English 1st Paper",
  activities: [...UNIT_ACTIVITIES, ...CHAPTER_ACTIVITIES, ...WRITING_ACTIVITIES.filter(a => !CHAPTER_ACTIVITIES.includes(a))],
  chapters: [
    // Part A: Reading Section (60 Marks) - 12 Units
    {
      id: 1,
      name: "Unit 01 - Education & Life",
      activities: UNIT_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 2,
      name: "Unit 02 - Art and Craft",
      activities: UNIT_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 3,
      name: "Unit 03 - Myths and Literature",
      activities: UNIT_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 4,
      name: "Unit 04 - History",
      activities: UNIT_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 5,
      name: "Unit 05 - Human Rights",
      activities: UNIT_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 6,
      name: "Unit 06 - Dreams",
      activities: UNIT_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 7,
      name: "Unit 07 - Youthful Achievers",
      activities: UNIT_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 8,
      name: "Unit 08 - Relationships",
      activities: UNIT_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 9,
      name: "Unit 09 - Adolescence",
      activities: UNIT_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 10,
      name: "Unit 10 - Lifestyle",
      activities: UNIT_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 11,
      name: "Unit 11 - Peace and Conflict",
      activities: UNIT_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 12,
      name: "Unit 12 - Environment and Nature",
      activities: UNIT_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    // Separate Reading Skill Chapters (13-16)
    {
      id: 13,
      name: "13. Summarizing (5 marks)",
      activities: CHAPTER_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 14,
      name: "14. Cloze with Clues (10 marks)",
      activities: CHAPTER_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 15,
      name: "15. Cloze without Clues (10 marks)",
      activities: CHAPTER_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 16,
      name: "16. Rearranging (10 marks)",
      activities: CHAPTER_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    // Part B: Writing Section (40 Marks) - 5 Writing Types
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
