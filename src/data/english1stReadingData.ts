import { SubjectData } from "@/types/tracker";

const ACTIVITIES = [
  "MCQ",
  "Open-ended",
  "Info Transfer",
  "Summarizing",
  "Cloze (with clues)",
  "Cloze (without clues)",
  "Rearranging",
];

export const english1stReadingData: SubjectData = {
  id: "english1st-reading",
  name: "English 1st Paper - Reading",
  activities: ACTIVITIES,
  chapters: [
    {
      id: 1,
      name: "Unit 01 - Education & Life",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 2,
      name: "Unit 02 - Art and Craft",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 3,
      name: "Unit 03 - Myths and Literature",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 4,
      name: "Unit 04 - History",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 5,
      name: "Unit 05 - Human Rights",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 6,
      name: "Unit 06 - Dreams",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 7,
      name: "Unit 07 - Youthful Achievers",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 8,
      name: "Unit 08 - Relationships",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 9,
      name: "Unit 09 - Adolescence",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 10,
      name: "Unit 10 - Lifestyle",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 11,
      name: "Unit 11 - Peace and Conflict",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 12,
      name: "Unit 12 - Environment and Nature",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
  ],
};
