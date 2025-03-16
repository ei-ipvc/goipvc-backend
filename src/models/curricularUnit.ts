import { Course } from "./course";
import { Teacher } from "./teacher";

export interface CurricularUnit {
  id: number;
  courseId: Course["id"];
  moodleId: number;

  name: string;
  academicYear: number;
  studyYear: number;
  semester: number;
  ects: number;
  autonomousHours: number;

  summary: string;
  objectives: string;
  content: string;
  teachMethods: string;
  evaluation: string;
  mainBiblio: string;
  compBiblio: string;

  classType: { type: string; hours: number }[];
  teachers: Teacher[];
}
