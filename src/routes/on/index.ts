import { Router } from "express";
import scheduleRouter from "./modules/schedule";

const router = Router();

router.get("/", (_, res) => {
  res.send("response from /on1!");
});

router.use("/schedule", scheduleRouter);

export default router;
