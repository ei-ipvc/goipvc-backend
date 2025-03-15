import { Router, Request, Response } from "express";
import axios, { AxiosResponse } from "axios";
import * as cheerio from "cheerio";
import client from "../../..";

const router = Router();

export async function curricularUnit(courseId: number, classId: number) {
  if (!courseId || !classId) {
    throw new Error("Missing courseId or classId");
  }

  try {
    const response: AxiosResponse = await axios.get(
      `https://on.ipvc.pt/v1/puc.php?cd_curso=${courseId}&cd_discip=${classId}&lang=pt`
    );

    const $ = cheerio.load(response.data);

    const getValue = (pattern: RegExp) => {
      const match = response.data.match(pattern);
      return match ? parseInt(match[1]) : null;
    };
    const year = getValue(/ANO:.+(\d+)/),
      semester = getValue(/SEMESTRE:.+S(\d)/),
      autonomousHours = getValue(/AUTÓNOMO:.+\s(\d+)/),
      ects = getValue(/ECTS:.+\s(\d+)/);

    const keys = [
      { from: "resumo", to: "summary" },
      { from: "objetivos", to: "objectives" },
      { from: "conteudo", to: "courseContent" },
      { from: "metodologias", to: "methodologies" },
      { from: "avaliacao", to: "evaluation" },
      { from: "bibliografia", to: "bibliography" },
      { from: "bibliografia_comp", to: "bibliographyExtra" },
    ];
    const sections = Object.fromEntries(
      keys.map(({ from, to }) => [
        to,
        $(`#${from} div div div :nth-child(2)`).text().trim(),
      ])
    );

    await client.query(
      `INSERT INTO curricular_units (id, course_id, academic_year, study_year, semester, ects, autonomous_hours, summary, objectives, course_content, methodologies, evaluation, bibliography, bibliography_extra) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) ON CONFLICT (id) DO UPDATE SET course_id = $2, academic_year = $3, study_year = $4, semester = $5, ects = $6, autonomous_hours = $7, summary = $8, objectives = $9, course_content = $10, methodologies = $11, evaluation = $12, bibliography = $13, bibliography_extra = $14`,
      [
        classId,
        courseId,
        year,
        year,
        semester,
        ects,
        autonomousHours,
        sections.summary,
        sections.objectives,
        sections.courseContent,
        sections.methodologies,
        sections.evaluation,
        sections.bibliography,
        sections.bibliographyExtra,
      ]
    );

    return { year, semester, autonomousHours, ects, ...sections };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.message);
    } else {
      console.error(error);
      throw new Error("An unexpected error occurred");
    }
  }
}

router.post("/", async (req: Request, res: Response) => {
  const courseId = req.body.courseId;
  const classId = req.body.classId;

  try {
    const classInfo = await curricularUnit(courseId, classId);
    res.status(200).json(classInfo);
  } catch (error) {
    if (error instanceof Error) res.status(500).send(error.message);
    else res.status(500).send("An unknown error occurred");
  }
});

export default router;
