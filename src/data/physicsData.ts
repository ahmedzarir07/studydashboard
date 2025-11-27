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

export const physicsData: SubjectData = {
  id: "physics",
  name: "Physics 1st Paper",
  activities: ACTIVITIES,
  chapters: [
    {
      id: 1,
      name: "অধ্যায় ০১- ভৌতজগত ও পরিমাপ",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 2,
      name: "অধ্যায় ০২-ভেক্টর",
      activities: [
        { name: "Class", status: "Done" },
        { name: "মোট ক্লাস", status: "" },
        { name: "ক", status: "Not Started" },
        { name: "খ", status: "Not Started" },
        { name: "ক্লাস নোট", status: "Done" },
        { name: "MCQ Practice", status: "Not Started" },
        { name: "Typewise CQ", status: "Not Started" },
        { name: "CQ Summery", status: "Not Started" },
        { name: "MCQ Summery", status: "Not Started" },
        { name: "ALL Revision", status: "Not Started" },
      ],
    },
    {
      id: 3,
      name: "অধ্যায় ০৩- গতিবিদ্যা",
      activities: [
        { name: "Class", status: "Done" },
        { name: "মোট ক্লাস", status: "" },
        { name: "ক", status: "Not Started" },
        { name: "খ", status: "Not Started" },
        { name: "ক্লাস নোট", status: "Done" },
        { name: "MCQ Practice", status: "Not Started" },
        { name: "Typewise CQ", status: "Not Started" },
        { name: "CQ Summery", status: "Not Started" },
        { name: "MCQ Summery", status: "Not Started" },
        { name: "ALL Revision", status: "Not Started" },
      ],
    },
    {
      id: 4,
      name: "অধ্যায় ০৪- নিউটনিয় বলবিদ্যা",
      activities: [
        { name: "Class", status: "In progress" },
        { name: "মোট ক্লাস", status: "" },
        { name: "ক", status: "" },
        { name: "খ", status: "" },
        { name: "ক্লাস নোট", status: "In progress" },
        { name: "MCQ Practice", status: "" },
        { name: "Typewise CQ", status: "" },
        { name: "CQ Summery", status: "" },
        { name: "MCQ Summery", status: "" },
        { name: "ALL Revision", status: "" },
      ],
    },
    {
      id: 5,
      name: "অধ্যায় ০৫- কাজ শক্তি ও ক্ষমতা",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 6,
      name: "অধ্যায় ০৬- মহাকর্ষ ও অভিকর্ষ",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 7,
      name: "অধ্যায় ০৭- পদার্থের গাঠনিক ধর্ম",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 8,
      name: "অধ্যায় ০৮- পযৃায়বৃত্ত গতি",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 9,
      name: "অধ্যায় ০৯- তরঙ্গ",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 10,
      name: "অধ্যায় ১০- গ্যাসের গতিতত্ব",
      activities: ACTIVITIES.map((name) => ({ name, status: "" })),
    },
  ],
};
