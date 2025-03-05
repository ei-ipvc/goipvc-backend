import { Course } from "./course";
import { Teacher } from "./teacher";

export interface CurricularUnit {
  id: number;
  courseId: Course["id"];
  moodleId?: number;
  name: string;
  academicYear: number;
  studyYear: number;
  semester: number;
  ects: number;
  autonomousHours: number;
  classType: any;
  teachers: Teacher[];
  summary: string;
  objectives: string;
  courseContent: string;
  methodologies: string;
  evaluation: string;
  bibliography: string;
  bibliographyExtra: string;
}
