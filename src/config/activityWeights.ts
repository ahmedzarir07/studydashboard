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
// Core Study: 40% | MCQ: 25% | CQ: 35% (scaled from 50% internal)
export const scienceConfig: SubjectConfig = {
  sections: {
    core: {
      max: 40,
      activities: {
        "Lecture": 20,
        "Notes": 20,
      },
    },
    mcq: {
      max: 25,
      activities: {
        "MCQ Practice": 15,
        "MCQ Summary": 10,
      },
    },
    cq: {
      max: 35,
      internalMax: 50, // Internal activities total 50%, but contribute max 35%
      activities: {
        "ক": 5,
        "খ": 10,
        "CQ Summary": 10,
        "Written CQ": 25,
        // Final layer activities included in CQ section
        "Revision": 3,
        "Exam": 2,
      },
    },
  },
};

// Higher Math 1st & 2nd Paper
// Core Study: 40% | MCQ: 25% | CQ/Problems: 30% | Final Layer: 5%
export const mathConfig: SubjectConfig = {
  sections: {
    core: {
      max: 40,
      activities: {
        "Lecture": 20,
        "Notes": 20,
      },
    },
    mcq: {
      max: 25,
      activities: {
        "MCQ Practice": 15,
        "MCQ Summary": 10,
      },
    },
    cq: {
      max: 30,
      activities: {
        "CQ Practice": 10,
        "CQ Summary": 10,
        "Book Problems": 10,
      },
    },
    final: {
      max: 5,
      activities: {
        "Revision": 3,
        "Exam": 2,
      },
    },
  },
};

// Get the appropriate config based on subject ID
export const getSubjectConfig = (subjectId: string): SubjectConfig => {
  const mathSubjects = ["highermath", "highermath2nd"];
  return mathSubjects.includes(subjectId) ? mathConfig : scienceConfig;
};
