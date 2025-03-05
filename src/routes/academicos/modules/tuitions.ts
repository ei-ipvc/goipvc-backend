import { Router } from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import { Tuition } from "../../../models/tuition";

const router = Router();

router.get("/", async (req, res) => {
  const token = req.cookies.JSESSIONID;
  if (!token) {
    res.status(400).send("Missing token");
    return;
  }

  try {
    const response = await axios.get(
      "https://academicos.ipvc.pt/netpa/DIFTasks?_AP_=9&_MD_=1&_SR_=173&_ST_=1",
      {
        headers: {
          Cookie: `JSESSIONID=${token}`,
          "User-Agent": "Mozilla/5.0 Chrome/99.0.0.0 Safari/537.36",
        },
        responseType: "arraybuffer",
      }
    );

    const html = Buffer.from(response.data, "binary").toString("latin1");
    const $ = cheerio.load(html);

    if (html.includes("NO_USER_LOGGED")) {
      res.status(401).send("Unauthorized");
      return;
    }

    const rows = $("#simpletable > tbody > tr")
      .filter((_, elem) => !!$(elem).attr("class"))
      .map((_, row) => {
        const [, desc, dueDate, , value, paymentDate, amountPaid, debt, fine] =
          $(row)
            .find("td")
            .toArray()
            .map((cell) =>
              $(cell).text().trim().replace(/\n/g, "").replace(" Eur", "")
            );

        if (!desc) return null; // skip empty rows
        return {
          desc,
          dueDate: dueDate.replace("(1)", ""),
          value: parseFloat(value),
          paymentDate,
          amountPaid: parseFloat(amountPaid),
          debt: parseFloat(debt),
          fine: parseFloat(fine),
        } as Tuition;
      })
      .get();

    res.status(response.status).json(rows);
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
