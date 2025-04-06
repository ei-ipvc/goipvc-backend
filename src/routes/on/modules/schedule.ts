import { Router } from "express";
import checkOnAuth from "../../../middleware/on";
import axios from "axios";
import * as cheerio from "cheerio";
import JSON5 from "json5";
import { Lesson } from "../../../models/lesson";
import {CheerioAPI} from "cheerio"

const router = Router();

function parseSchedule($: CheerioAPI) {
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
}

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
      return parseSchedule($)
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

router.get("/search-options", checkOnAuth, async (req, res) => {
  const token = req.headers["x-auth-on"]

  const response = await axios.get(
      "https://on.ipvc.pt/v1/modulos/atividadeletiva/horarios_consulta.php",
      {
        headers: {
          Cookie: token,
        }
      }
  )

  const $ = cheerio.load(response.data)

  const parseOptions = (selector: string, filterZero = false) => {
    return $(selector)
        .find('option')
        .filter((_, el) => !filterZero || $(el).attr('value') !== '0')
        .map((_, el) => ({
          name: $(el).text(),
          value: $(el).attr('value') || ''
        }))
        .get()
  }

  let a = {
    years: parseOptions('#param_anoletivoH'),
    semesters: parseOptions('#param_semestreH'),
    schools: parseOptions('#param_uoH', true),
    degrees: parseOptions('#param_grauH', true)
  }

  res.send(a)
})

// Usage example (Query params)
// ?year=202425&degree=LICENCIATURA&school=04
router.get("/course-list", checkOnAuth, async (req, res) => {
  const token = req.headers["x-auth-on"]

  if(!req.query["year"] || !req.query["degree"] || !req.query["school"]) {
    res.sendStatus(400)
    return
  }

  const formData = new FormData()
  // really
  formData.append("param_anoletivoH", req.query["year"] as string)
  formData.append("param_grauH", req.query["degree"] as string)
  formData.append("param_uoH", req.query["school"] as string)

  const response = await axios.post(
      "https://on.ipvc.pt/v1/modulos/atividadeletiva/source_select_cursosH.php",
      formData,
      {
        headers: {
          Cookie: token,
        }
      }
  )

  const $ = cheerio.load(response.data)

  res.send($('#param_cursoH')
      .find('option')
      .filter((_, el) => $(el).attr('value') !== '0')
      .map((_, el) => ({
        name: $(el).text(),
        value: $(el).attr('value') || ''
      }))
      .get())
})

async function getWeekList(token: string, year: string, semester: string) {
  const formData = new FormData()
  formData.append("param_anoletivoH", year)
  formData.append("param_semestreH", semester)

  const response = await axios.post(
      "https://on.ipvc.pt/v1/modulos/atividadeletiva/source_select_semanasH.php",
      formData,
      {
        headers: {
          Cookie: token,
        }
      }
  )

  const $ = cheerio.load(response.data)

  return $('#param_semanaH')
      .find('option')
      .map((_, el) => $(el).attr('value'))
      .get()
}

// Usage example (Query params)
// ?year=202425&semester=S2&course=9119
router.get("/class-list", checkOnAuth, async (req, res) => {
  const token = req.headers["x-auth-on"]

  if(!req.query["year"] || !req.query["semester"] || !req.query["course"]) {
    res.sendStatus(400)
    return
  }

  const formData = new FormData()
  formData.append("param_anoletivoH", req.query["year"] as string)
  formData.append("param_semestreH", req.query["semester"] as string)
  formData.append("param_cursoH", req.query["course"] as string)

  const response = await axios.post(
      "https://on.ipvc.pt/v1/modulos/atividadeletiva/source_select_turmasH.php",
      formData,
      {
        headers: {
          Cookie: token,
        }
      }
  )

  const $ = cheerio.load(response.data)

  res.send($('#param_turmaH')
      .find('option')
      .filter((_, el) => $(el).attr('value') !== '0')
      .map((_, el) => ({
        name: $(el).text(),
        value: $(el).attr('value') || ''
      }))
      .get())
})

// Usage example (Query params)
// ?year=202425&semester=S2&classId=EI-3-A
router.get("/search", checkOnAuth, async (req, res) => {
  const token = req.headers["x-auth-on"]

  if(!req.query["year"] || !req.query["semester"] || !req.query["classId"]) {
    res.sendStatus(400)
    return
  }

  const weeks = await getWeekList(token as string, req.query["year"] as string, req.query["semester"] as string)

  let schedule: any[] = []

  for(const week of weeks) {
    const formData = new FormData()
    formData.append("param_anoletivoH", req.query["year"] as string)
    formData.append("param_semestreH", req.query["semester"] as string)
    formData.append("param_turmaH", req.query["classId"] as string)
    formData.append("param_semanaH", week)
    formData.append("emissorH", "consultageral")

    const response = await axios.post(
        "https://on.ipvc.pt/v1/modulos/atividadeletiva/horario_source_v3.php",
        formData,
        {
          headers: {
            Cookie: token,
          }
        }
    )

    const $ = cheerio.load(response.data)

    if($.text().includes("Sem horário definido"))
      continue

    schedule = schedule.concat(parseSchedule($))
  }

  res.send(schedule)
})

export default router;
