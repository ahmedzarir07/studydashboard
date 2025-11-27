export type Status = "Done" | "In progress" | "Not Started" | "";

export interface Activity {
  name: string;
  status: Status;
}

export interface Chapter {
  id: number;
  name: string;
  activities: Activity[];
}

export interface SubjectData {
  id: string;
  name: string;
  chapters: Chapter[];
  activities: string[];
}
