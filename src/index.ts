import express from "express";
import authRouter from "./auth";
import academicosRouter from "./routes/academicos/";

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_, res) => {
  res.send("Hello World!");
});

app.use("/login", authRouter);
app.use("/academicos", academicosRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
