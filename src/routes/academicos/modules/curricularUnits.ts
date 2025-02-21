import { Router } from "express";
import axios from "axios";

interface FormattedUnit {
  id: number;
  name: string;
  finalGrade: string | number;
  academicYear: string;
  studyYear: number;
  semester: number;
  ects: number;
}

const router = Router();

router.get("/", async (req, res) => {
  const token = req.cookies.JSESSIONID;
  if (!token) {
    res.status(400).send("Missing token");
    return;
  }

  // 'https://academicos.ipvc.pt/netpa/ajax/consultanotasaluno/inscricoes?cdLectivoFilter=null&periodoFilter=null&anoCurricular=null&estadoFilter=null&disciplinaFilter=null',
  try {
    const response = await axios.get(
      "https://academicos.ipvc.pt/netpa/ajax/consultanotasaluno/inscricoes",
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

    const formattedUnits: FormattedUnit[] = response.data.result.map(
      (item: any) => ({
        id: parseInt(item.CD_DISCIP),
        name: item.DS_DISCIP,
        finalGrade:
          item.notaFinalCalcField === "-"
            ? "-"
            : parseFloat(item.notaFinalCalcField),
        academicYear: item.CD_LECTIVO,
        studyYear: parseInt(item.CD_A_S_CUR),
        semester: parseInt(item.CD_DURACAO.replace("S", "")),
        ects: parseInt(item.ectsCalcField),
      })
    );

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
