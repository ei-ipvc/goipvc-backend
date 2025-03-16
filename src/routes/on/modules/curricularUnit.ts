import { Router, Request, Response } from "express";
import axios, { AxiosResponse } from "axios";
import * as cheerio from "cheerio";
import client from "../../..";
import { CurricularUnit } from "../../../models/curricularUnit";

const router = Router();

const locFields = {
  en: {
    responsible: /MEMBER.+/,
    otherTeachers: /MEMBERS.+/,

    courseName: /COURSE UNIT:.+?> (.*)</,
    courseType: /CYCLE:.+?> (.*)</,

    className: /CURRICULAR UNIT:.+?> (.*)</,
    year: /YEAR:.+?(\d+)/,
    semester: /SEMESTER:.+?S(\d)/,
    autonomousHours: /AUTONOMOUS WORK:.+?\s(\d+)/,
  },
  pt: {
    responsible: /RESPONSÁVEL.+/,
    otherTeachers: /DOCENTES.+/,

    courseName: /CURSO:.+?> (.*)</,
    courseType: /CICLO:.+?> (.*)</,

    className: /CURRICULAR:.+?> (.*)</,
    year: /ANO:.+?(\d+)/,
    semester: /SEMESTRE:.+?S(\d)/,
    autonomousHours: /AUTÓNOMO:.+?\s(\d+)/,
  },
};

const parseTeachers = async (str: string, classId: number) => {
  // extract teacher names
  const teachersMatch = str.replace(/.+> /, "").match(/.+?\(/g);
  if (!teachersMatch) return [];
  const teachers = teachersMatch.map((t) => t.slice(0, -1));

  // query to get id, name, and email from the teachers
  const query = `SELECT id, name, email FROM teachers WHERE name IN (${teachers
    .map((t) => `'${t}'`)
    .join(", ")})`;
  const result = await client.query(query);

  // map of teacher names to ids from query
  const teacherData = result.rows.reduce(
    (acc: Record<string, { id: number; email: string | null }>, row: any) => {
      acc[row.name] = { id: row.id, email: row.email };
      return acc;
    },
    {}
  );

  // insert teachers into curricular_unit_teachers table
  for (const teacher of teachers) {
    const responsible = teachers.length === 1;
    await client.query(
      `INSERT INTO curricular_unit_teachers (id, teacher_id, responsible)
      VALUES ($1, $2, $3)
      ON CONFLICT (id, teacher_id) DO NOTHING`,
      [classId, teacherData[teacher].id, responsible]
    );
  }

  // return teacher data
  return teachers.map((name) => ({
    name,
    email: teacherData[name].email,
  }));
};

export async function curricularUnit(
  courseId: number,
  classId: number,
  lang: "en" | "pt" = "pt"
) {
  if (!courseId || !classId) {
    throw new Error("Missing courseId or classId");
  }

  try {
    const response: AxiosResponse = await axios.get(
      `https://on.ipvc.pt/v1/puc.php?cd_curso=${courseId}&cd_discip=${classId}&lang=${lang}`
    );

    const $ = cheerio.load(response.data);

    const shiftsElem = $(
      "div.col-lg-6:nth-child(2) table tbody tr:nth-child(2)"
    );
    const [shiftTypes, shiftHours] = [1, 2].map((col) =>
      shiftsElem
        .find(`td:nth-child(${col})`)
        .html()!
        .trim()
        .split("<br>")
        .filter(Boolean)
    );
    const shifts = shiftTypes.map((type, i) => ({
      type: type.trim(),
      hours: parseInt(shiftHours[i].trim(), 10),
    }));

    const getValue = (pattern: RegExp) => {
      const match = response.data.match(pattern);
      return match ? parseInt(match[1]) : null;
    };
    const fields = locFields[lang];
    const responsible = await parseTeachers(
        response.data.match(fields.responsible)[0],
        classId
      ),
      otherTeachers = await parseTeachers(
        response.data.match(fields.otherTeachers)[0],
        classId
      ),
      courseName = response.data.match(fields.courseName)[1],
      courseType = response.data.match(fields.courseType)[1],
      className = response.data.match(fields.className)[1],
      year = getValue(fields.year),
      semester = getValue(fields.semester),
      autonomousHours = getValue(fields.autonomousHours),
      ects = getValue(/ECTS:.+\s(\d+)/);

    const keys = [
      { from: "resumo", to: "summary" },
      { from: "objetivos", to: "objectives" },
      { from: "conteudo", to: "programContent" },
      { from: "metodologias", to: "teachMethods" },
      { from: "avaliacao", to: "evaluation" },
      { from: "bibliografia", to: "mainBiblio" },
      { from: "bibliografia_comp", to: "compBiblio" },
    ];
    const sections = Object.fromEntries(
      keys.map(({ from, to }) => [
        to,
        $(`#${from} div div div :nth-child(2)`).text().trim(),
      ])
    );

    lang = lang.toLowerCase() as "en" | "pt";
    await client.query(
      `INSERT INTO courses (id, name, type) 
      VALUES ($1, $2, $3) 
      ON CONFLICT (id) DO UPDATE 
      SET name = courses.name || $2::jsonb,
      type = courses.type || $3::jsonb`,
      [
        courseId,
        JSON.stringify({ [`name_${lang}`]: courseName }),
        JSON.stringify({ [`type_${lang}`]: courseType }),
      ]
    );
    await client.query(
      `INSERT INTO curricular_units (id, course_id, name, study_year, semester, ects, autonomous_hours, summary, objectives, content, teach_methods, evaluation, main_biblio, comp_biblio)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (id) DO UPDATE
      SET course_id = $2,
      name = curricular_units.name || $3::jsonb,
      study_year = $4,
      semester = $5,
      ects = $6,
      autonomous_hours = $7,
      summary = curricular_units.summary || $8::jsonb,
      objectives = curricular_units.objectives || $9::jsonb,
      content = curricular_units.content || $10::jsonb,
      teach_methods = curricular_units.teach_methods || $11::jsonb,
      evaluation = curricular_units.evaluation || $12::jsonb,
      main_biblio = curricular_units.main_biblio || $13::jsonb,
      comp_biblio = curricular_units.comp_biblio || $14::jsonb`,
      [
        classId,
        courseId,
        JSON.stringify({ [`name_${lang}`]: className }),
        year,
        semester,
        ects,
        autonomousHours,
        JSON.stringify({ [`summary_${lang}`]: sections.summary }),
        JSON.stringify({ [`objectives_${lang}`]: sections.objectives }),
        JSON.stringify({
          [`content_${lang}`]: sections.programContent,
        }),
        JSON.stringify({ [`teach_methods_${lang}`]: sections.teachMethods }),
        JSON.stringify({ [`evaluation_${lang}`]: sections.evaluation }),
        JSON.stringify({ [`main_biblio_${lang}`]: sections.mainBiblio }),
        JSON.stringify({ [`comp_biblio_${lang}`]: sections.compBiblio }),
      ]
    );
    await client.query(
      `INSERT INTO curricular_unit_class_types (id, class_type, hours)
      VALUES ($1, $2, $3)
      ON CONFLICT (id) DO UPDATE
      SET class_type = $2,
      hours = $3`,
      [classId, JSON.stringify(shiftTypes), JSON.stringify(shiftHours)]
    );

    return {
      studyYear: year,
      semester: semester,
      ects: ects,
      autonomousHours: autonomousHours,
      ...sections,
      classType: shifts,
      responsible: responsible,
      otherTeachers: otherTeachers,
    } as Partial<CurricularUnit>;
  } catch (error) {
    console.error(error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.message);
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
}

router.post("/", async (req: Request, res: Response) => {
  const courseId = req.body.courseId;
  const classId = req.body.classId;
  const lang = req.body.lang;

  try {
    const classInfo = await curricularUnit(courseId, classId, lang);
    res.status(200).json(classInfo);
  } catch (error) {
    res.status(500).send(error);
  }
});

export default router;
