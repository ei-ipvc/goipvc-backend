import { Router } from "express";
import axios from "axios";
import * as cheerio from "cheerio";

const router = Router();

router.get("/", async (req, res) => {
  const token = Object.entries(req.cookies)
    .map(([key, value]) => `${key}=${value}`)
    .join("; "); // PHPSESSID=...; ONIPVC=...
  if (!token) {
    res.status(400).send("Missing token");
    return;
  }

  let currentAcademicYear, currentSemester, studentID;
  try {
    const response = await axios.post(
      "https://on.ipvc.pt/v1/modulos/atividadeletiva/horarios_consulta_alunos.php",
      {
        headers: {
          Cookie: token,
          "User-Agent": "Mozilla/5.0 Chrome/99.0.0.0 Safari/537.36",
          "Content-Type": "application/x-www-form-urlencoded",
          Referer: "https://on.ipvc.pt/v1/index2.php?pagina=17",
        },
      }
    );

    const $ = cheerio.load(response.data);

    res.status(200).send(response.data);
    currentAcademicYear = $("#param_anoletivoA option:selected").text();
    currentSemester = $("#param_semestreA option:selected").text();
    studentID = $("#param_meuhorario_numutilizador").val();

    console.log(currentAcademicYear, currentSemester, studentID);
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

  /*try {
    const formData = new FormData();
    //formData.append("param_anoletivoA", "202425");
    //formData.append("param_semestreA", "S2");
    formData.append("param_meuhorario_numutilizador", "29077");
    formData.append("param_horarios_alunos", "horario_aluno");

    const response = await axios.post(
      "https://on.ipvc.pt/v1/modulos/atividadeletiva/horario_source_v3.php",
      formData,
      {
        headers: {
          Cookie: token,
          "User-Agent": "Mozilla/5.0 Chrome/99.0.0.0 Safari/537.36",
        },
      }
    );

    res.status(response.status).json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      res
        .status(error.response ? error.response.status : 500)
        .send(error.message);
    } else {
      console.error(error);
      res.status(500).send("An unexpected error occurred");
    }
  }*/
});

export default router;
