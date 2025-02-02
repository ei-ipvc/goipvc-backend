import { Router } from "express";

import balanceRouter from "./modules/balance";
import studentIdRouter from "./modules/studentId";

const router = Router();

router.get("/", (_, res) => {
  res.send("response from /sas1!");
});

router.use("/balance", balanceRouter);
router.use("/student-id", studentIdRouter);

export default router;
