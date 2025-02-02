import { Router } from "express";
import axios from "axios";
import * as cheerio from "cheerio";

interface Tuition {
  desc: string;
  dueDate: string;
  // ref: string;
  value: number;
  paymentDate: string;
  amountPaid: number;
  debt: number;
  fine: number;
}

const router = Router();

router.get("/", async (req, res) => {
  const { token } = req.body;

  if (!token) {
    res.status(400).send("Missing token");
    return;
  }

  try {
    const response = await axios.get(
      "https://academicos.ipvc.pt/netpa/DIFTasks?_AP_=9&_MD_=1&_SR_=173&_ST_=1",
      {
        headers: {
          Cookie: token,
          "User-Agent": "Mozilla/5.0 Chrome/99.0.0.0 Safari/537.36",
        },
        responseType: "arraybuffer",
      }
    );

    const html = Buffer.from(response.data, "binary").toString("latin1");
    const $ = cheerio.load(html);

    const rows = $("#simpletable > tbody > tr")
      .filter((_, elem) => !!$(elem).attr("class"))
      .map((_, row) => {
        const [, desc, dueDate, ref, value, paymentDate, amountPaid, debt, fine] =
          $(row)
            .find("td")
            .toArray()
            .map((cell) =>
              $(cell).text().trim().replace(/\n/g, "").replace(" Eur", "")
            );

        if (!desc) return null; // skip empty rows
        return {
          desc,
          dueDate,
          //ref,
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
