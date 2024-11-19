import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.send("response from /academicos1!");
});

export default router;
