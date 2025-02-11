import { Router } from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import JSON5 from "json5";

const router = Router();

router.post("/", async (req, res) => {
  const token = Object.entries(req.cookies)
    .map(([key, value]) => `${key}=${value}`)
    .join("; "); // PHPSESSID=...; ONIPVC=...
  if (!token) {
    res.status(400).send("Missing token");
    return;
  }

  const studentId = req.body.studentId;
  if (!studentId) {
    res.status(400).send("Missing studentId");
    return;
  }

  try {
    const formData = new FormData();
    // formData.append("param_anoletivoA", "202425");
    // formData.append("param_semestreA", "S2");
    formData.append("param_meuhorario_numutilizador", studentId);
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

    const $ = cheerio.load(response.data);

    // the 8th <script> tag defines events_data, which holds the schedule payload
    const script = $("script").eq(8).html()!;
    const match = script.match(/events_data\s*=\s*(.+);/);

    // JSON5 handles unquoted field names, single quotes values, ...
    const eventsData = JSON5.parse(match![1]);

    const lessons = eventsData.map((lesson: any) => {
      let [, shortName = "", classType = "", room = ""] =
        /(.+) \[(.+)] .+- (.+)/.exec(lesson.title)!;

      const className = ""; // @TODO

      const teachers = lesson.datadocentes
        .match(/&bull; (.*)<\/div>/)[1]
        .split("; ")
        .filter(
          (t: string, _: number, arr: string[]) =>
            t !== "N/D" || arr.length === 1
        );

      room = room.replace(/\./, "");

      return {
        shortName: shortName,
        className: className,
        classType: classType,
        start: lesson.start,
        end: lesson.end,
        teachers: teachers,
        room: room,
        statusColor: lesson.color,
      };
    });

    // res.status(200).json(eventsData);
    res.status(200).json(lessons);
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
