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
      name: "অধ্যায় ০৩- জীব প্রযুক্তি",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 4,
      name: "অধ্যায় ০৪- জীবনীশক্তি",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 5,
      name: "অধ্যায় ০৫- খাদ্য, পুষ্টি এবং পরিপাক",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 6,
      name: "অধ্যায় ০৬- জীবে পরিবহন",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 7,
      name: "অধ্যায় ০৭- গ্যাসীয় বিনিময়",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 8,
      name: "অধ্যায় ০৮- রেচন প্রক্রিয়া",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 9,
      name: "অধ্যায় ০৯- দৃঢ়তা প্রদান ও চলন",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 10,
      name: "অধ্যায় ১০- সমন্বয়",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 11,
      name: "অধ্যায় ১১- জীবের প্রজনন",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
  ],
};
