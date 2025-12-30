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

export const biologyData: SubjectData = {
  id: "biology",
  name: "Biology 1st Paper",
  activities: ACTIVITIES,
  chapters: [
    {
      id: 1,
      name: "অধ্যায় - ১: কোষ ও এর গঠন",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 2,
      name: "অধ্যায় - ২: কোষ বিভাজন",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 3,
      name: "অধ্যায় - ৩: কোষ রসায়ন",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 4,
      name: "অধ্যায় - ৪: অণুর্জীব",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 5,
      name: "অধ্যায় ০৫-শৈবাল ও ছত্রাক",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 6,
      name: "অধ্যায় - ৬: ব্রায়োফাইটা ও টেরিডোফাইটা",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 7,
      name: "অধ্যায় - ৭: নগ্নবীজি ও আবৃতবীজি উদ্ভিদ",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 8,
      name: "অধ্যায় - ৮: টিস্যু ও টিসুতন্ত্র",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 9,
      name: "অধ্যায় - ৯: উদ্ভিদ শারিরত্ব",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 10,
      name: "অধ্যায় - ১০: উদ্ভিদ প্রজনন",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 11,
      name: "অধ্যায় - ১১: জীবপ্রযুক্তি",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 12,
      name: "অধ্যায় - ১২: জীবের পরিবেশ বিস্তার ও সংরক্ষন",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
  ],
};
