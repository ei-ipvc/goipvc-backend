import { Router } from "express";
import scheduleRouter from "./modules/schedule";
import studentNameRouter from "./modules/studentName";

const router = Router();

router.get("/", (_, res) => {
  res.send("response from /on1!");
});

router.use("/schedule", scheduleRouter);
router.use("/student-name", studentNameRouter);

export default router;
