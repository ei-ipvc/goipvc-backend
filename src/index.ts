import express from "express";
import authRouter from "./auth";
import academicosRouter from "./routes/academicos/";

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//enable cors
app.use((_, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/", (_, res) => {
  res.send("Hello World!");
});

app.use("/login", authRouter);
app.use("/academicos", academicosRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
