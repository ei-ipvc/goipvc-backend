import { Router, Request, Response } from "express";
import axios, { AxiosResponse } from "axios";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const sesskey = req.query.sesskey;
  const token = req.headers["x-auth-moodle"];
  if (!sesskey || !token) res.status(400).send("Missing token or sesskey");

  try {
    const response: AxiosResponse = await axios.post(
      `https://elearning.ipvc.pt/ipvc2024/lib/ajax/service.php?sesskey=${sesskey}&info=core_calendar_get_action_events_by_timesort`,
      [
        {
          methodname: "core_calendar_get_action_events_by_timesort",
          args: {
            limittononsuspendedevents: true,
          },
        },
      ],
      {
        headers: {
          Cookie: token,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data[0].error) {
      res.status(401).send();
      return;
    }

    const data = response.data[0].data["events"];
    res.status(response.status).json(data);
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
