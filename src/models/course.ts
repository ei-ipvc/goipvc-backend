import { CurricularUnit } from "./curricularUnit";

export interface Course {
  id: number;
  name: string;
  curricularUnits: CurricularUnit[];
}
