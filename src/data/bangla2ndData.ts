import { SubjectData } from "@/types/tracker";

// Group A: ব্যাকরণ অংশ (01-06) - Grammar
const GRAMMAR_ACTIVITIES = [
  "Lecture",
  "Rule Notes",
  "Practice",
  "MCQ Practice",
  "Error Log",
  "Revision",
];

// Group B: নির্মিত অংশ (07-11) - Written Skills
const WRITTEN_ACTIVITIES = [
  "Lecture",
  "Format Templates",
  "Practice Drafts",
  "Model Answers",
  "Final Draft",
  "Revision",
];

// Group C: প্রবন্ধ-নিবন্ধ (12) - Essay
const ESSAY_ACTIVITIES = [
  "Lecture",
  "Outline",
  "Practice Writing",
  "Model Essays",
  "Final Draft",
  "Revision",
];

export const bangla2ndData: SubjectData = {
  id: "bangla2nd",
  name: "বাংলা ২য় পত্র",
  activities: [...new Set([...GRAMMAR_ACTIVITIES, ...WRITTEN_ACTIVITIES, ...ESSAY_ACTIVITIES])],
  chapters: [
    // Group A: ব্যাকরণ অংশ (01-06)
    {
      id: 1,
      name: "০১. বাংলা উচ্চারণের নিয়ম",
      activities: GRAMMAR_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 2,
      name: "০২. বাংলা বানানের নিয়ম",
      activities: GRAMMAR_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 3,
      name: "০৩. বাংলা ভাষার ব্যাকরণিক শব্দশ্রেণি",
      activities: GRAMMAR_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 4,
      name: "০৪. বাংলা শব্দগঠন প্রক্রিয়া",
      activities: GRAMMAR_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 5,
      name: "০৫. বাক্যতত্ত্ব",
      activities: GRAMMAR_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 6,
      name: "০৬. বাংলা ভাষার অপপ্রয়োগ ও শুদ্ধ প্রয়োগ",
      activities: GRAMMAR_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    // Group B: নির্মিত অংশ (07-11)
    {
      id: 7,
      name: "০৭. পারিভাষিক শব্দ ও অনুবাদ",
      activities: WRITTEN_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 8,
      name: "০৮. দিনলিপি, অভিজ্ঞতা বর্ণন, ভাষণ ও প্রতিবেদন",
      activities: WRITTEN_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 9,
      name: "০৯. বৈদ্যুতিন চিঠি, খুদেবার্তা, পত্রলিখন ও আবেদনপত্র",
      activities: WRITTEN_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 10,
      name: "১০. সারাংশ, সারমর্ম, সার-সংক্ষেপ ও ভাব-সম্প্রসারণ",
      activities: WRITTEN_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    {
      id: 11,
      name: "১১. সংলাপ ও খুদেগল্প",
      activities: WRITTEN_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
    // Group C: প্রবন্ধ-নিবন্ধ (12)
    {
      id: 12,
      name: "১২. প্রবন্ধ-নিবন্ধ রচনা",
      activities: ESSAY_ACTIVITIES.map((name) => ({ name, status: "" })),
    },
  ],
};
