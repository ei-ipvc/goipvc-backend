import { Router } from "express";

import teachersRouter from "./modules/teachers";

const router = Router();

router.get("/", (_, res) => {
  res.send("response from <code>/database</code>1!");
});

router.use("/teachers", teachersRouter);

export default router;
