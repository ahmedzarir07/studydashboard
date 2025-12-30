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

export const biology2ndData: SubjectData = {
  id: "biology2nd",
  name: "Biology 2nd Paper",
  activities: ACTIVITIES,
  chapters: [
    {
      id: 1,
      name: "অধ্যায় - ১: প্রাণীর বিভিন্নতা ও শ্রেণিবিন্যাস",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 2,
      name: "অধ্যায় - ২: প্রাণীর পরিচিতি",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 3,
      name: "অধ্যায় - ৩: মানব শারীরতত্ত্ব-পরিপাক ও শোষণ",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 4,
      name: "অধ্যায় - ৪: মানব শারীরতত্ত্ব -রক্ত",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 5,
      name: "অধ্যায় ০৫-মানব শারীরতত্ত্ব-শ্বসন ও শ্বাসক্রিয়া",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 6,
      name: "অধ্যায় - ৬: মানব শারীরতত্ত্ব-বর্জ্য ও নিষ্কাশন",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 7,
      name: "অধ্যায় - ৭: মানব শারীরতত্ত্ব-চলন",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 8,
      name: "অধ্যায় - ৮: মানব শারীরতত্ত্ব-সমন্বয়",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 9,
      name: "অধ্যায় - ৯: মানব জীবনের ধারাবাহিকতা",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 10,
      name: "অধ্যায় - ১০: মানবদেহের প্রতিরক্ষা",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 11,
      name: "অধ্যায় - ১১: জিনতত্ত্ব ও বিবর্তন",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 12,
      name: "অধ্যায় - ১২: প্রাণীর আচরন",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
  ],
};
