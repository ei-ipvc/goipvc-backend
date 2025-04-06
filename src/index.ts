import { Client } from "pg";
import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import cors from "cors";

import authRouter from "./auth";
import dbRouter from "./database";
import academicosRouter from "./routes/academicos/";
import moodleRouter from "./routes/moodle/";
import onRouter from "./routes/on/";
import sasRouter from "./routes/sas/";

dotenv.config();

const client = new Client({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

client.connect();

const app = express();
const port = 3000;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
  })
);
app.options("*", cors());

app.use((req: Request, res: Response, next: NextFunction): void => {
  if (req.headers.cookie && req.headers.cookie.includes("...")) {
    res.status(401).send();
    return;
  }
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_, res) => {
  res.send("Hello World1!");
});

app.use("/auth", authRouter);
app.use("/database", dbRouter);

app.use("/academicos", academicosRouter);
app.use("/moodle", moodleRouter);
app.use("/on", onRouter);
app.use("/sas", sasRouter);

app.use(
  "/blueprints",
  express.static(path.resolve(__dirname, "../src/blueprints"))
);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

export default client;
