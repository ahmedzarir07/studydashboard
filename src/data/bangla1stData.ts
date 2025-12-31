import { SubjectData } from "@/types/tracker";

// Group A: গদ্য (01-12) - Prose
const GADYA_ACTIVITIES = [
  "Lecture",
  "Text Reading",
  "MCQ Practice",
  "CQ Practice",
  "Notes",
  "Revision",
];

// Group B: কবিতা (13-24) - Poetry
const KOBITA_ACTIVITIES = [
  "Lecture",
  "Poem Reading",
  "MCQ Practice",
  "CQ Practice",
  "Theme",
  "Revision",
];

// Group C: নাটক (25) - Drama
const NATOK_ACTIVITIES = [
  "Lecture",
  "Text Reading",
  "MCQ Practice",
  "CQ Practice",
  "Revision",
];

// Group D: উপন্যাস (26) - Novel
const UPONNASH_ACTIVITIES = [
  "Lecture",
  "Chapter Reading",
  "MCQ Practice",
  "CQ Practice",
  "Revision",
];

export const bangla1stData: SubjectData = {
  id: "bangla1st",
  name: "বাংলা ১ম পত্র",
  activities: [...new Set([...GADYA_ACTIVITIES, ...KOBITA_ACTIVITIES, ...NATOK_ACTIVITIES, ...UPONNASH_ACTIVITIES])],
  chapters: [
    // Group A: গদ্য (01-12)
    {
      id: 1,
      name: "০১. বাংলার নব্য লেখকদিগের প্রতি নিবেদন",
      activities: GADYA_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 2,
      name: "০২. অপরিচিতা",
      activities: GADYA_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 3,
      name: "০৩. সাহিত্যে খেলা",
      activities: GADYA_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 4,
      name: "০৪. বিলাসী",
      activities: GADYA_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 5,
      name: "০৫. অর্ধাঙ্গী",
      activities: GADYA_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 6,
      name: "০৬. যৌবনের গান",
      activities: GADYA_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 7,
      name: "০৭. জীবন ও বৃক্ষ",
      activities: GADYA_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 8,
      name: "০৮. গন্তব্য কাবুল",
      activities: GADYA_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 9,
      name: "০৯. মাসি-পিসি",
      activities: GADYA_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 10,
      name: "১০. কপিলদাস মুর্মুর শেষ কাজ",
      activities: GADYA_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 11,
      name: "১১. রেইনকোট",
      activities: GADYA_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 12,
      name: "১২. নেকলেস",
      activities: GADYA_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    // Group B: কবিতা (13-24)
    {
      id: 13,
      name: "১৩. ঋতু বর্ণন",
      activities: KOBITA_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 14,
      name: "১৪. বিভীষণের প্রতি মেঘনাদ",
      activities: KOBITA_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 15,
      name: "১৫. সোনার তরী",
      activities: KOBITA_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 16,
      name: "১৬. বিদ্রোহী",
      activities: KOBITA_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 17,
      name: "১৭. সুচেতনা",
      activities: KOBITA_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 18,
      name: "১৮. প্রতিদান",
      activities: KOBITA_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 19,
      name: "১৯. তাহারেই পড়ে মনে",
      activities: KOBITA_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 20,
      name: "২০. পদ্মা",
      activities: KOBITA_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 21,
      name: "২১. আঠারো বছর বয়স",
      activities: KOBITA_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 22,
      name: "২২. ফেব্রুয়ারি ১৯৬৯",
      activities: KOBITA_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 23,
      name: "২৩. আমি কিংবদন্তির কথা বলছি",
      activities: KOBITA_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 24,
      name: "২৪. প্রত্যাবর্তনের লজ্জা",
      activities: KOBITA_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    // Group C: নাটক (25)
    {
      id: 25,
      name: "২৫. নাটক: সিরাজউদ্দৌলা",
      activities: NATOK_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    // Group D: উপন্যাস (26)
    {
      id: 26,
      name: "২৬. উপন্যাস: লালসালু",
      activities: UPONNASH_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
  ],
};
