import { Router } from "express";
import axios from "axios";

interface FormattedUnit {
  id: number;
  courseId: number;
  name: string;
  year: number;
  semester: number;
  evaluationType: string;
  grade: [string, string, string, string][];
  ects: number;
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

    const unitsMap: { [key: number]: FormattedUnit } = {};

    response.data.result.forEach((item: any) => {
      const id = item.CD_DISCIP;
      if (!unitsMap[id])
        unitsMap[id] = {
          id,
          courseId: item.CD_CURSO,
          name: item.DS_DISCIP,
          year: item.CD_A_S_CUR,
          semester: parseInt(item.CD_DURACAO_PD.replace("S", "")),
          evaluationType: item.DS_AVALIA,
          grade: [],
          ects: item.NR_CRE_EUR_PD,
        };
      unitsMap[id].grade.push([
        item.NR_NOT_DIS,
        item.DS_STATUS,
        item.DT_FIM_DIS,
        item.CD_FMTLECT,
      ]);
    });

    const formattedUnits = Object.values(unitsMap)
      .sort((a, b) => {
        if (a.year < b.year) return -1;
        if (a.year > b.year) return 1;
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      })
      .map((unit) => {
        unit.grade.sort((a, b) => {
          if (a[2] < b[2]) return 1;
          if (a[2] > b[2]) return -1;
          return 0;
        });
        return unit;
      });

    res.status(response.status).json(formattedUnits);
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
