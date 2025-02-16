import { Router, Request, Response } from "express";
import axios, { AxiosResponse } from "axios";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const token = req.body.token;
  if (!token) {
    res.status(400).send("Missing token");
    return;
  }

  try {
    const response: AxiosResponse = await axios.get(
      `https://elearning.ipvc.pt/ipvc2024/webservice/rest/server.php`,
      {
        params: {
          wstoken: token,
          wsfunction: "mod_assign_get_assignments",
          moodlewsrestformat: "json",
        },
      }
    );

    if (response.data.errorcode) {
      res.status(401).send("Unauthorized");
      return;
    }

    /*
    const assignments = response.data.courses.flatMap(
      (course: any) => course.assignments
    );
    */

    const assignments = response.data.courses.flatMap((course: any) =>
      course.assignments.map((assignment: any) => ({
        id: assignment.id,
        courseId: assignment.course,
        name: assignment.name,
        dueDate: assignment.duedate,
        modDate: assignment.timemodified,
        complete: assignment.completionsubmit,
      }))
    );

    res.status(response.status).json(assignments);
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
