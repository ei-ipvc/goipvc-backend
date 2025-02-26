import { Router } from "express";
import axios from "axios";

interface CurricularUnit {
  id: number;
  name: string;
  year: number;
  semester: number;
  evaluationType: string;
  grade: [string, string, string, string][];
  highestGrade: string;
  ects: number;
}

interface Course {
  avgGrade: number;
  curricularUnits: CurricularUnit[];
}

const router = Router();

router.get("/", async (req, res) => {
  const token = req.cookies.JSESSIONID;
  if (!token) {
    res.status(400).send("Missing token");
    return;
  }

  try {
    const response = await axios.get(
      "https://academicos.ipvc.pt/netpa/ajax/situacaodealuno/tabelaPlanoEstudos",
      {
        headers: {
          Cookie: `JSESSIONID=${token}`,
        },
      }
    );

    if (!response.data.success) {
      res.status(401).send("Unauthorized");
      return;
    }

    const unitsMap: { [key: number]: Course } = {};

    response.data.result.forEach((item: any) => {
      const courseId = item.CD_CURSO,
        unitId = item.CD_DISCIP;

      if (!unitsMap[courseId]) {
        unitsMap[courseId] = {
          avgGrade: 0,
          curricularUnits: [],
        };
      }

      const units = unitsMap[courseId].curricularUnits;
      let unit = units.find((u) => u.id === unitId);

      if (!unit) {
        unit = {
          id: unitId,
          name: item.DS_DISCIP,
          year: item.CD_A_S_CUR,
          semester: parseInt(item.CD_DURACAO_PD.replace("S", "")),
          evaluationType: item.DS_AVALIA,
          grade: [],
          highestGrade: item.NR_NOT_DIS,
          ects: item.NR_CRE_EUR_PD,
        };

        units.push(unit);
      }

      if (unit.highestGrade < item.NR_NOT_DIS)
        unit.highestGrade = item.NR_NOT_DIS;

      unit.grade.push([
        item.NR_NOT_DIS,
        item.DS_STATUS,
        item.DT_FIM_DIS,
        item.CD_FMTLECT,
      ]);
    });

    const formattedUnits = Object.values(unitsMap).map((course) => {
      course.avgGrade = parseFloat(
        course.curricularUnits
          .reduce(
            (acc, unit) =>
              acc +
              parseFloat(unit.highestGrade) / course.curricularUnits.length,
            0
          )
          .toFixed(2)
      );

      course.curricularUnits.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.name.localeCompare(b.name);
      });

      course.curricularUnits.forEach((unit) => {
        unit.grade.sort((a, b) => (a[2] > b[2] ? -1 : a[2] < b[2] ? 1 : 0));
      });

      return course;
    });

    res.status(200).json(formattedUnits);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      res
        .status(error.response ? error.response.status : 500)
        .send(error.message);
    } else {
      console.error(error);
      res.status(500).send("An unexpected error occurred");
    }
  }
});

export default router;
