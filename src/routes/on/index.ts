import { Router } from "express";
import classInfoRouter from "./modules/classInfo";
import courseIdRouter from "./modules/courseId";
import scheduleRouter from "./modules/schedule";
import firstNameRouter from "./modules/firstName";

const router = Router();

router.get("/", (_, res) => {
  res.send("response from /on1!");
});

router.use("/class-info", classInfoRouter);
router.use("/course-id", courseIdRouter);
router.use("/schedule", scheduleRouter);
router.use("/first-name", firstNameRouter);

export default router;
