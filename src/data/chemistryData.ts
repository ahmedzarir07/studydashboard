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

export const chemistryData: SubjectData = {
  id: "chemistry",
  name: "Chemistry 1st Paper",
  activities: ACTIVITIES,
  chapters: [
    {
      id: 1,
      name: "অধ্যায় ০১ - ল্যাবরেটরির নিরাপদ ব্যবহার",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 2,
      name: "অধ্যায় ০২ - গুণগত রসায়ন",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 3,
      name: "অধ্যায় ০৩- মৌলের পর্যায়বৃত্ত ধর্ম ও রাসায়নিক বন্ধন",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 4,
      name: "অধ্যায় ০৪- রাসায়নিক পরিবর্তন",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 5,
      name: "অধ্যায় ০৫- কর্মমূখী রসায়ন",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
  ],
};
