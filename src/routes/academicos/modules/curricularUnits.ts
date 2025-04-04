import { response, Router } from "express";
import axios from "axios";
import { curricularUnit } from "../../on/modules/curricularUnit";

interface CurricularUnit {
  id: number;
  name: string;
  year: number;
  semester: number;
  grade: [number, string, string, string | null, string][] | null;
  highestGrade: number | null;
  ects: number;
}

interface Course {
  avgGrade: number;
  curricularUnits: CurricularUnit[];
}

const router = Router();

const dateFormat = (date: string): string | null => {
  if (date === "-") return null;
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
};

router.get("/", async (req, res) => {
  const token = req.headers["x-auth-academicos"];
  if (!token) res.status(400).send("Missing token");

  try {
    const response = await axios.get(
      "https://academicos.ipvc.pt/netpa/ajax/consultanotasaluno/inscricoes",
      { headers: { Cookie: token } }
    );
    if (!response.data.success) {
      res.status(401).send();
      return;
    }

    const unitsMap: Record<number, Course> = {};
    for (const item of response.data.result) {
      if (!unitsMap[0]) unitsMap[0] = { avgGrade: 0, curricularUnits: [] };

      const units = unitsMap[0].curricularUnits;
      let unit = units.find((unit) => unit.id === item.CD_DISCIP);
      const grade = parseInt(item.notaFinalCalcField);

      if (!item.turmasCalcField) continue;

      if (!unit) {
        unit = {
          id: item.CD_DISCIP,
          name: item.DS_DISCIP,
          year: item.CD_A_S_CUR,
          semester: parseInt(item.CD_DURACAO.replace("S", "")),
          grade: item.notaFinalCalcField ? [] : null,
          highestGrade: grade || null,
          ects: parseInt(item.ectsCalcField),
        };
        units.push(unit);
      }

      let evaluationType = item.dsAvaliaCalcField || null;
      if (evaluationType === "-") evaluationType = null;

      if (unit.grade)
        unit.grade.push([
          grade,
          evaluationType,
          item.estadoCalcField,
          dateFormat(item.dataFimInscricao) || null,
          item.anoLectivoCalcField,
        ]);

      if (unit.highestGrade === null || unit.highestGrade < grade)
        unit.highestGrade = grade || null;

      if (!unit.ects) {
        try {
          const courseId = parseInt(/^\d+/.exec(item.id)![0]);
          const classInfo = await curricularUnit(courseId, unit.id);
          if (classInfo.ects) unit.ects = classInfo.ects;
        } catch (error) {
          console.error("Failed to fetch class info:", error);
        }
      }
    }

    const formattedUnits = Object.values(unitsMap).map((course) => {
      const validUnits = course.curricularUnits.filter(
        (unit) => unit.highestGrade !== null
      );

      const { totalEcts, weightedSum } = validUnits.reduce(
        (acc, unit) => {
          acc.totalEcts += unit.ects;
          acc.weightedSum += unit.highestGrade! * unit.ects;
          return acc;
        },
        { totalEcts: 0, weightedSum: 0 }
      );
      const avg = weightedSum / totalEcts;
      course.avgGrade = parseFloat(avg.toFixed(2));

      course.curricularUnits.sort((a, b) =>
        a.year !== b.year ? a.year - b.year : a.name.localeCompare(b.name)
      );
      course.curricularUnits.forEach((unit) =>
        unit.grade?.sort((a, b) => (a[2]! > b[2]! ? -1 : 1))
      );

      return course;
    });

    res.status(200).json(formattedUnits[0]);
  } catch (error) {
    const status =
      axios.isAxiosError(error) && error.response ? error.response.status : 500;
    res
      .status(status)
      .send(
        axios.isAxiosError(error)
          ? error.message
          : "An unexpected error occurred"
      );
  }
});

export default router;
