import { Router } from "express";
import curricularUnitsRouter from "./modules/curricularUnits";

const router = Router();

router.get("/", (req, res) => {
  res.send("response from /academicos1!");
});

router.use("/curricular-units", curricularUnitsRouter);

export default router;
