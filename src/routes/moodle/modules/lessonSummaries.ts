import { Router, Request, Response } from "express";
import client from "../../..";
import axios, { AxiosResponse } from "axios";
import * as cheerio from "cheerio";

interface Summary {
  id: number;
  date: string;
  time: string;
  class: string;
  room: string;
  teacher: string;
  summary: string;
  bibliography: string;
}

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const curricularUnitId = req.query.curricularUnitId;
  const token = req.headers["x-auth-moodle"];
  if (!curricularUnitId || !token)
    res.status(400).send("Missing curricularUnitId or token");

  const moodleClassId = (
    await client.query("SELECT moodle_id FROM curricular_units WHERE id = $1", [
      curricularUnitId,
    ])
  ).rows[0].moodle_id;

  try {
    const response: AxiosResponse = await axios.get(
      `https://elearning.ipvc.pt/ipvc2024/course/view.php?id=${moodleClassId}`,
      {
        headers: {
          Cookie: token,
        },
      }
    );

    if (response.data.includes("loginform")) {
      res.status(401).send();
      return;
    }

    const $ = cheerio.load(response.data);

    const summaries: Summary[] = $("#ipvc_sumarios table tbody tr td table")
      .toArray()
      .reduce((acc: Summary[], _, idx, tables) => {
        if (idx % 3 === 0) {
          const t1: string[] = $(tables[idx])
            .find("tr")
            .eq(1)
            .find("td")
            .map((_, el) => $(el).text().trim())
            .get();
          const t2: string = $(tables[idx + 1])
            .find("tr")
            .eq(1)
            .text()
            .trim();
          const t3: string = $(tables[idx + 2])
            .find("tr")
            .eq(1)
            .text()
            .trim();

          const summary: Summary = {
            id: Number(t1[0]),
            date: t1[1],
            time: t1[2],
            class: t1[3],
            room: t1[4],
            teacher: t1[5],
            summary: t1[6] || t2,
            bibliography: t1[7] || t3,
          };

          acc.push(summary);
        }
        return acc;
      }, []);

    res.status(response.status).json(summaries);
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
