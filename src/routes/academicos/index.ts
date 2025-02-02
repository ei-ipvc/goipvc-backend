import { Router } from "express";
import curricularUnitsRouter from "./modules/curricularUnits";
import tuitionRouter from "./modules/tuition";
import studentInfoRouter from "./modules/studentInfo";

const router = Router();

router.get("/", (req, res) => {
  res.send("response from /academicos1!");
});

router.use("/curricular-units", curricularUnitsRouter);
router.use("/tuition", tuitionRouter);
router.use("/student-info", studentInfoRouter);

export default router;
