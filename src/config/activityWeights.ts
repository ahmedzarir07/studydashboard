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

// English 2nd Paper - Grammar (60%) + Composition (40%)
// Grammar chapters (1-12): Practice, Rules Summary, Mock Test, Revision
// Composition chapters (13-16): Practice, Draft Writing, Final Copy, Revision
export const english2ndConfig: SubjectConfig = {
  sections: {
    core: {
      max: 30,
      activities: {
        "Practice": 30,
      },
    },
    mcq: {
      max: 25,
      activities: {
        "Rules Summary": 15,
        "Draft Writing": 10,
      },
    },
    cq: {
      max: 45,
      activities: {
        "Mock Test": 15,
        "Final Copy": 15,
        "Revision": 15,
      },
    },
  },
};

// Get the appropriate config based on subject ID and chapter
export const getSubjectConfig = (subjectId: string, chapterId?: number): SubjectConfig => {
  const mathSubjects = ["highermath", "highermath2nd"];
  const english2ndSubjects = ["english2nd"];
  
  if (mathSubjects.includes(subjectId)) return mathConfig;
  if (english2ndSubjects.includes(subjectId)) return english2ndConfig;
  
  // English 1st Paper has 3 different configs based on chapter
  if (subjectId === "english1st") {
    if (chapterId && chapterId >= 17) {
      return english1stWritingConfig; // Writing Section (17-21)
    } else if (chapterId && chapterId >= 13) {
      return english1stGrammarConfig; // Grammar & Mechanics (13-16)
    }
    return english1stReadingConfig; // Reading Units (1-12)
  }
  
  return scienceConfig;
};
