// Weighted Progress System Configuration
// Science subjects: CQ internal = 50%, but capped at 35% contribution
// Math subjects: No scaling needed, totals 100%
// English Reading: 7 activities per unit, normalized to 100%
// English Writing: 4 activities per chapter, normalized to 100%

export interface SectionConfig {
  max: number;
  internalMax?: number; // For scaling (science CQ only)
  activities: Record<string, number>;
}

export interface SubjectConfig {
  sections: {
    core: SectionConfig;
    mcq: SectionConfig;
    cq: SectionConfig;
    final?: SectionConfig; // Math only
  };
}

// Physics / Chemistry / Biology / ICT
// Core Study: 30% | MCQ: 20% | CQ: 50% = 100% total (no scaling needed)
export const scienceConfig: SubjectConfig = {
  sections: {
    core: {
      max: 30,
      activities: {
        "Lecture": 15,
        "Notes": 15,
      },
    },
    mcq: {
      max: 20,
      activities: {
        "MCQ Practice": 15,
        "MCQ Summary": 5,
      },
    },
    cq: {
      max: 50,
      activities: {
        "ক": 5,
        "খ": 10,
        "CQ Summary": 5,
        "Written CQ": 20,
        "Revision": 5,
        "Exam": 5,
      },
    },
  },
};

// Higher Math 1st & 2nd Paper
// Core Study: 30% | MCQ: 20% | CQ/Problems: 40% | Final Layer: 10%
export const mathConfig: SubjectConfig = {
  sections: {
    core: {
      max: 30,
      activities: {
        "Lecture": 15,
        "Notes": 15,
      },
    },
    mcq: {
      max: 20,
      activities: {
        "MCQ Practice": 15,
        "MCQ Summary": 5,
      },
    },
    cq: {
      max: 40,
      activities: {
        "CQ Practice": 15,
        "CQ Summary": 5,
        "Book Problems": 20,
      },
    },
    final: {
      max: 10,
      activities: {
        "Revision": 5,
        "Exam": 5,
      },
    },
  },
};

// English 1st Paper - 3 Groups with different activity structures
// Group 1 (Units 1-12): Reading Units - Lecture 25%, MCQ 20%, SQ 20%, Info Transfer 15%, Notes 10%, Revision 10%
// Group 2 (Chapters 13-16): Grammar & Mechanics - Lecture 20%, Practice 35%, Model Answers 15%, Error Analysis 10%, Revision 10%, Mock Practice 10%
// Group 3 (Chapters 17-21): Writing Section - Lecture 20%, Practice Drafts 30%, Model Review 15%, Final Draft 15%, Vocabulary 10%, Revision 10%

// Group 1: Reading Units (1-12) - Content-heavy, lecture important
export const english1stReadingConfig: SubjectConfig = {
  sections: {
    core: {
      max: 45,
      activities: {
        "Lecture": 25,
        "MCQ Practice": 20,
      },
    },
    mcq: {
      max: 35,
      activities: {
        "SQ": 20,
        "Info Transfer": 15,
      },
    },
    cq: {
      max: 20,
      activities: {
        "Vocabulary": 10,
        "Revision": 10,
      },
    },
  },
};

// Group 2: Grammar & Mechanics (13-16) - Practice-focused
export const english1stGrammarConfig: SubjectConfig = {
  sections: {
    core: {
      max: 55,
      activities: {
        "Lecture": 20,
        "Practice": 35,
      },
    },
    mcq: {
      max: 25,
      activities: {
        "Model Answers": 15,
        "Error Analysis": 10,
      },
    },
    cq: {
      max: 20,
      activities: {
        "Revision": 10,
        "Mock Practice": 10,
      },
    },
  },
};

// Group 3: Writing Section (17-21) - Draft-focused
export const english1stWritingConfig: SubjectConfig = {
  sections: {
    core: {
      max: 50,
      activities: {
        "Lecture": 20,
        "Practice Drafts": 30,
      },
    },
    mcq: {
      max: 30,
      activities: {
        "Model Review": 15,
        "Final Draft": 15,
      },
    },
    cq: {
      max: 20,
      activities: {
        "Vocabulary": 10,
        "Revision": 10,
      },
    },
  },
};

// English 2nd Paper - 3 Groups with different activity structures
// Group A (01-12): Grammar Core - Lecture 20%, Practice Sets 35%, Model Answers 15%, Error Log 10%, Revision 10%, Final Practice 10%
// Group B (13-14): Functional Writing - Lecture 25%, Practice Drafts 30%, Model Samples 15%, Final Draft 15%, Expressions 5%, Revision 10%
// Group C (15-16): Creative Writing - Lecture 20%, Idea Planning 15%, Practice Writing 30%, Model Reading 10%, Final Draft 15%, Revision 10%

// Group A: Grammar Core (01-12) - Practice-heavy
export const english2ndGrammarConfig: SubjectConfig = {
  sections: {
    core: {
      max: 55,
      activities: {
        "Lecture": 20,
        "Practice Sets": 35,
      },
    },
    mcq: {
      max: 25,
      activities: {
        "Model Answers": 15,
        "Error Log": 10,
      },
    },
    cq: {
      max: 20,
      activities: {
        "Revision": 10,
        "Final Practice": 10,
      },
    },
  },
};

// Group B: Functional Writing (13-14) - Format-driven
export const english2ndFunctionalConfig: SubjectConfig = {
  sections: {
    core: {
      max: 55,
      activities: {
        "Lecture": 25,
        "Practice Drafts": 30,
      },
    },
    mcq: {
      max: 30,
      activities: {
        "Model Samples": 15,
        "Final Draft": 15,
      },
    },
    cq: {
      max: 15,
      activities: {
        "Expressions": 5,
        "Revision": 10,
      },
    },
  },
};

// Group C: Creative Writing (15-16) - Idea + structure focused
export const english2ndCreativeConfig: SubjectConfig = {
  sections: {
    core: {
      max: 50,
      activities: {
        "Lecture": 20,
        "Practice Writing": 30,
      },
    },
    mcq: {
      max: 25,
      activities: {
        "Idea Planning": 15,
        "Model Reading": 10,
      },
    },
    cq: {
      max: 25,
      activities: {
        "Final Draft": 15,
        "Revision": 10,
      },
    },
  },
};

// Bangla 1st Paper - 4 Groups with different activity structures
// Group A (01-12): গদ্য - Lecture 25%, Text Reading 15%, MCQ 15%, CQ 20%, Notes 10%, Revision 15%
// Group B (13-24): কবিতা - Lecture 30%, Poem Reading 15%, MCQ 15%, CQ 20%, Theme 10%, Revision 10%
// Group C (25): নাটক - Lecture 30%, Text Reading 15%, MCQ 15%, CQ 25%, Revision 15%
// Group D (26): উপন্যাস - Lecture 30%, Chapter Reading 15%, MCQ 15%, CQ 25%, Revision 15%

// Group A: গদ্য (01-12) - Prose
export const bangla1stGadyaConfig: SubjectConfig = {
  sections: {
    core: {
      max: 40,
      activities: {
        "Lecture": 25,
        "Text Reading": 15,
      },
    },
    mcq: {
      max: 35,
      activities: {
        "MCQ Practice": 15,
        "CQ Practice": 20,
      },
    },
    cq: {
      max: 25,
      activities: {
        "Notes": 10,
        "Revision": 15,
      },
    },
  },
};

// Group B: কবিতা (13-24) - Poetry
export const bangla1stKobitaConfig: SubjectConfig = {
  sections: {
    core: {
      max: 45,
      activities: {
        "Lecture": 30,
        "Poem Reading": 15,
      },
    },
    mcq: {
      max: 35,
      activities: {
        "MCQ Practice": 15,
        "CQ Practice": 20,
      },
    },
    cq: {
      max: 20,
      activities: {
        "Theme": 10,
        "Revision": 10,
      },
    },
  },
};

// Group C: নাটক (25) - Drama
export const bangla1stNatokConfig: SubjectConfig = {
  sections: {
    core: {
      max: 45,
      activities: {
        "Lecture": 30,
        "Text Reading": 15,
      },
    },
    mcq: {
      max: 40,
      activities: {
        "MCQ Practice": 15,
        "CQ Practice": 25,
      },
    },
    cq: {
      max: 15,
      activities: {
        "Revision": 15,
      },
    },
  },
};

// Group D: উপন্যাস (26) - Novel
export const bangla1stUponnashConfig: SubjectConfig = {
  sections: {
    core: {
      max: 45,
      activities: {
        "Lecture": 30,
        "Chapter Reading": 15,
      },
    },
    mcq: {
      max: 40,
      activities: {
        "MCQ Practice": 15,
        "CQ Practice": 25,
      },
    },
    cq: {
      max: 15,
      activities: {
        "Revision": 15,
      },
    },
  },
};

// Get the appropriate config based on subject ID and chapter
export const getSubjectConfig = (subjectId: string, chapterId?: number): SubjectConfig => {
  const mathSubjects = ["highermath", "highermath2nd"];
  
  if (mathSubjects.includes(subjectId)) return mathConfig;
  
  // English 1st Paper has 3 different configs based on chapter
  if (subjectId === "english1st") {
    if (chapterId && chapterId >= 17) {
      return english1stWritingConfig; // Writing Section (17-21)
    } else if (chapterId && chapterId >= 13) {
      return english1stGrammarConfig; // Grammar & Mechanics (13-16)
    }
    return english1stReadingConfig; // Reading Units (1-12)
  }
  
  // English 2nd Paper has 3 different configs based on chapter
  if (subjectId === "english2nd") {
    if (chapterId && chapterId >= 15) {
      return english2ndCreativeConfig; // Creative Writing (15-16)
    } else if (chapterId && chapterId >= 13) {
      return english2ndFunctionalConfig; // Functional Writing (13-14)
    }
    return english2ndGrammarConfig; // Grammar Core (01-12)
  }
  
  // Bangla 1st Paper has 4 different configs based on chapter
  if (subjectId === "bangla1st") {
    if (chapterId && chapterId === 26) {
      return bangla1stUponnashConfig; // উপন্যাস (26)
    } else if (chapterId && chapterId === 25) {
      return bangla1stNatokConfig; // নাটক (25)
    } else if (chapterId && chapterId >= 13) {
      return bangla1stKobitaConfig; // কবিতা (13-24)
    }
    return bangla1stGadyaConfig; // গদ্য (01-12)
  }
  
  // Bangla 2nd Paper has 3 different configs based on chapter
  if (subjectId === "bangla2nd") {
    if (chapterId && chapterId === 12) {
      return bangla2ndEssayConfig; // প্রবন্ধ-নিবন্ধ (12)
    } else if (chapterId && chapterId >= 7) {
      return bangla2ndWrittenConfig; // নির্মিত অংশ (07-11)
    }
    return bangla2ndGrammarConfig; // ব্যাকরণ অংশ (01-06)
  }
  
  return scienceConfig;
};

// Bangla 2nd Paper - 3 Groups with different activity structures
// Group A (01-06): ব্যাকরণ - Lecture 25%, Rule Notes 15%, Practice 40%, Error Log 10%, Revision 10%
// Group B (07-11): নির্মিত - Lecture 25%, Format Templates 15%, Practice Drafts 30%, Model Answers 10%, Final Draft 10%, Revision 10%
// Group C (12): প্রবন্ধ - Lecture 20%, Outline 20%, Practice Writing 30%, Model Essays 10%, Final Draft 10%, Revision 10%

// Group A: ব্যাকরণ অংশ (01-06) - Grammar
export const bangla2ndGrammarConfig: SubjectConfig = {
  sections: {
    core: {
      max: 40,
      activities: {
        "Lecture": 25,
        "Rule Notes": 15,
      },
    },
    mcq: {
      max: 40,
      activities: {
        "Practice": 40,
      },
    },
    cq: {
      max: 20,
      activities: {
        "Error Log": 10,
        "Revision": 10,
      },
    },
  },
};

// Group B: নির্মিত অংশ (07-11) - Written Skills
export const bangla2ndWrittenConfig: SubjectConfig = {
  sections: {
    core: {
      max: 40,
      activities: {
        "Lecture": 25,
        "Format Templates": 15,
      },
    },
    mcq: {
      max: 40,
      activities: {
        "Practice Drafts": 30,
        "Model Answers": 10,
      },
    },
    cq: {
      max: 20,
      activities: {
        "Final Draft": 10,
        "Revision": 10,
      },
    },
  },
};

// Group C: প্রবন্ধ-নিবন্ধ (12) - Essay
export const bangla2ndEssayConfig: SubjectConfig = {
  sections: {
    core: {
      max: 40,
      activities: {
        "Lecture": 20,
        "Outline": 20,
      },
    },
    mcq: {
      max: 40,
      activities: {
        "Practice Writing": 30,
        "Model Essays": 10,
      },
    },
    cq: {
      max: 20,
      activities: {
        "Final Draft": 10,
        "Revision": 10,
      },
    },
  },
};
