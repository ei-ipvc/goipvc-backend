import { Router } from "express";
import axios from "axios";

const router = Router();

router.post("/", async (req, res) => {
  const { token } = req.body;

  if (!token) {
    res.status(400).send("Missing token");
    return;
  }

  try {
    const response = await axios.get(
      'https://academicos.ipvc.pt/netpa/ajax/consultanotasaluno/inscricoes?cdLectivoFilter=null&periodoFilter=null&anoCurricular=null&estadoFilter=null&disciplinaFilter=null&group=[{"property":"CD_LECTIVO","direction":"desc"}]&sort=[{"property":"CD_LECTIVO","direction":"DESC"}]',
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
      res.status(500).send("An unexpected error occurred");
    }
  }
});

export default router;
