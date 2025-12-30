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

export const higherMathData: SubjectData = {
  id: "highermath",
  name: "Higher Math 1st Paper",
  activities: ACTIVITIES,
  chapters: [
    {
      id: 1,
      name: "অধ্যায়  ০১: ম্যাট্রিক্স ও ট্রির্ণায়ক",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 2,
      name: "অধ্যায় ০২: ভেক্টর",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 3,
      name: "অধ্যায় ০৩: সরলরেখা",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 4,
      name: "অধ্যায় ০৪: বৃত্ত",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 5,
      name: "অধ্যায় ০৫: বিন্যাস ও সমাবেশ",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 6,
      name: "অধ্যায় ০৬: ত্রিকোণোমিতিক অনুপাত",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 7,
      name: "অধ্যায় ০৭: সংযুক্ত কোণর ত্রিকোণোমিতিক অনুপাত",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 8,
      name: "অধ্যায় ০৮: ফাংশন ও ফাংশনের লেখচিত্র",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 9,
      name: "অধ্যায় ০৯: অন্তরীকরণ",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 10,
      name: "অধ্যায় ১০: যোগজীকরণ",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
  ],
};
