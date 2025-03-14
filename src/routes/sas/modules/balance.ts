import { Router } from "express";
import axios from "axios";

const router = Router();

router.get("/", async (req, res) => {
  const token = req.headers.authorization;
  const refreshToken = req.cookies.refreshTokenWEB;

  if (!token || !refreshToken) {
    res.status(400).send("Missing bearer or refresh token");
    return;
  }

  try {
    const response = await axios.get(
      "https://sasocial.sas.ipvc.pt/api/current_account/movements/balances",
      {
        headers: {
          Authorization: token,
          Cookie: refreshToken,
        },
      }
    );

    res
      .status(200)
      .send(parseFloat(response.data.data[0].current_balance).toFixed(2));
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
