import { Router } from "express";
import checkOnAuth from "../../../middleware/on";
import axios from "axios";
import * as cheerio from "cheerio";
import JSON5 from "json5";
import { Lesson } from "../../../models/lesson";

const router = Router();

router.post("/", checkOnAuth, async (req, res) => {
  const token = req.headers["x-auth-on"];
  if (!token) {
    res.status(400).send("Missing token");
    return;
  }

  const studentId = req.body.studentId;
  if (!studentId) {
    res.status(400).send("Missing studentId");
    return;
  }

  const formData = new FormData();
  formData.append("param_meuhorario_numutilizador", studentId);
  formData.append("param_horarios_alunos", "horario_aluno");

  try {
    const fetchSchedule = async (semester: string): Promise<Lesson[]> => {
      formData.append("param_anoletivoA", "202425");
      formData.append("param_semestreA", semester);

      const response = await axios.post(
        "https://on.ipvc.pt/v1/modulos/atividadeletiva/horario_source_v3.php",
        formData,
        {
          headers: {
            Cookie: token,
          },
        }
      );

      const $ = cheerio.load(response.data);
      const script = $("script").eq(8).html()!;
      const match = script.match(/events_data\s*=\s*(.+);/);
      const eventsData = JSON5.parse(match![1]);

      return eventsData.map((lesson: any): Lesson => {
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
          curricularUnitId: courseId,
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

    const [s1, s2] = await Promise.allSettled([
      fetchSchedule("S1"),
      fetchSchedule("S2"),
    ]);

    const lessons = [
      ...(s1.status === "fulfilled" ? s1.value : []),
      ...(s2.status === "fulfilled" ? s2.value : []),
    ];

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
