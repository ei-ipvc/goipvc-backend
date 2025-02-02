import { Router } from "express";
import axios from "axios";

const router = Router();

router.get("/", async (req, res) => {
  const { token } = req.body;
  if (!token) {
    res.status(400).send("Missing token");
    return;
  }

  try {
    const response = await axios.get(
      "https://on.ipvc.pt/v1/modulos/atividadeletiva/horario_source_v3.php",
      {
        headers: {
          Cookie: token,
        },
      }
    );

    res.status(response.status).json(response.data);
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
