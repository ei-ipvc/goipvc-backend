import { Router } from "express";
import axios from "axios";
import { load } from "cheerio";
import { Teacher } from "../../models/teacher";
import client from "../..";

const router = Router();

const updtTeachers = async () => {
  const response = await axios.get(
    "https://www.ipvc.pt/estg/a-escola/corpo-docente/"
  );
  const $ = load(response.data);

  const teachers: Teacher[] = [];
  $(".link-005").each((_, el) => {
    const name = $(el).find(".link-005-item-title").text(),
      email = $(el)
        .find(".link-005-email a")
        .attr("href")
        ?.replace("mailto:", "");

    if (teachers.some((teacher) => teacher.name === name)) return;
    if (!email) return;

    teachers.push({ name, email });
  });

  for (const teacher of teachers) {
    await client.query(
      `INSERT INTO teachers (name, email) VALUES ($1, $2)
       ON CONFLICT (name) DO UPDATE SET email = EXCLUDED.email`,
      [teacher.name, teacher.email]
    );
  }
};

router.get("/", async (req, res) => {
  // for each 1:128 requests, updt teachers
  if (Math.random() < 0.0078125) await updtTeachers();

  const { query } = req.body;
  let sqlQuery = "SELECT * FROM teachers";
  const params: string[] = [];

  if (query) {
    sqlQuery += " WHERE name ILIKE $1 OR email ILIKE $1";
    params.push(`%${query}%`);
  }

  const { rows } = await client.query(sqlQuery, params);
  res.json(rows);
});

export { updtTeachers };
export default router;
