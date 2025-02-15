import { Router } from "express";

import { academicosStrategy } from "../strategies/academicos";
import { onStrategy } from "../strategies/on";
import { sasStrategy } from "../strategies/sas";
import { moodleStrategy } from "../strategies/moodle";

const router = Router();
router.post("/", async (req, res) => {
  if (!req.body.username || !req.body.password) {
    res.status(400).send("Missing username or password");
    return;
  }

  const { username, password } = req.body;

  try {
    const [academicosToken, onToken, sasTokens, moodleTokens] =
      await Promise.all([
        academicosStrategy(username, password),
        onStrategy(username, password),
        sasStrategy(username, password),
        moodleStrategy(username, password),
      ]);

    res.status(200).json({
      tokens: {
        academicos: academicosToken,

        on: onToken,

        sas: sasTokens[0],
        sasRefresh: sasTokens[1],

        moodle: moodleTokens[0],
        moodleToken: moodleTokens[1],
      },
    });
  } catch (error) {
    if (error instanceof Error) res.status(500).send(error.message);
    else res.status(500).send("An unknown error occurred");
  }
});

export default router;
