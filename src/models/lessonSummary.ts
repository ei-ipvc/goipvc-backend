import { Lesson } from "./lesson";
import { Teacher } from "./teacher";

export interface LessonSummary {
  id: number;
  lessonId: Lesson["id"];
  date: string;
  time: string;
  class: string;
  room: string;
  teachers: Teacher[];
  summary: string;
  bibliography: string;
}
