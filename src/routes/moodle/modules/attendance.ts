import { Router } from "express";
import client from "../../..";
import axios from "axios";
import * as cheerio from "cheerio";

interface Attendance {
  id: number;
  date: string;
  time: string;
  room: string;
  state: string;
  classType: string;
}

const router = Router();

router.get("/", async (req, res) => {
  const token = req.headers["x-auth-moodle"];
  const curricularUnitId = req.query.curricularUnitId;
  if (!token || !curricularUnitId)
    res.status(400).send("Missing curricularUnitId or token");

  let moodleClassId: number = 0;
  try {
    const queryResult = await client.query(
      "SELECT moodle_id FROM curricular_units WHERE id = $1",
      [curricularUnitId]
    );

    // shouldn't happen unless request was tampered with
    if (!queryResult.rows.length || !queryResult.rows[0].moodle_id) {
      res.status(404).send("Given curricularUnitId does not exist");
      return;
    }

    moodleClassId = queryResult.rows[0].moodle_id;
  } catch (e) {}

  try {
    const { data } = await axios.get(
      `https://elearning.ipvc.pt/ipvc2024/course/view.php?id=${moodleClassId}`,
      {
        headers: { Cookie: token },
      }
    );

    if (data.includes("loginform")) res.status(401).send();

    const $ = cheerio.load(data);
    const attendance: Attendance[] = $("#ipvc_presencas table tbody")
      .eq(1)
      .children()
      .slice(1)
      .map((_, row) => {
        const cols = $(row).children();
        return {
          id: +cols.eq(0).text().trim(),
          date: cols.eq(1).text().trim(),
          time: cols.eq(2).text().trim(),
          room: cols.eq(3).text().trim(),
          state: cols.eq(5).text().trim(),
          classType: cols.eq(6).text().trim(),
        };
      })
      .get();

    res.status(200).json(attendance);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      res
        .status(error.response?.status || 500)
        .send(error.message || "Unexpected error");
    } else {
      res.status(500).send("Unexpected error");
    }
  }
});

export default router;
