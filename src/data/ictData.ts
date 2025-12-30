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

export const ictData: SubjectData = {
  id: "ict",
  name: "ICT",
  activities: ACTIVITIES,
  chapters: [
    {
      id: 1,
      name: "বিশ্ব ও বাংলাদেশ প্রেক্ষিত",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 2,
      name: "কমিউনিকেশন সিষ্টেম ও নেটওয়ার্কিং",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 3,
      name: "সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 4,
      name: "ওয়েব ডিজাইন এবং HTML",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 5,
      name: "প্রোগ্রামিং ভাষা",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 6,
      name: "ডাটাবেজ ম্যানেজমেন্ট",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
  ],
};
