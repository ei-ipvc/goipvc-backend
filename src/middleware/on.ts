import axios from "axios";
import { Request, Response, NextFunction } from "express";

const checkOnAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await axios.get("https://on.ipvc.pt/dash.php", {
      maxRedirects: 0,
      headers: {
        Cookie: req.headers["x-auth-on"],
      },
    });

    if (response.status === 200) return next();
  } catch (err) {
    if (
      axios.isAxiosError(err) &&
      err.response &&
      err.response.status === 302 &&
      err.response.headers.location.includes("index.php")
    ) {
      res.status(401).send();
    } else {
      console.error(err);
      res.status(500).send("An error occurred while checking the session");
    }
  }
};

export default checkOnAuth;
