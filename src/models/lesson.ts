import { CurricularUnit } from "./curricularUnit";
import { Teacher } from "./teacher";

export interface Lesson {
  id: number;
  curricularUnitId: CurricularUnit["id"];
  shortName: string;
  className: string;
  classType: string;
  start: string;
  end: string;
  teachers: Teacher[];
  room: string;
  statusColor: string;
}
