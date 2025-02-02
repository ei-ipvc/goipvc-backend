import { Router } from "express";
import axios from "axios";

const router = Router();

router.get("/", async (req, res) => {
  const token = req.body.token,
    refreshToken = req.body.refreshToken;
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

    res.status(200).json(response.data.data[0].current_balance);
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
