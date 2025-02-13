import { Router } from "express";

import { academicosStrategy } from "../strategies/academicos";
import { ONStrategy } from "../strategies/on";
import { SASStrategy } from "../strategies/sas";

const router = Router();
router.post("/", async (req, res) => {
  const { username, password, strategy } = req.body;
  if (!username || !password || strategy === undefined) {
    res.status(400).send("Missing username, password, or strategy");
    return;
  }

  try {
    let tokens;
    switch (strategy) {
      case 0:
        tokens = await academicosStrategy(username, password);
        res.status(200).json({ tokens: { academicos: tokens } });
        break;
      case 1:
        // moodle
        break;
      case 2:
        tokens = await ONStrategy(username, password);
        res.status(200).json({ tokens: { ON: tokens } });
        break;
      case 3:
        tokens = await SASStrategy(username, password);
        res.status(200).json({
          tokens: {
            SASRefreshToken: tokens[0],
            SASToken: tokens[1],
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
