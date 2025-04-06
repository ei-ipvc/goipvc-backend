import { Router } from "express";
import courseIdRouter from "./modules/courseId";
import curricularUnitRouter from "./modules/curricularUnit";
import scheduleRouter from "./modules/schedule";
import firstNameRouter from "./modules/firstName";

const router = Router();

router.get("/", (_, res) => {
  res.send("response from /on1!");
});

router.use("/course-id", courseIdRouter);
router.use("/curricular-unit", curricularUnitRouter);
router.use("/schedule", scheduleRouter);
router.use("/first-name", firstNameRouter);

export default router;
