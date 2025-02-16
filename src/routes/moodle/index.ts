import { Router } from "express";
import classSummariesRouter from "./modules/classSummaries";
import courseUnitsRouter from "./modules/courseUnits";

const router = Router();

router.get("/", (_, res) => {
  res.send("response from /moodle1!");
});

router.use("/class-summaries", classSummariesRouter);
router.use("/course-units", courseUnitsRouter);

export default router;
