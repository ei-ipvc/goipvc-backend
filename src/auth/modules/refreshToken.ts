import { Router } from "express";

import { academicosStrategy } from "../strategies/academicos";
import { moodleStrategy } from "../strategies/moodle";
import { onStrategy } from "../strategies/on";
import { sasStrategy } from "../strategies/sas";

const router = Router();
router.post("/", async (req, res) => {
  const { username, password, strategy } = req.body;
  if (!username || !password || strategy === undefined) {
    res.status(400).send("Missing username, password, or strategy");
    return;
  }

  try {
    let token;
    switch (strategy) {
      case 0:
        token = await academicosStrategy(username, password);
        res.status(200).json({ token: token });
        break;
      case 1:
        token = await moodleStrategy(username, password);
        res.status(200).json({
          tokens: {
            moodle: token[0],
            moodleToken: token[1],
          },
        });
        break;
      case 2:
        token = await onStrategy(username, password);
        res.status(200).json({ token: token });
        break;
      case 3:
        token = await sasStrategy(username, password);
        res.status(200).json({
          tokens: {
            sas: token[0],
            sasRefresh: token[1],
          },
        });
        break;
      default:
        res.status(400).send("Invalid strategy");
        return;
    }
  } catch (error) {
    if (error instanceof Error) res.status(500).send(error.message);
    else res.status(500).send("An unknown error occurred");
  }
});

export default router;
