import { SubjectData } from "@/types/tracker";

const ACTIVITIES = [
  "Lecture",
  "Total Lec",
  "ক",
  "খ",
  "Notes",
  "MCQ Practice",
  "MCQ Summary",
  "CQ Summary",
  "Written CQ",
  "Revision",
  "Exam",
];

export const chemistry2ndData: SubjectData = {
  id: "chemistry2nd",
  name: "Chemistry 2nd Paper",
  activities: ACTIVITIES,
  chapters: [
    {
      id: 1,
      name: "অধ্যায় ০১ - পরিবেশ রসায়ন",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 2,
      name: "অধ্যায় ০২ - জৈব রসায়ন",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 3,
      name: "অধ্যায় ০৩- পরিমাণগত রসায়ন",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 4,
      name: "অধ্যায় ০৪- তড়িৎ রসায়ন",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 5,
      name: "অধ্যায় ০৫- অর্থনৈতিক রসায়ন",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
  ],
};
