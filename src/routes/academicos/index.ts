import { Router } from "express";

import curricularUnitsRouter from "./modules/curricularUnits";
import studentImageRouter from "./modules/studentImage";
import studentInfoRouter from "./modules/studentInfo";
import tuitionsRouter from "./modules/tuitions";

const router = Router();

router.get("/", (_, res) => {
  res.send("response from /academicos1!");
});

router.use("/curricular-units", curricularUnitsRouter);
router.use("/student-image", studentImageRouter);
router.use("/student-info", studentInfoRouter);
router.use("/tuitions", tuitionsRouter);

export default router;
