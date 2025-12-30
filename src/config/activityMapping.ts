// Activity Name Normalization
// Maps various activity name variations to standardized names used in weight calculations

export const activityMapping: Record<string, string> = {
  // Notes variations -> "Notes"
  "Highlight Book": "Notes",
  "Book Reading": "Notes",
  "Note Making": "Notes",
  
  // MCQ Practice variations -> "MCQ Practice"
  "MCQ": "MCQ Practice",
  
  // MCQ Summary variations -> "MCQ Summary"
  "MCQ Summery": "MCQ Summary",
  
  // CQ Summary variations -> "CQ Summary"
  "CQ Summery": "CQ Summary",
  "CQ Types": "CQ Summary",
  
  // Written CQ variations -> "Written CQ"
  "Typewise CQ": "Written CQ",
  "Figure Notes": "Written CQ",
  
  // Revision variations -> "Revision"
  "ALL Revision": "Revision",
};

// Normalize an activity name to its standardized form
export const normalizeActivity = (name: string): string => {
  return activityMapping[name] || name;
};
