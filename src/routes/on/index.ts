import { Router } from "express";
import classInfoRouter from "./modules/classInfo";
import scheduleRouter from "./modules/schedule";

const router = Router();

router.get("/", (_, res) => {
  res.send("response from /on1!");
});

router.use("/class-info", classInfoRouter);
router.use("/schedule", scheduleRouter);

export default router;
