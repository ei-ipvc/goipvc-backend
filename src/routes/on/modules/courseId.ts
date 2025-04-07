import { Router } from "express";
import axios from "axios";

const router = Router();

router.get("/", async (req, res) => {
  const token = req.headers["x-auth-on"];
  if (!token) {
    res.status(400).send("Missing token");
    return;
  }

  const username = req.query.username as string;
  if (!username) {
    res.status(400).send("Missing username");
    return;
  }

  const formData = new FormData();
  formData.append("param_alunosinscricao_idutilizador", username);
  formData.append("param_alunosinscricao_anoletivo", "202425");

  try {
    const response = await axios.post(
      "https://on.ipvc.pt/v1/modulos/atividadeletiva/alunos_meuhorario_select_curso.php",
      formData,
      {
        headers: {
          Cookie: token,
        },
      }
    );

    const match = response.data.match(/value="(\d+)"/);
    if (!match) {
      res.status(400).send();
      return;
    }
    const courseId = match[1];

    res.status(200).send(courseId);
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
