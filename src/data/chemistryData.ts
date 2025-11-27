import { SubjectData } from "@/types/tracker";

const ACTIVITIES = [
  "Class",
  "মোট ক্লাস",
  "ক",
  "খ",
  "ক্লাস নোট",
  "MCQ Practice",
  "Typewise CQ",
  "CQ Summery",
  "MCQ Summery",
  "ALL Revision",
];

export const chemistryData: SubjectData = {
  id: "chemistry",
  name: "Chemistry 1st Paper",
  activities: ACTIVITIES,
  chapters: [
    {
      id: 1,
      name: "অধ্যায় ০১- ল্যাবরেটরি নিরাপত্তা ও রাসায়নিক গণনা",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 2,
      name: "অধ্যায় ০২- গুণগত রসায়ন",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 3,
      name: "অধ্যায় ০৩- পরমাণুর গঠন",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 4,
      name: "অধ্যায় ০৪- রাসায়নিক বন্ধন",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 5,
      name: "অধ্যায় ০৫- মৌলের পর্যায়বৃত্ত ধর্ম ও রাসায়নিক বন্ধন",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 6,
      name: "অধ্যায় ০৬- রাসায়নিক বিক্রিয়া",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 7,
      name: "অধ্যায় ০৭- তড়িৎ রসায়ন",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 8,
      name: "অধ্যায় ০৮- পরিবেশ রসায়ন",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
  ],
};
