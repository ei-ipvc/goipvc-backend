import { Router } from "express";
import loginRouter from "./modules/login";
import refreshTokenRouter from "./modules/refreshToken";

const router = Router();

router.get("/", (_, res) => {
  res.send("response from /auth!");
});

router.use("/login", loginRouter);
router.use("/refresh-token", refreshTokenRouter);

export default router;
