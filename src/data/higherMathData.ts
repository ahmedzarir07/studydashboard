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

export const higherMathData: SubjectData = {
  id: "highermath",
  name: "Higher Math 1st Paper",
  activities: ACTIVITIES,
  chapters: [
    {
      id: 1,
      name: "অধ্যায় ০১- ম্যাট্রিক্স ও ক্রিয়াশীল দ্বিপদী উপপাদ্য",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 2,
      name: "অধ্যায় ০২- সমবর্তন ও দ্বিমাত্রিক ভেক্টর",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 3,
      name: "অধ্যায় ০৩- সরলরেখা",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 4,
      name: "অধ্যায় ০৪- বৃত্ত",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 5,
      name: "অধ্যায় ০৫- বিন্যাস ও সমাবেশ",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 6,
      name: "অধ্যায় ০৬- ত্রিকোণমিতিক অনুপাত",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 7,
      name: "অধ্যায় ০৭- সম্ভাবনা ও বিন্যাস হইতে ত্রিকোণমিতিক সমাধান",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 8,
      name: "অধ্যায় ০৮- সীমা ও অন্তরীকরণ পরিমিতি",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 9,
      name: "অধ্যায় ০৯- অন্তরীকরণ",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 10,
      name: "অধ্যায় ১০- যোগজীকরণ",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
  ],
};
