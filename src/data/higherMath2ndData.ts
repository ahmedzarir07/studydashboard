import { SubjectData } from "@/types/tracker";

const ACTIVITIES = [
  "Lecture",
  "Total Lec",
  "Notes",
  "MCQ Practice",
  "MCQ Summary",
  "CQ Practice",
  "CQ Summary",
  "Book Problems",
  "Revision",
  "Exam",
];

export const higherMath2ndData: SubjectData = {
  id: "highermath2nd",
  name: "Higher Math 2nd Paper",
  activities: ACTIVITIES,
  chapters: [
    {
      id: 1,
      name: "অধ্যায় ০১: বাস্তব সংখ্যা",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 2,
      name: "অধ্যায় ০২: যোগাশ্রয়ী প্রোগ্রাম",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 3,
      name: "অধ্যায় ০৩: জটিল সংখ্যা",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 4,
      name: "অধ্যায় ০৪: বহুপদী ও বহুপদী সমীকরণ",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 5,
      name: "অধ্যায় ০৫: দ্বিপদী বিস্তৃতি",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 6,
      name: "অধ্যায় ০৬: কণিক",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 7,
      name: "অধ্যায় ০৭: বিপরীত ত্রিকোণমিতি",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 8,
      name: "অধ্যায় ০৮: স্থিতিবিদ্যা",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 9,
      name: "অধ্যায় ০৯: সমতলে বস্তুকণার গতি",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 10,
      name: "অধ্যায় ১০: সম্ভাবনা",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
  ],
};
