import { Router } from "express";
import classesRouter from "./modules/classes";
import tuitionRouter from "./modules/tuition";
import studentInfoRouter from "./modules/studentInfo";

const router = Router();

router.get("/", (_, res) => {
  res.send("response from /academicos1!");
});

router.use("/classes", classesRouter);
router.use("/tuition", tuitionRouter);
router.use("/student-info", studentInfoRouter);

export default router;
