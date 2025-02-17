import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

client.connect();

import express from "express";
import cookieParser from "cookie-parser";

import authRouter from "./auth";
import academicosRouter from "./routes/academicos/";
import moodleRouter from "./routes/moodle/";
import onRouter from "./routes/on/";
import sasRouter from "./routes/sas/";

const app = express();
const port = 3000;

app.use((req, _, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_, res) => {
  res.send("Hello World!");
});

app.use("/auth", authRouter);

app.use("/academicos", academicosRouter);
app.use("/moodle", moodleRouter);
app.use("/on", onRouter);
app.use("/sas", sasRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

export default client;
