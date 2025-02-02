import { Router } from "express";

import balanceRouter from "./modules/balance";

const router = Router();

router.get("/", (_, res) => {
  res.send("response from /sas1!");
});

router.use("/balance", balanceRouter);

export default router;
