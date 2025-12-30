// Weighted Progress System Configuration
// Science subjects: CQ internal = 50%, but capped at 35% contribution
// Math subjects: No scaling needed, totals 100%

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

// Get the appropriate config based on subject ID
export const getSubjectConfig = (subjectId: string): SubjectConfig => {
  const mathSubjects = ["highermath", "highermath2nd"];
  return mathSubjects.includes(subjectId) ? mathConfig : scienceConfig;
};
