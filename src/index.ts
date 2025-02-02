import express from "express";
import cookieParser from "cookie-parser";

import authRouter from "./auth";
import academicosRouter from "./routes/academicos/";
import onRouter from "./routes/on/";

const app = express();
const port = 3000;

app.use(cookieParser());
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// Enable CORS
/*
  app.use((_, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});*/

app.get("/", (_, res) => {
  res.send("Hello World!");
});

app.use("/login", authRouter);
app.use("/academicos", academicosRouter);
app.use("/on", onRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
