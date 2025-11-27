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

export const biologyData: SubjectData = {
  id: "biology",
  name: "Biology 1st Paper",
  activities: ACTIVITIES,
  chapters: [
    {
      id: 1,
      name: "অধ্যায় ০১- কোষ ও এর গঠন",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 2,
      name: "অধ্যায় ০২- কোষ বিভাজন",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 3,
      name: "অধ্যায় ০৩- কোষ রসায়ন",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 4,
      name: "অধ্যায় ০৪- অনুজীবী",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 5,
      name: "অধ্যায় ০৫- শৈবাল ও ছত্রাক",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 6,
      name: "অধ্যায় ০৬- ব্রায়োফাইটা ও টেরিডোফাইটা",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 7,
      name: "অধ্যায় ০৭- নগ্নবীজী ও আবৃতবীজী উদ্ভিদ",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 8,
      name: "অধ্যায় ০৮- টিস্যু ও টিস্যুতন্ত্র",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 9,
      name: "অধ্যায় ০৯- উদ্ভিদ শারীরতত্ব",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 10,
      name: "অধ্যায় ১০- উদ্ভিদের প্রজনন",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 11,
      name: "অধ্যায় ১১- জীবের পরিবেশ বিদ্যা ও বংশগতি",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
  ],
};
