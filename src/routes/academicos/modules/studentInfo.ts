import { Router } from "express";
import axios from "axios";
import * as cheerio from "cheerio";

const router = Router();

router.get("/", async (req, res) => {
  const token = req.cookies.JSESSIONID;
  if (!token) {
    res.status(400).send("Missing token");
    return;
  }

  try {
    const response = await axios.get("https://academicos.ipvc.pt/netpa/page", {
      headers: {
        Cookie: `JSESSIONID=${token}`,
      },
    });

    if (response.data.includes("Ext.getCmp('loginRegister').showLogin()")) {
      res.status(401).send("Unauthorized");
      return;
    }

    const $ = cheerio.load(response.data);
    const pInfo = $(
      "#PerfilHomeDisplayInnerStage > div.perfilAreaContent > ul li"
    )
      .map((_, elem) => $(elem).text())
      .get();

    const schoolName = pInfo[0];
    const studentId = parseInt(pInfo[1].match(/\d+/g)![0] || "0");
    const name = pInfo[2].replace(
      /\S+/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
    );
    const course = pInfo[3];

    res.status(200).json({ schoolName, studentId, name, course });
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
