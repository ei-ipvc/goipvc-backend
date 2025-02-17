import { Router, Request, Response } from "express";
import axios, { AxiosResponse } from "axios";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const token = req.body.token;
  if (!token) {
    res.status(400).send("Missing token");
    return;
  }

  const userid = req.body.userid;
  if (!userid) {
    res.status(400).send("Missing userid");
    return;
  }

  try {
    const response: AxiosResponse = await axios.get(
      `https://elearning.ipvc.pt/ipvc2024/webservice/rest/server.php`,
      {
        params: {
          wstoken: token,
          wsfunction: "core_enrol_get_users_courses",
          moodlewsrestformat: "json",
          userid: userid,
        },
      }
    );

    if (response.data.errorcode) {
      res.status(401).send("Unauthorized");
      return;
    }

    const courses = response.data.map((course: any) => ({
      id: course.id,
      shortName: course.shortname,
      fullName: course.fullname,
      displayName: course.displayname, // @TODO: test if this is the same as fullname
      code: course.idnumber,
    }));

    res.status(response.status).json(courses);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      res
        .status(error.response ? error.response.status : 500)
        .send(error.message);
    } else {
      console.error(error);
      res.status(500).send("An unexpected error occurred");
    }
  }
});

export default router;
