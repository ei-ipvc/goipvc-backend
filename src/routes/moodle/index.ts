import { Router } from "express";
import courseSummariesRouter from "./modules/courseSummaries";

const router = Router();

router.get("/", (req, res) => {
  res.send("response from /moodle1!");
});

router.use("/course-summaries", courseSummariesRouter);

export default router;
