import { Router, Request, Response } from "express";
import axios, { AxiosResponse } from "axios";
import * as cheerio from "cheerio";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const courseId = req.body.courseId;
  if (!courseId) {
    res.status(400).send("Missing courseId");
    return;
  }

  const classId = req.body.classId;
  if (!classId) {
    res.status(400).send("Missing classId");
    return;
  }

  try {
    const response: AxiosResponse = await axios.get(
      `https://on.ipvc.pt/v1/puc.php?cd_curso=${courseId}&cd_discip=${classId}&lang=pt`
    );

    const $ = cheerio.load(response.data);

    res.status(200).json(response.data);
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
