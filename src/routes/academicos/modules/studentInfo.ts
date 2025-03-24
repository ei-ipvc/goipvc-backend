import { Router } from "express";
import axios from "axios";
import * as cheerio from "cheerio";

const router = Router();

router.get("/", async (req, res) => {
  const token = req.headers["x-auth-academicos"];
  if (!token) {
    res.status(400).send("Missing token");
    return;
  }

  try {
    const response = await axios.get("https://academicos.ipvc.pt/netpa/page", {
      headers: {
        Cookie: token,
      },
    });

    if (response.data.includes("Ext.getCmp('loginRegister').showLogin()")) {
      res.status(401).send();
      return;
    }

    const $ = cheerio.load(response.data);
    const pInfo = $(
      "#PerfilHomeDisplayInnerStage > div.perfilAreaContent > ul li"
    )
      .map((_, elem) => $(elem).text())
      .get();

    const studentId = parseInt(pInfo[1].match(/\d+/g)![0] || "0");
    const fullName = pInfo[2]
      .split(" ")
      .map((txt) => {
        const lowerList = ["de", "da"];
        return lowerList.includes(txt.toLowerCase())
          ? txt.toLowerCase()
          : txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
      })
      .join(" ");
    const schoolName = pInfo[0].replace(
      " do Instituto Politécnico de Viana do Castelo",
      ""
    );
    const schoolInitials = schoolName
      .trim()
      .split(" ")
      .map((word) => word[0])
      .filter((char) => char.match(/[A-Z]/))
      .join("");
    const course = pInfo[3];
    const courseId = parseInt(pInfo[3].match(/\[(\d+)\]/)![1]);
    const courseInitials = course
      .split(" ")
      .map((word) => (word[0].match(/[A-Z]/) ? word[0] : ""))
      .join("");

    res.status(200).json({
      studentId,
      course,
      courseId,
      courseInitials,
      fullName,
      schoolName,
      schoolInitials,
    });
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
