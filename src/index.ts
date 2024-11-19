import express from "express";
import academicosRouter from "./routes/academicos/";

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/academicos", academicosRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
