import axios, { AxiosResponse } from "axios";
import client from "../../..";

export const saveCurricularUnits = async (sesskey: string, token: string) => {
  try {
    const response: AxiosResponse = await axios.post(
      `https://elearning.ipvc.pt/ipvc2024/lib/ajax/service.php?sesskey=${sesskey}&info=core_course_get_enrolled_courses_by_timeline_classification`,
      [
        {
          methodname:
            "core_course_get_enrolled_courses_by_timeline_classification",
          args: {
            classification: "all",
            requiredfields: ["enddate"],
          },
        },
      ],
      {
        headers: {
          Cookie: token,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data[0].error) {
      const data = response.data[0].data.courses;
      data.forEach(async (unit: any) => {
        const id = unit.idnumber.match(/\d+$/)?.[0];
        const courseId = unit.idnumber.match(/^\d+/)?.[0];
        const moodleId = unit.id;

        if (id != 0 && courseId != 0) {
          await client.query(
            "INSERT INTO courses (id) VALUES ($1) ON CONFLICT DO NOTHING",
            [courseId]
          );
          client.query(
            "INSERT INTO curricular_units (id, course_id, moodle_id) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET course_id = $2, moodle_id = $3",
            [id, courseId, moodleId]
          );
        }
      });
    }
  } catch (error) {
    console.error("Failed to save curricular units:", error);
  }
};
