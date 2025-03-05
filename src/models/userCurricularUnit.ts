export interface UserCurricularUnit {
  grade: [number, string, string, string | null, string][] | null;
  highestGrade: number;
}
