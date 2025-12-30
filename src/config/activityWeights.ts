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

// English 1st Paper - Reading Section
// 7 activities per unit, marks distribution: MCQ(5), Open-ended(10), Info Transfer(10), 
// Summarizing(5), Cloze with clues(10), Cloze without clues(10), Rearranging(10) = 60 total
// Normalized to 100%
export const englishReadingConfig: SubjectConfig = {
  sections: {
    core: {
      max: 25,
      activities: {
        "MCQ": 8,          // 5/60 ≈ 8%
        "Summarizing": 8,  // 5/60 ≈ 8%
        "Rearranging": 9,  // Remaining from core
      },
    },
    mcq: {
      max: 25,
      activities: {
        "Open-ended": 17,  // 10/60 ≈ 17%
        "Info Transfer": 8,
      },
    },
    cq: {
      max: 50,
      activities: {
        "Info Transfer": 9, // Split across sections
        "Cloze (with clues)": 17,    // 10/60 ≈ 17%
        "Cloze (without clues)": 17, // 10/60 ≈ 17%
        "Rearranging": 7,  // Additional weight
      },
    },
  },
};

// English 1st Paper - Writing Section
// 4 activities per chapter: Practice, Summary, Final Draft, Revision
export const englishWritingConfig: SubjectConfig = {
  sections: {
    core: {
      max: 30,
      activities: {
        "Practice": 30,
      },
    },
    mcq: {
      max: 20,
      activities: {
        "Summary": 20,
      },
    },
    cq: {
      max: 50,
      activities: {
        "Final Draft": 35,
        "Revision": 15,
      },
    },
  },
};

// Get the appropriate config based on subject ID
export const getSubjectConfig = (subjectId: string): SubjectConfig => {
  const mathSubjects = ["highermath", "highermath2nd"];
  const englishReadingSubjects = ["english1st-reading"];
  const englishWritingSubjects = ["english1st-writing"];
  
  if (mathSubjects.includes(subjectId)) return mathConfig;
  if (englishReadingSubjects.includes(subjectId)) return englishReadingConfig;
  if (englishWritingSubjects.includes(subjectId)) return englishWritingConfig;
  
  return scienceConfig;
};
