import { Router } from "express";

import assignmentsRouter from "./modules/assignments";
import attendanceRouter from "./modules/attendance";
import curricularUnitsRouter from "./modules/curricularUnits";
import lessonSummariesRouter from "./modules/lessonSummaries";

const router = Router();

router.get("/", (_, res) => {
  res.send("response from /moodle1!");
});

router.use("/assignments", assignmentsRouter);
router.use("/attendance", attendanceRouter);
router.use("/curricular-units", curricularUnitsRouter);
router.use("/lesson-summaries", lessonSummariesRouter);

export default router;
