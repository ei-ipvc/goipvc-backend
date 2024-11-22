import express from "express";
import axios from "axios";

import academicosRouter from "./routes/academicos/";

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_, res) => {
  res.send("Hello World!");
});

app.post("/login", async (req, res) => {
  if (!req.body.username || !req.body.password) {
    res.status(400).send("Missing username or password");
    return;
  }

  const { username, password } = req.body;

  try {
    const response = await axios.post(
      "https://academicos.ipvc.pt/netpa/ajax?stage=loginstage",
      {
        _formsubmitstage: "loginstage",
        _formsubmitname: "login",
        ajax_mode: true,
        _user: username,
        _pass: password,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        withCredentials: true,
      }
    );

    const cookies = response.headers["set-cookie"];
    const token =
      cookies?.find((cookie) => cookie.includes("JSESSIONID"))?.split(";")[0] ||
      null;

    res.status(response.status).json({
      academicos: token,
    });

    // activate the session
    axios.get(
      "https://academicos.ipvc.pt/netpa/page?stage=ConsultaNotasAluno",
      {
        headers: {
          Cookie: token,
        },
      }
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      res
        .status(error.response ? error.response.status : 500)
        .send(error.message);
    } else {
      res.status(500).send("An unexpected error occurred");
    }
  }
});

app.use("/academicos", academicosRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
