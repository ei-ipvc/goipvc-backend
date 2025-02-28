import { Router, Request, Response } from "express";
import axios, { AxiosResponse } from "axios";

const router = Router();

export async function getClassInfo(courseId: number, classId: number) {
  if (!courseId || !classId) {
    throw new Error("Missing courseId or classId");
  }

  try {
    const response: AxiosResponse = await axios.get(
      `https://on.ipvc.pt/v1/puc.php?cd_curso=${courseId}&cd_discip=${classId}&lang=pt`
    );

    const match = /ECTS:<\/b> (.*?)<\/br>/.exec(response.data);
    const ects = match ? parseInt(match[1]) : null;

    return { ects: ects };
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
    const classInfo = await getClassInfo(courseId, classId);
    res.status(200).json(classInfo);
  } catch (error) {
    if (error instanceof Error) res.status(500).send(error.message);
    else res.status(500).send("An unknown error occurred");
  }
});

export default router;
