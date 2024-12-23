import { Router } from "express";
import getScheduleRouter from "./modules/getSchedule";

const router = Router();

router.get("/", (_, res) => {
  res.send("response from /on1!");
});

router.use("/curricular-units", getScheduleRouter);

export default router;
