import { SubjectData } from "@/types/tracker";

const ACTIVITIES = [
  "Practice",
  "Summary",
  "Final Draft",
  "Revision",
];

export const english1stWritingData: SubjectData = {
  id: "english1st-writing",
  name: "English 1st Paper - Writing",
  activities: ACTIVITIES,
  chapters: [
    {
      id: 1,
      name: "Paragraph",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 2,
      name: "Story / Completing Story",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 3,
      name: "Letter / Email",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 4,
      name: "Graph / Chart",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 5,
      name: "Theme Writing (Story/Poem)",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
  ],
};
