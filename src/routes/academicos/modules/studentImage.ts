import { Router } from "express";
import axios from "axios";

const router = Router();

router.get("/", async (req, res) => {
  const token = req.headers["x-auth-academicos"];
  const studentId = req.query.studentId;
  const courseId = req.query.courseId;
  if (!token) {
    res.status(400).send("Missing token");
    return;
  }

  try {
    const response = await axios.get(
      `https://academicos.ipvc.pt/netpa/PhotoLoader?codAluno=${studentId}&codCurso=${courseId}`,
      {
        headers: {
          Cookie: token,
        },
        responseType: "arraybuffer",
      }
    );

    const buffer = Buffer.from(response.data);
    res.writeHead(200, {
      "Content-Type": "image/png",
      "Content-Length": buffer.length,
    });
    res.end(buffer);
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
