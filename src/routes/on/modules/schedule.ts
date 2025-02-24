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
    formData.append("param_meuhorario_numutilizador", studentId);
    formData.append("param_horarios_alunos", "horario_aluno");

    const fetchSchedule = async (semester: string) => {
      formData.append("param_anoletivoA", "202425");
      formData.append("param_semestreA", semester);

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

      if (
        !response.data.includes(
          "modulos/atividadeletiva/calendar240/fullcalendar.css"
        )
      ) {
        return null;
      }

      const $ = cheerio.load(response.data);
      const script = $("script").eq(8).html()!;
      const match = script.match(/events_data\s*=\s*(.+);/);
      const eventsData = JSON5.parse(match![1]);
      // return res.status(200).json(eventsData);

      return eventsData.map((lesson: any) => {
        const courseId = parseInt(lesson.datauc.match(/^(\d+)/)[1]);

        let [, shortName = "", classType = "", room = ""] =
          /(.+) \[(.+)] .+- (.+)/.exec(lesson.title)!;

        const cNameMatch =
          lesson.datauc.match(/\| (.*) \|/) || lesson.datauc.match(/-(.*?)-/);
        const className = cNameMatch ? cNameMatch[1] : "Desconhecido";

        const teachers = lesson.datadocentes
          .match(/&bull; (.*)<\/div>/)[1]
          .split("; ")
          .filter(
            (t: string, _: number, arr: string[]) =>
              t !== "N/D" || arr.length === 1
          );

        room = room.replace(/\./, "");

        return {
          id: lesson.dataeventoid,
          courseId: courseId,
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
    };

    const s1 = await fetchSchedule("S1");
    const s2 = await fetchSchedule("S2");

    if (s1 === null && s2 === null) {
      res.status(401).send("Unauthorized");
      return;
    }

    const all = [...s1, ...s2];
    res.status(200).json(all);
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
