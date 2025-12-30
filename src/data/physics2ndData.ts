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

export const physics2ndData: SubjectData = {
  id: "physics2nd",
  name: "Physics 2nd Paper",
  activities: ACTIVITIES,
  chapters: [
    {
      id: 1,
      name: "অধ্যায় ০১- তাপ গতিবিদ্যা",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 2,
      name: "অধ্যায় ০২- স্থির তড়িৎ",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 3,
      name: "অধ্যায় ০৩- চল তড়িৎ",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 4,
      name: "অধ্যায় ০৪- তড়িৎ প্রবাহের চৌম্বক ক্রিয়া ও চুম্বকত্ব",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 5,
      name: "অধ্যায় ০৫- তাড়িতচৌম্বকীয় আবেশ ও পরিবর্তী প্রবাহ",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 6,
      name: "অধ্যায় ০৬- জ্যামিতিক আলোকবিজ্ঞান",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 7,
      name: "অধ্যায় ০৭- ভৌত আলোকবিজ্ঞান",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 8,
      name: "অধ্যায় ০৮- আধুনিক পদার্থ বিজ্ঞান",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 9,
      name: "অধ্যায় ০৯- পরমাণুর মডেল এবং নিউক্লিয়ার",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 10,
      name: "অধ্যায় ১০- সেমিকন্ডাক্টটর ও ইলেক্ট্রনিক্স",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 11,
      name: "অধ্যায় ১১- জ্যোতি বিজ্ঞান",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
  ],
};
