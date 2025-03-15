import { Router } from "express";
import { academicosStrategy } from "./strategies/academicos";
import { moodleStrategy } from "./strategies/moodle";
import { onStrategy } from "./strategies/on";
import { sasStrategy } from "./strategies/sas";

const router = Router();

router.post("/", async (req, res) => {
  const { username, password, academicos, moodle, on, sas } = req.body;
  if (!username || !password) {
    res.status(400).send("Missing username or password");
    return;
  }
  console.log(req.body);

  try {
    const tokens: any = {};
    const promises: Promise<void>[] = [];

    if (academicos)
      promises.push(
        academicosStrategy(username, password).then((token) => {
          tokens.academicos = token;
        })
      );
    if (moodle)
      promises.push(
        moodleStrategy(username, password).then(([cookie, sesskey]) => {
          tokens.moodle = { cookie, sesskey };
        })
      );
    if (on)
      promises.push(
        onStrategy(username, password).then((token) => {
          tokens.on = token;
        })
      );
    if (sas)
      promises.push(
        sasStrategy(username, password).then(([token, refreshToken]) => {
          tokens.sas = { token, refreshToken };
        })
      );
    await Promise.all(promises);

    if (Object.keys(tokens).length === 0) {
      res.status(400).send("No valid authentication strategy provided");
      return;
    }

    res.status(200).json(tokens);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("401")) {
        res.status(401).send();
      } else {
        res.status(500).send(error.message);
      }
    } else {
      res.status(500).send("An unknown error occurred");
    }
  }
});

export default router;
