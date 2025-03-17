import { Router } from "express";
import axios from "axios";
import * as cheerio from "cheerio";

const router = Router();

router.get("/", async (req, res) => {
  const token = req.headers["x-auth-on"];
  if (!token) {
    res.status(400).send("Missing token");
    return;
  }

  try {
    const response = await axios.get("https://on.ipvc.pt/dash.php", {
      headers: {
        Cookie: token,
        "User-Agent": "Mozilla/5.0 Chrome/99.0.0.0 Safari/537.36",
      },
    });
    const $ = cheerio.load(response.data);

    if (response.data.includes("title-card-login")) {
      res.status(401).send();
      return;
    }

    const firstName = $("div.d-none.d-md-block")
      .contents()
      .first()
      .text()
      .trim()
      .split(" ")[0];
    res
      .status(200)
      .send(
        firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()
      );
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
